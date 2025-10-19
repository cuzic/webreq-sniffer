/**
 * Manifest Filter Control Component
 * Displays smart manifest filtering controls for HLS/DASH playlists
 */

import { useMemo } from 'react';
import type { LogEntry } from '@/types';
import { filterManifestEntries } from '@/lib/manifest-filter';
import { detectManifestType } from '@/lib/manifest-parser';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileVideo } from 'lucide-react';

interface ManifestFilterControlProps {
  entries: LogEntry[];
  smartFilterEnabled: boolean;
  onToggleFilter: (enabled: boolean) => void;
}

export function ManifestFilterControl({
  entries,
  smartFilterEnabled,
  onToggleFilter,
}: ManifestFilterControlProps) {
  // Count how many entries would be filtered out
  const { manifestCount, filteredCount } = useMemo(() => {
    const manifests = entries.filter((entry) => detectManifestType(entry.url) !== null);
    const filtered = filterManifestEntries(entries);
    const filteredManifests = filtered.filter((entry) => detectManifestType(entry.url) !== null);

    return {
      manifestCount: manifests.length,
      filteredCount: manifests.length - filteredManifests.length,
    };
  }, [entries]);

  const hasManifests = manifestCount > 0;
  const wouldFilter = filteredCount > 0;

  // Determine badge variant
  const badgeVariant = wouldFilter ? 'info' : 'success';

  // Base badge styles
  const baseStyles =
    'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

  // Variant-specific styles
  const variantStyles = {
    success: 'bg-success/20 text-success',
    info: 'bg-primary/20 text-primary',
  };

  // Don't show if no manifests
  if (!hasManifests) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* Manifest Count Badge */}
      <div className="flex items-center gap-2">
        <FileVideo className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Manifests:</span>
        <span
          className={cn(baseStyles, variantStyles[badgeVariant])}
          data-variant={badgeVariant}
          aria-label={`${manifestCount} manifest entries, ${filteredCount} would be filtered`}
        >
          {manifestCount}
          {wouldFilter && smartFilterEnabled && (
            <span className="ml-1 opacity-70">→ {manifestCount - filteredCount}</span>
          )}
        </span>
      </div>

      {/* Toggle Button */}
      <Button
        variant={smartFilterEnabled ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToggleFilter(!smartFilterEnabled)}
        className={cn(
          'transition-colors',
          smartFilterEnabled && 'bg-primary text-primary-foreground hover:bg-primary/90'
        )}
        aria-label="Smart filter manifests"
      >
        Smart Filter
      </Button>

      {/* Info text */}
      {wouldFilter && (
        <span className="text-xs text-muted-foreground">
          {smartFilterEnabled ? 'Showing masters only' : 'Click to show masters only'}
        </span>
      )}
    </div>
  );
}
