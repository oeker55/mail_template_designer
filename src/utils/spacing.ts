// Shared spacing (margin/padding) utilities used across CanvasElement, htmlGenerator, and PropertyEditor

export interface ElementPropsBase {
  margin?: string
  padding?: string
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  [key: string]: unknown
}

export const getMargin = (p: ElementPropsBase): string => {
  if (p.margin) return p.margin
  return `${p.marginTop || 0}px ${p.marginRight || 0}px ${p.marginBottom || 0}px ${p.marginLeft || 0}px`
}

export const getPadding = (p: ElementPropsBase): string => {
  if (p.padding && p.padding !== '0') return p.padding
  return `${p.paddingTop || 0}px ${p.paddingRight || 0}px ${p.paddingBottom || 0}px ${p.paddingLeft || 0}px`
}

/** Column-level padding/margin with optional prefix (e.g., 'img' for image columns) */
export const getColumnPadding = (c: Record<string, unknown>, prefix: string = ''): string => {
  return `${c[prefix + 'PaddingTop'] || c[prefix + 'paddingTop'] || 0}px ${c[prefix + 'PaddingRight'] || c[prefix + 'paddingRight'] || 0}px ${c[prefix + 'PaddingBottom'] || c[prefix + 'paddingBottom'] || 0}px ${c[prefix + 'PaddingLeft'] || c[prefix + 'paddingLeft'] || 0}px`
}

export const getColumnMargin = (c: Record<string, unknown>, prefix: string = ''): string => {
  return `${c[prefix + 'MarginTop'] || c[prefix + 'marginTop'] || 0}px ${c[prefix + 'MarginRight'] || c[prefix + 'marginRight'] || 0}px ${c[prefix + 'MarginBottom'] || c[prefix + 'marginBottom'] || 0}px ${c[prefix + 'MarginLeft'] || c[prefix + 'marginLeft'] || 0}px`
}

/** Capitalize first letter for building prop names like 'paddingTop' from 'top' */
export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

/** Build a spacing prop name, e.g. spacingPropName('padding', 'top') => 'paddingTop' */
export const spacingPropName = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left'): string =>
  `${type}${capitalize(side)}`
