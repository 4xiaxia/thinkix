export function hexAlphaToOpacity(hex: string): number {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 8) {
    return parseInt(cleanHex.slice(6, 8), 16) / 255;
  }
  return 1;
}

export function removeHexAlpha(hex: string): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length === 8) {
    return `#${cleanHex.slice(0, 6)}`;
  }
  return hex;
}

export function applyOpacityToHex(hex: string, opacity: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0');
  return `#${cleanHex}${alpha}`;
}

export function isDefaultStroke(color: string): boolean {
  return color === '#000000' || color === 'rgb(0, 0, 0)';
}

export function isNoColor(color: string): boolean {
  return !color || color === '' || color === 'transparent' || color === 'rgba(0, 0, 0, 0)';
}

export function isValidColor(color: string | null | undefined): boolean {
  if (isNoColor(color || '')) return false;
  const hexPattern = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
  return hexPattern.test(color || '');
}

export function isFullyOpaque(opacity: number): boolean {
  return opacity === 1 || opacity === undefined || opacity === null;
}

export function splitRows<T>(array: T[], rowSize: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < array.length; i += rowSize) {
    rows.push(array.slice(i, i + rowSize));
  }
  return rows;
}
