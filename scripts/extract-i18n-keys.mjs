import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { globSync } from 'glob';
import parser from '@babel/parser';
import _traverse from '@babel/traverse';
const traverse = _traverse.default || _traverse;

// --------------------------------------------------
// Resolve project root
// --------------------------------------------------

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// --------------------------------------------------
// Configuration
// --------------------------------------------------

const SOURCE_DIR = path.join(projectRoot, 'src');
const LOCALES_DIR = path.join(projectRoot, 'src/i18n/locales');

const IGNORE_PATTERNS = [
    '**/*.test.ts',
    '**/*.test.js',
    '**/*.spec.ts',
    '**/*.spec.js',
    '**/node_modules/**'
];

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function flattenObject(obj, parentKey = '', result = {}) {
    for (const [key, value] of Object.entries(obj)) {
        const newKey = parentKey ? `${parentKey}.${key}` : key;

        if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
        ) {
            flattenObject(value, newKey, result);
        } else {
            result[newKey] = value;
        }
    }

    return result;
}

function unflattenObject(flat) {
    const result = {};

    for (const [key, value] of Object.entries(flat)) {
        const parts = key.split('.');
        let current = result;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];

            if (i === parts.length - 1) {
                current[part] = value;
            } else {
                current[part] ??= {};
                current = current[part];
            }
        }
    }

    return result;
}

// --------------------------------------------------
// Extract keys from source
// --------------------------------------------------

async function extractKeys() {
    console.log('Searching for translation keys...');

    const files = globSync(
        `${SOURCE_DIR}/**/*.{js,jsx,ts,tsx}`,
        {
            ignore: IGNORE_PATTERNS,
            windowsPathsNoEscape: true,
            absolute: true
        }
    );

    console.log(`Found ${files.length} files`);

    const keys = new Set();

    for (const file of files) {
        const filePath = path.resolve(projectRoot, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Parse the file content into an AST

        try {
            const ast = parser.parse(content, {
                sourceType: 'module',
                plugins: [
                    'jsx',
                    'typescript',
                    'decorators-legacy'
                ]
            });

            traverse(ast, {
                CallExpression(path) {
                    const callee = path.node.callee;

                    // Check for t('key')
                    if (callee.type === 'Identifier' && callee.name === 't') {
                        const args = path.node.arguments;
                        if (args.length > 0 && args[0].type === 'StringLiteral') {
                            keys.add(args[0].value);
                        }
                    }

                    // Check for useI18n().t('key')
                    if (callee.type === 'MemberExpression' &&
                        callee.property.type === 'Identifier' &&
                        callee.property.name === 't') {
                        const args = path.node.arguments;
                        if (args.length > 0 && args[0].type === 'StringLiteral') {
                            keys.add(args[0].value);
                        }
                    }
                }
            });
        } catch (error) {
            console.warn(`AST parse error for ${filePath}:`, error.message);
        }
           
    }

    console.log(`Found ${keys.size} unique keys`);
    return Array.from(keys).sort();
}

// --------------------------------------------------
// Compare & merge with locales
// --------------------------------------------------

async function processLocales(extractedKeys) {
    console.log('\nProcessing locale files...');

    const localeFiles = globSync(`${LOCALES_DIR}/*.json`);

    if (localeFiles.length === 0) {
        console.error('No locale files found');
        return;
    }

    for (const file of localeFiles) {
        const localeName = path.basename(file);
        console.log(`\n➡ ${localeName}`);

        const raw = fs.readFileSync(file, 'utf8');
        const json = JSON.parse(raw);

        const flatLocale = flattenObject(json);
        let changed = false;

        // Missing keys → add
        for (const key of extractedKeys) {
            if (!(key in flatLocale)) {
                flatLocale[key] = key; // placeholder
                changed = true;
                console.log(`     Added: ${key}`);
            }
        }

        // Extra keys → report
        const extraKeys = Object.keys(flatLocale)
            .filter(k => !extractedKeys.includes(k));

        if (extraKeys.length) {
            console.log(`     Unused keys (${extraKeys.length}):`);
            extraKeys.forEach(k => console.log(`      - ${k}`));
        }

        if (changed) {
            const merged = unflattenObject(flatLocale);
            fs.writeFileSync(
                file,
                JSON.stringify(merged, null, 2)
            );
            console.log('     File updated');
        } else {
            console.log('     No changes needed');
        }
    }
}

// --------------------------------------------------
// Main
// --------------------------------------------------

async function main() {
    try {
        const keys = await extractKeys();
        await processLocales(keys);

        console.log('\n  i18n extraction & merge completed');
    } catch (err) {
        console.error('  Error:', err);
        process.exit(1);
    }
}

main();
