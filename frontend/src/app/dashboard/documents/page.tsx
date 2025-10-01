'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, FormEvent } from 'react';

import type { DocumentDto, PermitType, UploadDocumentPayload } from '@/services/documents';
import {
  deleteDocument,
  getDocument,
  listDocuments,
  replaceDocument,
  uploadDocumentsBatch,
} from '@/services/documents';

type SchemaFieldType = 'text' | 'textarea' | 'select' | 'date';

type SchemaFieldOption = {
  value: string;
  label: string;
};

type SchemaField = {
  id: string;
  label: string;
  description?: string;
  required?: boolean;
  type: SchemaFieldType;
  options?: SchemaFieldOption[];
};

type UploadEntry = {
  id: string;
  file: File;
  errors: string[];
  metadata: Record<string, string>;
};

type AiFieldSource = 'loading' | 'ai' | 'fallback' | 'error';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const DEFAULT_FIELDS: SchemaField[] = [
  {
    id: 'label',
    label: 'Nama Dokumen',
    description: 'Nama tampilan yang akan muncul di daftar dokumen.',
    required: true,
    type: 'text',
  },
  {
    id: 'permitType',
    label: 'Jenis Perizinan',
    description: 'Pilih jenis perizinan yang terkait dengan dokumen ini.',
    required: false,
    type: 'select',
    options: [
      { value: 'HALAL', label: 'Halal' },
      { value: 'PIRT', label: 'PIRT' },
      { value: 'BPOM', label: 'BPOM' },
    ],
  },
  {
    id: 'notes',
    label: 'Catatan Tambahan',
    description: 'Informasi singkat untuk tim internal.',
    required: false,
    type: 'textarea',
  },
];

const PERMIT_OPTIONS: PermitType[] = ['HALAL', 'PIRT', 'BPOM'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDateTime(value: string | Date | null | undefined): string {
  if (!value) {
    return '-';
  }
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return '-';
  }
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(date);
}

function getEnv(name: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env?.[name]) {
    return process.env[name] as string;
  }
  if (typeof window !== 'undefined') {
    const fromWindow = (window as unknown as Record<string, string | undefined>)[name];
    if (fromWindow) {
      return fromWindow;
    }
  }
  return fallback;
}

function parseSchemaFields(schema: unknown): SchemaField[] {
  if (!schema || typeof schema !== 'object') {
    return [];
  }

  const candidateArrays: unknown[] = [];
  const record = schema as Record<string, unknown>;
  if (Array.isArray(record.upload_fields)) {
    candidateArrays.push(record.upload_fields);
  }
  if (record.metadata && typeof record.metadata === 'object') {
    const metadata = record.metadata as Record<string, unknown>;
    if (Array.isArray(metadata.upload_fields)) {
      candidateArrays.push(metadata.upload_fields);
    }
  }
  if (record.documents && typeof record.documents === 'object') {
    const documents = record.documents as Record<string, unknown>;
    if (Array.isArray(documents.fields)) {
      candidateArrays.push(documents.fields);
    }
  }

  for (const candidate of candidateArrays) {
    if (Array.isArray(candidate)) {
      const fromArray = candidate
        .map((item) => normalizeSchemaField(item))
        .filter((field): field is SchemaField => Boolean(field));
      if (fromArray.length > 0) {
        return fromArray;
      }
    }
  }

  if (record.properties && typeof record.properties === 'object') {
    const properties = record.properties as Record<string, unknown>;
    const requiredList = new Set<string>(Array.isArray(record.required) ? record.required : []);
    const fields: SchemaField[] = [];
    Object.entries(properties).forEach(([key, rawValue]) => {
      if (!rawValue || typeof rawValue !== 'object') {
        return;
      }
      const normalized = normalizeSchemaField({
        ...(rawValue as Record<string, unknown>),
        id: key,
        required: requiredList.has(key),
      });
      if (normalized) {
        fields.push(normalized);
      }
    });
    if (fields.length > 0) {
      return fields;
    }
  }

  return [];
}

