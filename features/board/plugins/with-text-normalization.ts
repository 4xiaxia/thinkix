import type { PlaitPlugin, PlaitBoard, PlaitI18nBoard } from '@plait/core';
import { MindI18nKey } from '@plait/mind';
import { DrawI18nKey } from '@plait/draw';

export function withTextNormalization(): PlaitPlugin {
  return (board: PlaitBoard) => {
    const i18nBoard = board as PlaitBoard & PlaitI18nBoard;
    const originalGetI18nValue = i18nBoard.getI18nValue?.bind(i18nBoard);

    i18nBoard.getI18nValue = (key: string) => {
      if (key === MindI18nKey.mindCentralText) {
        return 'Core Idea';
      }
      if (key === MindI18nKey.abstractNodeText) {
        return 'Summary';
      }
      if (key === DrawI18nKey.lineText) {
        return 'Text';
      }
      if (key === DrawI18nKey.geometryText) {
        return 'Text';
      }
      return originalGetI18nValue?.(key) ?? null;
    };

    return board;
  };
}
