import React from 'react'
import { ElementEditorProps } from './types'
import { NumberInput, ColorInput, SelectInput, TextInput, FONT_WEIGHT_OPTIONS, TEXT_ALIGN_OPTIONS, HEADING_OPTIONS } from '../ui'

const HeadingPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <div className="property-item">
        <label className="property-label">İçerik</label>
        <textarea
          value={(p.content as string) || ''}
          onChange={(e) => onChange('content', e.target.value)}
          rows={2}
          className="property-input property-textarea"
        />
      </div>
      <SelectInput label="Başlık Tipi" value={(p.as as string) || 'h2'} onChange={(v) => onChange('as', v)} options={HEADING_OPTIONS} />
      <NumberInput label="Font Boyutu" value={(p.fontSize as number) || 24} onChange={(v) => onChange('fontSize', v)} />
      <SelectInput label="Font Kalınlığı" value={(p.fontWeight as string) || 'bold'} onChange={(v) => onChange('fontWeight', v)} options={FONT_WEIGHT_OPTIONS} />
      <TextInput label="Font Ailesi" value={(p.fontFamily as string) || 'Arial, sans-serif'} onChange={(v) => onChange('fontFamily', v)} />
      <ColorInput label="Renk" value={(p.color as string) || '#000000'} onChange={(v) => onChange('color', v)} />
      <SelectInput label="Hizalama" value={(p.textAlign as string) || 'left'} onChange={(v) => onChange('textAlign', v)} options={TEXT_ALIGN_OPTIONS} />
      <TextInput label="Dış Boşluk" value={(p.margin as string) || '0 0 10px 0'} onChange={(v) => onChange('margin', v)} placeholder="0 0 10px 0" />
      <TextInput label="İç Boşluk" value={(p.padding as string) || '0'} onChange={(v) => onChange('padding', v)} placeholder="0" />
    </>
  )
}

export default HeadingPropertyEditor
