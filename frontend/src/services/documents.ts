'use client';

import { authorizedFetch } from './http';

export type PermitType = 'HALAL' | 'PIRT' | 'BPOM';

export type DocumentVersionDto = {
  id: string;
  version: number;
  originalFilename: string;
  mimeType: string;
  size: number;
  checksum: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  uploadedBy: string | null;
  createdAt: string;
  downloadUrl?: string;
};

export type DocumentDto = {
  id: string;
  userId: string;
  businessProfileId: string | null;
  permitType: PermitType | null;
  label: string | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  currentVersion: DocumentVersionDto | null;
  versions: DocumentVersionDto[];
};

export type UploadDocumentPayload = {
  file: File;
  businessProfileId?: string | null;
  permitType?: PermitType | null;
  label?: string | null;
  notes?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type BatchUploadDocumentPayload = {
  documents: UploadDocumentPayload[];
};

const DEFAULT_BACKEND_URL = 'http://localhost:3000';

export async function listDocuments(includeDownloadUrl = false): Promise<DocumentDto[]> {
  const url = buildBackendUrl('/documents', includeDownloadUrl ? { includeDownloadUrl: 'true' } : undefined);
  const response = await authorizedFetch(url);
  return handleResponse<DocumentDto[]>(response);
}

export async function getDocument(id: string): Promise<DocumentDto> {
  const url = buildBackendUrl(`/documents/${id}`);
  const response = await authorizedFetch(url);
  return handleResponse<DocumentDto>(response);
}

export async function getDocumentVersions(id: string): Promise<DocumentVersionDto[]> {
  const url = buildBackendUrl(`/documents/${id}/versions`);
  const response = await authorizedFetch(url);
  return handleResponse<DocumentVersionDto[]>(response);
}

export async function uploadDocument(payload: UploadDocumentPayload): Promise<DocumentDto> {
  const url = buildBackendUrl('/documents');
  const formData = buildFormData(payload);
  const response = await authorizedFetch(url, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<DocumentDto>(response);
}

export async function uploadDocumentsBatch(payload: BatchUploadDocumentPayload): Promise<DocumentDto[]> {
  if (!payload.documents.length) {
    throw new Error('Minimal satu dokumen harus dipilih.');
  }
  const url = buildBackendUrl('/documents/batch');
  const formData = new FormData();
  const metadataPayload = payload.documents.map((document) => ({
    businessProfileId: document.businessProfileId ?? null,
    permitType: document.permitType ?? null,
    label: document.label ?? document.file.name,
    notes: document.notes ?? null,
    metadata: document.metadata ?? null,
  }));

  payload.documents.forEach((document) => {
    formData.append('files', document.file);
  });
  formData.append('metadata', JSON.stringify(metadataPayload));

  const response = await authorizedFetch(url, {
    method: 'POST',
    body: formData,
  });
  return handleResponse<DocumentDto[]>(response);
}

export async function replaceDocument(id: string, payload: UploadDocumentPayload): Promise<DocumentDto> {
  const url = buildBackendUrl(`/documents/${id}`);
  const formData = buildFormData(payload);
  const response = await authorizedFetch(url, {
    method: 'PUT',
    body: formData,
  });
  return handleResponse<DocumentDto>(response);
}

export async function deleteDocument(id: string): Promise<void> {
  const url = buildBackendUrl(`/documents/${id}`);
  const response = await authorizedFetch(url, {
    method: 'DELETE',
  });
  await handleVoidResponse(response);
}

function buildFormData(payload: UploadDocumentPayload): FormData {
  const formData = new FormData();
  formData.append('file', payload.file);

  appendIfPresent(formData, 'businessProfileId', payload.businessProfileId);
  appendIfPresent(formData, 'permitType', payload.permitType);
  appendIfPresent(formData, 'label', payload.label ?? payload.file.name);
  appendIfPresent(formData, 'notes', payload.notes);

  if (payload.metadata && Object.keys(payload.metadata).length > 0) {
    formData.append('metadata', JSON.stringify(payload.metadata));
  }

  return formData;
}

function appendIfPresent(formData: FormData, key: string, value: string | null | undefined): void {
  if (value !== null && value !== undefined && String(value).length > 0) {
    formData.append(key, String(value));
  }
}

function buildBackendUrl(path: string, query?: Record<string, string | null | undefined>): string {
  const base = getBackendBaseUrl();
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, value);
      }
    });
  }
  return url.toString();
}

function getBackendBaseUrl(): string {
  return getEnv('NEXT_PUBLIC_BACKEND_URL', DEFAULT_BACKEND_URL);
}

function getEnv(name: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name] as string;
  }
  if (typeof window !== 'undefined') {
    const globalWithEnv = window as unknown as Record<string, string | undefined>;
    const fromWindow = globalWithEnv[name];
    if (fromWindow) {
      return fromWindow;
    }
  }
  return fallback;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const raw = await response.text();
  const parsed = raw ? safeJsonParse(raw) : null;

  if (!response.ok) {
    const message = extractErrorMessage(parsed, raw, response.status);
    throw new Error(message);
  }

  return (parsed as T) ?? ({} as T);
}

async function handleVoidResponse(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }
  const raw = await response.text();
  const parsed = raw ? safeJsonParse(raw) : null;
  const message = extractErrorMessage(parsed, raw, response.status);
  throw new Error(message);
}

function safeJsonParse(raw: string): unknown {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return raw;
  }
}

function extractErrorMessage(content: unknown, raw: string, status: number): string {
  if (content && typeof content === 'object') {
    const record = content as Record<string, unknown>;
    if (typeof record.message === 'string') {
      return record.message;
    }
    if (Array.isArray(record.message) && record.message.length > 0) {
      return String(record.message[0]);
    }
    if (typeof record.error === 'string') {
      return record.error;
    }
  }

  if (typeof content === 'string' && content.length > 0) {
    return content;
  }

  if (raw && raw.length > 0) {
    return raw;
  }

  return `Permintaan gagal dengan status ${status}.`;
}
