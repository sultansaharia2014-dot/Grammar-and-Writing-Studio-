import {
  MessageSquareQuote,
  ArrowLeftRight,
  Puzzle,
  Tags,
  Sparkles,
  AlignLeft,
  MessagesSquare,
  FileText,
} from 'lucide-react';
import { LanguageMode, ModuleId } from '../types/studio';
import { MODULE_META } from '../i18n/labels';

const MODULE_ORDER: ModuleId[] = [
  'narration',
  'voice',
  'morpheme',
  'pos',
  'verbs',
  'paragraph',
  'dialogue',
  'composition',
];

const MODULE_ICONS: Record<ModuleId, typeof MessageSquareQuote> = {
  narration: MessageSquareQuote,
  voice: ArrowLeftRight,
  morpheme: Puzzle,
  pos: Tags,
  verbs: Sparkles,
  paragraph: AlignLeft,
  dialogue: MessagesSquare,
  composition: FileText,
};

interface ModuleDockProps {
  activeModule: ModuleId;
  onSelectModule: (id: ModuleId) => void;
  lang: LanguageMode;
}

export function ModuleDock({ activeModule, onSelectModule, lang }: ModuleDockProps) {
  return (
    <nav
      aria-label="Grammar and Writing Modules"
      className="w-full mx-auto max-w-[1280px] px-3 sm:px-4 lg:px-6 mt-3 lg:mt-4"
    >
      <div
        role="tablist"
        aria-label="Studio modules"
        className="glass-panel-soft flex flex-wrap items-center justify-center gap-1.5 lg:gap-2 p-1.5 lg:p-2"
      >
        {MODULE_ORDER.map((id) => {
          const Icon = MODULE_ICONS[id];
          const isActive = activeModule === id;
          const label = lang === 'bn' ? MODULE_META[id].shortTitle.bn : MODULE_META[id].shortTitle.en;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelectModule(id)}
              className={`bubbly-btn inline-flex items-center gap-1 lg:gap-1.5 rounded-full px-2.5 py-1.5 lg:px-3.5 lg:py-2 text-[11px] sm:text-xs lg:text-[13px] font-bold whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'caramel-gloss text-white'
                  : 'bg-white/60 text-[#7A6252] hover:bg-white/95 hover:text-[#362419] border border-white/80'
              }`}
            >
              <Icon className="h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
