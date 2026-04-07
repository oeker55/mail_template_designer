import React from 'react'
import { ElementEditorProps } from './types'
import { TextInput, NumberInput, SelectInput, ALIGN_OPTIONS } from '../ui'

const SocialPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <TextInput label="Facebook Linki" value={(p.facebook as string) || ''} onChange={(v) => onChange('facebook', v)} placeholder="https://facebook.com/..." />
      <TextInput label="X (Twitter) Linki" value={(p.twitter as string) || ''} onChange={(v) => onChange('twitter', v)} placeholder="https://x.com/..." />
      <TextInput label="Instagram Linki" value={(p.instagram as string) || ''} onChange={(v) => onChange('instagram', v)} placeholder="https://instagram.com/..." />
      <TextInput label="LinkedIn Linki" value={(p.linkedin as string) || ''} onChange={(v) => onChange('linkedin', v)} placeholder="https://linkedin.com/..." />
      <TextInput label="YouTube Linki" value={(p.youtube as string) || ''} onChange={(v) => onChange('youtube', v)} placeholder="https://youtube.com/..." />
      <NumberInput label="İkon Boyutu" value={(p.iconSize as number) || 32} onChange={(v) => onChange('iconSize', v)} />
      <NumberInput label="Boşluk" value={(p.gap as number) || 10} onChange={(v) => onChange('gap', v)} />
      <SelectInput label="Hizalama" value={(p.align as string) || 'center'} onChange={(v) => onChange('align', v)} options={ALIGN_OPTIONS} />
      <TextInput label="İç Boşluk" value={(p.padding as string) || '10px 0'} onChange={(v) => onChange('padding', v)} placeholder="10px 0" />
    </>
  )
}

export default SocialPropertyEditor
