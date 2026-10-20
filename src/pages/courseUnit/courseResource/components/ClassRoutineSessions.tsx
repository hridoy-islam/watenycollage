/**
 * The unit's class routine, one row per scheduled session, with the documents
 * taught in each.
 *
 * Opening a material previews it in a dialog when the browser can render the
 * file (PDF, image, video, audio, plain text), with a download beside it; a
 * file it cannot render (Word, PowerPoint, Excel...) is downloaded instead.
 *
 * A document uploaded here is a `lecture` on the unit material keyed to the
 * session by `classRoutineId` - the same record the "Lecture" resource form
 * creates - so it also shows on the student and teacher class routine. The
 * rows read their documents from the page's resources rather than from the
 * routine's own `lessons`, so an upload or delete shows without a refetch.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import {
  CalendarDays,
  Download,
  Clock,
  FileText,
  Loader2,
  Pencil,
  Trash2,
  Upload,
  User,
  X
} from 'lucide-react';

import axiosInstance from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Resource } from './types';
import { MAX_FILE_SIZE } from './utils';

interface ClassRoutineSessionsProps {
  courseId?: string;
  termId?: string;
  groupId?: string;
  unitId?: string;
  resources: Resource[];
  canManage: boolean;
  uploaderId?: string;
  /** Saves uploaded documents, each as its own lesson on the given session. */
  onSaveDocuments: (
    routineId: string,
    documents: { title: string; fileUrl: string; fileName: string }[]
  ) => Promise<boolean>;
  /** Renames a material or swaps its file. */
  onUpdateDocument: (
    resource: Resource,
    changes: { title: string; fileUrl?: string; fileName?: string }
  ) => Promise<boolean>;
  onDeleteDocument: (resourceId: string) => void;
  /** Reports how many lectures (sessions) the unit has, for the tab count. */
  onCountChange?: (count: number) => void;
}

const routineIdOf = (routine: any): string | null => {
  if (!routine) return null;
  return typeof routine === 'object' ? routine._id || null : routine;
};

