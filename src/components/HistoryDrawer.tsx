import { useState } from 'react';
import { X, RotateCcw, Copy, Check, Trash2, Eraser } from 'lucide-react';
import { HistoryItem, LanguageMode } from '../types/studio';
import { MODULE_META, UI_COPY } from '../i18n/labels';

interface HistoryDrawerProps {
  open: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onWipeAll: () => void;
  lang: LanguageMode;
}

export function HistoryDrawer({
  open,
  onClose,
  items,
  onRestore,
  onDelete,
  onWipeAll,
  lang,
}: HistoryDrawerProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!open) return null;

  async function handleCopy(id: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      // Ignore clipboard failure
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#362419]/20 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over frosted panel */}
      <aside
        role="dialog"
        aria-label="Saved History Drawer"
        className="relative z-10 flex h-full w-full max-w-md flex-col p-4 sm:p-5"
      >
        <div className="glass-panel flex h-full flex-col overflow-hidden p-5">
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#362419]/10">
            <div>
              <h2 className="text-lg font-extrabold text-[#362419]">
                {lang === 'bn' ? UI_COPY.history.bn : UI_COPY.history.en}
              </h2>
              <p className="text-xs text-[#7A6252]">
                {items.length} {items.length === 1 ? 'saved item' : 'saved items'}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close History drawer"
              className="bubbly-btn flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#362419] border border-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {items.length === 0 ? (
              <div className="cream-well p-6 text-center text-sm text-[#7A6252]">
                {lang === 'bn'
                  ? 'এখনো কোনো ফলাফল সংরক্ষিত হয়নি। যেকোনো সমাধানে "Save" বাটনে ক্লিক করুন।'
                  : 'No saved history yet. Click "Save" on any transformation or piece of writing.'}
              </div>
            ) : (
              items.map((item) => {
                const modLabel =
                  lang === 'bn'
                    ? MODULE_META[item.module].shortTitle.bn
                    : MODULE_META[item.module].shortTitle.en;
                return (
                  <div
                    key={item.id}
                    className="cream-well p-3.5 space-y-2 transition-all hover:bg-white/75"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#FFF3E0] px-2.5 py-0.5 text-[11px] font-bold text-[#B86228]">
                        {modLabel}
                      </span>
                      <span className="text-[11px] font-medium text-[#7A6252]">
                        {item.meta}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#7A6252] line-clamp-2">
                      {item.input}
                    </p>
                    <p className="text-sm font-bold text-[#362419] line-clamp-3">
                      {item.output}
                    </p>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          onRestore(item);
                          onClose();
                        }}
                        className="bubbly-btn caramel-gloss inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold text-white cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Restore</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopy(item.id, item.output)}
                          aria-label={`Copy saved item ${item.input}`}
                          className="bubbly-btn inline-flex items-center gap-1 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-bold text-[#362419] border border-white cursor-pointer"
                        >
                          {copiedId === item.id ? (
                            <Check className="h-3 w-3 text-[#2E6F40]" />
                          ) : (
                            <Copy className="h-3 w-3 text-[#7A6252]" />
                          )}
                          <span>{copiedId === item.id ? 'Copied' : 'Copy'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
                          aria-label={`Delete saved item ${item.input}`}
                          className="bubbly-btn flex h-7 w-7 items-center justify-center rounded-full bg-white/80 text-[#7A6252] hover:text-[#B86228] border border-white cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {items.length > 0 && (
            <div className="pt-3 border-t border-[#362419]/10">
              <button
                type="button"
                onClick={onWipeAll}
                className="bubbly-btn flex w-full items-center justify-center gap-2 rounded-full bg-[#FFF3E0] hover:bg-[#FFE5BF] px-4 py-2.5 text-xs font-extrabold text-[#B86228] border border-white cursor-pointer"
              >
                <Eraser className="h-4 w-4" />
                <span>🧽 {lang === 'bn' ? UI_COPY.wipeAll.bn : UI_COPY.wipeAll.en}</span>
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