function normalizeSchemaField(field: unknown): SchemaField | null {
  if (!field || typeof field !== 'object') {
    return null;
  }
  const value = field as Record<string, unknown>;
  const id = (value.id ?? value.name ?? value.key) as string | undefined;
  if (!id) {
    return null;
  }
  const typeRaw = value.type as string | undefined;
  let type: SchemaFieldType = 'text';
  if (typeRaw === 'textarea') {
    type = 'textarea';
  } else if (typeRaw === 'select' || Array.isArray(value.enum) || Array.isArray(value.options)) {
    type = 'select';
  } else if (typeRaw === 'date' || typeRaw === 'datetime') {
    type = 'date';
  }

  let options: SchemaFieldOption[] | undefined;
  if (type === 'select') {
    const rawOptions = Array.isArray(value.options)
      ? (value.options as unknown[])
      : Array.isArray(value.enum)
        ? (value.enum as unknown[])
        : [];
    options = rawOptions
      .map((option: unknown) => {
        if (typeof option === 'string') {
          return { value: option, label: option } satisfies SchemaFieldOption;
        }
        if (option && typeof option === 'object') {
          const optRecord = option as Record<string, unknown>;
          const valueCandidate = optRecord.value ?? optRecord.id ?? optRecord.key;
          const labelCandidate = optRecord.label ?? optRecord.title ?? valueCandidate;
          if (valueCandidate !== undefined && valueCandidate !== null) {
            return {
              value: String(valueCandidate),
              label: String(labelCandidate ?? valueCandidate),
            } satisfies SchemaFieldOption;
          }
        }
        return null;
      })
      .filter((option): option is SchemaFieldOption => Boolean(option));
    if (!options || options.length === 0) {
      type = 'text';
      options = undefined;
    }
  }

  const labelCandidate = value.label ?? value.title ?? id;
  const description = value.description ?? value.helperText;
  const required = Boolean(value.required ?? value.is_required ?? value.mandatory);

  return {
    id,
    label: String(labelCandidate),
    description: description ? String(description) : undefined,
    required,
    type,
    options,
  } satisfies SchemaField;
}

function createInitialMetadata(fields: SchemaField[]): Record<string, string> {
  const initial: Record<string, string> = {};
  fields.forEach((field) => {
    if (field.type === 'select' && field.options && field.options.length > 0) {
      initial[field.id] = field.options[0].value;
    } else {
      initial[field.id] = '';
    }
  });
  return initial;
}


function isPermitType(value: string | null | undefined): value is PermitType {
  if (!value) {
    return false;
  }
  return PERMIT_OPTIONS.includes(value as PermitType);
}

function trimToNull(value: string | null | undefined): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function sanitizeMetadataRecord(record: Record<string, string>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  Object.entries(record).forEach(([key, value]) => {
    const trimmed = trimToNull(value);
    if (trimmed !== null) {
      sanitized[key] = trimmed;
    }
  });
  return sanitized;
}

function toUploadPayload(entry: UploadEntry, fallbackPermitType: string): UploadDocumentPayload {
  const {
    label: rawLabel,
    permitType: rawPermitType,
    notes: rawNotes,
    businessProfileId: rawBusinessProfileId,
    ...rest
  } = entry.metadata;

  const cleanedLabel = trimToNull(rawLabel) ?? entry.file.name;
  const candidatePermit = trimToNull(rawPermitType) ?? trimToNull(fallbackPermitType)?.toUpperCase();
  const normalizedPermit = candidatePermit ? candidatePermit.toUpperCase() : null;
  const permitType = isPermitType(normalizedPermit) ? normalizedPermit : null;
  const businessProfileId = trimToNull(rawBusinessProfileId);
  const metadata = sanitizeMetadataRecord(rest);

  return {
    file: entry.file,
    label: cleanedLabel,
    notes: trimToNull(rawNotes),
    permitType,
    businessProfileId,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
  } satisfies UploadDocumentPayload;
}

function parseMetadataInput(rawValue: string): Record<string, unknown> | null {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return null;
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    throw new Error('Metadata harus berupa JSON valid.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Metadata harus berupa objek JSON.');
  }
  return parsed as Record<string, unknown>;
}

