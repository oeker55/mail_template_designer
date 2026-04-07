import React from 'react'
import { ELEMENT_TYPES, ICONS } from '../config/elementTypes'
import { PropertyEditorProps } from '../types'
import {
  TextPropertyEditor,
  HeadingPropertyEditor,
  ImagePropertyEditor,
  ButtonPropertyEditor,
  LinkPropertyEditor,
  HrPropertyEditor,
  SectionPropertyEditor,
  SocialPropertyEditor,
  MultiColumnPropertyEditor,
  ProductRowPropertyEditor,
  InfoTablePropertyEditor,
} from './property-editors'
import './ui'  // import CSS
import './PropertyEditor.css'

const EmptyPropertyIcon: React.FC = () => (
  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    <circle cx="12" cy="12" r="4" />
  </svg>
)

const EDITOR_MAP: Record<string, React.FC<{ element: any; onChange: (propName: string, value: unknown) => void }>> = {
  text: TextPropertyEditor,
  heading: HeadingPropertyEditor,
  image: ImagePropertyEditor,
  button: ButtonPropertyEditor,
  link: LinkPropertyEditor,
  hr: HrPropertyEditor,
  section: SectionPropertyEditor,
  social: SocialPropertyEditor,
  multi_column: MultiColumnPropertyEditor,
  product_row: ProductRowPropertyEditor,
  info_table: InfoTablePropertyEditor,
}

const PropertyEditor: React.FC<PropertyEditorProps> = ({ element, onUpdateElement }) => {
  if (!element) {
    return (
      <div className="property-editor">
        <div className="property-editor-empty">
          <EmptyPropertyIcon />
          <h3>Özellik Paneli</h3>
          <p>Düzenlemek için bir element seçin</p>
        </div>
      </div>
    )
  }

  const handleChange = (propName: string, value: unknown) => {
    onUpdateElement(element.id, { [propName]: value })
  }

  const elementType = ELEMENT_TYPES[element.type.toUpperCase()]
  const EditorComponent = EDITOR_MAP[element.type]

  return (
    <div className="property-editor">
      <div className="property-editor-header">
        <h3>
          <span className="header-element-icon" dangerouslySetInnerHTML={{ __html: ICONS[elementType?.icon] || ICONS.text }} />
          <span className="header-element-name">{elementType?.name}</span>
        </h3>
      </div>
      <div className="property-list">
        {EditorComponent ? (
          <EditorComponent element={element} onChange={handleChange} />
        ) : (
          <div className="property-editor-empty">
            <p>Bu element tipi için düzenleyici bulunamadı.</p>
          </div>
        )}
      </div>
      <div className="property-footer">
        <p className="property-hint">💡 Değişkenleri [[değişkenAdı]] formatında kullanın</p>
      </div>
    </div>
  )
}

export default PropertyEditor
