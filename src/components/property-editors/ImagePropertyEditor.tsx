import React, { useState } from 'react'
import { ElementEditorProps } from './types'
import { NumberInput, ColorInput, CheckboxInput, SelectInput, SpacingControl, SectionDivider, ALIGN_OPTIONS } from '../ui'
import { TextInput } from '../ui'
import { TEMPLATE_VARIABLES } from '../../config/templateVariables'
import { formatVariable } from '../../config/templateVariables'

const ImagePropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props
  const [showUrlVariableDropdown, setShowUrlVariableDropdown] = useState(false)
  const [showLinkUrlVariableDropdown, setShowLinkUrlVariableDropdown] = useState(false)

  const getUrlVariables = () => {
    const urlVars: Array<{ key: string; label: string; example: string; categoryIcon: string }> = []
    Object.entries(TEMPLATE_VARIABLES).forEach(([_catKey, category]) => {
      category.variables.forEach((v) => {
        if (v.key.toLowerCase().includes('url') || v.key.toLowerCase().includes('logo') || v.key.toLowerCase().includes('link') || v.key.toLowerCase().includes('web')) {
          urlVars.push({ ...v, categoryIcon: category.icon })
        }
      })
    })
    return urlVars
  }

  const renderUrlInput = (propName: string, label: string, showDropdown: boolean, setShowDropdown: (v: boolean) => void) => (
    <div className="property-item">
      <label className="property-label">{label}</label>
      <div className="url-input-with-variable">
        <input type="text" value={(p[propName] as string) || ''} onChange={(e) => onChange(propName, e.target.value)} className="property-input url-input" placeholder="https://example.com/image.jpg" />
        <div className="url-variable-wrapper">
          <button type="button" className={`url-variable-btn ${showDropdown ? 'active' : ''}`} onClick={() => setShowDropdown(!showDropdown)} title="Değişken Seç">
            <span className="variable-icon">{`{{x}}`}</span>
          </button>
          {showDropdown && (
            <div className="url-variable-dropdown">
              <div className="url-variable-header">
                <span>🔗 URL Değişkeni Seç</span>
                <button type="button" className="url-variable-close" onClick={() => setShowDropdown(false)}>✕</button>
              </div>
              <div className="url-variable-list">
                {getUrlVariables().map((v, idx) => (
                  <button key={idx} type="button" className="url-variable-item" onClick={() => { onChange(propName, formatVariable(v.key)); setShowDropdown(false) }}>
                    <span className="var-icon">{v.categoryIcon}</span>
                    <span className="var-label">{v.label}</span>
                    <span className="var-key">[[{v.key}]]</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {renderUrlInput('src', 'Resim URL', showUrlVariableDropdown, setShowUrlVariableDropdown)}
      <TextInput label="Alternatif Metin" value={(p.alt as string) || ''} onChange={(v) => onChange('alt', v)} placeholder="Resim açıklaması" />
      <NumberInput label="Genişlik (px)" value={(p.width as number) || 600} onChange={(v) => onChange('width', v)} disabled={p.keepAspectRatio as boolean} />
      <NumberInput label="Yükseklik (px)" value={(p.height as number) || 300} onChange={(v) => onChange('height', v)} />
      <CheckboxInput label="En/Boy Oranını Koru" checked={(p.keepAspectRatio as boolean) !== false} onChange={(v) => onChange('keepAspectRatio', v)} />
      <SelectInput label="Hizalama" value={(p.textAlign as string) || 'center'} onChange={(v) => onChange('textAlign', v)} options={ALIGN_OPTIONS} />
      <ColorInput label="Arkaplan Rengi" value={(p.backgroundColor as string) || 'transparent'} onChange={(v) => onChange('backgroundColor', v)} placeholder="transparent" />

      <SectionDivider icon="🔗" text="Linkli Resim" />
      <CheckboxInput label="Linkli Resim" checked={(p.isLinked as boolean) || false} onChange={(v) => onChange('isLinked', v)} description="Resme tıklandığında linke yönlendir" />
      {(p.isLinked as boolean) && renderUrlInput('linkUrl', 'Link URL', showLinkUrlVariableDropdown, setShowLinkUrlVariableDropdown)}

      <SpacingControl type="padding" props={p} onChange={onChange} />
      <SpacingControl type="margin" props={p} onChange={onChange} />
    </>
  )
}

export default ImagePropertyEditor
