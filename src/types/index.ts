import React from 'react'

// Element Props Types
export interface TextProps {
  content: string
  fontSize: number
  fontWeight: string
  fontFamily: string
  color: string
  backgroundColor: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  lineHeight: number
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  margin?: string
  padding?: string
}

export interface HeadingProps {
  content: string
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
  fontSize: number
  fontWeight: string
  fontFamily: string
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  margin: string
  padding: string
}

export interface ColumnData {
  width: string
  type: 'text' | 'image' | 'button'
  // Text properties
  content: string
  fontSize: number
  fontWeight: string
  fontFamily: string
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  lineHeight: number
  backgroundColor: string
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  borderTop: string
  borderBottom: string
  borderLeft: string
  borderRight: string
  // Image properties
  src: string
  alt: string
  imgWidth: number | string
  imgHeight: number | string
  imgKeepAspectRatio: boolean
  imgAlign: 'left' | 'center' | 'right'
  imgBackgroundColor: string
  imgPaddingTop: number
  imgPaddingRight: number
  imgPaddingBottom: number
  imgPaddingLeft: number
  imgMarginTop: number
  imgMarginRight: number
  imgMarginBottom: number
  imgMarginLeft: number
  // Button properties
  btnText: string
  btnLink: string
  btnBg: string
  btnColor: string
  btnFontSize: number
  btnBorderRadius: number
  btnPadding: string
}

export interface MultiColumnProps {
  gap: number
  padding: string
  backgroundColor: string
  columns: ColumnData[]
}

export interface ImageProps {
  src: string
  alt: string
  width: number
  height: number
  keepAspectRatio: boolean
  textAlign: 'left' | 'center' | 'right'
  backgroundColor: string
  marginTop: number
  marginRight: number
  marginBottom: number
  marginLeft: number
  paddingTop: number
  paddingRight: number
  paddingBottom: number
  paddingLeft: number
  margin?: string
  style?: React.CSSProperties
}

export interface ButtonProps {
  text: string
  href: string
  fontSize: number
  fontWeight: string
  color: string
  backgroundColor: string
  borderRadius: number
  padding: string
  textAlign: 'left' | 'center' | 'right'
}

export interface LinkProps {
  text: string
  href: string
  color: string
  textDecoration: 'none' | 'underline' | 'line-through'
  fontSize: number
}

export interface HrProps {
  borderColor: string
  margin: string
}

export interface SectionProps {
  backgroundColor: string
  padding: string
  borderRadius: number
  content?: string
}

export interface ColumnProps {
  width: string
}

export interface SocialProps {
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
  iconSize: number
  gap: number
  align: 'left' | 'center' | 'right'
  padding: string
}

// Union type for all element props
export type ElementProps = 
  | TextProps 
  | HeadingProps 
  | MultiColumnProps 
  | ImageProps 
  | ButtonProps 
  | LinkProps 
  | HrProps 
  | SectionProps 
  | ColumnProps 
  | SocialProps

// Element type
export type ElementType = 
  | 'text' 
  | 'heading' 
  | 'multi_column' 
  | 'image' 
  | 'button' 
  | 'link' 
  | 'hr' 
  | 'section' 
  | 'column' 
  | 'social'

// Canvas Element
export interface CanvasElement {
  id: string
  type: ElementType
  props: Record<string, unknown>
}

// Element Type Config
export interface ElementTypeConfig {
  id: string
  name: string
  icon: string
  component: string
  defaultProps: Record<string, unknown>
}

// Template Types
export interface Template {
  _id?: string
  id?: string
  name: string
  fcode: string
  elements_json: CanvasElement[] | string
  html_content?: string
  createdAt?: string
  created_at?: string
  updatedAt?: string
  updated_at?: string
}

export interface LocalTemplate {
  id: string
  name: string
  fcode: string
  elements: CanvasElement[]
  savedAt: string
}

export interface PresetTemplate {
  id: string
  name: string
  category: string
  description: string
  thumbnail: string
  elements: CanvasElement[]
}

// Template Variable Types
export interface TemplateVariable {
  key: string
  label: string
  example: string
}

export interface TemplateVariableCategory {
  label: string
  icon: string
  variables: TemplateVariable[]
}

export interface TemplateVariableCategories {
  [key: string]: TemplateVariableCategory
}

// API Types
export interface TemplateData {
  name: string
  fcode: string
  elements_json: CanvasElement[]
  html_content?: string
}

export interface MailSendData {
  templateId: string | number
  replacements: Record<string, string>
  recipients: string[]
}

export interface MailTestData {
  htmlContent: string
  recipient: string
  subject: string
}

// Component Props Types
export interface CanvasProps {
  elements: CanvasElement[]
  selectedElement: CanvasElement | null
  onSelectElement: (element: CanvasElement) => void
  onDeleteElement: (id: string) => void
  onReorderElements: (dragIndex: number, hoverIndex: number) => void
}

export interface CanvasElementComponentProps {
  element: CanvasElement
  index: number
  isSelected: boolean
  onSelect: () => void
  onDelete: () => void
  onReorder: (dragIndex: number, hoverIndex: number) => void
}

export interface ElementPaletteProps {
  onAddElement: (elementType: string) => void
}

export interface PropertyEditorProps {
  element: CanvasElement | null
  onUpdateElement: (elementId: string, newProps: Record<string, unknown>) => void
}

export interface TemplateEditorProps {
  templateId: string
  onBack: () => void
}

export interface TemplateListProps {
  onEdit: (id: string) => void
  onCreate: () => void
}

// Drag and Drop Types
export interface DragItem {
  id: string
  index: number
  type: string
}

export interface DropResult {
  name: string
}

// Rich Text Editor Types
export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
}

// Spacing Input Types
export interface SpacingValues {
  top: number
  right: number
  bottom: number
  left: number
}

export interface SpacingInputProps {
  label: string
  values: SpacingValues
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', value: number) => void
  icon: string
}

// vite-env declarations
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL: string
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export {}