export default function DocumentUploadPage(): JSX.Element {
  const aiServiceBaseUrl = useMemo(
    () => getEnv('NEXT_PUBLIC_AI_SERVICE_URL', 'http://localhost:7700'),
    [],
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement | null>(null);

  const [aiFields, setAiFields] = useState<SchemaField[]>(DEFAULT_FIELDS);
  const [aiFieldSource, setAiFieldSource] = useState<AiFieldSource>('loading');
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPermitType, setSelectedPermitType] = useState<string>('PIRT');

  const [files, setFiles] = useState<UploadEntry[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState<boolean>(true);
  const [documentsError, setDocumentsError] = useState<string | null>(null);
  const [documentsStatus, setDocumentsStatus] = useState<string | null>(null);

  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<DocumentDto | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState<boolean>(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailStatus, setDetailStatus] = useState<string | null>(null);
  const [detailActionError, setDetailActionError] = useState<string | null>(null);

  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceLabel, setReplaceLabel] = useState<string>('');
  const [replacePermitType, setReplacePermitType] = useState<string>('');
  const [replaceNotes, setReplaceNotes] = useState<string>('');
  const [replaceMetadata, setReplaceMetadata] = useState<string>('');
  const [isReplacing, setIsReplacing] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const loadDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const response = await listDocuments(true);
      setDocuments(response);
    } catch (error) {
      setDocumentsError(error instanceof Error ? error.message : 'Gagal memuat dokumen.');
    } finally {
      setDocumentsLoading(false);
    }
  }, []);

  const openDocumentDetail = useCallback(async (documentId: string) => {
    setSelectedDocumentId(documentId);
    setIsDetailLoading(true);
    setDetailError(null);
    setDetailStatus(null);
    setDetailActionError(null);
    try {
      const document = await getDocument(documentId);
      setSelectedDocument(document);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Gagal memuat detail dokumen.');
      setSelectedDocument(null);
    } finally {
      setIsDetailLoading(false);
    }
  }, []);

  const refreshDocumentsAndDetail = useCallback(async () => {
    await loadDocuments();
    if (selectedDocumentId) {
      await openDocumentDetail(selectedDocumentId);
    }
  }, [loadDocuments, openDocumentDetail, selectedDocumentId]);

  const loadAiFields = useCallback(
    async (permitType: string) => {
      setAiFieldSource('loading');
      setAiError(null);
      try {
        const response = await fetch(
          `${aiServiceBaseUrl}/v1/templates/${encodeURIComponent(permitType.toUpperCase())}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          },
        );

        if (!response.ok) {
          throw new Error(`Gagal memuat form AI (${response.status})`);
        }
        const data = (await response.json()) as {
          schema_data?: unknown;
        };
        const extracted = parseSchemaFields(data?.schema_data);
        if (extracted.length === 0) {
          throw new Error('Schema AI tidak menyediakan field upload.');
        }
        setAiFields(extracted);
        setAiFieldSource('ai');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Tidak dapat memuat konfigurasi AI';
        setAiError(message);
        setAiFields(DEFAULT_FIELDS);
        setAiFieldSource('fallback');
      }
    },
    [aiServiceBaseUrl],
  );

  useEffect(() => {
    loadAiFields(selectedPermitType).catch(() => {
      setAiError('Tidak dapat menghubungi layanan AI');
      setAiFieldSource('error');
      setAiFields(DEFAULT_FIELDS);
    });
  }, [loadAiFields, selectedPermitType]);

  useEffect(() => {
    loadDocuments().catch(() => undefined);
  }, [loadDocuments]);

  useEffect(() => {
    setFiles((prev) =>
      prev.map((entry) => {
        const nextMetadata = { ...entry.metadata };
        const fieldIds = new Set(aiFields.map((field) => field.id));
        aiFields.forEach((field) => {
          if (nextMetadata[field.id] === undefined) {
            nextMetadata[field.id] = field.type === 'select' && field.options?.length
              ? field.options[0].value
              : '';
          }
        });
        Object.keys(nextMetadata).forEach((key) => {
          if (!fieldIds.has(key)) {
            delete nextMetadata[key];
          }
        });
        return {
          ...entry,
          metadata: nextMetadata,
        } satisfies UploadEntry;
      }),
    );
  }, [aiFields]);

  useEffect(() => {
    if (!selectedDocument) {
      setReplaceFile(null);
      setReplaceLabel('');
      setReplacePermitType('');
      setReplaceNotes('');
      setReplaceMetadata('');
      setDetailStatus(null);
      setDetailActionError(null);
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = '';
      }
      return;
    }

    setReplaceFile(null);
    setReplaceLabel(selectedDocument.label ?? '');
    setReplacePermitType(selectedDocument.permitType ?? '');
    setReplaceNotes(selectedDocument.currentVersion?.notes ?? '');
    setReplaceMetadata(
      selectedDocument.currentVersion?.metadata
        ? JSON.stringify(selectedDocument.currentVersion.metadata, null, 2)
        : '',
    );
    setDetailStatus(null);
    setDetailActionError(null);
    if (replaceFileInputRef.current) {
      replaceFileInputRef.current.value = '';
    }
  }, [selectedDocument]);

  const handleFiles = useCallback(
    (incoming: FileList | File[]) => {
      const fileArray = Array.from(incoming).filter(Boolean) as File[];
      if (fileArray.length === 0) {
        return;
      }

      setFiles((prev) => {
        const existingSignature = new Set(
          prev.map((entry) => `${entry.file.name}-${entry.file.size}-${entry.file.lastModified}`),
        );
        const nextEntries: UploadEntry[] = [...prev];

        fileArray.forEach((file) => {
          const signature = `${file.name}-${file.size}-${file.lastModified}`;
          if (existingSignature.has(signature)) {
            return;
          }

          const errors: string[] = [];
          if (!ACCEPTED_MIME_TYPES.has(file.type)) {
            errors.push('Format file harus PDF, DOC, atau DOCX.');
          }
          if (file.size > MAX_FILE_SIZE_BYTES) {
            errors.push('Ukuran file maksimal 10 MB.');
          }

          const initialMetadata = createInitialMetadata(aiFields);
          if (Object.prototype.hasOwnProperty.call(initialMetadata, 'permitType')) {
            initialMetadata.permitType = selectedPermitType;
          }

          const entry: UploadEntry = {
            id: crypto.randomUUID(),
            file,
            errors,
            metadata: initialMetadata,
          };
          nextEntries.push(entry);
          existingSignature.add(signature);
        });

        return nextEntries;
      });
    },
    [aiFields, selectedPermitType],
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleBrowseFiles = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.files) {
        handleFiles(event.target.files);
        event.target.value = '';
      }
    },
    [handleFiles],
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const updateMetadata = useCallback((id: string, fieldId: string, value: string) => {
    setFiles((prev) =>
      prev.map((entry) => {
        if (entry.id !== id) {
          return entry;
        }
        return {
          ...entry,
          metadata: {
            ...entry.metadata,
            [fieldId]: value,
          },
        } satisfies UploadEntry;
      }),
    );
  }, []);

  const validateUploadEntries = useCallback(() => {
    const nextEntries: UploadEntry[] = [];
    let hasBlockingError = false;

    files.forEach((entry) => {
      const errors = [...entry.errors];
      aiFields.forEach((field) => {
        if (field.required && !entry.metadata[field.id]) {
          errors.push(`Field "${field.label}" wajib diisi.`);
        }
      });
      nextEntries.push({ ...entry, errors });
      if (errors.length > 0) {
        hasBlockingError = true;
      }
    });

    setFiles(nextEntries);
    if (files.length === 0) {
      setSubmitError('Tambahkan minimal satu dokumen untuk diunggah.');
      return false;
    }
    if (hasBlockingError) {
      setSubmitError('Periksa kembali dokumen yang belum valid.');
      return false;
    }
    setSubmitError(null);
    return true;
  }, [aiFields, files]);

  const handleUploadSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitSuccess(null);
      if (!validateUploadEntries()) {
        return;
      }

      const payloads: UploadDocumentPayload[] = files.map((entry) =>
        toUploadPayload(entry, selectedPermitType),
      );

      setIsSubmitting(true);
      try {
        await uploadDocumentsBatch({ documents: payloads });
        setSubmitSuccess('Dokumen berhasil diunggah.');
        setFiles([]);
        await refreshDocumentsAndDetail();
        setDocumentsStatus('Daftar dokumen diperbarui.');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunggah dokumen.';
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [files, refreshDocumentsAndDetail, selectedPermitType, validateUploadEntries],
  );

  const handleReplaceFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      setReplaceFile(null);
      return;
    }
    setReplaceFile(event.target.files[0]);
  }, []);

  const handleReplaceSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!selectedDocument) {
        return;
      }
      if (!replaceFile) {
        setDetailActionError('Pilih file baru sebelum memperbarui dokumen.');
        return;
      }

      let metadataObject: Record<string, unknown> | null = null;
      try {
        metadataObject = parseMetadataInput(replaceMetadata);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Metadata tidak valid.';
        setDetailActionError(message);
        return;
      }

      setIsReplacing(true);
      setDetailActionError(null);
      setDetailStatus(null);
      try {
        const payload: UploadDocumentPayload = {
          file: replaceFile,
          label: trimToNull(replaceLabel) ?? replaceFile.name,
          notes: trimToNull(replaceNotes),
          permitType: isPermitType(replacePermitType) ? replacePermitType : selectedDocument.permitType,
          businessProfileId: selectedDocument.businessProfileId,
          metadata: metadataObject,
        };
        await replaceDocument(selectedDocument.id, payload);
        setDetailStatus('Dokumen berhasil diperbarui.');
        setReplaceFile(null);
        if (replaceFileInputRef.current) {
          replaceFileInputRef.current.value = '';
        }
        await refreshDocumentsAndDetail();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Gagal memperbarui dokumen.';
        setDetailActionError(message);
      } finally {
        setIsReplacing(false);
      }
    },
    [refreshDocumentsAndDetail, replaceFile, replaceLabel, replaceMetadata, replaceNotes, replacePermitType, selectedDocument],
  );

  const handleDeleteDocument = useCallback(async () => {
    if (!selectedDocument) {
      return;
    }
    const confirmed = window.confirm('Hapus dokumen beserta semua versinya?');
    if (!confirmed) {
      return;
    }
    setIsDeleting(true);
    setDetailActionError(null);
    setDetailStatus(null);
    try {
      await deleteDocument(selectedDocument.id);
      setDocumentsStatus('Dokumen berhasil dihapus.');
      setSelectedDocument(null);
      setSelectedDocumentId(null);
      setReplaceFile(null);
      if (replaceFileInputRef.current) {
        replaceFileInputRef.current.value = '';
      }
      await loadDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Gagal menghapus dokumen.';
      setDetailActionError(message);
    } finally {
      setIsDeleting(false);
    }
  }, [loadDocuments, selectedDocument]);

  const handleRefreshDocuments = useCallback(async () => {
    setDocumentsStatus(null);
    await refreshDocumentsAndDetail();
  }, [refreshDocumentsAndDetail]);

  const hasFiles = files.length > 0;

  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="border-2 border-black bg-white px-8 py-6 shadow-card">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                Dashboard
              </p>
              <h1 className="font-heading text-4xl font-bold text-neutral-dark">
                Upload Dokumen Kepatuhan
              </h1>
              <p className="text-neutral-mid text-base">
                Seret & lepas file PDF atau DOCX, atau pilih dari perangkat Anda. Maksimum 10 MB per file.
              </p>
            </div>
            <div className="border-2 border-neutral-light bg-secondary/60 px-4 py-3 text-sm text-neutral-dark">
              <p className="font-semibold">Konfigurasi Form</p>
              <p className="text-neutral-mid">
                {aiFieldSource === 'loading' && 'Memuat field dari AI...'}
                {aiFieldSource === 'ai' && 'Field otomatis dari AI Service.'}
                {aiFieldSource === 'fallback' && 'Menggunakan field default (AI tidak tersedia).'}
                {aiFieldSource === 'error' && 'Gagal memuat field dari AI.'}
              </p>
            </div>
          </div>
        </header>

        <section className="border-2 border-black bg-white p-8 shadow-card">
          <form className="space-y-8" onSubmit={handleUploadSubmit}>
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-mid" htmlFor="permit-selector">
                      Jenis Perizinan
                    </label>
                    <select
                      id="permit-selector"
                      className="border-2 border-neutral-light bg-secondary/20 px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                      value={selectedPermitType}
                      onChange={(event) => setSelectedPermitType(event.target.value.toUpperCase())}
                    >
                      {PERMIT_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-mid" htmlFor="ai-refresh">
                      Sinkronisasi Schema AI
                    </label>
                    <button
                      id="ai-refresh"
                      type="button"
                      className="border-2 border-black bg-secondary px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-dark transition-colors hover:bg-secondary/70 disabled:cursor-not-allowed disabled:opacity-60"
                      onClick={() => loadAiFields(selectedPermitType)}
                      disabled={aiFieldSource === 'loading'}
                    >
                      {aiFieldSource === 'loading' ? 'Memuat...' : 'Muat Ulang Field AI'}
                    </button>
                  </div>
                </div>

                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-neutral-mid">
                  Area Upload
                </label>
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-neutral-light bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="font-heading text-2xl text-neutral-dark">Seret & lepas file di sini</p>
                  <p className="text-sm text-neutral-mid">
                    atau
                    <button
                      type="button"
                      className="ml-2 inline-flex items-center border-2 border-black bg-primary px-3 py-1 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
                      onClick={(event) => {
                        event.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      Pilih File
                    </button>
                  </p>
                  <p className="text-xs text-neutral-mid">
                    Format yang didukung: PDF, DOC, DOCX. Maksimal 10 MB per file.
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleBrowseFiles}
                />

                {hasFiles && (
                  <div className="space-y-6">
                    {files.map((entry) => (
                      <div key={entry.id} className="border-2 border-neutral-light bg-secondary/20 p-4">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-neutral-dark">{entry.file.name}</p>
                            <p className="text-xs text-neutral-mid">{formatBytes(entry.file.size)}</p>
                          </div>
                          <button
                            type="button"
                            className="self-start border-2 border-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-dark transition-colors hover:bg-secondary"
                            onClick={() => removeFile(entry.id)}
                          >
                            Hapus
                          </button>
                        </div>

                        {entry.errors.length > 0 && (
                          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-danger)]">
                            {entry.errors.map((error, index) => (
                              <li key={`${entry.id}-error-${index}`}>{error}</li>
                            ))}
                          </ul>
                        )}

                        <div className="mt-5 grid gap-4 md:grid-cols-2">
                          {aiFields.map((field) => {
                            const value = entry.metadata[field.id] ?? '';
                            return (
                              <div key={`${entry.id}-${field.id}`} className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-neutral-dark" htmlFor={`${entry.id}-${field.id}`}>
                                  {field.label}
                                  {field.required ? <span className="text-[var(--color-danger)]">*</span> : null}
                                </label>
                                {field.type === 'textarea' ? (
                                  <textarea
                                    id={`${entry.id}-${field.id}`}
                                    className="min-h-[96px] border-2 border-neutral-light bg-secondary/20 px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                                    value={value}
                                    onChange={(event) => updateMetadata(entry.id, field.id, event.target.value)}
                                  />
                                ) : field.type === 'select' && field.options ? (
                                  <select
                                    id={`${entry.id}-${field.id}`}
                                    className="border-2 border-neutral-light bg-secondary/20 px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                                    value={value}
                                    onChange={(event) => updateMetadata(entry.id, field.id, event.target.value)}
                                  >
                                    {field.options.map((option) => (
                                      <option key={option.value} value={option.value}>
                                        {option.label}
                                      </option>
                                    ))}
                                  </select>
                                ) : field.type === 'date' ? (
                                  <input
                                    id={`${entry.id}-${field.id}`}
                                    type="date"
                                    className="border-2 border-neutral-light bg-secondary/20 px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                                    value={value}
                                    onChange={(event) => updateMetadata(entry.id, field.id, event.target.value)}
                                  />
                                ) : (
                                  <input
                                    id={`${entry.id}-${field.id}`}
                                    type="text"
                                    className="border-2 border-neutral-light bg-secondary/20 px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                                    value={value}
                                    onChange={(event) => updateMetadata(entry.id, field.id, event.target.value)}
                                  />
                                )}
                                {field.description ? (
                                  <p className="text-xs text-neutral-mid">{field.description}</p>
                                ) : null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <aside className="flex flex-col gap-4 rounded border-2 border-neutral-light bg-secondary/20 p-4 text-sm text-neutral-dark">
                <h2 className="font-heading text-lg font-semibold">Tips Upload</h2>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Gunakan nama file yang menggambarkan isi dokumen.</li>
                  <li>Pastikan ukuran file tidak melebihi 10 MB.</li>
                  <li>Lengkapi metadata agar tim dapat memproses lebih cepat.</li>
                </ul>
              </aside>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-neutral-mid">
                {submitError && <p className="text-[var(--color-danger)]">{submitError}</p>}
                {submitSuccess && <p className="text-[var(--color-success)]">{submitSuccess}</p>}
                {aiError && aiFieldSource !== 'ai' && (
                  <p className="text-[var(--color-warning)]">{aiError}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="border-2 border-black px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-dark transition-colors hover:bg-secondary"
                  onClick={() => {
                    setFiles([]);
                    setSubmitError(null);
                    setSubmitSuccess(null);
                  }}
                  disabled={isSubmitting}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="border-2 border-black bg-primary px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
                  disabled={isSubmitting || !hasFiles}
                >
                  {isSubmitting ? 'Mengunggah...' : 'Unggah Dokumen'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="border-2 border-black bg-white p-8 shadow-card">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-heading text-3xl font-semibold text-neutral-dark">Dokumen Terunggah</h2>
              <p className="text-sm text-neutral-mid">
                Lihat histori versi, unduh file terbaru, dan kelola metadata dokumen bisnis Anda.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="border-2 border-black px-4 py-2 text-sm font-semibold uppercase tracking-wide text-neutral-dark transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleRefreshDocuments}
                disabled={documentsLoading}
              >
                {documentsLoading ? 'Memuat...' : 'Segarkan Daftar'}
              </button>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            {documentsStatus && <p className="text-[var(--color-success)]">{documentsStatus}</p>}
            {documentsError && <p className="text-[var(--color-danger)]">{documentsError}</p>}
          </div>

          <div className="mt-6 grid gap-8 lg:grid-cols-[2fr_3fr]">
            <div className="space-y-4">
              {documentsLoading && documents.length === 0 && (
                <p className="text-sm text-neutral-mid">Memuat daftar dokumen...</p>
              )}
              {!documentsLoading && documents.length === 0 && !documentsError && (
                <p className="text-sm text-neutral-mid">Belum ada dokumen yang diunggah.</p>
              )}
              <ul className="flex flex-col gap-3">
                {documents.map((document) => {
                  const isActive = document.id === selectedDocumentId;
                  const currentVersion = document.currentVersion;
                  const label = document.label ?? currentVersion?.originalFilename ?? 'Tanpa nama';
                  return (
                    <li key={document.id}>
                      <button
                        type="button"
                        className={`flex w-full flex-col gap-1 border-2 border-black px-4 py-3 text-left transition-colors hover:bg-secondary/40 ${
                          isActive ? 'bg-primary text-white' : 'bg-white text-neutral-dark'
                        }`}
                        onClick={() => openDocumentDetail(document.id)}
                      >
                        <span className="text-base font-semibold">{label}</span>
                        <span className="text-xs uppercase tracking-[0.2em]">
                          {document.permitType ?? 'Tidak ada tipe'}
                        </span>
                        <span className="text-xs">
                          Diperbarui {formatDateTime(document.updatedAt)} • {currentVersion ? formatBytes(currentVersion.size) : 'Ukuran tidak tersedia'}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-2 border-neutral-light bg-secondary/10 p-6">
              {isDetailLoading && <p className="text-sm text-neutral-mid">Memuat detail dokumen...</p>}
              {detailError && !isDetailLoading && (
                <p className="text-sm text-[var(--color-danger)]">{detailError}</p>
              )}
              {!selectedDocument && !isDetailLoading && !detailError && (
                <p className="text-sm text-neutral-mid">Pilih salah satu dokumen untuk melihat detail dan riwayat versinya.</p>
              )}

              {selectedDocument && !isDetailLoading && !detailError && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-heading text-2xl font-semibold text-neutral-dark">
                      {selectedDocument.label ?? selectedDocument.currentVersion?.originalFilename ?? 'Tanpa nama'}
                    </h3>
                    <p className="text-sm text-neutral-mid">
                      Jenis izin: {selectedDocument.permitType ?? 'Tidak ada'} • Dibuat {formatDateTime(selectedDocument.createdAt)} • Diperbarui {formatDateTime(selectedDocument.updatedAt)}
                    </p>
                    {selectedDocument.currentVersion ? (
                      <div className="rounded border border-neutral-light bg-white p-4 text-sm">
                        <p className="font-semibold text-neutral-dark">Versi aktif #{selectedDocument.currentVersion.version}</p>
                        <p className="text-neutral-mid">
                          {selectedDocument.currentVersion.originalFilename} • {formatBytes(selectedDocument.currentVersion.size)} • {formatDateTime(selectedDocument.currentVersion.createdAt)}
                        </p>
                        {selectedDocument.currentVersion.downloadUrl ? (
                          <a
                            href={selectedDocument.currentVersion.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center border-2 border-black bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark"
                          >
                            Unduh Versi Terbaru
                          </a>
                        ) : (
                          <p className="mt-3 text-xs text-neutral-mid">Link unduhan belum tersedia.</p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <h4 className="font-semibold text-neutral-dark">Riwayat Versi</h4>
                    <div className="mt-3 space-y-3">
                      {selectedDocument.versions.map((version) => {
                        const isCurrent = selectedDocument.currentVersion?.id === version.id;
                        return (
                          <div
                            key={version.id}
                            className={`border border-neutral-light bg-white p-4 text-sm ${isCurrent ? 'border-primary bg-secondary/30' : ''}`}
                          >
                            <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-semibold text-neutral-dark">Versi {version.version}</p>
                                <p className="text-neutral-mid">
                                  {version.originalFilename} • {formatBytes(version.size)} • {formatDateTime(version.createdAt)}
                                </p>
                              </div>
                              {isCurrent && <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Aktif</span>}
                            </div>
                            {version.notes ? (
                              <p className="mt-2 text-neutral-dark">Catatan: {version.notes}</p>
                            ) : null}
                            {version.downloadUrl ? (
                              <a
                                href={version.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center border border-black px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-dark transition-colors hover:bg-secondary"
                              >
                                Unduh Versi Ini
                              </a>
                            ) : !isCurrent ? (
                              <p className="mt-3 text-xs text-neutral-mid">
                                Link unduhan hanya tersedia untuk versi terbaru.
                              </p>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-neutral-dark">Perbarui Dokumen</h4>
                    {detailActionError && (
                      <p className="text-sm text-[var(--color-danger)]">{detailActionError}</p>
                    )}
                    {detailStatus && (
                      <p className="text-sm text-[var(--color-success)]">{detailStatus}</p>
                    )}
                    <form className="space-y-4" onSubmit={handleReplaceSubmit}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-neutral-dark" htmlFor="replace-label">
                            Nama Dokumen
                          </label>
                          <input
                            id="replace-label"
                            type="text"
                            className="border-2 border-neutral-light bg-white px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                            value={replaceLabel}
                            onChange={(event) => setReplaceLabel(event.target.value)}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-semibold text-neutral-dark" htmlFor="replace-permit">
                            Jenis Perizinan
                          </label>
                          <select
                            id="replace-permit"
                            className="border-2 border-neutral-light bg-white px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                            value={replacePermitType}
                            onChange={(event) => setReplacePermitType(event.target.value.toUpperCase())}
                          >
                            <option value="">Pertahankan ({selectedDocument.permitType ?? 'Tidak ada'})</option>
                            {PERMIT_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-neutral-dark" htmlFor="replace-notes">
                          Catatan Versi
                        </label>
                        <textarea
                          id="replace-notes"
                          className="min-h-[96px] border-2 border-neutral-light bg-white px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                          value={replaceNotes}
                          onChange={(event) => setReplaceNotes(event.target.value)}
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-neutral-dark" htmlFor="replace-metadata">
                          Metadata (JSON)
                        </label>
                        <textarea
                          id="replace-metadata"
                          className="min-h-[160px] border-2 border-neutral-light bg-white px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                          value={replaceMetadata}
                          onChange={(event) => setReplaceMetadata(event.target.value)}
                        />
                        <p className="text-xs text-neutral-mid">Kosongkan untuk menghapus metadata, atau gunakan format JSON objek.</p>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-neutral-dark" htmlFor="replace-file">
                          File Baru
                        </label>
                        <input
                          id="replace-file"
                          ref={replaceFileInputRef}
                          type="file"
                          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                          onChange={handleReplaceFileChange}
                          className="border-2 border-neutral-light bg-white px-3 py-2 text-sm text-neutral-dark focus:border-primary focus:outline-none"
                        />
                        {replaceFile ? (
                          <p className="text-xs text-neutral-mid">
                            File dipilih: {replaceFile.name} • {formatBytes(replaceFile.size)}
                          </p>
                        ) : (
                          <p className="text-xs text-neutral-mid">Pilih file baru untuk membuat versi terbaru.</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <button
                          type="submit"
                          className="border-2 border-black bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-primary/60"
                          disabled={isReplacing}
                        >
                          {isReplacing ? 'Menyimpan...' : 'Unggah Versi Baru'}
                        </button>
                        <button
                          type="button"
                          className="border-2 border-[var(--color-danger)] px-5 py-2 text-sm font-semibold uppercase tracking-wide text-[var(--color-danger)] transition-colors hover:bg-[var(--color-danger)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          onClick={handleDeleteDocument}
                          disabled={isDeleting}
                        >
                          {isDeleting ? 'Menghapus...' : 'Hapus Dokumen'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
