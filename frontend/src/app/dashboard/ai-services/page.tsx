'use client';

import { useEffect, useMemo, useState } from 'react';

import ChatToolbar from '@/components/chat/ChatToolbar';

type WorkspaceTaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
type WorkspaceTaskPriority = 'high' | 'medium' | 'low';
type WorkspaceDocumentStatus = 'missing' | 'collecting' | 'ready' | 'submitted';
type WorkspaceRiskLevel = 'low' | 'medium' | 'high';
type WorkspaceOverallStatus = 'on_track' | 'at_risk' | 'blocked';

type WorkspaceTask = {
  id: string;
  title: string;
  status: WorkspaceTaskStatus;
  priority: WorkspaceTaskPriority;
  permitType: string | null;
  description: string;
  nextActions: string[];
  relatedDocuments: string[];
  dueDate: string | null;
  blockedReason: string | null;
};

type WorkspaceAnalysisDocument = {
  id: string;
  title: string;
  status: WorkspaceDocumentStatus;
  permitType: string | null;
  summary: string;
  requiredActions: string[];
  linkedTasks: string[];
};

type WorkspaceSummary = {
  headline: string;
  overallStatus: WorkspaceOverallStatus;
  riskLevel: WorkspaceRiskLevel;
  nextAction: string;
};

type WorkspaceAnalysis = {
  summary: WorkspaceSummary;
  tasks: WorkspaceTask[];
  documents: WorkspaceAnalysisDocument[];
};

type WorkspaceDocumentSnapshot = {
  id: string;
  label: string | null;
  permitType: string | null;
  filename: string | null;
  size: number | null;
  uploadedAt: string;
  updatedAt: string;
};

type WorkspaceResponse = {
  profile: BusinessProfileResponse | null;
  documents: WorkspaceDocumentSnapshot[];
  analysis: WorkspaceAnalysis;
};

type BusinessPermit = {
  id: string;
  permitType: string;
  isChecklistComplete: boolean;
  fieldChecklist: Record<string, unknown> | null;
  documents: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

type BusinessProfileResponse = {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  businessScale: string;
  province: string | null;
  city: string | null;
  address: string | null;
  industryTags: string[];
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  permits: BusinessPermit[];
};

const TASK_STATUS_LABEL: Record<WorkspaceTaskStatus, string> = {
  todo: 'Belum Dimulai',
  in_progress: 'Sedang Berjalan',
  blocked: 'Terblokir',
  done: 'Selesai',
};

const TASK_STATUS_COLOR: Record<WorkspaceTaskStatus, string> = {
  todo: 'bg-neutral-light text-neutral-dark border-neutral-light',
  in_progress: 'bg-primary/10 text-primary border-primary/40',
  blocked: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/60',
  done: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/40',
};

const PRIORITY_LABEL: Record<WorkspaceTaskPriority, string> = {
  high: 'Prioritas Tinggi',
  medium: 'Prioritas Sedang',
  low: 'Prioritas Rendah',
};

const DOCUMENT_STATUS_LABEL: Record<WorkspaceDocumentStatus, string> = {
  missing: 'Belum Ada',
  collecting: 'Dalam Pengumpulan',
  ready: 'Siap',
  submitted: 'Telah Diajukan',
};

const DOCUMENT_STATUS_COLOR: Record<WorkspaceDocumentStatus, string> = {
  missing: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/50',
  collecting: 'bg-secondary/40 text-neutral-dark border-neutral-light',
  ready: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/40',
  submitted: 'bg-primary/10 text-primary border-primary/40',
};

const RISK_LABEL: Record<WorkspaceRiskLevel, string> = {
  low: 'Risiko Rendah',
  medium: 'Risiko Sedang',
  high: 'Risiko Tinggi',
};

const RISK_COLOR: Record<WorkspaceRiskLevel, string> = {
  low: 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-[var(--color-success)]/40',
  medium: 'bg-primary/10 text-primary border-primary/40',
  high: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)] border-[var(--color-danger)]/50',
};

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

