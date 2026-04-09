import React, { useState, useMemo } from 'react'
import { ElementEditorProps } from './types'
import { NumberInput, ColorInput, TextInput, SelectInput, SectionDivider, COLUMN_TYPE_OPTIONS } from '../ui'
import { CanvasElement } from '../../types'
import TextPropertyEditor from './TextPropertyEditor'
import ImagePropertyEditor from './ImagePropertyEditor'
import ButtonPropertyEditor from './ButtonPropertyEditor'

const DEFAULT_COLUMN: Record<string, unknown> = {
  width: '50%', type: 'text', content: 'Yeni Kolon', fontSize: 16, fontWeight: 'normal', fontFamily: 'Arial, sans-serif',
  color: '#000000', textAlign: 'left', lineHeight: 1.5, backgroundColor: 'transparent',
  paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
  borderTop: '', borderBottom: '', borderLeft: '', borderRight: '',
  src: 'https://via.placeholder.com/300x200', alt: 'Resim', imgWidth: 300, imgHeight: '', imgKeepAspectRatio: true, imgAlign: 'center', imgBackgroundColor: 'transparent',
  imgPaddingTop: 0, imgPaddingRight: 0, imgPaddingBottom: 0, imgPaddingLeft: 0, imgMarginTop: 0, imgMarginRight: 0, imgMarginBottom: 0, imgMarginLeft: 0,
  btnText: 'Buton', btnLink: '#', btnBg: '#3A416F', btnColor: '#ffffff', btnFontSize: 16, btnFontWeight: 'bold', btnBorderRadius: 4, btnPadding: '12px 24px', btnTextAlign: 'center'
}

const parseWidth = (width: unknown): number => {
  if (typeof width === 'number') return width
  if (typeof width === 'string') return parseFloat(width) || 50
  return 50
}

// Mapping: column prop name → standalone element prop name
const IMAGE_COL_TO_ELEMENT: Record<string, string> = {
  src: 'src', alt: 'alt', imgWidth: 'width', imgHeight: 'height',
  imgKeepAspectRatio: 'keepAspectRatio', imgAlign: 'textAlign', imgBackgroundColor: 'backgroundColor',
  imgPaddingTop: 'paddingTop', imgPaddingRight: 'paddingRight', imgPaddingBottom: 'paddingBottom', imgPaddingLeft: 'paddingLeft',
  imgMarginTop: 'marginTop', imgMarginRight: 'marginRight', imgMarginBottom: 'marginBottom', imgMarginLeft: 'marginLeft',
  isLinked: 'isLinked', linkUrl: 'linkUrl',
}
const IMAGE_ELEMENT_TO_COL: Record<string, string> = Object.fromEntries(
  Object.entries(IMAGE_COL_TO_ELEMENT).map(([k, v]) => [v, k])
)

const BUTTON_COL_TO_ELEMENT: Record<string, string> = {
  btnText: 'text', btnLink: 'href', btnBg: 'backgroundColor', btnColor: 'color',
  btnFontSize: 'fontSize', btnFontWeight: 'fontWeight', btnBorderRadius: 'borderRadius',
  btnPadding: 'padding', btnTextAlign: 'textAlign',
}
const BUTTON_ELEMENT_TO_COL: Record<string, string> = Object.fromEntries(
  Object.entries(BUTTON_COL_TO_ELEMENT).map(([k, v]) => [v, k])
)

/** Convert column data to a virtual CanvasElement for a standalone property editor */
const columnToElement = (col: Record<string, unknown>, colType: string): CanvasElement => {
  const props: Record<string, unknown> = {}
  if (colType === 'image') {
    for (const [colKey, elKey] of Object.entries(IMAGE_COL_TO_ELEMENT)) {
      if (col[colKey] !== undefined) props[elKey] = col[colKey]
    }
  } else if (colType === 'button') {
    for (const [colKey, elKey] of Object.entries(BUTTON_COL_TO_ELEMENT)) {
      if (col[colKey] !== undefined) props[elKey] = col[colKey]
    }
  } else {
    // text: direct 1:1 mapping
    const skip = new Set(['width', 'type'])
    for (const [k, v] of Object.entries(col)) {
      if (!skip.has(k)) props[k] = v
    }
  }
  return { id: `col-virtual`, type: colType as CanvasElement['type'], props }
}

