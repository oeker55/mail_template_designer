import React from 'react'
import { render } from '@react-email/render'
import {
  Html,
  Head,
  Body,
  Container,
  Text,
  Heading,
  Img,
  Button,
  Link,
  Hr,
  Section,
  Row,
  Column
} from '@react-email/components'
import { CanvasElement } from '../types'

// React Email kullanarak mail-safe HTML generator
export const generateEmailHTML = async (elements: CanvasElement[], templateName: string = 'Email Template'): Promise<string> => {
  // React Email component'i oluştur
  const EmailTemplate: React.FC = () => (
    <Html>
      <Head>
        <title>{templateName}</title>
      </Head>
      <Body style={{ margin: 0, padding: 0, backgroundColor: '#f5f5f5' }}>
        <Container style={{ backgroundColor: '#ffffff', maxWidth: '600px' }}>
          {elements.map((element, index) => (
            <React.Fragment key={index}>
              {renderElement(element)}
            </React.Fragment>
          ))}
        </Container>
      </Body>
    </Html>
  )

  // React Email'in render fonksiyonu ile HTML'e çevir (async)
  try {
    const html = await render(<EmailTemplate />)
    return html
  } catch (error) {
    console.error('HTML generation error:', error)
    return generateFallbackHTML(elements, templateName)
  }
}

// Helper function types
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