function formatDateLabel(value: string | null): string {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '-';
  }
  return parsed.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatFileSize(value: number | null): string {
  if (value === null || value === undefined) {
    return '-';
  }
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

const TASK_COLUMNS: Array<{ key: WorkspaceTaskStatus; title: string }> = [
  { key: 'todo', title: 'Belum Dimulai' },
  { key: 'in_progress', title: 'Sedang Berjalan' },
  { key: 'blocked', title: 'Terblokir' },
  { key: 'done', title: 'Selesai' },
];

export default function DashboardAiServicesPage() {
  const backendBaseUrl = useMemo(
    () => getEnv('NEXT_PUBLIC_BACKEND_URL', 'http://localhost:7600'),
    [],
  );

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadWorkspace = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${backendBaseUrl}/workspace/summary`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) {
          const message = await response.text();
          throw new Error(message || 'Gagal memuat workspace');
        }
        const data = (await response.json()) as WorkspaceResponse;
        if (active) {
          setWorkspace(data);
        }
      } catch (err) {
        if (active) {
          const message = err instanceof Error ? err.message : 'Tidak dapat memuat workspace saat ini.';
          setError(message);
          setWorkspace(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadWorkspace();
    return () => {
      active = false;
    };
  }, [backendBaseUrl]);

  const chatSuggestions = useMemo(() => {
    if (!workspace) {
      return [
        'Apa langkah pertama yang harus saya lakukan?',
        'Dokumen apa yang perlu saya siapkan?',
        'Bagaimana cara mengaktifkan Autopilot?',
      ];
    }
    const suggestions = new Set<string>();
    if (workspace.analysis.summary.nextAction) {
      suggestions.add(workspace.analysis.summary.nextAction);
    }
    workspace.analysis.tasks
      .filter((task) => task.status !== 'done')
      .slice(0, 2)
      .forEach((task) => {
        suggestions.add(`Apa langkah selanjutnya untuk ${task.title}?`);
      });
    if (workspace.analysis.documents.length > 0) {
      const pendingDoc = workspace.analysis.documents.find((doc) => doc.status !== 'ready' && doc.status !== 'submitted');
      if (pendingDoc) {
        suggestions.add(`Apa yang dibutuhkan untuk ${pendingDoc.title}?`);
      }
    }
    return Array.from(suggestions).slice(0, 3);
  }, [workspace]);

  const groupedTasks = useMemo(() => {
    const columns: Record<WorkspaceTaskStatus, WorkspaceTask[]> = {
      todo: [],
      in_progress: [],
      blocked: [],
      done: [],
    };
    workspace?.analysis.tasks.forEach((task) => {
      columns[task.status].push(task);
    });
    return columns;
  }, [workspace]);

  return (
    <div className="relative min-h-screen bg-secondary/20 pb-24">
      <main className="mx-auto w-full max-w-6xl px-6 pb-20 pt-12 text-neutral-dark md:px-10">
        <header className="border-b-2 border-black pb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">AI Services</p>
          <h1 className="mt-3 font-heading text-4xl text-neutral-dark">Task List Terpadu</h1>
          <p className="mt-3 max-w-3xl text-sm text-neutral-mid">
            Chatbot Aksara menganalisis profil usaha, dokumen pendukung, dan status checklist untuk menyusun rencana kerja kepatuhan
            yang selalu terbarui. Kelola tugas di sini, sambil membuka toolbar mengambang untuk bimbingan kontekstual.
          </p>
        </header>

        {isLoading ? (
          <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr]">
            <div className="h-[180px] animate-pulse rounded-xl border-2 border-black bg-white/70" />
            <div className="flex flex-col gap-4">
              <div className="h-[80px] animate-pulse rounded-xl border border-neutral-light bg-white/70" />
              <div className="h-[80px] animate-pulse rounded-xl border border-neutral-light bg-white/60" />
            </div>
          </section>
        ) : error ? (
          <section className="mt-10 rounded-xl border-2 border-[var(--color-danger)] bg-[var(--color-danger)]/10 p-6 text-sm text-neutral-dark">
            <h2 className="font-heading text-xl text-[var(--color-danger)]">Tidak dapat memuat data</h2>
            <p className="mt-2 text-neutral-mid">{error}</p>
            <p className="mt-4 text-neutral-mid">Coba muat ulang halaman atau periksa koneksi backend Anda.</p>
          </section>
        ) : workspace ? (
          <>
            <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_3fr]">
              <div className="flex h-full flex-col gap-4 rounded-xl border-2 border-black bg-white p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <h2 className="font-heading text-2xl text-neutral-dark">Ringkasan AI</h2>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${RISK_COLOR[workspace.analysis.summary.riskLevel]}`}>
                    {RISK_LABEL[workspace.analysis.summary.riskLevel]}
                  </span>
                </div>
                <p className="text-sm text-neutral-mid">{workspace.analysis.summary.headline}</p>
                <div className="mt-2 rounded-lg border border-neutral-light bg-secondary/30 p-4 text-sm text-neutral-dark">
                  <p className="font-semibold text-neutral-dark">Langkah berikutnya</p>
                  <p className="mt-1 text-neutral-mid">{workspace.analysis.summary.nextAction}</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-light bg-secondary/30 p-4 text-sm text-neutral-mid">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-dark">Status keseluruhan</p>
                    <p className="mt-2 text-neutral-dark">{workspace.analysis.summary.overallStatus === 'on_track' ? 'On Track' : workspace.analysis.summary.overallStatus === 'blocked' ? 'Terblokir' : 'Perlu Tindakan'}</p>
                  </div>
                  <div className="rounded-lg border border-neutral-light bg-secondary/30 p-4 text-sm text-neutral-mid">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-dark">Checklist lengkap</p>
                    <p className="mt-2 text-neutral-dark">
                      {workspace.profile?.permits.filter((permit) => permit.isChecklistComplete).length ?? 0} dari {workspace.profile?.permits.length ?? 0} izin
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border-2 border-black bg-white p-6 shadow-card">
                <h3 className="font-heading text-xl text-neutral-dark">Profil Bisnis</h3>
                {workspace.profile ? (
                  <div className="mt-4 grid gap-3 text-sm text-neutral-mid">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-dark">Nama Usaha</p>
                      <p className="mt-1 text-neutral-dark">{workspace.profile.businessName}</p>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-dark">Jenis & Skala</p>
                        <p className="mt-1 text-neutral-dark">
                          {workspace.profile.businessType} • {workspace.profile.businessScale}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-dark">Lokasi</p>
                        <p className="mt-1 text-neutral-dark">
                          {workspace.profile.city ?? '—'}, {workspace.profile.province ?? '—'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-dark">Fokus izin</p>
                      <ul className="mt-1 flex flex-wrap gap-2">
                        {workspace.profile.permits.map((permit) => (
                          <li key={permit.id} className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${permit.isChecklistComplete ? 'border-[var(--color-success)] text-[var(--color-success)]' : 'border-primary text-primary'}`}>
                            {permit.permitType}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-neutral-mid">
                    Profil bisnis belum lengkap. Gunakan chatbot untuk mengisi data awal sehingga AI dapat mempersonalisasi checklist Anda.
                  </p>
                )}
              </div>
            </section>

            <section className="mt-10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-heading text-2xl text-neutral-dark">Daftar Tugas</h2>
                <p className="text-sm text-neutral-mid">
                  Tugas terkelompok otomatis berdasarkan status. Gunakan tombol pada setiap kartu untuk melihat tindakan berikutnya.
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {TASK_COLUMNS.map((column) => (
                  <div key={column.key} className="flex h-full flex-col gap-3 rounded-xl border border-neutral-light bg-white p-4 shadow-card">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-neutral-mid">{column.title}</p>
                      <span className="text-xs text-neutral-mid">{groupedTasks[column.key].length}</span>
                    </div>
                    {groupedTasks[column.key].length === 0 ? (
                      <p className="text-sm text-neutral-mid">Belum ada tugas.</p>
                    ) : (
                      <ul className="flex flex-col gap-3">
                        {groupedTasks[column.key].map((task) => (
                          <li key={task.id} className="rounded-lg border border-neutral-light bg-secondary/20 p-4 text-sm text-neutral-dark">
                            <div className="flex items-center justify-between gap-2">
                              <h3 className="font-semibold text-neutral-dark">{task.title}</h3>
                              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] ${TASK_STATUS_COLOR[task.status]}`}>
                                {TASK_STATUS_LABEL[task.status]}
                              </span>
                            </div>
                            <p className="mt-2 text-neutral-mid">{task.description}</p>
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-neutral-mid">
                              <span className="rounded-full border border-neutral-light px-2 py-0.5 uppercase tracking-wide text-neutral-mid">{PRIORITY_LABEL[task.priority]}</span>
                              {task.permitType ? (
                                <span className="rounded-full border border-neutral-light px-2 py-0.5 uppercase tracking-wide text-neutral-mid">{task.permitType}</span>
                              ) : null}
                              {task.dueDate ? (
                                <span className="rounded-full border border-neutral-light px-2 py-0.5 uppercase tracking-wide text-neutral-mid">Jatuh tempo: {formatDateLabel(task.dueDate)}</span>
                              ) : null}
                            </div>
                            {task.nextActions.length > 0 ? (
                              <ul className="mt-3 list-disc space-y-1 pl-4 text-neutral-mid">
                                {task.nextActions.map((action, index) => (
                                  <li key={`${task.id}-action-${index}`}>{action}</li>
                                ))}
                              </ul>
                            ) : null}
                            {task.blockedReason ? (
                              <p className="mt-2 rounded-md border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-3 py-2 text-xs text-[var(--color-danger)]">
                                {task.blockedReason}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10 grid gap-6 lg:grid-cols-[3fr_2fr]">
              <div className="rounded-xl border-2 border-black bg-white p-6 shadow-card">
                <h2 className="font-heading text-2xl text-neutral-dark">Kesiapan Dokumen</h2>
                <p className="mt-2 text-sm text-neutral-mid">
                  Ikuti rekomendasi AI untuk memastikan setiap dokumen memenuhi syarat sebelum diajukan.
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {workspace.analysis.documents.map((document) => (
                    <article key={document.id} className="flex flex-col gap-3 rounded-lg border border-neutral-light bg-secondary/20 p-4 text-sm text-neutral-dark">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-neutral-dark">{document.title}</h3>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.3em] ${DOCUMENT_STATUS_COLOR[document.status]}`}>
                          {DOCUMENT_STATUS_LABEL[document.status]}
                        </span>
                      </div>
                      <p className="text-neutral-mid">{document.summary}</p>
                      {document.requiredActions.length > 0 ? (
                        <ul className="list-disc space-y-1 pl-4 text-neutral-mid">
                          {document.requiredActions.map((action, index) => (
                            <li key={`${document.id}-action-${index}`}>{action}</li>
                          ))}
                        </ul>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border-2 border-black bg-white p-6 shadow-card">
                <h2 className="font-heading text-2xl text-neutral-dark">Dokumen Terunggah</h2>
                {workspace.documents.length === 0 ? (
                  <p className="mt-3 text-sm text-neutral-mid">Belum ada dokumen yang diunggah. Mulai unggah agar AI dapat memvalidasi kelengkapan.</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-3 text-sm text-neutral-dark">
                    {workspace.documents.map((document) => (
                      <li key={document.id} className="rounded-lg border border-neutral-light bg-secondary/20 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-neutral-dark">{document.label ?? document.filename ?? 'Dokumen Pendukung'}</p>
                          <span className="text-xs text-neutral-mid">{formatFileSize(document.size)}</span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-mid">
                          {document.permitType ? `Terkait izin ${document.permitType}` : 'Tidak terikat izin tertentu'}
                        </p>
                        <p className="mt-2 text-xs text-neutral-mid">
                          Diunggah: {formatDateLabel(document.uploadedAt)} • Diperbarui: {formatDateLabel(document.updatedAt)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </>
        ) : null}
      </main>

      <ChatToolbar suggestions={chatSuggestions} />
    </div>
  );
}

