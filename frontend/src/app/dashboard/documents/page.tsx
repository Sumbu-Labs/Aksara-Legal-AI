'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function getEnv(name: string, fallback: string): string {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name] as string;
  }
  if (typeof window !== 'undefined') {
    const fromWindow = (window as unknown as Record<string, string | undefined>)[name];
    if (fromWindow) return fromWindow;
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

export default function DocumentUploadPage(): JSX.Element {
  const backendBaseUrl = useMemo(
    () => getEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:3000'),
    [],
  );
  const aiServiceBaseUrl = useMemo(
    () => getEnv('NEXT_PUBLIC_AI_SERVICE_URL', 'http://localhost:8000'),
    [],
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [aiFields, setAiFields] = useState<SchemaField[]>(DEFAULT_FIELDS);
  const [aiFieldSource, setAiFieldSource] = useState<AiFieldSource>('loading');
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPermitType, setSelectedPermitType] = useState<string>('PIRT');

  const [files, setFiles] = useState<UploadEntry[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      handleFiles(event.dataTransfer.files);
    },
    [handleFiles],
  );

  const onBrowseFiles = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const validateBeforeSubmit = useCallback(() => {
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

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitSuccess(null);
      if (!validateBeforeSubmit()) {
        return;
      }

      const formData = new FormData();
      files.forEach((entry) => {
        formData.append('files', entry.file);
      });
      const metadataPayload = files.map((entry) => ({
        ...entry.metadata,
        permitType: entry.metadata.permitType ?? selectedPermitType,
        label: entry.metadata.label && entry.metadata.label.trim().length > 0
          ? entry.metadata.label.trim()
          : entry.file.name,
      }));
      formData.append('metadata', JSON.stringify(metadataPayload));

      setIsSubmitting(true);
      try {
        const response = await fetch(`${backendBaseUrl}/documents/batch`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Gagal mengunggah dokumen');
        }
        setSubmitSuccess('Dokumen berhasil diunggah.');
        setFiles([]);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Terjadi kesalahan saat mengunggah dokumen.';
        setSubmitError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [backendBaseUrl, files, selectedPermitType, validateBeforeSubmit],
  );

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
          <form className="space-y-8" onSubmit={onSubmit}>
            <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
              <div>
                <label className="mb-2 block text-sm font-semibold uppercase tracking-[0.2em] text-neutral-mid">
                  Area Upload
                </label>
                <div
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={onDrop}
                  className="flex cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed border-neutral-light bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p className="font-heading text-2xl text-neutral-dark">
                    Seret & lepas file di sini
                  </p>
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
                    PDF, DOC, DOCX · Maksimum 10 MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    multiple
                    onChange={onBrowseFiles}
                  />
                </div>
              </div>

              <aside className="border-2 border-neutral-light bg-secondary/40 p-4 text-sm text-neutral-mid">
                <p className="font-semibold text-neutral-dark">Tips</p>
                <ul className="mt-2 space-y-2">
                  <li>Gunakan format nama file yang mudah dikenali, misalnya <em>SIUP-cabang-jogja.pdf</em>.</li>
                  <li>Pastikan dokumen sudah ditandatangani atau distempel sesuai kebutuhan.</li>
                  <li>Field metadata akan disesuaikan otomatis oleh AI Service berdasarkan jenis izin.</li>
                </ul>
              </aside>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading text-2xl text-neutral-dark">Daftar Dokumen</h2>
                <div className="flex items-center gap-3">
                  <label className="text-sm font-semibold text-neutral-mid" htmlFor="permit-filter">
                    Jenis izin utama
                  </label>
                  <select
                    id="permit-filter"
                    value={selectedPermitType}
                    onChange={(event) => setSelectedPermitType(event.target.value)}
                    className="border-2 border-neutral-light bg-white px-3 py-2 text-sm text-neutral-dark"
                  >
                    <option value="PIRT">PIRT</option>
                    <option value="HALAL">Halal</option>
                    <option value="BPOM">BPOM</option>
                  </select>
                </div>
              </div>

              {!hasFiles && (
                <div className="border-2 border-neutral-light bg-secondary/30 px-6 py-10 text-center text-neutral-mid">
                  Belum ada file yang dipilih. Unggah dokumen untuk mulai melengkapi metadata.
                </div>
              )}

              {hasFiles && (
                <div className="space-y-6">
                  {files.map((entry) => (
                    <div key={entry.id} className="border-2 border-neutral-light bg-white p-6 shadow-card">
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
      </div>
    </div>
  );
}
