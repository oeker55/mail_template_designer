import React from 'react'
import { ElementEditorProps } from './types'
import { RichTextEditor, NumberInput, ColorInput, TextInput, SelectInput, SpacingControl, SectionDivider, FONT_WEIGHT_SIMPLE_OPTIONS, TEXT_ALIGN_OPTIONS, COLUMN_TYPE_OPTIONS, ALIGN_OPTIONS } from '../ui'

const MultiColumnPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props
  const columns = (p.columns || []) as Array<Record<string, unknown>>

  const handleColumnChange = (index: number, field: string, value: unknown) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    onChange('columns', newColumns)
  }

  const addColumn = () => {
    const newColumns = [...columns, {
      width: '100%', type: 'text', content: 'Yeni Kolon', fontSize: 16, fontWeight: 'normal', fontFamily: 'Arial, sans-serif',
      color: '#000000', textAlign: 'left', lineHeight: 1.5, backgroundColor: 'transparent',
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
      borderTop: '', borderBottom: '', borderLeft: '', borderRight: '',
      src: 'https://via.placeholder.com/300x200', alt: 'Resim', imgWidth: 300, imgHeight: '', imgKeepAspectRatio: true, imgAlign: 'center', imgBackgroundColor: 'transparent',
      imgPaddingTop: 0, imgPaddingRight: 0, imgPaddingBottom: 0, imgPaddingLeft: 0, imgMarginTop: 0, imgMarginRight: 0, imgMarginBottom: 0, imgMarginLeft: 0,
      btnText: 'Buton', btnLink: '#', btnBg: '#3A416F', btnColor: '#ffffff', btnFontSize: 16, btnBorderRadius: 4, btnPadding: '12px 24px'
    }]
    onChange('columns', newColumns)
  }

  const removeColumn = (index: number) => {
    const newColumns = columns.filter((_: unknown, i: number) => i !== index)
    onChange('columns', newColumns)
  }

  // Helper to create onChange for a specific column
  const colOnChange = (index: number) => (propName: string, value: unknown) => handleColumnChange(index, propName, value)

  return (
    <>
      <NumberInput label="Boşluk" value={(p.gap as number) || 0} onChange={(v) => onChange('gap', v)} />
      <TextInput label="İç Boşluk" value={(p.padding as string) || '10px'} onChange={(v) => onChange('padding', v)} />
      <ColorInput label="Arkaplan Rengi" value={(p.backgroundColor as string) || 'transparent'} onChange={(v) => onChange('backgroundColor', v)} />

      <SectionDivider icon="📏" text="Kolonlar" />

      <div className="columns-editor">
        {columns.map((col, index) => (
          <div key={index} className="column-item" style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
            <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
              <h4 style={{ margin: 0 }}>Kolon {index + 1}</h4>
              <button onClick={() => removeColumn(index)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Sil</button>
            </div>

            <SelectInput label="Tip" value={(col.type as string) || 'text'} onChange={(v) => handleColumnChange(index, 'type', v)} options={COLUMN_TYPE_OPTIONS} />
            <TextInput label="Genişlik" value={(col.width as string) || '50%'} onChange={(v) => handleColumnChange(index, 'width', v)} />

            {(!col.type || col.type === 'text') && (
              <>
                <div className="property-item">
                  <label className="property-label">İçerik</label>
                  <RichTextEditor value={(col.content as string) || ''} onChange={(v) => handleColumnChange(index, 'content', v)} />
                </div>
                <NumberInput label="Font Boyutu" value={(col.fontSize as number) || 16} onChange={(v) => handleColumnChange(index, 'fontSize', v)} />
                <SelectInput label="Font Kalınlığı" value={(col.fontWeight as string) || 'normal'} onChange={(v) => handleColumnChange(index, 'fontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
                <ColorInput label="Yazı Rengi" value={(col.color as string) || '#000000'} onChange={(v) => handleColumnChange(index, 'color', v)} />
                <SelectInput label="Hizalama" value={(col.textAlign as string) || 'left'} onChange={(v) => handleColumnChange(index, 'textAlign', v)} options={TEXT_ALIGN_OPTIONS} />
                <SpacingControl type="padding" props={col} onChange={colOnChange(index)} />
                <SpacingControl type="margin" props={col} onChange={colOnChange(index)} />
              </>
            )}

            {col.type === 'image' && (
              <>
                <TextInput label="Resim URL" value={(col.src as string) || ''} onChange={(v) => handleColumnChange(index, 'src', v)} placeholder="https://..." />
                <TextInput label="Alt Metin" value={(col.alt as string) || ''} onChange={(v) => handleColumnChange(index, 'alt', v)} />
                <NumberInput label="Yükseklik" value={(col.imgHeight as number) || 0} onChange={(v) => handleColumnChange(index, 'imgHeight', v || '')} />
                <SelectInput label="Hizalama" value={(col.imgAlign as string) || 'center'} onChange={(v) => handleColumnChange(index, 'imgAlign', v)} options={ALIGN_OPTIONS} />
              </>
            )}

            {col.type === 'button' && (
              <>
                <TextInput label="Buton Metni" value={(col.btnText as string) || ''} onChange={(v) => handleColumnChange(index, 'btnText', v)} />
                <TextInput label="Link" value={(col.btnLink as string) || '#'} onChange={(v) => handleColumnChange(index, 'btnLink', v)} />
                <ColorInput label="Arkaplan" value={(col.btnBg as string) || '#3A416F'} onChange={(v) => handleColumnChange(index, 'btnBg', v)} />
                <ColorInput label="Yazı Rengi" value={(col.btnColor as string) || '#ffffff'} onChange={(v) => handleColumnChange(index, 'btnColor', v)} />
              </>
            )}
          </div>
        ))}
        <button onClick={addColumn} style={{ width: '100%', padding: '8px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Kolon Ekle</button>
      </div>
    </>
  )
}

export default MultiColumnPropertyEditor
