/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

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
    modified?: number;
    checksum?: string;
}

export interface SourceFile {
    filename: string;
    content: string;
    permissions: string;
}
