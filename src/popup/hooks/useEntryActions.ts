/**
 * useEntryActions Hook
 * Manages individual entry actions (copy, open, export, etc.)
 */

import { useState } from 'react';
import type { LogEntry, EntryActions } from '@/types';
import { toast } from 'sonner';
import { exportLogs } from '../messaging';
import {
  generateCurlCommand,
  generateCurlWithHeaders,
  generateYtDlpCommand,
} from '@/lib/command-generators';
import { tryCatch, tryCatchSync } from '@/lib/error-handling';

export function useEntryActions(
  setDetailsEntry: (entry: LogEntry) => void,
  setShowDetailsDialog: (show: boolean) => void,
  setManifestUrl: (url: string) => void,
  setShowManifestDialog: (show: boolean) => void
) {
  const [loading, setLoading] = useState(false);

  async function handleCopyUrl(entry: LogEntry) {
    const result = await tryCatch(
      () => navigator.clipboard.writeText(entry.url),
      'URLのコピーに失敗しました'
    );
    if (result !== null) {
      toast.success('URLをコピーしました');
    }
  }

  function handleOpenInTab(entry: LogEntry) {
    const result = tryCatchSync(
      () => chrome.tabs.create({ url: entry.url }),
      'URLを開けませんでした'
    );
    if (result !== null) {
      toast.success('新しいタブで開きました');
    }
  }

  async function handleExportSingle(entry: LogEntry) {
    setLoading(true);
    const filename = await tryCatch(
      () => exportLogs('json', [entry.id]),
      'エクスポートに失敗しました'
    );
    if (filename !== null) {
      toast.success(`${filename} をエクスポートしました`);
    }
    setLoading(false);
  }

  function handleShowDetails(entry: LogEntry) {
    setDetailsEntry(entry);
    setShowDetailsDialog(true);
  }

  async function handleCopyCurl(entry: LogEntry) {
    const command = generateCurlCommand(entry);
    const result = await tryCatch(
      () => navigator.clipboard.writeText(command),
      'コピーに失敗しました'
    );
    if (result !== null) {
      toast.success('curlコマンドをコピーしました');
    }
  }

  async function handleCopyCurlWithHeaders(entry: LogEntry) {
    const command = generateCurlWithHeaders(entry);
    const result = await tryCatch(
      () => navigator.clipboard.writeText(command),
      'コピーに失敗しました'
    );
    if (result !== null) {
      toast.success('curlコマンド（ヘッダー付き）をコピーしました');
    }
  }

  async function handleCopyYtDlp(entry: LogEntry) {
    const command = generateYtDlpCommand(entry);
    const result = await tryCatch(
      () => navigator.clipboard.writeText(command),
      'コピーに失敗しました'
    );
    if (result !== null) {
      toast.success('yt-dlpコマンドをコピーしました');
    }
  }

  function handleDelete(_entry: LogEntry) {
    // Note: Delete functionality not yet implemented
    toast.info('削除機能は実装中です');
  }

  function handleViewManifestMetadata(entry: LogEntry) {
    setManifestUrl(entry.url);
    setShowManifestDialog(true);
  }

  const entryActions: EntryActions = {
    onCopyUrl: handleCopyUrl,
    onOpenInTab: handleOpenInTab,
    onExport: handleExportSingle,
    onShowDetails: handleShowDetails,
    onDelete: handleDelete,
    onCopyCurl: handleCopyCurl,
    onCopyCurlWithHeaders: handleCopyCurlWithHeaders,
    onCopyYtDlp: handleCopyYtDlp,
    onViewManifestMetadata: handleViewManifestMetadata,
  };

  return {
    loading,
    entryActions,
  };
}
