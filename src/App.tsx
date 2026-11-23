import { useState, useEffect } from 'react';
import {
  HistoryItem,
  LanguageMode,
  ModuleId,
  StudioSettings,
} from './types/studio';
import { MODULE_META } from './i18n/labels';
import { AmbientBackground } from './components/AmbientBackground';
import { StudioHeader } from './components/StudioHeader';
import { ModuleDock } from './components/ModuleDock';
import { HistoryDrawer } from './components/HistoryDrawer';
import { NarrationModule } from './components/modules/NarrationModule';
import { VoiceModule } from './components/modules/VoiceModule';
import { SuffixPrefixModule } from './components/modules/SuffixPrefixModule';
import { PartsOfSpeechModule } from './components/modules/PartsOfSpeechModule';
import { VerbChangingModule } from './components/modules/VerbChangingModule';
import { WriterModule } from './components/modules/WriterModule';
import {
  DEFAULT_STUDIO_SETTINGS,
  StudioPrefsContext,
  normalizeStudioSettings,
} from './context/StudioPrefsContext';

const INITIAL_INPUTS: Record<ModuleId, string> = {
  narration: MODULE_META.narration.examples[0],
  voice: MODULE_META.voice.examples[0],
  morpheme: MODULE_META.morpheme.examples[0],
  pos: MODULE_META.pos.examples[0],
  verbs: MODULE_META.verbs.examples[0],
  paragraph: MODULE_META.paragraph.examples[0],
  dialogue: MODULE_META.dialogue.examples[0],
  composition: MODULE_META.composition.examples[0],
};

const HISTORY_STORAGE_KEY = 'gws_history_v1';
const SETTINGS_STORAGE_KEY = 'gws_settings_v1';

export default function App() {
  const [activeModule, setActiveModule] = useState<ModuleId>('narration');
  const [lang, setLang] = useState<LanguageMode>('en');
  const [inputs, setInputs] = useState<Record<ModuleId, string>>(INITIAL_INPUTS);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);

  const [settings, setSettings] = useState<StudioSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return normalizeStudioSettings(JSON.parse(saved));
    } catch {
      // Ignore storage error
    }
    return DEFAULT_STUDIO_SETTINGS;
  });

  const [autoSolve, setAutoSolve] = useState<boolean>(settings.autoSolveDefault);

  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore storage error
    }
    return [];
  });

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => {
        if (typeof data?.aiConfigured === 'boolean') {
          setAiConfigured(data.aiConfigured);
        }
      })
      .catch(() => {
        setAiConfigured(false);
      });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota error
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage error
    }
  }, [settings]);

  function updateModuleInput(mod: ModuleId, value: string) {
    setInputs((prev) => ({ ...prev, [mod]: value }));
  }

  function handleSaveHistory(
    mod: ModuleId,
    input: string,
    output: string,
    meta: string,
    extra?: HistoryItem['extra'],
  ) {
    const item: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      module: mod,
      input,
      output,
      meta,
      createdAt: Date.now(),
      extra,
    };
    setHistory((prev) => [item, ...prev].slice(0, 50));
  }

  function handleRestoreHistory(item: HistoryItem) {
    setActiveModule(item.module);
    setInputs((prev) => ({ ...prev, [item.module]: item.input }));
  }

  return (
    <StudioPrefsContext.Provider
      value={{
        realRubberAnimation: settings.realRubberAnimation,
        pencilWriteAnimation: settings.pencilWriteAnimation,
      }}
    >
      <div className="font-bilingual min-h-screen flex flex-col overflow-x-clip pb-8 lg:pb-12">
        <AmbientBackground />

      <StudioHeader
        lang={lang}
        onLangChange={setLang}
        historyCount={history.length}
        onOpenHistory={() => setHistoryOpen(true)}
        settings={settings}
        onUpdateSettings={(next) => {
          setSettings(next);
          setAutoSolve(next.autoSolveDefault);
        }}
        aiConfigured={aiConfigured}
      />

      <ModuleDock
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        lang={lang}
      />

      <main className="mx-auto w-full max-w-[1280px] min-w-0 flex-1 px-3 sm:px-4 lg:px-6 mt-3.5 lg:mt-5">
        {activeModule === 'narration' && (
          <NarrationModule
            input={inputs.narration}
            onInputChange={(val) => updateModuleInput('narration', val)}
            lang={lang}
            autoSolve={autoSolve}
            onToggleAutoSolve={() => setAutoSolve((prev) => !prev)}
            speechRate={settings.speechRate}
            onSaveHistory={(i, o, m) => handleSaveHistory('narration', i, o, m)}
          />
        )}

        {activeModule === 'voice' && (
          <VoiceModule
            input={inputs.voice}
            onInputChange={(val) => updateModuleInput('voice', val)}
            lang={lang}
            autoSolve={autoSolve}
            onToggleAutoSolve={() => setAutoSolve((prev) => !prev)}
            speechRate={settings.speechRate}
            onSaveHistory={(i, o, m) => handleSaveHistory('voice', i, o, m)}
          />
        )}

        {activeModule === 'morpheme' && (
          <SuffixPrefixModule
            input={inputs.morpheme}
            onInputChange={(val) => updateModuleInput('morpheme', val)}
            lang={lang}
            autoSolve={autoSolve}
            onToggleAutoSolve={() => setAutoSolve((prev) => !prev)}
            onSaveHistory={(i, o, m) => handleSaveHistory('morpheme', i, o, m)}
          />
        )}

        {activeModule === 'pos' && (
          <PartsOfSpeechModule
            input={inputs.pos}
            onInputChange={(val) => updateModuleInput('pos', val)}
            lang={lang}
            autoSolve={autoSolve}
            onToggleAutoSolve={() => setAutoSolve((prev) => !prev)}
            onSaveHistory={(i, o, m) => handleSaveHistory('pos', i, o, m)}
          />
        )}

        {activeModule === 'verbs' && (
          <VerbChangingModule
            input={inputs.verbs}
            onInputChange={(val) => updateModuleInput('verbs', val)}
            lang={lang}
            autoSolve={autoSolve}
            onToggleAutoSolve={() => setAutoSolve((prev) => !prev)}
            onSaveHistory={(i, o, m) => handleSaveHistory('verbs', i, o, m)}
          />
        )}

        {(activeModule === 'paragraph' ||
          activeModule === 'dialogue' ||
          activeModule === 'composition') && (
          <WriterModule
            key={activeModule}
            kind={activeModule}
            topic={inputs[activeModule]}
            onTopicChange={(val) => updateModuleInput(activeModule, val)}
            lang={lang}
            speechRate={settings.speechRate}
            onSaveHistory={(i, o, m, extra) =>
              handleSaveHistory(activeModule, i, o, m, extra)
            }
          />
        )}
      </main>

      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        items={history}
        onRestore={handleRestoreHistory}
        onDelete={(id) => setHistory((prev) => prev.filter((it) => it.id !== id))}
        onWipeAll={() => setHistory([])}
        lang={lang}
      />
      </div>
    </StudioPrefsContext.Provider>
  );
}
