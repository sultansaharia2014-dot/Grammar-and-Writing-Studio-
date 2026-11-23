import { createContext, useContext } from 'react';
import { StudioSettings } from '../types/studio';

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  speechRate: 1.0,
  autoSolveDefault: true,
  preferAiEnhancement: true,
  realRubberAnimation: true,
  pencilWriteAnimation: true,
};

export function normalizeStudioSettings(
  raw: Partial<StudioSettings> | null | undefined,
): StudioSettings {
  return {
    speechRate:
      typeof raw?.speechRate === 'number' && raw.speechRate >= 0.5 && raw.speechRate <= 2
        ? raw.speechRate
        : DEFAULT_STUDIO_SETTINGS.speechRate,
    autoSolveDefault:
      typeof raw?.autoSolveDefault === 'boolean'
        ? raw.autoSolveDefault
        : DEFAULT_STUDIO_SETTINGS.autoSolveDefault,
    preferAiEnhancement:
      typeof raw?.preferAiEnhancement === 'boolean'
        ? raw.preferAiEnhancement
        : DEFAULT_STUDIO_SETTINGS.preferAiEnhancement,
    realRubberAnimation:
      typeof raw?.realRubberAnimation === 'boolean'
        ? raw.realRubberAnimation
        : DEFAULT_STUDIO_SETTINGS.realRubberAnimation,
    pencilWriteAnimation:
      typeof raw?.pencilWriteAnimation === 'boolean'
        ? raw.pencilWriteAnimation
        : DEFAULT_STUDIO_SETTINGS.pencilWriteAnimation,
  };
}

export const StudioPrefsContext = createContext<{
  realRubberAnimation: boolean;
  pencilWriteAnimation: boolean;
}>({
  realRubberAnimation: true,
  pencilWriteAnimation: true,
});

export function useStudioPrefs() {
  return useContext(StudioPrefsContext);
}
