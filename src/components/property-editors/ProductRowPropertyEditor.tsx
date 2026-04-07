import React from 'react'
import { ElementEditorProps } from './types'
import {
  TextInput, NumberInput, ColorInput, SelectInput, CheckboxInput,
  SectionDivider, VariableSelector,
  FONT_WEIGHT_SIMPLE_OPTIONS, ALIGN_OPTIONS,
} from '../ui'

const ProductRowPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props
  const displayMode = (p.displayMode as string) || 'card'
  const columns = (p.columns || []) as Array<Record<string, unknown>>

  const handleColumnChange = (index: number, field: string, value: unknown) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    onChange('columns', newColumns)
  }

  const addColumn = () => {
    onChange('columns', [...columns, {
      id: `col_${Date.now()}`, label: 'Yeni Kolon', variableKey: 'item.new_field',
      width: 'auto', type: 'text', fontSize: 14, fontWeight: 'normal', color: '#333333',
      textAlign: 'left', imgWidth: 60, imgHeight: 60,
    }])
  }

  const removeColumn = (index: number) => {
    onChange('columns', columns.filter((_: unknown, i: number) => i !== index))
  }

  return (
    <>
      {/* Display Mode */}
      <SectionDivider icon="🎨" text="Görünüm Modu" />
      <div className="property-item">
        <label className="property-label">Görünüm Tipi</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { mode: 'card', icon: '🃏', label: 'Kart', desc: 'Resim + Bilgi yan yana' },
            { mode: 'table', icon: '📊', label: 'Tablo', desc: 'Kolonlu liste' },
          ].map(({ mode, icon, label, desc }) => (
            <button key={mode} type="button" onClick={() => onChange('displayMode', mode)} style={{
              flex: 1, padding: '12px 8px', border: displayMode === mode ? '2px solid #1976d2' : '1px solid #ddd',
              borderRadius: '8px', backgroundColor: displayMode === mode ? '#e3f2fd' : '#fff', cursor: 'pointer', textAlign: 'center',
            }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ fontSize: '12px', fontWeight: displayMode === mode ? 'bold' : 'normal' }}>{label}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Repeater */}
      <SectionDivider icon="🔄" text="Tekrarlama Ayarları" />
      <TextInput label="Array Key" value={(p.repeatKey as string) || 'order_items'} onChange={(v) => onChange('repeatKey', v)} placeholder="order_items, products" />
      <TextInput label="Item Alias" value={(p.repeatItemAlias as string) || 'item'} onChange={(v) => onChange('repeatItemAlias', v)} placeholder="item, product" />

      {/* Card Mode */}
      {displayMode === 'card' && (
        <>
          <SectionDivider icon="🖼️" text="Ürün Resmi" />
          <div className="property-item">
            <label className="property-label">Resim Değişkeni</label>
            <VariableSelector value={(p.cardImgVariableKey as string) || 'item.image_url'} onChange={(v) => onChange('cardImgVariableKey', v)} placeholder="item.image_url" filterCategories={['product_item']} />
          </div>
          <div className="property-row">
            <NumberInput label="Genişlik (px)" value={(p.cardImgWidth as number) || 80} onChange={(v) => onChange('cardImgWidth', v)} />
            <NumberInput label="Yükseklik (px)" value={(p.cardImgHeight as number) || 80} onChange={(v) => onChange('cardImgHeight', v)} />
          </div>
          <NumberInput label="Resim Köşe Yuvarlaklığı" value={(p.cardImgBorderRadius as number) || 4} onChange={(v) => onChange('cardImgBorderRadius', v)} />
          <CheckboxInput label="Resme Link Ekle" checked={Boolean(p.cardImgLinkEnabled)} onChange={(v) => onChange('cardImgLinkEnabled', v)} />
          {Boolean(p.cardImgLinkEnabled) && (
            <>
              <CheckboxInput label="Sabit Link Kullan" checked={Boolean(p.cardImgLinkIsStatic)} onChange={(v) => onChange('cardImgLinkIsStatic', v)} />
              {Boolean(p.cardImgLinkIsStatic) ? (
                <TextInput label="Sabit Link URL" value={(p.cardImgLinkStaticUrl as string) || ''} onChange={(v) => onChange('cardImgLinkStaticUrl', v)} placeholder="https://example.com" />
              ) : (
                <div className="property-item">
                  <label className="property-label">Link Değişkeni</label>
                  <VariableSelector value={(p.cardImgLinkVariableKey as string) || 'item.url'} onChange={(v) => onChange('cardImgLinkVariableKey', v)} placeholder="item.url" filterCategories={['product_item']} />
                </div>
              )}
            </>
          )}

          <SectionDivider icon="📝" text="Ürün Başlığı" />
          <div className="property-item">
            <label className="property-label">Başlık Değişkeni</label>
            <VariableSelector value={(p.cardTitleVariableKey as string) || 'item.name'} onChange={(v) => onChange('cardTitleVariableKey', v)} placeholder="item.name" filterCategories={['product_item']} />
          </div>
          <div className="property-row">
            <NumberInput label="Font Boyutu" value={(p.cardTitleFontSize as number) || 14} onChange={(v) => onChange('cardTitleFontSize', v)} />
            <SelectInput label="Font Kalınlığı" value={(p.cardTitleFontWeight as string) || 'normal'} onChange={(v) => onChange('cardTitleFontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
          </div>
          <ColorInput label="Başlık Rengi" value={(p.cardTitleColor as string) || '#333333'} onChange={(v) => onChange('cardTitleColor', v)} />

          <SectionDivider icon="📄" text="Alt Bilgi (Adet, Beden vb.)" />
          <div className="property-item">
            <label className="property-label">Alt Bilgi Değişkeni</label>
            <VariableSelector value={(p.cardSubtitleVariableKey as string) || 'item.details'} onChange={(v) => onChange('cardSubtitleVariableKey', v)} placeholder="item.details" filterCategories={['product_item']} />
            <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
              Backend'de birleştirilmiş string: "Adet : 1 - Beden : L"
            </small>
          </div>
          <div className="property-row">
            <NumberInput label="Font Boyutu" value={(p.cardSubtitleFontSize as number) || 13} onChange={(v) => onChange('cardSubtitleFontSize', v)} />
            <ColorInput label="Renk" value={(p.cardSubtitleColor as string) || '#666666'} onChange={(v) => onChange('cardSubtitleColor', v)} />
          </div>

          <SectionDivider icon="💰" text="Fiyat" />
          <div className="property-item">
            <label className="property-label">Fiyat Değişkeni</label>
            <VariableSelector value={(p.cardPriceVariableKey as string) || 'item.price'} onChange={(v) => onChange('cardPriceVariableKey', v)} placeholder="item.price" filterCategories={['product_item']} />
          </div>
          <div className="property-row">
            <NumberInput label="Font Boyutu" value={(p.cardPriceFontSize as number) || 15} onChange={(v) => onChange('cardPriceFontSize', v)} />
            <SelectInput label="Font Kalınlığı" value={(p.cardPriceFontWeight as string) || 'bold'} onChange={(v) => onChange('cardPriceFontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
          </div>
          <ColorInput label="Fiyat Rengi" value={(p.cardPriceColor as string) || '#f57c00'} onChange={(v) => onChange('cardPriceColor', v)} />

          <SectionDivider icon="🎴" text="Kart Stili" />
          <ColorInput label="Kart Arkaplan" value={(p.cardBgColor as string) || '#ffffff'} onChange={(v) => onChange('cardBgColor', v)} />
          <ColorInput label="Kenarlık Rengi" value={(p.cardBorderColor as string) || '#eeeeee'} onChange={(v) => onChange('cardBorderColor', v)} />
          <div className="property-row">
            <NumberInput label="Köşe Yuvarlaklığı" value={(p.cardBorderRadius as number) || 8} onChange={(v) => onChange('cardBorderRadius', v)} />
            <TextInput label="İç Boşluk" value={(p.cardPadding as string) || '12px'} onChange={(v) => onChange('cardPadding', v)} placeholder="12px" />
          </div>
          <CheckboxInput label="Gölge Efekti" checked={(p.cardShadow as boolean) || false} onChange={(v) => onChange('cardShadow', v)} />
        </>
      )}

      {/* Table Mode */}
      {displayMode === 'table' && (
        <>
          <SectionDivider icon="📋" text="Tablo Başlık Ayarları" />
          <CheckboxInput label="Başlık Göster" checked={(p.showHeader as boolean) !== false} onChange={(v) => onChange('showHeader', v)} />
          {(p.showHeader as boolean) !== false && (
            <>
              <ColorInput label="Başlık Arkaplan" value={(p.headerBgColor as string) || '#f8f9fa'} onChange={(v) => onChange('headerBgColor', v)} />
              <ColorInput label="Başlık Yazı Rengi" value={(p.headerTextColor as string) || '#333333'} onChange={(v) => onChange('headerTextColor', v)} />
              <NumberInput label="Başlık Font Boyutu" value={(p.headerFontSize as number) || 14} onChange={(v) => onChange('headerFontSize', v)} />
            </>
          )}

          <SectionDivider icon="📊" text="Satır Stilleri" />
          <ColorInput label="Satır Arkaplan" value={(p.rowBgColor as string) || '#ffffff'} onChange={(v) => onChange('rowBgColor', v)} />
          <ColorInput label="Alternatif Satır Arkaplan" value={(p.rowAltBgColor as string) || '#f9f9f9'} onChange={(v) => onChange('rowAltBgColor', v)} />
          <ColorInput label="Satır Kenarlık Rengi" value={(p.rowBorderColor as string) || '#e0e0e0'} onChange={(v) => onChange('rowBorderColor', v)} />

          <SectionDivider icon="📏" text="Kolonlar" />
          <div className="columns-editor">
            {columns.map((col, index) => (
              <div key={index} className="column-item" style={{ border: '1px solid #e0e0e0', padding: '12px', marginBottom: '12px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                    {col.type === 'image' ? '🖼️' : col.type === 'price' ? '💰' : '📝'} Kolon {index + 1}: {col.label as string}
                  </h4>
                  <button onClick={() => removeColumn(index)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Sil</button>
                </div>
                <TextInput label="Başlık Etiketi" value={(col.label as string) || ''} onChange={(v) => handleColumnChange(index, 'label', v)} placeholder="Ürün Adı" />
                <SelectInput label="Tip" value={(col.type as string) || 'text'} onChange={(v) => handleColumnChange(index, 'type', v)} options={[
                  { value: 'text', label: 'Metin' }, { value: 'image', label: 'Resim' }, { value: 'price', label: 'Fiyat' },
                ]} />
                <div className="property-item">
                  <label className="property-label">🔗 Değişken Anahtarı</label>
                  <input type="text" value={(col.variableKey as string) || ''} onChange={(e) => handleColumnChange(index, 'variableKey', e.target.value)} className="property-input" placeholder="item.name, item.price" />
                  <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>Backend'den gelecek veri yolu (örn: item.name)</small>
                </div>
                <TextInput label="Genişlik" value={(col.width as string) || 'auto'} onChange={(v) => handleColumnChange(index, 'width', v)} placeholder="100px, 20%, auto" />
                <SelectInput label="Hizalama" value={(col.textAlign as string) || 'left'} onChange={(v) => handleColumnChange(index, 'textAlign', v)} options={ALIGN_OPTIONS} />

                {col.type !== 'image' && (
                  <>
                    <NumberInput label="Font Boyutu" value={(col.fontSize as number) || 14} onChange={(v) => handleColumnChange(index, 'fontSize', v)} />
                    <SelectInput label="Font Kalınlığı" value={(col.fontWeight as string) || 'normal'} onChange={(v) => handleColumnChange(index, 'fontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
                    <ColorInput label="Yazı Rengi" value={(col.color as string) || '#333333'} onChange={(v) => handleColumnChange(index, 'color', v)} />
                  </>
                )}
                {col.type === 'image' && (
                  <>
                    <NumberInput label="Resim Genişliği (px)" value={(col.imgWidth as number) || 60} onChange={(v) => handleColumnChange(index, 'imgWidth', v)} />
                    <NumberInput label="Resim Yüksekliği (px)" value={(col.imgHeight as number) || 60} onChange={(v) => handleColumnChange(index, 'imgHeight', v)} />
                    <CheckboxInput label="Resme Link Ekle" checked={Boolean(col.linkEnabled)} onChange={(v) => handleColumnChange(index, 'linkEnabled', v)} />
                    {Boolean(col.linkEnabled) && (
                      <div className="property-item">
                        <label className="property-label">Link Değişkeni</label>
                        <VariableSelector value={(col.linkVariableKey as string) || 'item.url'} onChange={(v) => handleColumnChange(index, 'linkVariableKey', v)} placeholder="item.url" filterCategories={['product_item']} />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <button onClick={addColumn} style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Kolon Ekle</button>
          </div>

          <SectionDivider icon="🎨" text="Genel Stiller" />
          <TextInput label="Tablo Genişliği" value={(p.tableWidth as string) || '100%'} onChange={(v) => onChange('tableWidth', v)} placeholder="100%, 600px" />
          <ColorInput label="Tablo Kenarlık Rengi" value={(p.tableBorderColor as string) || '#e0e0e0'} onChange={(v) => onChange('tableBorderColor', v)} />
          <NumberInput label="Köşe Yuvarlaklığı (px)" value={(p.borderRadius as number) || 4} onChange={(v) => onChange('borderRadius', v)} />
        </>
      )}
    </>
  )
}

export default ProductRowPropertyEditor
