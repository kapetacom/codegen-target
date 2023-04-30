export interface GeneratedFile {
    filename: string;
    content: string;
    mode: string;
    permissions: string;
}

export interface GeneratedAsset {
    filename: string;
    mode: string;
    permissions: string;
    modified?: number
    checksum?: string
}