const teacherName = (teacher: any) =>
  teacher
    ? teacher.name ||
      `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim() ||
      teacher.email ||
      ''
    : '';

type LectureStatus = 'today' | 'upcoming' | 'completed';


/** The colour and short label a document tile shows for its file type. */
const fileStyle = (name = '') => {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return { ext: 'PDF', className: 'bg-red-50 text-red-600' };
  if (['doc', 'docx', 'rtf', 'txt'].includes(ext))
    return { ext: ext.toUpperCase(), className: 'bg-blue-50 text-blue-600' };
  if (['ppt', 'pptx', 'key'].includes(ext))
    return { ext: ext.toUpperCase(), className: 'bg-orange-50 text-orange-600' };
  if (['xls', 'xlsx', 'csv'].includes(ext))
    return { ext: ext.toUpperCase(), className: 'bg-emerald-50 text-emerald-600' };
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext))
    return { ext: ext.toUpperCase(), className: 'bg-violet-50 text-violet-600' };
  if (['mp4', 'mov', 'webm', 'mp3', 'wav'].includes(ext))
    return { ext: ext.toUpperCase(), className: 'bg-pink-50 text-pink-600' };
  return { ext: ext ? ext.toUpperCase() : 'FILE', className: 'bg-gray-100 text-black' };
};

type PreviewKind = 'pdf' | 'image' | 'video' | 'audio' | 'text';

/** How the browser can show a file, or null when it can only be downloaded. */
const previewKindOf = (name = ''): PreviewKind | null => {
  const ext = name.split('?')[0].split('.').pop()?.toLowerCase() || '';
  if (ext === 'pdf') return 'pdf';
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return 'image';
  if (['mp4', 'webm', 'ogg', 'mov'].includes(ext)) return 'video';
  if (['mp3', 'wav', 'm4a', 'aac'].includes(ext)) return 'audio';
  if (['txt', 'csv', 'json', 'md'].includes(ext)) return 'text';
  return null;
};

/**
 * Saves a file under its own name. The files live on another origin, where
 * `<a download>` is ignored, so it is fetched as a blob first; if storage
 * refuses the cross-origin read, the file is opened in a new tab instead,
 * where the browser offers to save whatever it cannot show.
 */
const downloadFile = async (url: string, fileName?: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = fileName || url.split('/').pop()?.split('?')[0] || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

const minutesBetween = (start?: string, end?: string) => {
  if (!start || !end) return 0;
  return moment(end, 'HH:mm').diff(moment(start, 'HH:mm'), 'minutes');
};

const formatDuration = (minutes: number) => {
  if (minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return [h ? `${h}h` : '', m ? `${m}m` : ''].filter(Boolean).join(' ');
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

// Class dates are stored as UTC midnight, so the date part is the day.
const sessionDay = (classDate?: string) =>
  classDate ? moment.utc(classDate).format('YYYY-MM-DD') : '';

export default function ClassRoutineSessions({
  courseId,
  termId,
  groupId,
  unitId,
  resources,
  canManage,
  uploaderId,
  onSaveDocuments,
  onUpdateDocument,
  onDeleteDocument,
  onCountChange
}: ClassRoutineSessionsProps) {
  const { toast } = useToast();
  const [routines, setRoutines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // The session the upload dialog is open for.
  const [uploadFor, setUploadFor] = useState<any>(null);
  // The files picked for it, each with its own title (the file name until
  // someone changes it).
  const [picked, setPicked] = useState<{ file: File; title: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  // Which file of the batch is uploading, counted from 1.
  const [uploadingIndex, setUploadingIndex] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  // The material the edit dialog is open for, with its lecture.
  const [editing, setEditing] = useState<{
    doc: Resource;
    routine: any;
    number: number;
  } | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [replacement, setReplacement] = useState<File | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // The material open in the preview dialog.
  const [previewing, setPreviewing] = useState<Resource | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (doc: Resource) => {
    if (!doc.fileUrl) return;
    setDownloading(true);
    try {
      await downloadFile(doc.fileUrl, doc.fileName);
    } finally {
      setDownloading(false);
    }
  };

  /** Previews what the browser can show and downloads the rest. */
  const openMaterial = (doc: Resource) => {
    if (!doc.fileUrl) return;
    if (previewKindOf(doc.fileName || doc.fileUrl)) {
      setPreviewFailed(false);
      setPreviewing(doc);
    } else {
      handleDownload(doc);
    }
  };
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchRoutines = useCallback(async () => {
    if (!unitId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {
        unitId,
        limit: 'all',
        sort: 'classDate'
      };
      if (courseId) params.courseId = courseId;
      if (termId) params.termId = termId;
      if (groupId) params.groupId = groupId;
      const res = await axiosInstance.get('/course-routine', { params });
      const result = res.data?.data?.result || [];
      setRoutines(
        [...result].sort(
          (a, b) =>
            sessionDay(a.classDate).localeCompare(sessionDay(b.classDate)) ||
            (a.startTime || '').localeCompare(b.startTime || '')
        )
      );
    } catch (error) {
      console.error('Failed to load class routine:', error);
      setRoutines([]);
    } finally {
      setLoading(false);
    }
  }, [unitId, courseId, termId, groupId]);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  useEffect(() => {
    if (!loading) onCountChange?.(routines.length);
  }, [loading, routines.length, onCountChange]);

  const documentsByRoutine = useMemo(() => {
    const map: Record<string, Resource[]> = {};
    resources.forEach((r) => {
      if (r.type !== 'lecture') return;
      const key = routineIdOf(r.classRoutineId);
      if (!key) return;
      (map[key] ||= []).push(r);
    });
    return map;
  }, [resources]);

  const today = moment().format('YYYY-MM-DD');

  const statusOf = (routine: any): LectureStatus => {
    const day = sessionDay(routine.classDate);
    if (day === today) return 'today';
    return day < today ? 'completed' : 'upcoming';
  };

  // Numbered in date order: the routine is the lecture plan.
  const lectures = useMemo(
    () => routines.map((routine, index) => ({ routine, number: index + 1 })),
    [routines]
  );

  const openUpload = (routine: any, index: number) => {
    setUploadFor({ ...routine, lectureNumber: index + 1 });
    setPicked([]);
    setProgress(0);
  };

  const closeUpload = () => {
    if (saving) return;
    setUploadFor(null);
  };

  const addFiles = (list: FileList | null) => {
    const files = Array.from(list || []);
    const tooLarge = files.filter((f) => f.size > MAX_FILE_SIZE);
    if (tooLarge.length) {
      toast({
        title: 'File too large',
        description: `${tooLarge.map((f) => f.name).join(', ')} ${
          tooLarge.length === 1 ? 'is' : 'are'
        } over 20MB and ${tooLarge.length === 1 ? 'was' : 'were'} left out.`,
        variant: 'destructive'
      });
    }
    setPicked((prev) => [
      ...prev,
      ...files
        .filter((f) => f.size <= MAX_FILE_SIZE)
        .map((file) => ({ file, title: file.name.replace(/\.[^.]+$/, '') }))
    ]);
    // Lets the same file be picked again after it was removed.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  /** Uploads one file to storage and returns its URL, reporting progress. */
  const uploadFile = async (file: File) => {
    setProgress(0);
    const form = new FormData();
    form.append('entityId', uploaderId || '');
    form.append('file_type', 'resource');
    form.append('file', file);

    const response = await axiosInstance.post('/documents', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (event.total) {
          setProgress(Math.round((event.loaded * 100) / event.total));
        }
      }
    });
    const fileUrl = response.data?.data?.fileUrl?.trim();
    if (!fileUrl) throw new Error(`Upload failed for ${file.name}`);
    return fileUrl as string;
  };

  const openEdit = (doc: Resource, routine: any, number: number) => {
    setEditing({ doc, routine, number });
    setEditTitle(doc.title || '');
    setReplacement(null);
    setProgress(0);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const pickReplacement = (list: FileList | null) => {
    const file = list?.[0];
    if (replaceInputRef.current) replaceInputRef.current.value = '';
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: 'File too large',
        description: `${file.name} is over 20MB.`,
        variant: 'destructive'
      });
      return;
    }
    setReplacement(file);
  };

  const editChanged =
    !!editing &&
    (!!replacement || editTitle.trim() !== (editing.doc.title || '').trim());

  const handleSaveEdit = async () => {
    if (!editing || !editTitle.trim() || !editChanged) return;
    setSaving(true);
    try {
      const changes: { title: string; fileUrl?: string; fileName?: string } = {
        title: editTitle.trim()
      };
      if (replacement) {
        changes.fileUrl = await uploadFile(replacement);
        changes.fileName = replacement.name;
      }
      const saved = await onUpdateDocument(editing.doc, changes);
      if (saved) setEditing(null);
    } catch (error) {
      console.error('Material update failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload the new file. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!uploadFor || picked.length === 0) return;

    setSaving(true);
    try {
      // Every file is uploaded before any lesson is saved, so a failed upload
      // part-way through leaves nothing half-attached to the session.
      const documents: { title: string; fileUrl: string; fileName: string }[] = [];
      for (let i = 0; i < picked.length; i++) {
        const { file, title } = picked[i];
        setUploadingIndex(i + 1);
        const fileUrl = await uploadFile(file);

        documents.push({
          title: title.trim() || file.name.replace(/\.[^.]+$/, ''),
          fileUrl,
          fileName: file.name
        });
      }

      const saved = await onSaveDocuments(uploadFor._id, documents);
      if (saved) setUploadFor(null);
    } catch (error) {
      console.error('Session document upload failed:', error);
      toast({
        title: 'Upload failed',
        description: 'Could not upload the documents. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
      setProgress(0);
      setUploadingIndex(0);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold text-black">
            <CalendarDays className="h-4 w-4 text-watney" />
            Lectures
          </h2>
          <p className="mt-0.5 text-xs text-black">
            {canManage
              ? 'Every class on the routine is a lecture. Upload its materials for students here.'
              : 'Every class on the routine is a lecture, with its materials.'}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center rounded-xl border border-gray-200 py-12">
          <Loader2 className="h-5 w-5 animate-spin text-watney" />
        </div>
      ) : lectures.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
          <CalendarDays className="mx-auto h-8 w-8 text-black" />
          <p className="mt-2 text-sm font-medium text-black">No lectures yet</p>
          <p className="mt-1 text-xs text-black">
            Lectures appear here once the class routine for this unit is created.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full min-w-[820px] text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/80 text-left text-[10px] font-semibold uppercase tracking-wider text-black">
                <th className="w-[150px] px-3 py-2.5">Date</th>
                <th className="w-[130px] px-3 py-2.5">Time</th>
                <th className="w-[150px] px-3 py-2.5">Teacher</th>
                <th className="px-4 py-2.5 text-right">Materials</th>
                {canManage && <th className="w-[1%] px-4 py-2.5 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lectures.map(({ routine, number }) => {
                const day = sessionDay(routine.classDate);
                const date = day ? moment(day) : null;
                const status = statusOf(routine);
                const docs = documentsByRoutine[routine._id] || [];
                const teacher = teacherName(routine.teacherId);
                const duration = formatDuration(
                  minutesBetween(routine.startTime, routine.endTime)
                );

                return (
                  <tr
                    key={routine._id}
                    className={`align-middle transition-colors hover:bg-gray-50/70 ${
                      status === 'today' ? 'bg-watney/5' : ''
                    }`}
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-black">
                      {date ? date.format('ddd, DD MMM YYYY') : 'TBC'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-black">
                      {routine.startTime && routine.endTime ? (
                        <>
                          {routine.startTime} – {routine.endTime}
                          {duration && (
                            <span className="ml-1 text-black">({duration})</span>
                          )}
                        </>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="max-w-[150px] truncate px-3 py-2.5 text-black">
                      {teacher || <span className="text-black">Not assigned</span>}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {docs.length === 0 ? (
                        <span className="text-black">No materials</span>
                      ) : (
                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                          {docs.map((doc) => {
                            const style = fileStyle(doc.fileName || doc.fileUrl);
                            const label = doc.title || doc.fileName || 'Document';
                            return (
                              <span
                                key={doc._id}
                                className="inline-flex max-w-[220px] items-center gap-1.5 rounded-md border border-gray-200 bg-white py-0.5 pl-1 pr-1.5"
                              >
                                <span
                                  className={`shrink-0 rounded px-1 py-0.5 text-[8px] font-bold leading-none ${style.className}`}
                                >
                                  {style.ext.slice(0, 4)}
                                </span>
                                {doc.fileUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => openMaterial(doc)}
                                    className="truncate text-left text-[11px] font-medium text-black hover:text-watney hover:underline"
                                    title={
                                      previewKindOf(doc.fileName || doc.fileUrl)
                                        ? `Open ${label}`
                                        : `Download ${label}`
                                    }
                                  >
                                    {label}
                                  </button>
                                ) : (
                                  <span className="truncate text-[11px] font-medium text-black">
                                    {label}
                                  </span>
                                )}
                                {doc.fileUrl && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownload(doc)}
                                    className="shrink-0 text-black hover:text-watney"
                                    title="Download"
                                    aria-label={`Download ${label}`}
                                  >
                                    <Download className="h-3 w-3" />
                                  </button>
                                )}
                                {canManage && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => openEdit(doc, routine, number)}
                                      className="shrink-0 text-black hover:text-watney"
                                      title="Edit"
                                      aria-label={`Edit ${label}`}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => onDeleteDocument(doc._id)}
                                      className="shrink-0 text-black hover:text-red-600"
                                      title="Delete"
                                      aria-label={`Delete ${label}`}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    {canManage && (
                      <td className="whitespace-nowrap px-4 py-2.5 text-right">
                        <Button
                          size="sm"
                          onClick={() => openUpload(routine, number - 1)}
                          className="h-7 bg-watney px-2.5 text-[11px] text-white hover:bg-watney/90"
                        >
                          <Upload className="mr-1 h-3 w-3" />
                          Upload
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!uploadFor} onOpenChange={(open) => !open && closeUpload()}>
        <DialogContent className="z-[9999] sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-black">
              Upload materials — Lecture {uploadFor?.lectureNumber}
            </DialogTitle>
            <DialogDescription className="text-xs text-black">
              Add the slides, notes or other files for this lecture. Students
              see them under the lecture on their class routine.
            </DialogDescription>
          </DialogHeader>

          {uploadFor && <LectureStrip routine={uploadFor} />}

          <div className="space-y-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!saving) addFiles(e.dataTransfer.files);
              }}
              disabled={saving}
              className={`flex w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-4 text-center transition-colors disabled:opacity-60 ${
                picked.length ? 'py-3' : 'py-8'
              } ${
                dragOver
                  ? 'border-watney bg-watney/10'
                  : 'border-gray-300 hover:border-watney hover:bg-watney/5'
              }`}
            >
              <Upload className="h-5 w-5 text-watney" />
              <span className="text-xs font-semibold text-black">
                {picked.length ? 'Add more files' : 'Click to choose files, or drop them here'}
              </span>
              {!picked.length && (
                <span className="text-[11px] text-black">
                  You can pick several at once. Up to 20MB each.
                </span>
              )}
            </button>

            {picked.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[11px] font-semibold text-black">
                  {picked.length} file{picked.length === 1 ? '' : 's'} ready.
                  Change a name if students should see something else.
                </p>
                <ul className="max-h-60 space-y-1.5 overflow-y-auto">
                  {picked.map((item, i) => (
                    <li
                      key={`${item.file.name}-${i}`}
                      className="flex items-start gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2"
                    >
                      <FileText className="mt-1.5 h-4 w-4 shrink-0 text-watney" />
                      <div className="min-w-0 flex-1">
                        <Input
                          value={item.title}
                          onChange={(e) =>
                            setPicked((prev) =>
                              prev.map((p, j) =>
                                j === i ? { ...p, title: e.target.value } : p
                              )
                            )
                          }
                          disabled={saving}
                          placeholder="Name shown to students"
                          aria-label={`Name shown to students for ${item.file.name}`}
                          className="h-8 bg-white text-xs"
                        />
                        <p className="mt-1 truncate text-[10px] text-black">
                          {item.file.name} · {formatSize(item.file.size)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPicked((prev) => prev.filter((_, j) => j !== i))
                        }
                        disabled={saving}
                        className="mt-1.5 shrink-0 text-black hover:text-red-600 disabled:opacity-50"
                        aria-label={`Remove ${item.file.name}`}
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {saving && uploadingIndex > 0 && (
              <div className="space-y-1">
                <p className="text-[11px] text-black">
                  Uploading file {uploadingIndex} of {picked.length}...
                </p>
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-watney transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={closeUpload} disabled={saving}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpload}
              disabled={picked.length === 0 || saving}
              className="bg-watney text-white hover:bg-watney/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  {picked.length > 1
                    ? `Upload ${picked.length} files`
                    : 'Upload materials'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editing} onOpenChange={(open) => !open && closeEdit()}>
        <DialogContent className="z-[9999] sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-black">
              Edit material — Lecture {editing?.number}
            </DialogTitle>
            <DialogDescription className="text-xs text-black">
              Rename it, or replace the file students download.
            </DialogDescription>
          </DialogHeader>

          {editing && <LectureStrip routine={editing.routine} />}

          {editing && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="material-title"
                  className="text-xs font-semibold text-black"
                >
                  Name shown to students <span className="text-red-600">*</span>
                </label>
                <Input
                  id="material-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  disabled={saving}
                  className="h-9 text-xs"
                />
                {!editTitle.trim() && (
                  <p className="text-[11px] text-red-600">A name is required.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-black">File</span>
                <input
                  ref={replaceInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => pickReplacement(e.target.files)}
                />
                {(() => {
                  const name = replacement
                    ? replacement.name
                    : editing.doc.fileName || editing.doc.fileUrl || '';
                  const style = fileStyle(name);
                  return (
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (!saving) pickReplacement(e.dataTransfer.files);
                      }}
                      className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                        replacement ? 'border-watney/40 bg-watney/5' : 'border-gray-200 bg-white'
                      }`}
                    >
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[9px] font-bold ${style.className}`}
                      >
                        {style.ext.slice(0, 4)}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-black">
                          {name || 'No file attached'}
                        </p>
                        <p className="text-[10px] text-black">
                          {replacement
                            ? `New file · ${formatSize(replacement.size)} · replaces the current one when saved`
                            : 'Current file'}
                        </p>
                      </div>
                      {replacement ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setReplacement(null)}
                          disabled={saving}
                          className="h-7 text-[11px]"
                        >
                          Keep current
                        </Button>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          {editing.doc.fileUrl && (
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px]"
                            >
                              <a
                                href={editing.doc.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open
                              </a>
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => replaceInputRef.current?.click()}
                            disabled={saving}
                            className="h-7 text-[11px]"
                          >
                            <Upload className="mr-1 h-3 w-3" />
                            Replace
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {saving && replacement && progress > 0 && (
                <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full bg-watney transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={closeEdit} disabled={saving}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveEdit}
              disabled={saving || !editChanged || !editTitle.trim()}
              className="bg-watney text-white hover:bg-watney/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="z-[9999] flex max-h-[92vh] w-[95vw] max-w-5xl flex-col gap-3 p-4">
          <DialogHeader className="pr-8">
            <DialogTitle className="truncate text-base font-semibold text-black">
              {previewing?.title || previewing?.fileName || 'Material'}
            </DialogTitle>
            {previewing?.fileName && (
              <DialogDescription className="truncate text-xs text-black">
                {previewing.fileName}
              </DialogDescription>
            )}
          </DialogHeader>

          {previewing?.fileUrl && (
            <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-gray-200 bg-gray-50">
              {(() => {
                const url = previewing.fileUrl;
                const kind = previewKindOf(previewing.fileName || url);
                if (previewFailed || !kind) {
                  return (
                    <div className="flex h-[50vh] flex-col items-center justify-center gap-3 px-6 text-center">
                      <FileText className="h-10 w-10 text-black" />
                      <p className="text-sm font-medium text-black">
                        This file cannot be shown here.
                      </p>
                      <p className="text-xs text-black">Download it to open it on your device.</p>
                    </div>
                  );
                }
                if (kind === 'image') {
                  return (
                    <div className="flex items-center justify-center p-2">
                      <img
                        src={url}
                        alt={previewing.title || ''}
                        onError={() => setPreviewFailed(true)}
                        className="max-h-[70vh] max-w-full object-contain"
                      />
                    </div>
                  );
                }
                if (kind === 'video') {
                  return (
                    <video
                      src={url}
                      controls
                      onError={() => setPreviewFailed(true)}
                      className="max-h-[70vh] w-full bg-black"
                    />
                  );
                }
                if (kind === 'audio') {
                  return (
                    <div className="flex h-40 items-center justify-center p-4">
                      <audio
                        src={url}
                        controls
                        onError={() => setPreviewFailed(true)}
                        className="w-full max-w-md"
                      />
                    </div>
                  );
                }
                // PDF and plain text: the browser's own viewer.
                return (
                  <iframe
                    src={url}
                    title={previewing.title || 'Material'}
                    className="h-[70vh] w-full bg-white"
                  />
                );
              })()}
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setPreviewing(null)}>
              Close
            </Button>
            {previewing?.fileUrl && (
              <Button
                size="sm"
                onClick={() => handleDownload(previewing)}
                disabled={downloading}
                className="bg-watney text-white hover:bg-watney/90"
              >
                {downloading ? (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                )}
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}

/** The date, time and teacher of the lecture a dialog is acting on. */
function LectureStrip({ routine }: { routine: any }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md border border-watney/20 bg-watney/5 px-3 py-2 text-xs text-black">
      <span className="flex items-center gap-1.5 font-semibold">
        <CalendarDays className="h-3.5 w-3.5 text-watney" />
        {moment(sessionDay(routine.classDate)).format('ddd DD MMM YYYY')}
      </span>
      {routine.startTime && (
        <span className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-watney" />
          {routine.startTime} - {routine.endTime}
        </span>
      )}
      <span className="flex items-center gap-1.5">
        <User className="h-3.5 w-3.5 text-watney" />
        {teacherName(routine.teacherId) || 'No teacher'}
      </span>
    </div>
  );
}
