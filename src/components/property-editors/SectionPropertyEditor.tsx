import React from 'react'
import { ElementEditorProps } from './types'
import { ColorInput, TextInput, NumberInput } from '../ui'

const SectionPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <ColorInput label="Arkaplan Rengi" value={(p.backgroundColor as string) || 'transparent'} onChange={(v) => onChange('backgroundColor', v)} placeholder="transparent" />
      <TextInput label="İç Boşluk" value={(p.padding as string) || '20px'} onChange={(v) => onChange('padding', v)} placeholder="20px" />
      <NumberInput label="Köşe Yuvarlaklığı" value={(p.borderRadius as number) || 0} onChange={(v) => onChange('borderRadius', v)} />
    </>
  )
}

export default SectionPropertyEditor
