import React from 'react'
import { ElementEditorProps } from './types'
import {
  TextInput, NumberInput, ColorInput, SelectInput, CheckboxInput,
  SectionDivider, VariableSelector,
  FONT_WEIGHT_SIMPLE_OPTIONS, ALIGN_OPTIONS,
} from '../ui'

const DISPLAY_MODE_OPTIONS = [
  { mode: 'card', label: 'Kart', desc: 'Klasik resimli urun satiri' },
  { mode: 'table', label: 'Tablo', desc: 'Kolonlu siparis listesi' },
  { mode: 'gallery', label: 'Galeri', desc: 'Ornekteki gibi coklu gorsel kart' },
  { mode: 'compact', label: 'Kompakt', desc: 'Dar, hizli okunur liste' },
  { mode: 'split', label: 'Split', desc: 'Gorsel + detay paneli' },
  { mode: 'feature', label: 'Vitrin', desc: 'Buyuk tek urun sunumu' },
  { mode: 'receipt', label: 'Fis', desc: 'Adet, SKU ve fiyat odakli' },
  { mode: 'poster', label: 'Poster', desc: 'Gorsel agirlikli kampanya blogu' },
]

const TEXT_TRANSFORM_OPTIONS = [
  { value: 'none', label: 'Yok' },
  { value: 'uppercase', label: 'Buyuk Harf' },
  { value: 'capitalize', label: 'Ilk Harf Buyuk' },
]

const IMAGE_FIT_OPTIONS = [
  { value: 'cover', label: 'Kapla' },
  { value: 'contain', label: 'Sigdir' },
]

const CARD_LAYOUT_OPTIONS = [
  { value: 'horizontal', label: 'Yatay' },
  { value: 'vertical', label: 'Dikey' },
]

const ProductRowPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props
  const displayMode = (p.displayMode as string) || 'card'
  const columns = (p.columns || []) as Array<Record<string, unknown>>
  const isTableMode = displayMode === 'table'
  const usesGalleryColumns = displayMode === 'gallery'
  const usesBadge = displayMode === 'poster'
  const usesReceiptFields = displayMode === 'receipt'
  const ctaDefaultEnabled = ['gallery', 'split', 'feature', 'poster'].includes(displayMode)
  const ctaChecked = typeof p.ctaEnabled === 'boolean' ? (p.ctaEnabled as boolean) : ctaDefaultEnabled

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

  const handleDisplayModeChange = (mode: string) => {
    onChange('displayMode', mode)
    onChange('visualTextAlign', ['gallery', 'feature', 'poster'].includes(mode) ? 'center' : 'left')
    onChange('ctaEnabled', ['gallery', 'split', 'feature', 'poster'].includes(mode))
    if (mode === 'gallery') {
      onChange('visualColumns', 3)
      onChange('visualImageHeight', 230)
      onChange('cardImgWidth', 180)
      onChange('cardImgHeight', 230)
    }
    if (mode === 'compact' || mode === 'receipt') {
      onChange('visualImageHeight', 80)
    }
  }

  return (
    <>
      <SectionDivider icon="*" text="Gorunum Modu" />
      <div className="property-item">
        <label className="property-label">Gorunum Tipi</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '8px' }}>
          {DISPLAY_MODE_OPTIONS.map(({ mode, label, desc }) => (
            <button key={mode} type="button" onClick={() => handleDisplayModeChange(mode)} style={{
              minHeight: 74,
              padding: '10px 8px',
              border: displayMode === mode ? '2px solid #1976d2' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: displayMode === mode ? '#e3f2fd' : '#fff',
              cursor: 'pointer',
              textAlign: 'left',
            }}>
              <div style={{ fontSize: '13px', fontWeight: displayMode === mode ? 'bold' : 'normal', color: '#1f2937' }}>{label}</div>
              <div style={{ fontSize: '10px', color: '#666', lineHeight: 1.35, marginTop: 4 }}>{desc}</div>
            </button>
          ))}
        </div>
      </div>

      <SectionDivider icon="[]" text="Tekrarlama Ayarlari" />
      <TextInput label="Array Key" value={(p.repeatKey as string) || 'order_items'} onChange={(v) => onChange('repeatKey', v)} placeholder="order_items, products" />
      <TextInput label="Item Alias" value={(p.repeatItemAlias as string) || 'item'} onChange={(v) => onChange('repeatItemAlias', v)} placeholder="item, product" />

      {!isTableMode && (
        <>
          <SectionDivider icon="IMG" text="Icerik Degiskenleri" />
          <div className="property-item">
            <label className="property-label">Resim Degiskeni</label>
            <VariableSelector value={(p.cardImgVariableKey as string) || 'item.image_url'} onChange={(v) => onChange('cardImgVariableKey', v)} placeholder="item.image_url" filterCategories={['product_item']} />
          </div>
          <CheckboxInput label="Resme Link Ekle" checked={Boolean(p.cardImgLinkEnabled)} onChange={(v) => onChange('cardImgLinkEnabled', v)} />
          {Boolean(p.cardImgLinkEnabled) && (
            <>
              <CheckboxInput label="Sabit Resim Linki Kullan" checked={Boolean(p.cardImgLinkIsStatic)} onChange={(v) => onChange('cardImgLinkIsStatic', v)} />
              {Boolean(p.cardImgLinkIsStatic) ? (
                <TextInput label="Sabit Resim Link URL" value={(p.cardImgLinkStaticUrl as string) || ''} onChange={(v) => onChange('cardImgLinkStaticUrl', v)} placeholder="https://example.com" type="url" />
              ) : (
                <div className="property-item">
                  <label className="property-label">Resim Link Degiskeni</label>
                  <VariableSelector value={(p.cardImgLinkVariableKey as string) || 'item.url'} onChange={(v) => onChange('cardImgLinkVariableKey', v)} placeholder="item.url" filterCategories={['product_item']} />
                </div>
              )}
            </>
          )}

          <div className="property-item">
            <label className="property-label">Baslik Degiskeni</label>
            <VariableSelector value={(p.cardTitleVariableKey as string) || 'item.name'} onChange={(v) => onChange('cardTitleVariableKey', v)} placeholder="item.name" filterCategories={['product_item']} />
          </div>
          <div className="property-item">
            <label className="property-label">Alt Bilgi Degiskeni</label>
            <VariableSelector value={(p.cardSubtitleVariableKey as string) || 'item.details'} onChange={(v) => onChange('cardSubtitleVariableKey', v)} placeholder="item.details" filterCategories={['product_item']} />
          </div>
          <div className="property-item">
            <label className="property-label">Fiyat Degiskeni</label>
            <VariableSelector value={(p.cardPriceVariableKey as string) || 'item.price'} onChange={(v) => onChange('cardPriceVariableKey', v)} placeholder="item.price" filterCategories={['product_item']} />
          </div>

          {usesReceiptFields && (
            <>
              <div className="property-item">
                <label className="property-label">Adet Degiskeni</label>
                <VariableSelector value={(p.visualQuantityVariableKey as string) || 'item.quantity'} onChange={(v) => onChange('visualQuantityVariableKey', v)} placeholder="item.quantity" filterCategories={['product_item']} />
              </div>
              <div className="property-item">
                <label className="property-label">SKU Degiskeni</label>
                <VariableSelector value={(p.visualSkuVariableKey as string) || 'item.sku'} onChange={(v) => onChange('visualSkuVariableKey', v)} placeholder="item.sku" filterCategories={['product_item']} />
              </div>
            </>
          )}

          <SectionDivider icon="LAY" text="Yerlesim ve Gorsel" />
          {displayMode === 'card' && (
            <SelectInput label="Kart Yerlesimi" value={(p.cardLayout as string) || 'horizontal'} onChange={(v) => onChange('cardLayout', v)} options={CARD_LAYOUT_OPTIONS} />
          )}
          {usesGalleryColumns && (
            <NumberInput label="Kolon Sayisi" value={(p.visualColumns as number) || 3} onChange={(v) => onChange('visualColumns', v)} min={1} max={4} />
          )}
          <div className="property-row">
            <NumberInput label="Gorsel Genislik" value={(p.cardImgWidth as number) || 80} onChange={(v) => onChange('cardImgWidth', v)} min={24} />
            <NumberInput label="Gorsel Yukseklik" value={(p.cardImgHeight as number) || 80} onChange={(v) => onChange('cardImgHeight', v)} min={24} />
          </div>
          <div className="property-row">
            <NumberInput label="Vitrin Gorsel Yuksekligi" value={(p.visualImageHeight as number) || 230} onChange={(v) => onChange('visualImageHeight', v)} min={80} />
            <SelectInput label="Gorsel Davranisi" value={(p.visualImageFit as string) || 'cover'} onChange={(v) => onChange('visualImageFit', v)} options={IMAGE_FIT_OPTIONS} />
          </div>
          <div className="property-row">
            <NumberInput label="Gorsel Kose" value={(p.cardImgBorderRadius as number) || 4} onChange={(v) => onChange('cardImgBorderRadius', v)} min={0} />
            <NumberInput label="Aralik" value={(displayMode === 'card' ? (p.cardGap as number) : (p.visualGap as number)) || 12} onChange={(v) => onChange(displayMode === 'card' ? 'cardGap' : 'visualGap', v)} min={0} />
          </div>
          <SelectInput label="Metin Hizalama" value={(p.visualTextAlign as string) || 'center'} onChange={(v) => onChange('visualTextAlign', v)} options={ALIGN_OPTIONS} />

          <SectionDivider icon="TXT" text="Metin Stilleri" />
          <div className="property-row">
            <NumberInput label="Baslik Font" value={(p.cardTitleFontSize as number) || 14} onChange={(v) => onChange('cardTitleFontSize', v)} min={8} />
            <SelectInput label="Baslik Kalinligi" value={(p.cardTitleFontWeight as string) || 'normal'} onChange={(v) => onChange('cardTitleFontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
          </div>
          <ColorInput label="Baslik Rengi" value={(p.cardTitleColor as string) || '#333333'} onChange={(v) => onChange('cardTitleColor', v)} />
          <SelectInput label="Baslik Donusumu" value={(p.visualTitleTextTransform as string) || 'none'} onChange={(v) => onChange('visualTitleTextTransform', v)} options={TEXT_TRANSFORM_OPTIONS} />
          <div className="property-row">
            <NumberInput label="Alt Bilgi Font" value={(p.cardSubtitleFontSize as number) || 13} onChange={(v) => onChange('cardSubtitleFontSize', v)} min={8} />
            <ColorInput label="Alt Bilgi Rengi" value={(p.cardSubtitleColor as string) || '#666666'} onChange={(v) => onChange('cardSubtitleColor', v)} />
          </div>
          <div className="property-row">
            <SelectInput label="Alt Bilgi Donusumu" value={(p.visualSubtitleTextTransform as string) || 'uppercase'} onChange={(v) => onChange('visualSubtitleTextTransform', v)} options={TEXT_TRANSFORM_OPTIONS} />
            <NumberInput label="Harf Araligi" value={(p.visualSubtitleLetterSpacing as number) || 0} onChange={(v) => onChange('visualSubtitleLetterSpacing', v)} min={0} step={0.5} />
          </div>
          <div className="property-row">
            <NumberInput label="Fiyat Font" value={(p.cardPriceFontSize as number) || 15} onChange={(v) => onChange('cardPriceFontSize', v)} min={8} />
            <SelectInput label="Fiyat Kalinligi" value={(p.cardPriceFontWeight as string) || 'bold'} onChange={(v) => onChange('cardPriceFontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
          </div>
          <ColorInput label="Fiyat Rengi" value={(p.cardPriceColor as string) || '#f57c00'} onChange={(v) => onChange('cardPriceColor', v)} />

          <SectionDivider icon="CTA" text="Buton / Aksiyon" />
          <CheckboxInput label="Buton Goster" checked={ctaChecked} onChange={(v) => onChange('ctaEnabled', v)} />
          {ctaChecked && (
            <>
              <TextInput label="Buton Metni" value={(p.ctaText as string) || 'Incele'} onChange={(v) => onChange('ctaText', v)} placeholder="Incele" />
              <CheckboxInput label="Sabit Buton Linki Kullan" checked={Boolean(p.ctaLinkIsStatic)} onChange={(v) => onChange('ctaLinkIsStatic', v)} />
              {Boolean(p.ctaLinkIsStatic) ? (
                <TextInput label="Sabit Buton URL" value={(p.ctaStaticUrl as string) || ''} onChange={(v) => onChange('ctaStaticUrl', v)} placeholder="https://example.com" type="url" />
              ) : (
                <div className="property-item">
                  <label className="property-label">Buton Link Degiskeni</label>
                  <VariableSelector value={(p.ctaLinkVariableKey as string) || 'item.url'} onChange={(v) => onChange('ctaLinkVariableKey', v)} placeholder="item.url" filterCategories={['product_item']} />
                </div>
              )}
              <div className="property-row">
                <ColorInput label="Buton Arkaplan" value={(p.ctaBgColor as string) || '#444444'} onChange={(v) => onChange('ctaBgColor', v)} />
                <ColorInput label="Buton Yazi" value={(p.ctaTextColor as string) || '#ffffff'} onChange={(v) => onChange('ctaTextColor', v)} />
              </div>
              <div className="property-row">
                <ColorInput label="Buton Kenarlik" value={(p.ctaBorderColor as string) || '#444444'} onChange={(v) => onChange('ctaBorderColor', v)} />
                <NumberInput label="Buton Kose" value={(p.ctaBorderRadius as number) || 0} onChange={(v) => onChange('ctaBorderRadius', v)} min={0} />
              </div>
              <div className="property-row">
                <NumberInput label="Buton Font" value={(p.ctaFontSize as number) || 13} onChange={(v) => onChange('ctaFontSize', v)} min={8} />
                <NumberInput label="Buton Harf Araligi" value={(p.ctaLetterSpacing as number) || 0} onChange={(v) => onChange('ctaLetterSpacing', v)} min={0} step={0.5} />
              </div>
              <TextInput label="Buton Bosluk" value={(p.ctaPadding as string) || '12px 24px'} onChange={(v) => onChange('ctaPadding', v)} placeholder="12px 24px" />
              <SelectInput label="Buton Donusumu" value={(p.ctaTextTransform as string) || 'uppercase'} onChange={(v) => onChange('ctaTextTransform', v)} options={TEXT_TRANSFORM_OPTIONS} />
            </>
          )}

          <SectionDivider icon="BOX" text="Yuzey Stili" />
          <ColorInput label="Arkaplan" value={(p.cardBgColor as string) || '#ffffff'} onChange={(v) => onChange('cardBgColor', v)} />
          <ColorInput label="Kenarlik Rengi" value={(p.cardBorderColor as string) || '#eeeeee'} onChange={(v) => onChange('cardBorderColor', v)} />
          <div className="property-row">
            <NumberInput label="Kose Yuvarlakligi" value={(p.cardBorderRadius as number) || 8} onChange={(v) => onChange('cardBorderRadius', v)} min={0} />
            <TextInput label="Ic Bosluk" value={(p.cardPadding as string) || '12px'} onChange={(v) => onChange('cardPadding', v)} placeholder="12px" />
          </div>
          <div className="property-row">
            <ColorInput label="Vurgu Rengi" value={(p.visualAccentColor as string) || '#e85d5d'} onChange={(v) => onChange('visualAccentColor', v)} />
            <CheckboxInput label="Golge Efekti" checked={(p.cardShadow as boolean) || false} onChange={(v) => onChange('cardShadow', v)} />
          </div>
          {usesBadge && (
            <>
              <TextInput label="Rozet Metni" value={(p.visualBadgeText as string) || 'Yeni'} onChange={(v) => onChange('visualBadgeText', v)} placeholder="Yeni" />
              <div className="property-row">
                <ColorInput label="Rozet Arkaplan" value={(p.visualBadgeBgColor as string) || '#111111'} onChange={(v) => onChange('visualBadgeBgColor', v)} />
                <ColorInput label="Rozet Yazi" value={(p.visualBadgeTextColor as string) || '#ffffff'} onChange={(v) => onChange('visualBadgeTextColor', v)} />
              </div>
            </>
          )}
        </>
      )}

      {isTableMode && (
        <>
          <SectionDivider icon="HDR" text="Tablo Baslik Ayarlari" />
          <CheckboxInput label="Baslik Goster" checked={(p.showHeader as boolean) !== false} onChange={(v) => onChange('showHeader', v)} />
          {(p.showHeader as boolean) !== false && (
            <>
              <ColorInput label="Baslik Arkaplan" value={(p.headerBgColor as string) || '#f8f9fa'} onChange={(v) => onChange('headerBgColor', v)} />
              <ColorInput label="Baslik Yazi Rengi" value={(p.headerTextColor as string) || '#333333'} onChange={(v) => onChange('headerTextColor', v)} />
              <NumberInput label="Baslik Font Boyutu" value={(p.headerFontSize as number) || 14} onChange={(v) => onChange('headerFontSize', v)} />
            </>
          )}

          <SectionDivider icon="ROW" text="Satir Stilleri" />
          <ColorInput label="Satir Arkaplan" value={(p.rowBgColor as string) || '#ffffff'} onChange={(v) => onChange('rowBgColor', v)} />
          <ColorInput label="Alternatif Satir Arkaplan" value={(p.rowAltBgColor as string) || '#f9f9f9'} onChange={(v) => onChange('rowAltBgColor', v)} />
          <ColorInput label="Satir Kenarlik Rengi" value={(p.rowBorderColor as string) || '#e0e0e0'} onChange={(v) => onChange('rowBorderColor', v)} />

          <SectionDivider icon="COL" text="Kolonlar" />
          <div className="columns-editor">
            {columns.map((col, index) => (
              <div key={index} className="column-item" style={{ border: '1px solid #e0e0e0', padding: '12px', marginBottom: '12px', borderRadius: '8px', backgroundColor: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                    Kolon {index + 1}: {col.label as string}
                  </h4>
                  <button onClick={() => removeColumn(index)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Sil</button>
                </div>
                <TextInput label="Baslik Etiketi" value={(col.label as string) || ''} onChange={(v) => handleColumnChange(index, 'label', v)} placeholder="Urun Adi" />
                <SelectInput label="Tip" value={(col.type as string) || 'text'} onChange={(v) => handleColumnChange(index, 'type', v)} options={[
                  { value: 'text', label: 'Metin' }, { value: 'image', label: 'Resim' }, { value: 'price', label: 'Fiyat' },
                ]} />
                <div className="property-item">
                  <label className="property-label">Degisken Anahtari</label>
                  <input type="text" value={(col.variableKey as string) || ''} onChange={(e) => handleColumnChange(index, 'variableKey', e.target.value)} className="property-input" placeholder="item.name, item.price" />
                  <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>Backend'den gelecek veri yolu (orn: item.name)</small>
                </div>
                <TextInput label="Genislik" value={(col.width as string) || 'auto'} onChange={(v) => handleColumnChange(index, 'width', v)} placeholder="100px, 20%, auto" />
                <SelectInput label="Hizalama" value={(col.textAlign as string) || 'left'} onChange={(v) => handleColumnChange(index, 'textAlign', v)} options={ALIGN_OPTIONS} />

                {col.type !== 'image' && (
                  <>
                    <NumberInput label="Font Boyutu" value={(col.fontSize as number) || 14} onChange={(v) => handleColumnChange(index, 'fontSize', v)} />
                    <SelectInput label="Font Kalinligi" value={(col.fontWeight as string) || 'normal'} onChange={(v) => handleColumnChange(index, 'fontWeight', v)} options={FONT_WEIGHT_SIMPLE_OPTIONS} />
                    <ColorInput label="Yazi Rengi" value={(col.color as string) || '#333333'} onChange={(v) => handleColumnChange(index, 'color', v)} />
                  </>
                )}
                {col.type === 'image' && (
                  <>
                    <NumberInput label="Resim Genisligi (px)" value={(col.imgWidth as number) || 60} onChange={(v) => handleColumnChange(index, 'imgWidth', v)} />
                    <NumberInput label="Resim Yuksekligi (px)" value={(col.imgHeight as number) || 60} onChange={(v) => handleColumnChange(index, 'imgHeight', v)} />
                    <CheckboxInput label="Resme Link Ekle" checked={Boolean(col.linkEnabled)} onChange={(v) => handleColumnChange(index, 'linkEnabled', v)} />
                    {Boolean(col.linkEnabled) && (
                      <div className="property-item">
                        <label className="property-label">Link Degiskeni</label>
                        <VariableSelector value={(col.linkVariableKey as string) || 'item.url'} onChange={(v) => handleColumnChange(index, 'linkVariableKey', v)} placeholder="item.url" filterCategories={['product_item']} />
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
            <button onClick={addColumn} style={{ width: '100%', padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>+ Kolon Ekle</button>
          </div>

          <SectionDivider icon="BOX" text="Genel Stiller" />
          <TextInput label="Tablo Genisligi" value={(p.tableWidth as string) || '100%'} onChange={(v) => onChange('tableWidth', v)} placeholder="100%, 600px" />
          <ColorInput label="Tablo Kenarlik Rengi" value={(p.tableBorderColor as string) || '#e0e0e0'} onChange={(v) => onChange('tableBorderColor', v)} />
          <NumberInput label="Kose Yuvarlakligi (px)" value={(p.borderRadius as number) || 4} onChange={(v) => onChange('borderRadius', v)} />
        </>
      )}
    </>
  )
}

export default ProductRowPropertyEditor
