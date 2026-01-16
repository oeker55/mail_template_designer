import React, { useRef } from 'react'
import { useDrag } from 'react-dnd'
import { ELEMENT_TYPES, ICONS } from '../config/elementTypes'
import { ElementPaletteProps, ElementTypeConfig } from '../types'
import './ElementPalette.css'

interface DraggableElementProps {
  elementType: string
  elementConfig: ElementTypeConfig
  onAddElement: (elementType: string) => void
}

const DraggableElement: React.FC<DraggableElementProps> = ({ elementType, elementConfig, onAddElement }) => {
  const elementRef = useRef<HTMLDivElement>(null)
  
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ELEMENT',
    item: { elementType },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ name: string }>()
      if (item && dropResult) {
        onAddElement(item.elementType)
      }
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const iconSvg = ICONS[elementConfig.icon] || ICONS.text

  // Tıklama ile animasyonlu ekleme
  const handleClick = (_e: React.MouseEvent<HTMLDivElement>) => {
    const sourceRect = elementRef.current?.getBoundingClientRect()
    if (!sourceRect) {
      onAddElement(elementType)
      return
    }
    
    // Canvas'ı bul
    const canvas = document.querySelector('.canvas')
    if (!canvas) {
      onAddElement(elementType)
      return
    }
    
    const canvasRect = canvas.getBoundingClientRect()
    
    // Ghost element oluştur
    const ghost = document.createElement('div')
    ghost.className = 'element-fly-ghost'
    ghost.innerHTML = `
      <span class="ghost-icon">${iconSvg}</span>
      <span class="ghost-name">${elementConfig.name}</span>
    `
    
    // Başlangıç pozisyonu (tıklanan elementin pozisyonu)
    ghost.style.cssText = `
      position: fixed;
      left: ${sourceRect.left}px;
      top: ${sourceRect.top}px;
      width: ${sourceRect.width}px;
      height: ${sourceRect.height}px;
      z-index: 10000;
      pointer-events: none;
    `
    
    document.body.appendChild(ghost)
    
    // Hedef pozisyonu hesapla (canvas'ın ortası veya alt kısmı)
    const targetX = canvasRect.left + canvasRect.width / 2 - sourceRect.width / 2
    const targetY = canvasRect.top + Math.min(canvasRect.height - 100, 200)
    
    // Animasyonu başlat
    requestAnimationFrame(() => {
      ghost.style.transition = 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
      ghost.style.left = `${targetX}px`
      ghost.style.top = `${targetY}px`
      ghost.style.transform = 'scale(0.8)'
      ghost.style.opacity = '0.6'
    })
    
    // Animasyon bitince elementi ekle ve ghost'u kaldır
    setTimeout(() => {
      ghost.style.transform = 'scale(0.3)'
      ghost.style.opacity = '0'
    }, 300)
    
    setTimeout(() => {
      ghost.remove()
      onAddElement(elementType)
    }, 450)
  }

  // Ref'i birleştir
  const setRefs = (el: HTMLDivElement | null) => {
    (elementRef as React.MutableRefObject<HTMLDivElement | null>).current = el
    drag(el)
  }

  return (
    <div
      ref={setRefs}
      className={`palette-element ${isDragging ? 'dragging' : ''}`}
      onClick={handleClick}
    >
      <span className="element-icon" dangerouslySetInnerHTML={{ __html: iconSvg }} />
      <span className="element-name">{elementConfig.name}</span>
    </div>
  )
}

const ElementPalette: React.FC<ElementPaletteProps> = ({ onAddElement }) => {
  return (
    <div className="element-palette">
      <div className="palette-header">
        <h3>Elementler</h3>
        <p className="palette-hint">Sürükle veya tıkla</p>
      </div>
      <div className="palette-elements">
        {Object.entries(ELEMENT_TYPES).map(([key, config]) => (
          <DraggableElement
            key={key}
            elementType={config.id}
            elementConfig={config}
            onAddElement={onAddElement}
          />
        ))}
      </div>
      <div className="palette-footer">
        <p className="palette-info">
          <strong>İpucu:</strong> Elementleri canvas'a sürükleyerek veya tıklayarak ekleyebilirsiniz.
        </p>
        <p className="palette-info">
          <strong>Değişkenler:</strong> [[firma_adi]], [[musteri_adi]] gibi değişkenleri text elementlerinde kullanın.
        </p>
      </div>
    </div>
  )
}

export default ElementPalette
