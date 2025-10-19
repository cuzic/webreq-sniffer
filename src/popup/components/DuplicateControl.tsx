/**
 * Duplicate Control Component
 * Displays duplicate request detection and filtering controls
 */

import { useMemo } from 'react';
import type { LogEntry } from '@/types';
import { countDuplicates, DuplicateStrategy } from '@/lib/duplicate-detector';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';

interface DuplicateControlProps {
  entries: LogEntry[];
  showDuplicatesOnly: boolean;
  onToggleDuplicates: (show: boolean) => void;
  duplicateStrategy: DuplicateStrategy;
  onStrategyChange: (strategy: DuplicateStrategy) => void;
}

export function DuplicateControl({
  entries,
  showDuplicatesOnly,
  onToggleDuplicates,
  duplicateStrategy,
  onStrategyChange,
}: DuplicateControlProps) {
  // Count duplicates efficiently using useMemo
  const duplicateCount = useMemo(() => {
    return countDuplicates(entries);
  }, [entries]);

  const hasDuplicates = duplicateCount > 0;

  // Determine badge variant
  const badgeVariant = hasDuplicates ? 'warning' : 'success';

  // Base badge styles
  const baseStyles =
    'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

  // Variant-specific styles
  const variantStyles = {
    success: 'bg-success/20 text-success',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Duplicate Count Badge */}
      <div className="flex items-center gap-2">
        <Copy className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Duplicates:</span>
        <span
          className={cn(baseStyles, variantStyles[badgeVariant])}
          data-variant={badgeVariant}
          aria-label={`${duplicateCount} duplicate entries`}
        >
          {duplicateCount.toLocaleString()}
        </span>
      </div>

      {/* Toggle Button */}
      <Button
        variant={showDuplicatesOnly ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggleDuplicates(!showDuplicatesOnly)}
        className={cn(
          'transition-colors',
          showDuplicatesOnly && 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
        aria-label="Show duplicates only"
      >
        Duplicates Only
      </Button>

      {/* Strategy Selector - only show when duplicates exist */}
      {hasDuplicates && (
        <div className="flex items-center gap-2">
          <label htmlFor="duplicate-strategy" className="text-sm text-muted-foreground">
            Strategy:
          </label>
          <select
            id="duplicate-strategy"
            value={duplicateStrategy}
            onChange={(e) => onStrategyChange(e.target.value as DuplicateStrategy)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Duplicate strategy"
          >
            <option value={DuplicateStrategy.KEEP_FIRST}>Keep First</option>
            <option value={DuplicateStrategy.KEEP_LAST}>Keep Last</option>
          </select>
        </div>
      )}
    </div>
  );
}
