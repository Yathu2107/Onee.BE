/**
 * Onee global colour palette.
 * Use these tokens across the entire platform — in CSS via custom properties,
 * Tailwind utilities (e.g. bg-onee-gold), or by importing this module in TS/TSX.
 */
export const palette = {
  cream: '#FBECB3',
  gold: '#EBB407',
  black: '#060605',
  earth: '#847454',
  white: '#FFFFFF',
} as const

export type PaletteColor = keyof typeof palette
