import React from 'react'
import { ElementEditorProps } from './types'
import { TextInput, NumberInput, ColorInput, SelectInput, TEXT_DECORATION_OPTIONS } from '../ui'

const LinkPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <TextInput label="Metin" value={(p.text as string) || ''} onChange={(v) => onChange('text', v)} />
      <TextInput label="Link URL" value={(p.href as string) || '#'} onChange={(v) => onChange('href', v)} placeholder="https://example.com" />
      <ColorInput label="Renk" value={(p.color as string) || '#3A416F'} onChange={(v) => onChange('color', v)} />
      <SelectInput label="Metin Dekorasyonu" value={(p.textDecoration as string) || 'underline'} onChange={(v) => onChange('textDecoration', v)} options={TEXT_DECORATION_OPTIONS} />
      <NumberInput label="Font Boyutu" value={(p.fontSize as number) || 16} onChange={(v) => onChange('fontSize', v)} />
    </>
  )
}

export default LinkPropertyEditor
