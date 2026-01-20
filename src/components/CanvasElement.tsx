import React, { useRef, useState, useEffect } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { CanvasElementComponentProps } from '../types'
import './CanvasElement.css'

interface DragItem {
  id: string
  index: number
}

interface ElementPropsBase {
  margin?: string
  padding?: string
  marginTop?: number
  marginRight?: number
  marginBottom?: number
  marginLeft?: number
  paddingTop?: number
  paddingRight?: number
  paddingBottom?: number
  paddingLeft?: number
  [key: string]: unknown
}

const CanvasElement: React.FC<CanvasElementComponentProps> = ({ 
  element, 
  index, 
  isSelected, 
  onSelect, 
  onDelete, 
  onReorder 
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [isNew, setIsNew] = useState(true)

  // Yeni element animasyonu için - 600ms sonra animasyon class'ını kaldır
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNew(false)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: string | symbol | null }>({
    accept: 'CANVAS_ELEMENT',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      if (dragIndex === hoverIndex) {
        return
      }

      const hoverBoundingRect = ref.current?.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      onReorder(dragIndex, hoverIndex)
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: 'CANVAS_ELEMENT',
    item: (): DragItem => {
      return { id: element.id, index }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  drag(drop(ref))

  const renderElement = (): React.ReactNode => {
    const { type, props } = element
    const p = props as ElementPropsBase
    
    // Margin ve Padding helper fonksiyonları
    const getMargin = (p: ElementPropsBase): string => {
      if (p.margin) return p.margin
      return `${p.marginTop || 0}px ${p.marginRight || 0}px ${p.marginBottom || 0}px ${p.marginLeft || 0}px`
    }
    
    const getPadding = (p: ElementPropsBase): string => {
      if (p.padding && p.padding !== '0') return p.padding
      return `${p.paddingTop || 0}px ${p.paddingRight || 0}px ${p.paddingBottom || 0}px ${p.paddingLeft || 0}px`
    }

    switch (type) {
      case 'text':
        return (
          <div
            style={{
              fontSize: `${p.fontSize}px`,
              fontWeight: p.fontWeight as string,
              fontFamily: p.fontFamily as string,
              color: p.color as string,
              backgroundColor: p.backgroundColor && p.backgroundColor !== 'transparent' ? p.backgroundColor as string : undefined,
              textAlign: (p.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
              lineHeight: (p.lineHeight as number) || 1.5,
              margin: getMargin(p),
              padding: getPadding(p),
              whiteSpace: 'pre-wrap'
            }}
            dangerouslySetInnerHTML={{ __html: p.content as string }}
          />
        )

      case 'heading':
        const HeadingTag = (p.as as keyof JSX.IntrinsicElements) || 'h2'
        return React.createElement(
          HeadingTag,
          {
            style: {
              fontSize: `${p.fontSize}px`,
              fontWeight: p.fontWeight as string,
              fontFamily: p.fontFamily as string,
              color: p.color as string,
              textAlign: (p.textAlign as 'left' | 'center' | 'right' | 'justify') || 'left',
              margin: p.margin as string,
              padding: p.padding as string
            }
          },
          p.content as string
        )

      case 'multi_column':
        const columns = p.columns as Array<Record<string, unknown>>
        
        const renderColumn = (col: Record<string, unknown>): React.ReactNode => {
          const colType = (col.type || 'text') as string
          
          // Kolon için margin/padding helper
          const getColPadding = (c: Record<string, unknown>, prefix: string = ''): string => {
            const pre = prefix ? prefix : ''
            return `${c[pre + 'paddingTop'] || c[pre + 'PaddingTop'] || 0}px ${c[pre + 'paddingRight'] || c[pre + 'PaddingRight'] || 0}px ${c[pre + 'paddingBottom'] || c[pre + 'PaddingBottom'] || 0}px ${c[pre + 'paddingLeft'] || c[pre + 'PaddingLeft'] || 0}px`
          }
          
          const getColMargin = (c: Record<string, unknown>, prefix: string = ''): string => {
            const pre = prefix ? prefix : ''
            return `${c[pre + 'marginTop'] || c[pre + 'MarginTop'] || 0}px ${c[pre + 'marginRight'] || c[pre + 'MarginRight'] || 0}px ${c[pre + 'marginBottom'] || c[pre + 'MarginBottom'] || 0}px ${c[pre + 'marginLeft'] || c[pre + 'MarginLeft'] || 0}px`
          }
          
          if (colType === 'image') {
            const imgBgColor = col.imgBackgroundColor && col.imgBackgroundColor !== 'transparent' ? col.imgBackgroundColor as string : undefined
            return (
              <div style={{ 
                textAlign: (col.imgAlign as 'left' | 'center' | 'right') || 'center',
                backgroundColor: imgBgColor,
                padding: getColPadding(col, 'img'),
                margin: getColMargin(col, 'img')
              }}>
                <img 
                  src={col.src as string} 
                  alt={col.alt as string} 
                  height={(col.imgHeight as string) || 'auto'}
                  width={col.imgKeepAspectRatio !== false ? 'auto' : ((col.imgWidth as string) || 'auto')}
                  style={{ maxWidth: '100%', display: 'inline-block' }} 
                />
              </div>
            )
          } else if (colType === 'button') {
            return (
              <div style={{ textAlign: 'center' }}>
                <a 
                  href={col.btnLink as string}
                  style={{
                    display: 'inline-block',
                    backgroundColor: (col.btnBg as string) || '#007bff',
                    color: (col.btnColor as string) || '#ffffff',
                    fontSize: `${(col.btnFontSize as number) || 16}px`,
                    padding: (col.btnPadding as string) || '12px 24px',
                    textDecoration: 'none',
                    borderRadius: `${(col.btnBorderRadius as number) || 4}px`
                  }}
                >
                  {col.btnText as string}
                </a>
              </div>
            )
          } else {
            // Metin tipi
            const bgColor = col.backgroundColor && col.backgroundColor !== 'transparent' ? col.backgroundColor as string : undefined
            return (
              <div 
                style={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: `${(col.fontSize as number) || 16}px`,
                  fontWeight: (col.fontWeight as string) || 'normal',
                  fontFamily: (col.fontFamily as string) || 'Arial, sans-serif',
                  color: (col.color as string) || '#000000',
                  textAlign: ((col.textAlign as string) || 'left') as 'left' | 'center' | 'right' | 'justify',
                  lineHeight: (col.lineHeight as number) || 1.5,
                  backgroundColor: bgColor,
                  padding: getColPadding(col),
                  margin: getColMargin(col)
                }}
                dangerouslySetInnerHTML={{ __html: col.content as string }}
              />
            )
          }
        }
        
        // Border stilini kolon için oluştur
        const getColumnBorderStyle = (col: Record<string, unknown>): React.CSSProperties => {
          const borders: React.CSSProperties = {}
          if (col.borderTop) borders.borderTop = col.borderTop as string
          if (col.borderBottom) borders.borderBottom = col.borderBottom as string
          if (col.borderLeft) borders.borderLeft = col.borderLeft as string
          if (col.borderRight) borders.borderRight = col.borderRight as string
          return borders
        }

        return (
          <div style={{ 
            display: 'flex', 
            gap: `${p.gap}px`,
            padding: p.padding as string,
            backgroundColor: p.backgroundColor as string
          }}>
            {columns && columns.map((col, idx) => (
              <div key={idx} style={{ 
                width: col.width as string, 
                wordBreak: 'break-word',
                ...getColumnBorderStyle(col)
              }}>
                {renderColumn(col)}
              </div>
            ))}
          </div>
        )

      case 'social':
        const socialIcons = [
          { key: 'facebook', src: 'https://img.icons8.com/color/48/facebook-new.png' },
          { key: 'twitter', src: 'https://img.icons8.com/color/48/twitter--v1.png' },
          { key: 'instagram', src: 'https://img.icons8.com/color/48/instagram-new--v1.png' },
          { key: 'linkedin', src: 'https://img.icons8.com/color/48/linkedin.png' },
          { key: 'youtube', src: 'https://img.icons8.com/color/48/youtube-play.png' }
        ]

        return (
          <div style={{ 
            display: 'flex', 
            justifyContent: p.align === 'center' ? 'center' : p.align === 'right' ? 'flex-end' : 'flex-start',
            gap: `${p.gap}px`,
            padding: p.padding as string 
          }}>
            {socialIcons.map(icon => {
              if (!p[icon.key]) return null
              return (
                <a 
                  key={icon.key} 
                  href={p[icon.key] as string} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', lineHeight: 0 }}
                >
                  <img 
                    src={icon.src} 
                    alt={icon.key} 
                    width={p.iconSize as number} 
                    height={p.iconSize as number} 
                    style={{ display: 'block', border: 'none' }}
                  />
                </a>
              )
            })}
            {!Object.keys(p).some(k => ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].includes(k) && p[k]) && (
              <div style={{ color: '#999', fontStyle: 'italic', width: '100%', textAlign: p.align as 'left' | 'center' | 'right' }}>
                Sosyal medya linklerini ekleyin
              </div>
            )}
          </div>
        )

      case 'image':
        // Margin ve Padding helper
        const imgMargin = (p.margin as string) || `${p.marginTop || 0}px ${p.marginRight || 0}px ${p.marginBottom || 0}px ${p.marginLeft || 0}px`
        const imgPadding = `${p.paddingTop || 0}px ${p.paddingRight || 0}px ${p.paddingBottom || 0}px ${p.paddingLeft || 0}px`
        const imgBgColor = p.backgroundColor && p.backgroundColor !== 'transparent' ? p.backgroundColor as string : undefined
        
        return (
          <div style={{ 
            textAlign: (p.textAlign as 'left' | 'center' | 'right') || 'center', 
            margin: imgMargin,
            padding: imgPadding,
            backgroundColor: imgBgColor
          }}>
            <img
              src={p.src as string}
              alt={p.alt as string}
              height={(p.height as string) || 'auto'}
              width={p.keepAspectRatio ? 'auto' : ((p.width as string) || 'auto')}
              style={{
                display: 'inline-block',
                maxWidth: '100%',
                ...(p.style as React.CSSProperties || {})
              }}
            />
          </div>
        )

      case 'button':
        return (
          <div style={{ textAlign: (p.textAlign as 'left' | 'center' | 'right') || 'center', margin: '10px 0' }}>
            <a
              href={p.href as string}
              style={{
                display: 'inline-block',
                fontSize: `${p.fontSize}px`,
                fontWeight: p.fontWeight as string,
                color: p.color as string,
                backgroundColor: p.backgroundColor as string,
                padding: p.padding as string,
                textDecoration: 'none',
                borderRadius: `${p.borderRadius}px`,
              }}
            >
              {p.text as string}
            </a>
          </div>
        )

      case 'link':
        return (
          <a
            href={p.href as string}
            style={{
              color: p.color as string,
              textDecoration: p.textDecoration as string,
              fontSize: `${p.fontSize}px`
            }}
          >
            {p.text as string}
          </a>
        )

      case 'hr':
        return (
          <hr
            style={{
              borderColor: p.borderColor as string,
              margin: p.margin as string,
              borderStyle: 'solid',
              borderWidth: '1px 0 0 0'
            }}
          />
        )

      case 'section':
        return (
          <div
            style={{
              backgroundColor: p.backgroundColor as string,
              padding: p.padding as string,
              borderRadius: `${p.borderRadius}px`
            }}
          >
            {(p.content as string) || 'Section içeriği'}
          </div>
        )

      case 'product_row':
        const productColumns = p.columns as Array<Record<string, unknown>>
        const displayMode = (p.displayMode as string) || 'card'
        const sampleData = {
          'item.image_url': 'https://via.placeholder.com/80x80?text=Ürün',
          'item.name': '3 İplik Şardonsuz Yakası Ribanalı Sweatshirt - Ekru',
          'item.details': 'Adet : 1 - Beden : L',
          'item.quantity': '1',
          'item.price': '150,00 TL',
          'item.sku': 'SKU-001',
          'item.total': '150,00 TL'
        }
        
        // KART GÖRÜNÜMÜ
        if (displayMode === 'card') {
          return (
            <div style={{ 
              padding: p.padding as string,
              width: p.tableWidth as string
            }}>
              {/* Repeatable indicator badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                padding: '6px 10px',
                backgroundColor: '#e3f2fd',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#1565c0'
              }}>
                <span style={{ fontSize: '14px' }}>🔄</span>
                <span><strong>Tekrarlanabilir Element</strong> - Backend'de <code style={{ backgroundColor: '#bbdefb', padding: '2px 4px', borderRadius: '2px' }}>[[{String(p.repeatKey)}]]</code> array'ine göre çoğaltılır</span>
              </div>

              {/* Örnek kartlar */}
              {[0, 1].map((rowIdx) => (
                <div key={rowIdx} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: `${p.cardGap || 12}px`,
                  padding: (p.cardPadding as string) || '12px',
                  backgroundColor: (p.cardBgColor as string) || '#ffffff',
                  border: `1px solid ${(p.cardBorderColor as string) || '#eeeeee'}`,
                  borderRadius: `${p.cardBorderRadius || 8}px`,
                  marginBottom: '8px',
                  boxShadow: p.cardShadow ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}>
                  {/* Ürün Resmi */}
                  <div style={{ flexShrink: 0 }}>
                    <img 
                      src={sampleData['item.image_url']}
                      alt="Ürün"
                      width={(p.cardImgWidth as number) || 80}
                      height={(p.cardImgHeight as number) || 80}
                      style={{
                        display: 'block',
                        borderRadius: `${p.cardImgBorderRadius || 4}px`,
                        objectFit: 'cover'
                      }}
                    />
                    <div style={{ 
                      fontSize: '9px', 
                      color: '#9e9e9e', 
                      textAlign: 'center',
                      marginTop: '4px'
                    }}>
                      [[{String(p.cardImgVariableKey)}]]
                    </div>
                  </div>
                  
                  {/* Ürün Bilgileri */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Başlık */}
                    <div style={{
                      fontSize: `${p.cardTitleFontSize || 14}px`,
                      fontWeight: (p.cardTitleFontWeight as string) || 'normal',
                      color: (p.cardTitleColor as string) || '#333333',
                      marginBottom: '4px',
                      lineHeight: 1.4
                    }}>
                      <span style={{ color: '#9e9e9e', fontSize: '9px' }}>[[{String(p.cardTitleVariableKey)}]]</span>
                      <br />
                      {sampleData['item.name']}
                    </div>
                    
                    {/* Alt bilgi */}
                    <div style={{
                      fontSize: `${p.cardSubtitleFontSize || 13}px`,
                      color: (p.cardSubtitleColor as string) || '#666666',
                      marginBottom: '6px'
                    }}>
                      <span style={{ color: '#9e9e9e', fontSize: '9px' }}>[[{String(p.cardSubtitleVariableKey)}]]</span>
                      <br />
                      {sampleData['item.details']}
                    </div>
                    
                    {/* Fiyat */}
                    <div style={{
                      fontSize: `${p.cardPriceFontSize || 15}px`,
                      fontWeight: (p.cardPriceFontWeight as string) || 'bold',
                      color: (p.cardPriceColor as string) || '#f57c00'
                    }}>
                      <span style={{ color: '#9e9e9e', fontSize: '9px' }}>[[{String(p.cardPriceVariableKey)}]]</span>
                      <br />
                      {sampleData['item.price']}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* More rows indicator */}
              <div style={{
                padding: '8px',
                textAlign: 'center',
                color: '#9e9e9e',
                fontSize: '12px',
                fontStyle: 'italic',
                backgroundColor: '#fafafa',
                borderRadius: '4px'
              }}>
                ⋮ Diğer ürünler backend'de otomatik eklenir ⋮
              </div>
            </div>
          )
        }
        
        // TABLO GÖRÜNÜMÜ
        return (
          <div style={{ 
            padding: p.padding as string,
            width: p.tableWidth as string
          }}>
            {/* Repeatable indicator badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              padding: '6px 10px',
              backgroundColor: '#e3f2fd',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#1565c0'
            }}>
              <span style={{ fontSize: '14px' }}>🔄</span>
              <span><strong>Tekrarlanabilir Element</strong> - Backend'de <code style={{ backgroundColor: '#bbdefb', padding: '2px 4px', borderRadius: '2px' }}>[[{String(p.repeatKey)}]]</code> array'ine göre çoğaltılır</span>
            </div>
            
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              border: `1px solid ${p.tableBorderColor as string}`,
              borderRadius: `${p.borderRadius}px`
            }}>
              {/* Header */}
              {Boolean(p.showHeader) && (
                <thead>
                  <tr style={{
                    backgroundColor: p.headerBgColor as string
                  }}>
                    {productColumns.map((col, idx) => (
                      <th key={idx} style={{
                        padding: '10px 8px',
                        textAlign: (col.textAlign as 'left' | 'center' | 'right') || 'left',
                        fontSize: `${p.headerFontSize}px`,
                        fontWeight: p.headerFontWeight as string,
                        color: p.headerTextColor as string,
                        borderBottom: `2px solid ${p.tableBorderColor as string}`,
                        width: col.width as string
                      }}>
                        {String(col.label)}
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              {/* Sample rows to show design */}
              <tbody>
                {[0, 1].map((rowIdx) => (
                  <tr key={rowIdx} style={{
                    backgroundColor: rowIdx % 2 === 0 ? p.rowBgColor as string : p.rowAltBgColor as string
                  }}>
                    {productColumns.map((col, colIdx) => (
                      <td key={colIdx} style={{
                        padding: '10px 8px',
                        textAlign: (col.textAlign as 'left' | 'center' | 'right') || 'left',
                        fontSize: `${col.fontSize}px`,
                        fontWeight: col.fontWeight as string,
                        color: col.color as string,
                        borderBottom: `1px solid ${p.rowBorderColor as string}`,
                        width: col.width as string
                      }}>
                        {col.type === 'image' ? (
                          <img 
                            src={sampleData['item.image_url']} 
                            alt="Ürün"
                            width={col.imgWidth as number || 60}
                            height={col.imgHeight as number || 60}
                            style={{ display: 'block', margin: col.textAlign === 'center' ? '0 auto' : '0' }}
                          />
                        ) : (
                          <span>
                            <span style={{ color: '#9e9e9e', fontSize: '10px' }}>[[{String(col.variableKey)}]]</span>
                            <br />
                            {sampleData[col.variableKey as keyof typeof sampleData] || `Örnek ${String(col.label)}`}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* More rows indicator */}
                <tr style={{ backgroundColor: '#fafafa' }}>
                  <td colSpan={productColumns.length} style={{
                    padding: '8px',
                    textAlign: 'center',
                    color: '#9e9e9e',
                    fontSize: '12px',
                    fontStyle: 'italic'
                  }}>
                    ⋮ Diğer ürünler backend'de otomatik eklenir ⋮
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )

      default:
        return <div>Unknown Element</div>
    }
  }

  return (
    <div
      ref={ref}
      className={`canvas-element-wrapper ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isNew ? 'element-new' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onSelect()
      }}
      data-handler-id={handlerId}
    >
      <div className="canvas-element">
        {renderElement()}
      </div>
      {isSelected && (
        <div className="element-controls">
          <button
            className="control-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            title="Sil"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/>
            </svg>
          </button>
          <button
            className="control-btn drag-btn"
            title="Taşı"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M2 12h20M12 2l3 3M12 2l-3 3M12 22l3-3M12 22l-3-3M2 12l3 3M2 12l3-3M22 12l-3 3M22 12l-3-3"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default CanvasElement
