/**
 * Copyright 2023 Kapeta Inc.
 * SPDX-License-Identifier: MIT
 */

export const OPTION_CONTEXT_AI = 'AIContext';

export interface GeneratedFile {
    filename: string;
    content: string | Buffer;
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

export enum AIFileTypes {
    SERVICE = 'service',
    SERVICE_IF = 'service-interface',
    WEB_SCREEN = 'web-screen',
    DAO = 'dao',
    DTO = 'dto',
    CONFIG = 'config',
    CLIENT = 'client', // Various clients
    API = 'api',
    API_CLIENT = 'api-client', // API client
    EVENT_PUBLISHER = 'event-publisher',
    EVENT_CONSUMER = 'event-consumer',
    SECURITY = 'security',
    CONTEXT = 'context',
    IGNORE = 'ignore',
    INSTRUCTIONS = 'instructions',
    DOCUMENTATION = 'documentation',
}
