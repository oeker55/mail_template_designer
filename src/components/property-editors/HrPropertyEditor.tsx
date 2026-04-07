import React from 'react'
import { ElementEditorProps } from './types'
import { ColorInput, TextInput } from '../ui'

const HrPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <ColorInput label="Kenarlık Rengi" value={(p.borderColor as string) || '#e0e0e0'} onChange={(v) => onChange('borderColor', v)} />
      <TextInput label="Dış Boşluk" value={(p.margin as string) || '20px 0'} onChange={(v) => onChange('margin', v)} placeholder="20px 0" />
    </>
  )
}

export default HrPropertyEditor
