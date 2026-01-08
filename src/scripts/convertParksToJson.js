// scripts/convertParksToJson.js
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read CSV file
const csvPath = join(__dirname, '../data/all_parks_ext.csv');
const jsonPath = join(__dirname, '../data/parks.json');

try {
    // Read CSV file
    const csvContent = readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    const headers = lines[0].replace(/"/g, '').split(',');
    const parks = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Parse CSV line with quotes
        const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);

        if (values && values.length === headers.length) {
            const park = {};
            headers.forEach((header, index) => {
                let value = values[index];
                // Remove surrounding quotes
                if (value.startsWith('"') && value.endsWith('"')) {
                    value = value.slice(1, -1);
                }
                park[header] = value;
            });

            // Only include active parks
            if (park.active === '1') {
                parks.push({
                    reference: park.reference,
                    name: park.name,
                    latitude: parseFloat(park.latitude),
                    longitude: parseFloat(park.longitude),
                    grid: park.grid,
                    locationDesc: park.locationDesc
                });
            }
        }
    }

    // Write JSON file
    writeFileSync(jsonPath, JSON.stringify(parks, null, 2));
    console.log(`✓ Converted ${parks.length} parks to JSON at ${jsonPath}`);
} catch (error) {
    console.error('Error converting CSV to JSON:', error);
    process.exit(1);
}