const MultiColumnPropertyEditor: React.FC<ElementEditorProps> = ({ element, onChange }) => {
  const p = element.props
  const columns = (p.columns || []) as Array<Record<string, unknown>>
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number>(0)

  const activeIndex = Math.min(selectedColumnIndex, Math.max(0, columns.length - 1))

  const handleColumnChange = (index: number, field: string, value: unknown) => {
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    onChange('columns', newColumns)
  }

  const addColumn = () => {
    const equalWidth = Math.floor(100 / (columns.length + 1))
    const newColumns = [
      ...columns.map(col => ({ ...col, width: `${equalWidth}%` })),
      { ...DEFAULT_COLUMN, width: `${equalWidth}%` }
    ]
    onChange('columns', newColumns)
    setSelectedColumnIndex(newColumns.length - 1)
  }

  const removeColumn = (index: number) => {
    if (columns.length <= 1) return
    const newColumns = columns.filter((_: unknown, i: number) => i !== index)
    const equalWidth = Math.floor(100 / newColumns.length)
    const redistributed = newColumns.map(col => ({ ...col, width: `${equalWidth}%` }))
    onChange('columns', redistributed)
    if (activeIndex >= newColumns.length) {
      setSelectedColumnIndex(newColumns.length - 1)
    }
  }

  const handleWidthChange = (index: number, newWidth: number) => {
    const clamped = Math.max(5, Math.min(100, newWidth))
    handleColumnChange(index, 'width', `${clamped}%`)
  }

  const selectedCol = columns[activeIndex] || {}
  const colType = (selectedCol.type as string) || 'text'

  // Build a virtual CanvasElement for the selected column
  const virtualElement = useMemo(
    () => columnToElement(selectedCol, colType),
    [selectedCol, colType]
  )

  // Wrapped onChange that maps element prop names back to column prop names
  const virtualOnChange = useMemo(() => {
    return (propName: string, value: unknown) => {
      let colPropName = propName
      if (colType === 'image') {
        colPropName = IMAGE_ELEMENT_TO_COL[propName] || propName
      } else if (colType === 'button') {
        colPropName = BUTTON_ELEMENT_TO_COL[propName] || propName
      }
      handleColumnChange(activeIndex, colPropName, value)
    }
  }, [activeIndex, colType, columns])

  return (
    <>
      <NumberInput label="Boşluk" value={(p.gap as number) || 0} onChange={(v) => onChange('gap', v)} />
      <TextInput label="İç Boşluk" value={(p.padding as string) || '10px'} onChange={(v) => onChange('padding', v)} />
      <ColorInput label="Arkaplan Rengi" value={(p.backgroundColor as string) || 'transparent'} onChange={(v) => onChange('backgroundColor', v)} />

      <SectionDivider icon="📏" text="Kolon Yönetimi" />

      {/* Column Width Preview Tabs */}
      <div style={{ display: 'flex', gap: '3px', marginBottom: '12px', alignItems: 'center' }}>
        {columns.map((col, index) => {
          const w = parseWidth(col.width)
          return (
            <button
              key={index}
              onClick={() => setSelectedColumnIndex(index)}
              style={{
                flex: `${w} 0 0%`,
                padding: '6px 0',
                border: activeIndex === index ? '2px solid #4A90D9' : '2px dashed #ccc',
                borderRadius: '4px',
                background: activeIndex === index ? '#E8F0FE' : 'white',
                color: activeIndex === index ? '#4A90D9' : '#aaa',
                fontSize: '12px',
                fontWeight: activeIndex === index ? '600' : '400',
                cursor: 'pointer',
                textAlign: 'center',
                minWidth: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                transition: 'flex 0.2s ease',
              }}
            >
              {index + 1}
            </button>
          )
        })}
        <button
          onClick={addColumn}
          style={{
            padding: '6px 10px',
            border: '2px dashed #ccc',
            borderRadius: '4px',
            background: 'white',
            color: '#888',
            fontSize: '14px',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          +
        </button>
      </div>

      {/* Column Width Management List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
        {columns.map((col, index) => {
          const width = parseWidth(col.width)
          return (
            <div
              key={index}
              onClick={() => setSelectedColumnIndex(index)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '6px 8px', borderRadius: '6px',
                background: activeIndex === index ? '#F0F5FF' : '#FAFAFA',
                border: activeIndex === index ? '1px solid #4A90D9' : '1px solid #eee',
                cursor: 'pointer',
              }}
            >
              <span style={{ flex: 1, fontSize: '13px', color: '#333', fontWeight: activeIndex === index ? '600' : '400' }}>
                Konteyner {index + 1}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); removeColumn(index); }}
                style={{
                  background: 'none', border: 'none',
                  cursor: columns.length <= 1 ? 'not-allowed' : 'pointer',
                  color: columns.length <= 1 ? '#ddd' : '#999', fontSize: '16px', padding: '2px',
                  opacity: columns.length <= 1 ? 0.4 : 1,
                }}
                disabled={columns.length <= 1}
                title="Kolonu sil"
              >
                🗑
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginLeft: '4px' }}>
                <button
                  onClick={(e) => { e.stopPropagation(); handleWidthChange(index, width - 1); }}
                  style={{
                    width: '26px', height: '26px', border: '1px solid #ddd', borderRadius: '4px',
                    background: 'white', cursor: 'pointer', fontSize: '14px', color: '#666',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >−</button>
                <input
                  type="number"
                  value={Math.round(width)}
                  onChange={(e) => { e.stopPropagation(); handleWidthChange(index, parseFloat(e.target.value) || 0); }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '48px', height: '26px', textAlign: 'center', border: '1px solid #ddd',
                    borderRadius: '4px', fontSize: '13px', color: '#333',
                  }}
                />
                <button
                  onClick={(e) => { e.stopPropagation(); handleWidthChange(index, width + 1); }}
                  style={{
                    width: '26px', height: '26px', border: '1px solid #ddd', borderRadius: '4px',
                    background: 'white', cursor: 'pointer', fontSize: '14px', color: '#666',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >+</button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected Column Properties — delegates to actual standalone editors */}
      {columns.length > 0 && (
        <>
          <SectionDivider icon="⚙️" text={`Konteyner ${activeIndex + 1} Özellikleri`} />

          <SelectInput label="Tip" value={colType} onChange={(v) => handleColumnChange(activeIndex, 'type', v)} options={COLUMN_TYPE_OPTIONS} />

          {colType === 'text' && (
            <TextPropertyEditor element={virtualElement} onChange={virtualOnChange} />
          )}

          {colType === 'image' && (
            <ImagePropertyEditor element={virtualElement} onChange={virtualOnChange} />
          )}

          {colType === 'button' && (
            <ButtonPropertyEditor element={virtualElement} onChange={virtualOnChange} />
          )}
        </>
      )}
    </>
  )
}

export default MultiColumnPropertyEditor
