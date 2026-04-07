import React from 'react'
import { ElementEditorProps } from './types'
import {
  TextInput, NumberInput, ColorInput, SelectInput, CheckboxInput,
  SectionDivider, SpacingControl, VariableSelector,
  FONT_WEIGHT_SIMPLE_OPTIONS, ALIGN_OPTIONS, LABEL_STYLE_OPTIONS, VALUE_STYLE_OPTIONS,
} from '../ui'

const InfoTablePropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props
  const rows = (p.rows as Array<Record<string, unknown>>) || []

  const handleRowChange = (rowIndex: number, field: string, value: unknown) => {
    const newRows = [...rows]
    newRows[rowIndex] = { ...newRows[rowIndex], [field]: value }
    onChange('rows', newRows)
  }

  const addRow = () => {
    onChange('rows', [...rows, {
      id: `row_${Date.now()}`, label: 'Yeni Satır', valueKey: 'variable.key',
      labelStyle: 'normal', valueStyle: 'normal', valueColor: '#333333',
    }])
  }

  const removeRow = (rowIndex: number) => {
    onChange('rows', rows.filter((_, idx) => idx !== rowIndex))
  }

  const moveRow = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= rows.length) return
    const newRows = [...rows]
    const [movedRow] = newRows.splice(fromIndex, 1)
    newRows.splice(toIndex, 0, movedRow)
    onChange('rows', newRows)
  }

  return (
    <>
      {/* Title */}
      <SectionDivider icon="📋" text="Başlık Ayarları" />
      <CheckboxInput label="Başlık Göster" checked={(p.showTitle as boolean) !== false} onChange={(v) => onChange('showTitle', v)} />
      {(p.showTitle as boolean) !== false && (
        <>
          <TextInput label="Başlık Metni" value={(p.title as string) || 'Sipariş Özeti'} onChange={(v) => onChange('title', v)} />
          <div className="property-row">
            <NumberInput label="Font Boyutu" value={(p.titleFontSize as number) || 14} onChange={(v) => onChange('titleFontSize', v)} />
            <SelectInput label="Font Kalınlığı" value={(p.titleFontWeight as string) || 'bold'} onChange={(v) => onChange('titleFontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
          </div>
          <ColorInput label="Başlık Rengi" value={(p.titleColor as string) || '#333333'} onChange={(v) => onChange('titleColor', v)} />
          <ColorInput label="Başlık Arkaplanı" value={(p.titleBgColor as string) || '#f5f5f5'} onChange={(v) => onChange('titleBgColor', v)} />
        </>
      )}

      {/* Table Styles */}
      <SectionDivider icon="🎨" text="Tablo Stilleri" />
      <ColorInput label="Tablo Arkaplanı" value={(p.tableBgColor as string) || '#ffffff'} onChange={(v) => onChange('tableBgColor', v)} />
      <ColorInput label="Kenarlık Rengi" value={(p.tableBorderColor as string) || '#e0e0e0'} onChange={(v) => onChange('tableBorderColor', v)} />
      <div className="property-row">
        <TextInput label="Tablo Genişliği" value={(p.tableWidth as string) || '100%'} onChange={(v) => onChange('tableWidth', v)} placeholder="100%" />
        <NumberInput label="Köşe Yuvarlaklığı" value={(p.tableBorderRadius as number) || 0} onChange={(v) => onChange('tableBorderRadius', v)} />
      </div>

      {/* Column Settings */}
      <SectionDivider icon="📊" text="Kolon Ayarları" />
      <div className="property-row">
        <TextInput label="Etiket Genişliği" value={(p.labelWidth as string) || '50%'} onChange={(v) => onChange('labelWidth', v)} placeholder="50%" />
        <TextInput label="Değer Genişliği" value={(p.valueWidth as string) || '50%'} onChange={(v) => onChange('valueWidth', v)} placeholder="50%" />
      </div>
      <div className="property-row">
        <SelectInput label="Etiket Hizalama" value={(p.labelAlign as string) || 'left'} onChange={(v) => onChange('labelAlign', v)} options={ALIGN_OPTIONS} />
        <SelectInput label="Değer Hizalama" value={(p.valueAlign as string) || 'right'} onChange={(v) => onChange('valueAlign', v)} options={ALIGN_OPTIONS} />
      </div>
      <TextInput label="Satır İç Boşluğu" value={(p.rowPadding as string) || '8px 16px'} onChange={(v) => onChange('rowPadding', v)} placeholder="8px 16px" />
      <div className="property-row">
        <NumberInput label="Etiket Font" value={(p.labelFontSize as number) || 14} onChange={(v) => onChange('labelFontSize', v)} />
        <NumberInput label="Değer Font" value={(p.valueFontSize as number) || 14} onChange={(v) => onChange('valueFontSize', v)} />
      </div>

      {/* Rows */}
      <SectionDivider icon="📝" text={`Satırlar (${rows.length})`} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {rows.map((row, index) => (
          <div key={(row.id as string) || index} style={{ padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>Satır {index + 1}</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button onClick={() => moveRow(index, index - 1)} disabled={index === 0} style={{ padding: '4px 8px', background: index === 0 ? '#ccc' : '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: index === 0 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>↑</button>
                <button onClick={() => moveRow(index, index + 1)} disabled={index === rows.length - 1} style={{ padding: '4px 8px', background: index === rows.length - 1 ? '#ccc' : '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: index === rows.length - 1 ? 'not-allowed' : 'pointer', fontSize: '12px' }}>↓</button>
                <button onClick={() => removeRow(index)} style={{ padding: '4px 8px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>×</button>
              </div>
            </div>

            <TextInput label="Etiket" value={(row.label as string) || ''} onChange={(v) => handleRowChange(index, 'label', v)} placeholder="Ürün Toplamı" />
            <div className="property-item">
              <label className="property-label">Değer Değişkeni</label>
              <VariableSelector value={(row.valueKey as string) || ''} onChange={(v) => handleRowChange(index, 'valueKey', v)} placeholder="order.subtotal" filterCategories={['order_summary', 'address', 'order', 'payment']} />
              <small style={{ color: '#666', fontSize: '10px' }}>Çıktıda: [[{String(row.valueKey || 'order.subtotal')}]]</small>
            </div>
            <div className="property-row">
              <SelectInput label="Etiket Stili" value={(row.labelStyle as string) || 'normal'} onChange={(v) => handleRowChange(index, 'labelStyle', v)} options={LABEL_STYLE_OPTIONS} />
              <SelectInput label="Değer Stili" value={(row.valueStyle as string) || 'normal'} onChange={(v) => handleRowChange(index, 'valueStyle', v)} options={VALUE_STYLE_OPTIONS} />
            </div>
            <div className="property-row">
              <ColorInput label="Değer Rengi" value={(row.valueColor as string) || '#333333'} onChange={(v) => handleRowChange(index, 'valueColor', v)} />
              <NumberInput label="Değer Font" value={(row.valueFontSize as number) || 0} onChange={(v) => handleRowChange(index, 'valueFontSize', v || undefined)} placeholder="Varsayılan" />
            </div>
          </div>
        ))}

        <button onClick={addRow} style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Yeni Satır Ekle</button>
      </div>

      {/* Margin */}
      <SectionDivider icon="↔️" text="Dış Boşluk" />
      <SpacingControl type="margin" props={p} onChange={onChange} />
    </>
  )
}

export default InfoTablePropertyEditor
