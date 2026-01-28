export type BaseReferenceItem = {
    reference: string
    name: string
    latitude: number
    longitude: number
}

/* POTA */
export type PotaReferenceItem = BaseReferenceItem & {
    program: 'POTA'
    // future:
    // entity?: string
    // parkType?: string
}

/* SOTA */
export type SotaReferenceItem = BaseReferenceItem & {
    program: 'SOTA'
    // future:
    // associationCode?: string
    // points?: number
}

/* Union when needed */
export type ReferenceItem =
    | PotaReferenceItem
    | SotaReferenceItem



// Metadata types
export type ReferenceFileMeta = {
    program: 'POTA' | 'SOTA'
    source: string
    generatedAt: string
    count: number
}

export type PotaReferenceFile = {
    meta: ReferenceFileMeta & { program: 'POTA' }
    items: PotaReferenceItem[]
}

export type SotaReferenceFile = {
    meta: ReferenceFileMeta & { program: 'SOTA' }
    items: SotaReferenceItem[]
}
