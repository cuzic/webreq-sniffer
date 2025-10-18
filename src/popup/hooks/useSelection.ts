/**
 * useSelection Hook
 * Manages entry selection state
 */

import { useState, useMemo } from 'react';
import type { LogEntry, SelectionActions } from '@/types';

export function useSelection(entries: LogEntry[]) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  function handleToggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleSelectAll() {
    setSelectedIds(new Set(entries.map((e) => e.id)));
  }

  function handleClearAll() {
    setSelectedIds(new Set());
  }

  function handleInvertSelection() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      entries.forEach((entry) => {
        if (next.has(entry.id)) {
          next.delete(entry.id);
        } else {
          next.add(entry.id);
        }
      });
      return next;
    });
  }

  // Compute entries that will be exported (for preview)
  const entriesToExport = useMemo(() => {
    if (selectedIds.size > 0) {
      // Export selected entries only
      return entries.filter((entry) => selectedIds.has(entry.id));
    }
    // Export all entries when nothing is selected
    return entries;
  }, [entries, selectedIds]);

  const selectionActions: SelectionActions = {
    onToggle: handleToggle,
    onSelectAll: handleSelectAll,
    onClearAll: handleClearAll,
    onInvertSelection: handleInvertSelection,
  };

  return {
    selectedIds,
    entriesToExport,
    selectionActions,
  };
}
