import React from 'react'
import { ElementEditorProps } from './types'
import { RichTextEditor, NumberInput, ColorInput, SelectInput, SpacingControl, FONT_WEIGHT_SIMPLE_OPTIONS, TEXT_ALIGN_OPTIONS } from '../ui'
import TextInput from '../ui/TextInput'

const TextPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <div className="property-item">
        <label className="property-label">İçerik</label>
        <RichTextEditor value={(p.content as string) || ''} onChange={(v) => onChange('content', v)} />
      </div>
      <NumberInput label="Font Boyutu" value={(p.fontSize as number) || 16} onChange={(v) => onChange('fontSize', v)} />
      <SelectInput label="Font Kalınlığı" value={(p.fontWeight as string) || 'normal'} onChange={(v) => onChange('fontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
      <TextInput label="Font Ailesi" value={(p.fontFamily as string) || 'Arial, sans-serif'} onChange={(v) => onChange('fontFamily', v)} />
      <ColorInput label="Yazı Rengi" value={(p.color as string) || '#000000'} onChange={(v) => onChange('color', v)} />
      <ColorInput label="Arkaplan Rengi" value={(p.backgroundColor as string) || 'transparent'} onChange={(v) => onChange('backgroundColor', v)} placeholder="transparent" />
      <SelectInput label="Hizalama" value={(p.textAlign as string) || 'left'} onChange={(v) => onChange('textAlign', v)} options={TEXT_ALIGN_OPTIONS} />
      <NumberInput label="Satır Yüksekliği" value={(p.lineHeight as number) || 1.5} onChange={(v) => onChange('lineHeight', v)} step={0.1} />
      <SpacingControl type="padding" props={p} onChange={onChange} />
      <SpacingControl type="margin" props={p} onChange={onChange} />
    </>
  )
}

export default TextPropertyEditor