// Element'i React Email component'ine çevir
const renderElement = (element: CanvasElement): React.ReactNode => {
  const { type, props } = element
  const p = props as ElementPropsBase
  
  // Margin ve Padding helper fonksiyonları
  const getMargin = (p: ElementPropsBase): string => {
    if (p.margin) return p.margin as string
    return `${p.marginTop || 0}px ${p.marginRight || 0}px ${p.marginBottom || 0}px ${p.marginLeft || 0}px`
  }
  
  const getPadding = (p: ElementPropsBase): string => {
    if (p.padding && p.padding !== '0') return p.padding as string
    return `${p.paddingTop || 0}px ${p.paddingRight || 0}px ${p.paddingBottom || 0}px ${p.paddingLeft || 0}px`
  }
  
  switch (type) {
    case 'text':
      return (
        <Text
          style={{
            fontSize: (p.fontSize as number) + 'px',
            fontWeight: p.fontWeight as string,
            fontFamily: p.fontFamily as string,
            color: p.color as string,
            backgroundColor: p.backgroundColor && p.backgroundColor !== 'transparent' ? p.backgroundColor as string : undefined,
            textAlign: (p.textAlign || 'left') as 'left' | 'center' | 'right' | 'justify',
            lineHeight: (p.lineHeight as number) || 1.5,
            margin: getMargin(p),
            padding: getPadding(p),
            whiteSpace: 'pre-wrap'
          }}
          dangerouslySetInnerHTML={{ __html: p.content as string }}
        />
      )
    
    case 'heading':
      return (
        <Heading
          as={p.as as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'}
          style={{
            fontSize: (p.fontSize as number) + 'px',
            fontWeight: p.fontWeight as string,
            fontFamily: p.fontFamily as string,
            color: p.color as string,
            textAlign: (p.textAlign || 'left') as 'left' | 'center' | 'right' | 'justify',
            margin: p.margin as string,
            padding: p.padding as string
          }}
        >
          {p.content as string}
        </Heading>
      )

    case 'multi_column':
      const columns = p.columns as Array<Record<string, unknown>>
      
      const renderColumnContent = (col: Record<string, unknown>): React.ReactNode => {
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
              backgroundColor: imgBgColor,
              padding: getColPadding(col, 'img'),
              margin: getColMargin(col, 'img')
            }}>
              <Row>
                <Column align={(col.imgAlign as 'left' | 'center' | 'right') || 'center'}>
                  <Img 
                    src={col.src as string} 
                    alt={col.alt as string} 
                    height={col.imgHeight as number || undefined}
                    width={col.imgKeepAspectRatio !== false ? undefined : (col.imgWidth as number || undefined)}
                    style={{ maxWidth: '100%', display: 'block' }} 
                  />
                </Column>
              </Row>
            </div>
          )
        } else if (colType === 'button') {
          return (
            <Button
              href={col.btnLink as string}
              style={{
                backgroundColor: (col.btnBg as string) || '#007bff',
                color: (col.btnColor as string) || '#ffffff',
                fontSize: ((col.btnFontSize as number) || 16) + 'px',
                padding: (col.btnPadding as string) || '12px 24px',
                borderRadius: ((col.btnBorderRadius as number) || 4) + 'px',
                textAlign: 'center',
                display: 'inline-block'
              }}
            >
              {col.btnText as string}
            </Button>
          )
        } else {
          // Metin tipi
          const bgColor = col.backgroundColor && col.backgroundColor !== 'transparent' ? col.backgroundColor as string : undefined
          return (
            <Text 
              style={{ 
                margin: getColMargin(col), 
                padding: getColPadding(col),
                backgroundColor: bgColor,
                whiteSpace: 'pre-wrap',
                fontSize: ((col.fontSize as number) || 16) + 'px',
                fontWeight: (col.fontWeight as string) || 'normal',
                fontFamily: (col.fontFamily as string) || 'Arial, sans-serif',
                color: (col.color as string) || '#000000',
                textAlign: ((col.textAlign as string) || 'left') as 'left' | 'center' | 'right' | 'justify',
                lineHeight: (col.lineHeight as number) || 1.5
              }}
              dangerouslySetInnerHTML={{ __html: col.content as string }}
            />
          )
        }
      }
      
      // Border stilini Column için oluştur
      const getColumnBorderStyle = (col: Record<string, unknown>): React.CSSProperties => {
        const borders: React.CSSProperties = {}
        if (col.borderTop) borders.borderTop = col.borderTop as string
        if (col.borderBottom) borders.borderBottom = col.borderBottom as string
        if (col.borderLeft) borders.borderLeft = col.borderLeft as string
        if (col.borderRight) borders.borderRight = col.borderRight as string
        return borders
      }

      return (
        <Section style={{ padding: p.padding as string, backgroundColor: p.backgroundColor as string }}>
          <Row>
            {columns && columns.map((col, index) => (
              <Column 
                key={index} 
                style={{ 
                  width: col.width as string, 
                  paddingRight: index !== columns.length - 1 ? (p.gap as number) / 2 : 0,
                  paddingLeft: index !== 0 ? (p.gap as number) / 2 : 0,
                  ...getColumnBorderStyle(col)
                }}
              >
                {renderColumnContent(col)}
              </Column>
            ))}
          </Row>
        </Section>
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
        <Section style={{ padding: p.padding as string, textAlign: p.align as 'left' | 'center' | 'right' }}>
          {socialIcons.map(icon => {
            if (!p[icon.key]) return null
            return (
              <Link
                key={icon.key}
                href={p[icon.key] as string}
                target="_blank"
                style={{ 
                  display: 'inline-block', 
                  margin: `0 ${(p.gap as number)/2}px`,
                  textDecoration: 'none'
                }}
              >
                <Img
                  src={icon.src}
                  alt={icon.key}
                  width={p.iconSize as number}
                  height={p.iconSize as number}
                  style={{ 
                    display: 'block', 
                    border: 'none',
                    outline: 'none'
                  }}
                />
              </Link>
            )
          })}
        </Section>
      )

    case 'image':
      // Margin ve Padding helper
      const imgMargin = p.margin || `${p.marginTop || 0}px ${p.marginRight || 0}px ${p.marginBottom || 0}px ${p.marginLeft || 0}px`
      const imgPadding = `${p.paddingTop || 0}px ${p.paddingRight || 0}px ${p.paddingBottom || 0}px ${p.paddingLeft || 0}px`
      const imgBgColor = p.backgroundColor && p.backgroundColor !== 'transparent' ? p.backgroundColor as string : undefined
      
      const imgElement = (
        <Img
          src={p.src as string}
          alt={p.alt as string}
          height={p.height as number || undefined}
          width={p.keepAspectRatio ? undefined : (p.width as number || undefined)}
          style={{ display: 'block', maxWidth: '100%', ...(p.style as React.CSSProperties || {}) }}
        />
      )
      
      return (
        <Section style={{ 
          margin: imgMargin,
          padding: imgPadding,
          backgroundColor: imgBgColor
        }}>
          <Row>
            <Column align={(p.textAlign as 'left' | 'center' | 'right') || 'center'}>
              {p.isLinked && p.linkUrl ? (
                <Link href={p.linkUrl as string} target="_blank" style={{ textDecoration: 'none' }}>
                  {imgElement}
                </Link>
              ) : (
                imgElement
              )}
            </Column>
          </Row>
        </Section>
      )
    
    case 'button':
      return (
        <Section style={{ textAlign: (p.textAlign as 'left' | 'center' | 'right') || 'center' }}>
          <Button
            href={p.href as string}
            style={{
              fontSize: (p.fontSize as number) + 'px',
              fontWeight: p.fontWeight as string,
              color: p.color as string,
              backgroundColor: p.backgroundColor as string,
              borderRadius: (p.borderRadius as number) + 'px',
              padding: p.padding as string
            }}
          >
            {p.text as string}
          </Button>
        </Section>
      )
    
    case 'link':
      return (
        <Link
          href={p.href as string}
          style={{
            color: p.color as string,
            textDecoration: p.textDecoration as string,
            fontSize: (p.fontSize as number) + 'px'
          }}
        >
          {p.text as string}
        </Link>
      )
    
    case 'hr':
      return (
        <Hr
          style={{
            borderColor: p.borderColor as string,
            margin: p.margin as string
          }}
        />
      )
    
    case 'section':
      return (
        <Section
          style={{
            backgroundColor: p.backgroundColor as string,
            padding: p.padding as string,
            borderRadius: (p.borderRadius as number) + 'px'
          }}
        >
          {p.content as string}
        </Section>
      )

    case 'product_row':
      // Product Row - Tekrarlanabilir Ürün Satırı
      // Bu element backend'de repeatKey array'ine göre çoğaltılacak
      const productColumns = p.columns as Array<Record<string, unknown>>
      const repeatKey = String(p.repeatKey || 'order_items')
      const itemAlias = String(p.repeatItemAlias || 'item')
      const productDisplayMode = (p.displayMode as string) || 'card'
      
      // KART GÖRÜNÜMÜ için HTML
      if (productDisplayMode === 'card') {
        return (
          <Section 
            style={{ padding: p.padding as string }}
            data-repeat-start={repeatKey}
            data-repeat-item={itemAlias}
          >
            {/* Outlook uyumlu tablo tabanlı kart yapısı */}
            <table
              role="presentation"
              cellPadding="0"
              cellSpacing="0"
              data-repeat-row="true"
              style={{
                width: '100%',
                backgroundColor: (p.cardBgColor as string) || '#ffffff',
                border: `1px solid ${(p.cardBorderColor as string) || '#eeeeee'}`,
                borderRadius: ((p.cardBorderRadius as number) || 8) + 'px',
                marginBottom: '8px'
              }}
            >
              <tr>
                {/* Ürün Resmi Kolonu */}
                <td
                  style={{
                    width: ((p.cardImgWidth as number) || 80) + 'px',
                    padding: (p.cardPadding as string) || '12px',
                    verticalAlign: 'top'
                  }}
                >
                  {Boolean(p.cardImgLinkEnabled) ? (
                    <Link href={Boolean(p.cardImgLinkIsStatic) ? (p.cardImgLinkStaticUrl as string) || '' : `[[${(p.cardImgLinkVariableKey as string) || 'item.url'}]]`} style={{ display: 'block' }}>
                      <Img
                        src={`[[${(p.cardImgVariableKey as string) || 'item.image_url'}]]`}
                        alt="Ürün"
                        width={(p.cardImgWidth as number) || 80}
                        height={(p.cardImgHeight as number) || 80}
                        style={{
                          display: 'block',
                          borderRadius: ((p.cardImgBorderRadius as number) || 4) + 'px',
                          border: 'none',
                          outline: 'none'
                        }}
                      />
                    </Link>
                  ) : (
                    <Img
                      src={`[[${(p.cardImgVariableKey as string) || 'item.image_url'}]]`}
                      alt="Ürün"
                      width={(p.cardImgWidth as number) || 80}
                      height={(p.cardImgHeight as number) || 80}
                      style={{
                        display: 'block',
                        borderRadius: ((p.cardImgBorderRadius as number) || 4) + 'px',
                        border: 'none',
                        outline: 'none'
                      }}
                    />
                  )}
                </td>
                
                {/* Ürün Bilgileri Kolonu */}
                <td
                  style={{
                    padding: (p.cardPadding as string) || '12px',
                    paddingLeft: '0',
                    verticalAlign: 'top'
                  }}
                >
                  {/* Ürün Adı */}
                  <Text
                    style={{
                      margin: '0 0 4px 0',
                      padding: 0,
                      fontSize: ((p.cardTitleFontSize as number) || 14) + 'px',
                      fontWeight: (p.cardTitleFontWeight as string) || 'normal',
                      color: (p.cardTitleColor as string) || '#333333',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      lineHeight: '1.4'
                    }}
                  >
                    {`[[${(p.cardTitleVariableKey as string) || 'item.name'}]]`}
                  </Text>
                  
                  {/* Alt Bilgi (Adet, Beden vb.) */}
                  <Text
                    style={{
                      margin: '0 0 6px 0',
                      padding: 0,
                      fontSize: ((p.cardSubtitleFontSize as number) || 13) + 'px',
                      color: (p.cardSubtitleColor as string) || '#666666',
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                  >
                    {`[[${(p.cardSubtitleVariableKey as string) || 'item.details'}]]`}
                  </Text>
                  
                  {/* Fiyat */}
                  <Text
                    style={{
                      margin: 0,
                      padding: 0,
                      fontSize: ((p.cardPriceFontSize as number) || 15) + 'px',
                      fontWeight: (p.cardPriceFontWeight as string) || 'bold',
                      color: (p.cardPriceColor as string) || '#f57c00',
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                  >
                    {`[[${(p.cardPriceVariableKey as string) || 'item.price'}]]`}
                  </Text>
                </td>
              </tr>
            </table>
          </Section>
        )
      }
      
      // TABLO GÖRÜNÜMÜ için HTML
      return (
        <Section 
          style={{ padding: p.padding as string }}
          data-repeat-start={repeatKey}
          data-repeat-item={itemAlias}
        >
          
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: (p.tableWidth as string) || '100%',
              borderCollapse: 'collapse',
              border: `1px solid ${(p.tableBorderColor as string) || '#e0e0e0'}`,
              borderRadius: ((p.borderRadius as number) || 0) + 'px'
            }}
          >
            {/* Tablo Başlığı */}
            {Boolean(p.showHeader) && (
              <thead>
                <tr style={{ backgroundColor: (p.headerBgColor as string) || '#f8f9fa' }}>
                  {productColumns.map((col, idx) => (
                    <th
                      key={idx}
                      style={{
                        padding: '12px 10px',
                        textAlign: (col.textAlign as 'left' | 'center' | 'right') || 'left',
                        fontSize: ((p.headerFontSize as number) || 14) + 'px',
                        fontWeight: (p.headerFontWeight as string) || 'bold',
                        fontFamily: 'Arial, Helvetica, sans-serif',
                        color: (p.headerTextColor as string) || '#333333',
                        borderBottom: `2px solid ${(p.tableBorderColor as string) || '#e0e0e0'}`,
                        width: col.width as string
                      }}
                    >
                      {(col.label as string) || 'Kolon'}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            
            {/* Ürün Satırı - Bu kısım backend'de her item için tekrarlanacak */}
            <tbody>
              <tr data-repeat-row="true" style={{ backgroundColor: (p.rowBgColor as string) || '#ffffff' }}>
                {productColumns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    style={{
                      padding: '12px 10px',
                      textAlign: (col.textAlign as 'left' | 'center' | 'right') || 'left',
                      fontSize: ((col.fontSize as number) || 14) + 'px',
                      fontWeight: (col.fontWeight as string) || 'normal',
                      fontFamily: 'Arial, Helvetica, sans-serif',
                      color: (col.color as string) || '#333333',
                      borderBottom: `1px solid ${(p.rowBorderColor as string) || '#e0e0e0'}`,
                      width: col.width as string,
                      verticalAlign: 'middle'
                    }}
                  >
                    {col.type === 'image' ? (
                      Boolean(col.linkEnabled) ? (
                        <Link href={`[[${(col.linkVariableKey as string) || 'item.url'}]]`} style={{ display: 'block' }}>
                          <Img
                            src={`[[${(col.variableKey as string) || 'item.image_url'}]]`}
                            alt="Ürün"
                            width={(col.imgWidth as number) || 60}
                            height={(col.imgHeight as number) || 60}
                            style={{
                              display: 'block',
                              margin: col.textAlign === 'center' ? '0 auto' : '0',
                              border: 'none',
                              outline: 'none'
                            }}
                          />
                        </Link>
                      ) : (
                        <Img
                          src={`[[${(col.variableKey as string) || 'item.image_url'}]]`}
                          alt="Ürün"
                          width={(col.imgWidth as number) || 60}
                          height={(col.imgHeight as number) || 60}
                          style={{
                            display: 'block',
                            margin: col.textAlign === 'center' ? '0 auto' : '0',
                            border: 'none',
                            outline: 'none'
                          }}
                        />
                      )
                    ) : (
                      <Text
                        style={{
                          margin: 0,
                          padding: 0,
                          fontSize: ((col.fontSize as number) || 14) + 'px',
                          fontWeight: (col.fontWeight as string) || 'normal',
                          color: (col.color as string) || '#333333',
                          fontFamily: 'Arial, Helvetica, sans-serif',
                          textAlign: (col.textAlign as 'left' | 'center' | 'right') || 'left'
                        }}
                      >
                        {`[[${(col.variableKey as string) || 'item.value'}]]`}
                      </Text>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </Section>
      )

    case 'info_table':
      // Info Table - Bilgi Tablosu (Sipariş Özeti, Adres vb.)
      const infoRows = (p.rows as Array<Record<string, unknown>>) || []
      
      // Stil hesaplamaları
      const getInfoValueStyle = (row: Record<string, unknown>): React.CSSProperties => {
        const style: React.CSSProperties = {
          margin: 0,
          padding: 0,
          fontFamily: 'Arial, Helvetica, sans-serif'
        }
        
        // Font boyutu
        style.fontSize = ((row.valueFontSize as number) || (p.valueFontSize as number) || 14) + 'px'
        
        // Renk
        style.color = (row.valueColor as string) || (p.valueColor as string) || '#333333'
        
        // Stil türü
        switch (row.valueStyle as string) {
          case 'bold':
            style.fontWeight = 'bold'
            break
          case 'italic':
            style.fontStyle = 'italic'
            break
          case 'strikethrough':
            style.textDecoration = 'line-through'
            break
          default:
            style.fontWeight = 'normal'
        }
        
        return style
      }
      
      const getInfoLabelStyle = (row: Record<string, unknown>): React.CSSProperties => {
        const style: React.CSSProperties = {
          margin: 0,
          padding: 0,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: ((p.labelFontSize as number) || 14) + 'px',
          color: (p.labelColor as string) || '#333333'
        }
        
        switch (row.labelStyle as string) {
          case 'bold':
            style.fontWeight = 'bold'
            break
          case 'italic':
            style.fontStyle = 'italic'
            break
          default:
            style.fontWeight = (p.labelFontWeight as string) || 'normal'
        }
        
        return style
      }
      
      // Margin hesapla
      const infoMarginTop = (p.marginTop as number) || 0
      const infoMarginRight = (p.marginRight as number) || 0
      const infoMarginBottom = (p.marginBottom as number) || 0
      const infoMarginLeft = (p.marginLeft as number) || 0

      return (
        <Section style={{ 
          paddingTop: infoMarginTop + 'px',
          paddingRight: infoMarginRight + 'px', 
          paddingBottom: infoMarginBottom + 'px',
          paddingLeft: infoMarginLeft + 'px'
        }}>
          <table
            role="presentation"
            cellPadding="0"
            cellSpacing="0"
            style={{
              width: (p.tableWidth as string) || '100%',
              borderCollapse: 'collapse',
              backgroundColor: (p.tableBgColor as string) || '#ffffff',
              border: `1px solid ${(p.tableBorderColor as string) || '#e0e0e0'}`,
              borderRadius: ((p.tableBorderRadius as number) || 0) + 'px',
              overflow: 'hidden'
            }}
          >
            {/* Başlık Satırı */}
            {Boolean(p.showTitle) && (
              <thead>
                <tr>
                  <th
                    colSpan={2}
                    style={{
                      padding: (p.titlePadding as string) || '12px 16px',
                      backgroundColor: (p.titleBgColor as string) || '#f5f5f5',
                      borderBottom: (p.titleBorderBottom as string) || '1px solid #e0e0e0',
                      fontSize: ((p.titleFontSize as number) || 14) + 'px',
                      fontWeight: (p.titleFontWeight as string) || 'bold',
                      color: (p.titleColor as string) || '#333333',
                      textAlign: 'left',
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                  >
                    {String(p.title) || 'Sipariş Özeti'}
                  </th>
                </tr>
              </thead>
            )}
            
            <tbody>
              {infoRows.map((row, idx) => (
                <tr key={row.id as string || idx}>
                  {/* Etiket (Sol kolon) */}
                  <td
                    style={{
                      width: (p.labelWidth as string) || '50%',
                      padding: (p.rowPadding as string) || '8px 16px',
                      borderBottom: idx < infoRows.length - 1 
                        ? ((p.rowBorderBottom as string) || '1px solid #f0f0f0') 
                        : 'none',
                      textAlign: (p.labelAlign as 'left' | 'center' | 'right') || 'left',
                      verticalAlign: 'middle',
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                  >
                    <Text style={getInfoLabelStyle(row)}>
                      {(row.label as string) || 'Etiket'}
                    </Text>
                  </td>
                  
                  {/* Değer (Sağ kolon) */}
                  <td
                    style={{
                      width: (p.valueWidth as string) || '50%',
                      padding: (p.rowPadding as string) || '8px 16px',
                      borderBottom: idx < infoRows.length - 1 
                        ? ((p.rowBorderBottom as string) || '1px solid #f0f0f0') 
                        : 'none',
                      textAlign: (p.valueAlign as 'left' | 'center' | 'right') || 'right',
                      verticalAlign: 'middle',
                      fontFamily: 'Arial, Helvetica, sans-serif'
                    }}
                  >
                    {row.valueKey && String(row.valueKey).trim() !== '' ? (
                      <Text style={getInfoValueStyle(row)}>
                        {`[[${(row.valueKey as string)}]]`}
                      </Text>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )
    
    default:
      return null
  }
}

// Fallback HTML generator (React Email çalışmazsa)
const generateFallbackHTML = (_elements: CanvasElement[], templateName: string): string => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${templateName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f5f5f5;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff;">
          <tr><td>Template Preview</td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
