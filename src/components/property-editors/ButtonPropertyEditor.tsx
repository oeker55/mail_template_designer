import React from 'react'
import { ElementEditorProps } from './types'
import { TextInput, NumberInput, ColorInput, SelectInput, FONT_WEIGHT_OPTIONS, ALIGN_OPTIONS } from '../ui'

const ButtonPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <TextInput label="Buton Metni" value={(p.text as string) || ''} onChange={(v) => onChange('text', v)} />
      <TextInput label="Link URL" value={(p.href as string) || '#'} onChange={(v) => onChange('href', v)} placeholder="https://example.com" />
      <NumberInput label="Font Boyutu" value={(p.fontSize as number) || 16} onChange={(v) => onChange('fontSize', v)} />
      <SelectInput label="Font Kalınlığı" value={(p.fontWeight as string) || 'bold'} onChange={(v) => onChange('fontWeight', v)} options={FONT_WEIGHT_OPTIONS} />
      <ColorInput label="Yazı Rengi" value={(p.color as string) || '#ffffff'} onChange={(v) => onChange('color', v)} />
      <ColorInput label="Arkaplan Rengi" value={(p.backgroundColor as string) || '#3A416F'} onChange={(v) => onChange('backgroundColor', v)} />
      <NumberInput label="Köşe Yuvarlaklığı" value={(p.borderRadius as number) || 4} onChange={(v) => onChange('borderRadius', v)} />
      <TextInput label="İç Boşluk" value={(p.padding as string) || '12px 24px'} onChange={(v) => onChange('padding', v)} placeholder="12px 24px" />
      <SelectInput label="Hizalama" value={(p.textAlign as string) || 'center'} onChange={(v) => onChange('textAlign', v)} options={ALIGN_OPTIONS} />
    </>
  )
}

export default ButtonPropertyEditor
