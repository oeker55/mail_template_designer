import React from 'react'
import { ElementEditorProps } from './types'
import { ColorInput, MonacoPropertyEditor, SpacingControl } from '../ui'

const HtmlBlockPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props

  return (
    <>
      <div className="property-item">
        <label className="property-label">HTML</label>
        <MonacoPropertyEditor
          value={(p.html as string) || ''}
          onChange={(value) => onChange('html', value)}
          language="html"
          height={320}
          path={`html-block-${element.id}.html`}
          className="html-block-monaco-editor"
          options={{
            formatOnPaste: true,
            formatOnType: true,
          }}
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
