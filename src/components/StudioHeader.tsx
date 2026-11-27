import { useState, useRef, useEffect } from 'react';
import { BookOpen, History, Settings, Check, Volume2, Square } from 'lucide-react';
import { LanguageMode, StudioSettings } from '../types/studio';
import { useStudioSpeaker } from '../utils/studioSpeech';

interface StudioHeaderProps {
  lang: LanguageMode;
  onLangChange: (lang: LanguageMode) => void;
  historyCount: number;
  onOpenHistory: () => void;
  settings: StudioSettings;
  onUpdateSettings: (next: StudioSettings) => void;
  aiConfigured: boolean;
}

export function StudioHeader({
  lang,
  onLangChange,
  historyCount,
  onOpenHistory,
  settings,
  onUpdateSettings,
  aiConfigured,
}: StudioHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { speaking: samplePlaying, toggleSampleVoice } = useStudioSpeaker(settings.speechRate);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    if (settingsOpen) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [settingsOpen]);

  return (
    <header className="sticky top-2 lg:top-3 z-30 w-full mx-auto max-w-[1280px] px-3 sm:px-4 lg:px-6">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-2 lg:gap-3 px-3 py-2 sm:px-4 sm:py-2.5 lg:px-6 lg:py-3">
        {/* Left: Glossy bubbly studio emblem + title + <5ms badge */}
        <div className="flex items-center gap-2 lg:gap-3 min-w-0 max-w-full">
          <div
            className="caramel-gloss flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-xl lg:rounded-2xl text-white"
            aria-hidden="true"
          >
            <BookOpen className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2.3} />
          </div>
          <div className="flex items-center gap-1.5 lg:gap-2.5 flex-wrap min-w-0">
            <h1 className="text-[13px] sm:text-base lg:text-lg font-extrabold tracking-tight text-[#362419] leading-tight">
              Grammar &amp; Writing Studio
            </h1>
            <span
              className="inline-flex items-center rounded-full bg-[#E8F5E9] px-2 lg:px-2.5 py-0.5 text-[10px] lg:text-xs font-semibold text-[#2E6F40] whitespace-nowrap shrink-0 border border-white/80"
              title="Local client-side transformation speed"
            >
              ⚡ Instant &lt;5ms
            </span>
          </div>
        </div>

        {/* Right: Bilingual toggle + History drawer button + Studio Settings gear popover */}
        <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 flex-wrap max-w-full shrink-0">
          {/* Segmented Bilingual Glass Pill */}
          <div
            role="group"
            aria-label="Language mode"
            className="flex items-center rounded-full bg-[#F6EEE2]/85 p-0.5 lg:p-1 border border-white/80 shadow-inner"
          >
            <button
              type="button"
              onClick={() => onLangChange('en')}
              aria-pressed={lang === 'en'}
              className={`bubbly-btn rounded-full px-2.5 lg:px-3 py-1 lg:py-1.5 text-[11px] lg:text-xs font-bold whitespace-nowrap cursor-pointer ${
                lang === 'en'
                  ? 'caramel-gloss text-white'
                  : 'text-[#7A6252] hover:text-[#362419]'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLangChange('bn')}
              aria-pressed={lang === 'bn'}
              className={`bubbly-btn rounded-full px-2.5 lg:px-3 py-1 lg:py-1.5 text-[11px] lg:text-xs font-bold whitespace-nowrap cursor-pointer ${
                lang === 'bn'
                  ? 'caramel-gloss text-white'
                  : 'text-[#7A6252] hover:text-[#362419]'
              }`}
            >
              বাংলা + EN
            </button>
          </div>

          {/* History Drawer Button */}
          <button
            type="button"
            onClick={onOpenHistory}
            aria-label={`Open History drawer (${historyCount} saved)`}
            className="bubbly-btn inline-flex items-center gap-1.5 lg:gap-2 rounded-full bg-white/80 hover:bg-white px-2.5 lg:px-3.5 py-1.5 lg:py-2 text-[11px] lg:text-xs font-bold text-[#362419] border border-white shadow-sm whitespace-nowrap cursor-pointer"
          >
            <History className="h-3.5 w-3.5 lg:h-4 lg:w-4 text-[#B86228]" />
            <span className="hidden sm:inline">History</span>
            <span
              data-testid="history-count-badge"
              className="inline-flex min-w-[18px] lg:min-w-[20px] items-center justify-center rounded-full bg-[#FFF3E0] px-1.5 py-0.5 text-[10px] lg:text-[11px] font-extrabold text-[#B86228] tabular-nums"
            >
              {historyCount}
            </span>
          </button>

          {/* Subtle Studio Settings Gear Popover */}
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setSettingsOpen((prev) => !prev)}
              aria-label="Studio settings and engine preferences"
              aria-expanded={settingsOpen}
              className="bubbly-btn flex h-8 w-8 lg:h-9 lg:w-9 items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#7A6252] hover:text-[#362419] border border-white shadow-sm cursor-pointer"
            >
              <Settings className="h-3.5 w-3.5 lg:h-4 lg:w-4" />
            </button>

            {settingsOpen && (
              <div
                role="dialog"
                aria-label="Studio preferences"
                className="glass-panel absolute right-0 mt-2.5 w-[min(18rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] p-4 z-50 text-left"
              >
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#362419]/10">
                  <span className="text-sm font-bold text-[#362419]">Studio Preferences</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      aiConfigured
                        ? 'bg-[#E8F5E9] text-[#2E6F40]'
                        : 'bg-[#FFF3E0] text-[#B86228]'
                    }`}
                  >
                    {aiConfigured ? 'AI Ready' : 'Local Engine'}
                  </span>
                </div>

                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="speech-rate-range" className="font-semibold text-[#362419]">
                        Voice Listen Speed
                      </label>
                      <span className="font-bold text-[#B86228] tabular-nums">
                        {settings.speechRate.toFixed(1)}x
                      </span>
                    </div>
                    <input
                      id="speech-rate-range"
                      type="range"
                      min={0.7}
                      max={1.3}
                      step={0.1}
                      value={settings.speechRate}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          speechRate: Number(e.target.value),
                        })
                      }
                      className="w-full accent-[#E07A44] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={toggleSampleVoice}
                      className="mt-2 flex w-full items-center justify-between rounded-2xl bg-[#FFF3E0]/85 hover:bg-[#FFF3E0] px-3 py-1.5 text-[11px] font-bold text-[#B86228] border border-white cursor-pointer"
                    >
                      <span>Reading Voice: Studio Narrator</span>
                      <span className="inline-flex items-center gap-1">
                        {samplePlaying ? <Square className="h-3 w-3" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span>{samplePlaying ? 'Stop' : 'Sample'}</span>
                      </span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        autoSolveDefault: !settings.autoSolveDefault,
                      })
                    }
                    className="flex w-full items-center justify-between rounded-2xl bg-[#F6EEE2]/80 px-3 py-2 font-semibold text-[#362419] cursor-pointer"
                  >
                    <span>Auto-Solve on Type</span>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        settings.autoSolveDefault
                          ? 'bg-[#2E6F40] text-white'
                          : 'bg-white/70 text-transparent border border-[#7A6252]/30'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={settings.realRubberAnimation}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        realRubberAnimation: !settings.realRubberAnimation,
                      })
                    }
                    className="flex w-full items-center justify-between rounded-2xl bg-[#F6EEE2]/80 px-3 py-2 font-semibold text-[#362419] cursor-pointer"
                  >
                    <span>Real Rubber Animation</span>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        settings.realRubberAnimation
                          ? 'bg-[#2E6F40] text-white'
                          : 'bg-white/70 text-transparent border border-[#7A6252]/30'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    aria-pressed={settings.pencilWriteAnimation}
                    onClick={() =>
                      onUpdateSettings({
                        ...settings,
                        pencilWriteAnimation: !settings.pencilWriteAnimation,
                      })
                    }
                    className="flex w-full items-center justify-between rounded-2xl bg-[#F6EEE2]/80 px-3 py-2 font-semibold text-[#362419] cursor-pointer"
                  >
                    <span>Pencil Write on Examples</span>
                    <span
                      className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                        settings.pencilWriteAnimation
                          ? 'bg-[#2E6F40] text-white'
                          : 'bg-white/70 text-transparent border border-[#7A6252]/30'
                      }`}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                  </button>

                  <p className="text-[11px] leading-relaxed text-[#7A6252]">
                    Instant grammar transforms run locally in &lt;5ms. Multi-clause AI refinement &amp;
                    long-form generation connect securely through the studio server.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
