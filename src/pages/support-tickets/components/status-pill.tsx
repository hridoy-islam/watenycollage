import { CheckCircle2, CircleDot, Clock } from 'lucide-react';

const STATUS_META: Record<
  string,
  { label: string; icon: typeof CircleDot; pill: string; dot: string }
> = {
  reported: {
    label: 'Reported',
    icon: CircleDot,
    pill: 'border-amber-200 bg-amber-50 text-amber-800',
    dot: 'bg-amber-500'
  },
  'in-progress': {
    label: 'In progress',
    icon: Clock,
    pill: 'border-blue-200 bg-blue-50 text-blue-800',
    dot: 'bg-blue-500'
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle2,
    pill: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500'
  }
};

const statusMeta = (status?: string) =>
  STATUS_META[status || 'reported'] || STATUS_META.reported;

/** A status as a pill, used in the list and on the details page. */
export function StatusPill({ status }: { status?: string }) {
  const meta = statusMeta(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.pill}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}
