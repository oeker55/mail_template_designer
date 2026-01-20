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
