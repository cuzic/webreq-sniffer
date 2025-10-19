/**
 * Filter Preview Badge Component
 * Displays real-time count of entries matching current filter criteria
 */

import { useMemo } from 'react';
import type { LogEntry } from '@/types';
import { countMatchingEntries } from '@/lib/filter-matcher';
import { cn } from '@/lib/utils';

interface FilterPreviewBadgeProps {
  entries: LogEntry[];
  searchTerm: string;
  filterType: string;
}

export function FilterPreviewBadge({ entries, searchTerm, filterType }: FilterPreviewBadgeProps) {
  // Calculate matching count efficiently using useMemo
  const matchCount = useMemo(() => {
    return countMatchingEntries(entries, { searchTerm, filterType });
  }, [entries, searchTerm, filterType]);

  const totalCount = entries.length;

  // Determine badge variant based on match results
  const variant = matchCount === 0 ? 'warning' : matchCount === totalCount ? 'success' : 'info';

  // Base badge styles
  const baseStyles =
    'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

  // Variant-specific styles
  const variantStyles = {
    success: 'bg-success/20 text-success',
    info: 'bg-primary/20 text-primary',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <span
      className={cn(baseStyles, variantStyles[variant])}
      data-variant={variant}
      role="status"
      aria-label={`${matchCount} matching entries out of ${totalCount} total`}
      aria-live="polite"
    >
      {matchCount.toLocaleString()}
    </span>
  );
}
