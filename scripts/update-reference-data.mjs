import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

/* ------------------------------------------------------------------
 * Configuration
 * ------------------------------------------------------------------ */

const DATA_SOURCES = {
    pota: {
        program: 'POTA',
        csvUrl: 'https://pota.app/all_parks_ext.csv',
        outputJson: 'public/data/pota-references.json',
        outputChecksum: 'public/data/pota-references.checksum',
        hasHeaderComment: false,
        parser: parsePotaCsv,
    },
    sota: {
        program: 'SOTA',
        csvUrl: 'https://www.sotadata.org.uk/summitslist.csv',
        outputJson: 'public/data/sota-references.json',
        outputChecksum: 'public/data/sota-references.checksum',
        hasHeaderComment: true,
        parser: parseSotaCsv,
    },
}

/* ------------------------------------------------------------------
 * Path helpers
 * ------------------------------------------------------------------ */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

/* ------------------------------------------------------------------
 * Utilities
 * ------------------------------------------------------------------ */

function sha256(content) {
    return crypto.createHash('sha256').update(content).digest('hex')
}

/**
 * Minimal CSV parser with quoted field support.
 */
function parseCSV(csvText) {
    const rows = []
    let row = []
    let field = ''
    let inQuotes = false

    for (let i = 0; i < csvText.length; i++) {
        const char = csvText[i]
        const next = csvText[i + 1]

        if (char === '"' && inQuotes && next === '"') {
            field += '"'
            i++
        } else if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            row.push(field)
            field = ''
        } else if (char === '\n' && !inQuotes) {
            row.push(field)
            rows.push(row)
            row = []
            field = ''
        } else {
            field += char
        }
    }

    if (field.length || row.length) {
        row.push(field)
        rows.push(row)
    }

    return rows
}

function parseCSVWithOptionalHeader(csvText, hasHeaderComment) {
    const lines = csvText.trim().split('\n')

    if (hasHeaderComment) {
        lines.shift()
    }

    return parseCSV(lines.join('\n'))
}

/* ------------------------------------------------------------------
 * Parsers
 * ------------------------------------------------------------------ */

function parsePotaCsv(rows) {
    const headers = rows.shift()
    const index = Object.fromEntries(headers.map((h, i) => [h, i]))

    const items = []

    for (const row of rows) {
        if (row[index.active] !== '1') continue

        const latitude = Number(row[index.latitude])
        const longitude = Number(row[index.longitude])
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) continue

        items.push({
            reference: row[index.reference],
            name: row[index.name],
            latitude,
            longitude,
        })
    }

    items.sort((a, b) => a.reference.localeCompare(b.reference))
    return items
}

function parseSotaCsv(rows) {
    const headers = rows.shift()
    const index = Object.fromEntries(headers.map((h, i) => [h, i]))

    const items = []

    for (const row of rows) {
        const reference = row[index.SummitCode]
        if (!reference) continue

        const latitude = Number(row[index.Latitude])
        const longitude = Number(row[index.Longitude])
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) continue

        items.push({
            reference,
            name: row[index.SummitName] || '',
            latitude,
            longitude,
        })
    }

    items.sort((a, b) => a.reference.localeCompare(b.reference))
    return items
}

/* ------------------------------------------------------------------
 * IO helpers
 * ------------------------------------------------------------------ */

async function hasDataChanged(checksumPath, newChecksum) {
    try {
        const oldChecksum = await fs.readFile(checksumPath, 'utf-8')
        return oldChecksum !== newChecksum
    } catch {
        return true
    }
}

/* ------------------------------------------------------------------
 * Update logic
 * ------------------------------------------------------------------ */

async function updateSource(config) {
    console.log(`Fetching ${config.program} references...`)

    const res = await fetch(config.csvUrl)
    if (!res.ok) {
        throw new Error(`Failed to fetch ${config.program} CSV`)
    }

    const csvText = await res.text()
    const rows = parseCSVWithOptionalHeader(csvText, config.hasHeaderComment)
    const items = config.parser(rows)

    const payload = {
        meta: {
            program: config.program,
            source: config.csvUrl,
            generatedAt: new Date().toISOString(),
            count: items.length,
        },
        items,
    }

    const checksum = sha256(JSON.stringify(items))
    const json = JSON.stringify(payload, null, 2)

    const jsonPath = path.join(projectRoot, config.outputJson)
    const checksumPath = path.join(projectRoot, config.outputChecksum)

    if (!(await hasDataChanged(checksumPath, checksum))) {
        console.log(`✓ ${config.program}: no changes (${items.length} records)`)
        return
    }

    await fs.mkdir(path.dirname(jsonPath), { recursive: true })
    await fs.writeFile(jsonPath, json)
    await fs.writeFile(checksumPath, checksum)

    console.log(`✓ ${config.program}: updated (${items.length} records)`)
}

/* ------------------------------------------------------------------
 * Main
 * ------------------------------------------------------------------ */

async function main() {
    console.log('Updating reference data...\n')

    for (const config of Object.values(DATA_SOURCES)) {
        try {
            await updateSource(config)
            console.log()
        } catch (err) {
            console.error(`✗ ${config.program} failed:`, err.message)
        }
    }

    console.log('Done.')
}

main().catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
})
