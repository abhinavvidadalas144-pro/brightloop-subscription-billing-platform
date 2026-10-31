import React from 'react';

export type BadgeStatus =
  | 'Paid'
  | 'Active'
  | 'Confirmed'
  | 'Outstanding'
  | 'Pending'
  | 'Overdue'
  | 'Draft'
  | 'Closed'
  | 'Quotation'
  | 'Sent'
  | 'Accepted'
  | 'Converted'
  | 'Expired'
  | 'Inactive'
  | 'Limited';

interface StatusBadgeProps {
  status: BadgeStatus | string;
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showDot = true,
}) => {
  const norm = status.toLowerCase();

  // Subtle enterprise badge palette (restrained, high legibility)
  let bgStyles = 'bg-slate-100 text-slate-700 border-slate-200/80';
  let dotColor = 'bg-slate-500';

  if (norm === 'paid' || norm === 'active' || norm === 'accepted' || norm === 'converted') {
    bgStyles = 'bg-emerald-50 text-emerald-800 border-emerald-200/60';
    dotColor = 'bg-emerald-600';
  } else if (norm === 'outstanding' || norm === 'pending' || norm === 'confirmed' || norm === 'limited') {
    bgStyles = 'bg-amber-50 text-amber-800 border-amber-200/60';
    dotColor = 'bg-amber-600';
  } else if (norm === 'overdue' || norm === 'expired' || norm === 'inactive') {
    bgStyles = 'bg-rose-50 text-rose-800 border-rose-200/60';
    dotColor = 'bg-rose-600';
  } else if (norm === 'quotation' || norm === 'sent') {
    bgStyles = 'bg-sky-50 text-sky-800 border-sky-200/60';
    dotColor = 'bg-sky-600';
  } else if (norm === 'draft' || norm === 'closed') {
    bgStyles = 'bg-slate-100 text-slate-600 border-slate-200';
    dotColor = 'bg-slate-400';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium border tabular-nums whitespace-nowrap ${bgStyles} ${className}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />}
      <span>{status}</span>
    </span>
  );
};
