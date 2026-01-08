import fs from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const CSV_URL = 'https://pota.app/all_parks_ext.csv'
const OUTPUT_JSON = 'public/data/pota-parks.json'
const OUTPUT_CHECKSUM = 'public/data/pota-parks.checksum'

// Resolve project root
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')

const jsonPath = path.join(projectRoot, OUTPUT_JSON)
const checksumPath = path.join(projectRoot, OUTPUT_CHECKSUM)

/**
 * Safe CSV parser (quoted fields, commas inside quotes)
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

function sha256(content) {
    return crypto.createHash('sha256').update(content).digest('hex')
}

async function main() {
    console.log('Fetching POTA parks CSV…')

    const response = await fetch(CSV_URL)
    if (!response.ok) {
        throw new Error(`Failed to fetch CSV (${response.status})`)
    }

    const csvText = await response.text()
    const rows = parseCSV(csvText.trim())

    const headers = rows.shift()
    if (!headers) {
        throw new Error('CSV header missing')
    }

    const index = Object.fromEntries(headers.map((h, i) => [h, i]))
    const parks = []

    for (const row of rows) {
        if (!row.length) continue
        if (row[index.active] !== '1') continue

        const latitude = Number(row[index.latitude])
        const longitude = Number(row[index.longitude])
        if (Number.isNaN(latitude) || Number.isNaN(longitude)) continue

        parks.push({
            reference: row[index.reference],
            name: row[index.name],
            latitude,
            longitude,
            grid: row[index.grid],
            locationDesc: row[index.locationDesc],
        })
    }

    parks.sort((a, b) => a.reference.localeCompare(b.reference))

    const json = JSON.stringify(parks, null, 2)
    const newChecksum = sha256(json)

    let oldChecksum = null
    try {
        oldChecksum = await fs.readFile(checksumPath, 'utf-8')
    } catch {
        // first run – checksum file does not exist
    }

    if (oldChecksum === newChecksum) {
        console.log('✓ No meaningful data change detected (checksum match)')
        return
    }

    await fs.mkdir(path.dirname(jsonPath), { recursive: true })
    await fs.writeFile(jsonPath, json)
    await fs.writeFile(checksumPath, newChecksum)

    console.log(`✓ Updated ${parks.length} active parks`)
    console.log('✓ Checksum updated')
}

main().catch(err => {
    console.error('❌ Failed to update POTA parks data')
    console.error(err)
    process.exit(1)
})
