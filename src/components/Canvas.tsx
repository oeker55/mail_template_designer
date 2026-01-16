import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import CanvasElement from './CanvasElement.tsx'
import { CanvasProps } from '../types'
import './Canvas.css'

const EmptyIcon: React.FC = () => (
  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
  </svg>
)

interface DropCollectedProps {
  isOver: boolean
}

const Canvas: React.FC<CanvasProps> = ({ 
  elements, 
  selectedElement, 
  onSelectElement, 
  onDeleteElement, 
  onReorderElements 
}) => {
  const canvasRef = useRef<HTMLDivElement>(null)

  const [{ isOver }, drop] = useDrop<
    { elementType: string },
    { name: string },
    DropCollectedProps
  >(() => ({
    accept: 'ELEMENT',
    drop: () => ({ name: 'Canvas' }),
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }))

  return (
    <div className="canvas-container">
      <div className="canvas-wrapper">
        <div 
          ref={drop}
          className={`canvas ${isOver ? 'canvas-dragover' : ''}`}
        >
          <div className="canvas-email-preview">
            {elements.length === 0 ? (
              <div className="canvas-empty">
                <EmptyIcon />
                <h3>Boş Şablon</h3>
                <p>E-posta şablonunuzu oluşturmak için soldaki panelden element sürükleyin veya tıklayın</p>
              </div>
            ) : (
              elements.map((element, index) => (
                <CanvasElement
                  key={element.id}
                  element={element}
                  index={index}
                  isSelected={selectedElement?.id === element.id}
                  onSelect={() => onSelectElement(element)}
                  onDelete={() => onDeleteElement(element.id)}
                  onReorder={onReorderElements}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Canvas
