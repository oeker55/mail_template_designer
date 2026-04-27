import React from 'react'
import { ElementEditorProps } from './types'
import { ColorInput, SpacingControl } from '../ui'

const HtmlBlockPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <div className="property-item">
        <label className="property-label">HTML</label>
        <textarea
          value={(p.html as string) || ''}
          onChange={(e) => onChange('html', e.target.value)}
          className="property-input property-textarea html-block-textarea"
          spellCheck={false}
          placeholder="<table>...</table>"
        />
        <p className="rich-text-help">Email uyumlulugu icin tablo ve inline style kullanin.</p>
      </div>
      <ColorInput
        label="Arkaplan Rengi"
        value={(p.backgroundColor as string) || 'transparent'}
        onChange={(v) => onChange('backgroundColor', v)}
        placeholder="transparent"
      />
      <SpacingControl type="padding" props={p} onChange={onChange} />
      <SpacingControl type="margin" props={p} onChange={onChange} />
    </>
  )
}

export default HtmlBlockPropertyEditor
