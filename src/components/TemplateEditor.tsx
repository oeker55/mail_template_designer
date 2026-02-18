import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ElementPalette from './ElementPalette'
import Canvas from './Canvas'
import PropertyEditor from './PropertyEditor'
import { ELEMENT_TYPES } from '../config/elementTypes'
import { generateEmailHTML } from '../utils/htmlGenerator'
import { templateAPI, mailAPI } from '../utils/api'
import { TemplateEditorProps, CanvasElement, Template } from '../types'
import './TemplateEditor.css'

const TemplateEditor: React.FC<TemplateEditorProps> = ({ subjectId, scode, fcode, title, onBack }) => {
  const [templateName, setTemplateName] = useState<string>(title || 'Yeni Template')
  const [testEmail, setTestEmail] = useState<string>('oeker55@outlook.com')
  const [showTestEmailPopup, setShowTestEmailPopup] = useState<boolean>(false)
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [templateNotFound, setTemplateNotFound] = useState<boolean>(false)
  const [existingTemplateId, setExistingTemplateId] = useState<string | null>(null)

  useEffect(() => {
    loadTemplateBySubject()
  }, [subjectId, scode])

  const loadTemplateBySubject = async () => {
    try {
      setLoading(true)
      // scode ve subjectId ile template'i çek
      const template: Template = await templateAPI.getBySubject(scode, subjectId)
      
      if (template) {
        setTemplateName(template.title || title)
        setExistingTemplateId(template._id || template.id || null)
        setTemplateNotFound(false)
        
        // elements_json alanı string ise parse et, değilse direkt kullan
        const elementsData = typeof template.elements_json === 'string' 
          ? JSON.parse(template.elements_json) 
          : template.elements_json
        
        setElements(elementsData || [])
      } else {
        // Template yoksa bulunamadı
        setTemplateName(title)
        setExistingTemplateId(null)
        setTemplateNotFound(true)
        setElements([])
      }
    } catch (error) {
      // 404 veya hata durumunda bulunamadı göster
      console.log('Template bulunamadı:', error)
      setTemplateName(title)
      setExistingTemplateId(null)
      setTemplateNotFound(true)
      setElements([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddElement = (elementType: string) => {
    const elementTypeUpper = elementType.toUpperCase()
    const elementConfig = ELEMENT_TYPES[elementTypeUpper]
    if (!elementConfig) return
    
    const newElement: CanvasElement = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: elementType as CanvasElement['type'],
      props: { ...elementConfig.defaultProps }
    }
    setElements(prevElements => [...prevElements, newElement])
    setSelectedElement(newElement)
  }

  const handleUpdateElement = (elementId: string, newProps: Record<string, unknown>) => {
    setElements(prevElements => {
      const updatedElements = prevElements.map(el => 
        el.id === elementId ? { ...el, props: { ...el.props, ...newProps } } : el
      )
      
      // Eğer güncellenen element seçili ise, selectedElement'i de güncelle
      if (selectedElement?.id === elementId) {
        const updatedElement = updatedElements.find(el => el.id === elementId)
        setSelectedElement(updatedElement || null)
      }
      
      return updatedElements
    })
  }

  const handleDeleteElement = (elementId: string) => {
    setElements(elements.filter(el => el.id !== elementId))
    if (selectedElement?.id === elementId) {
      setSelectedElement(null)
    }
  }

  const handleReorderElements = (dragIndex: number, hoverIndex: number) => {
    const newElements = [...elements]
    const draggedElement = newElements[dragIndex]
    newElements.splice(dragIndex, 1)
    newElements.splice(hoverIndex, 0, draggedElement)
    setElements(newElements)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // HTML generate et (async)
      const html = await generateEmailHTML(elements, templateName)
      
      // Template verisi - scode, subjectId, title ile kaydet
      const templateData = {
        name: templateName,
        fcode: fcode,
        scode: scode,
        subjectId: subjectId,
        title: title,
        elements_json: elements, // JSON olarak elementleri kaydet (düzenleme için)
        html_content: html // HTML olarak da kaydet (mail gönderme için)
      }

      let savedTemplate: Template
      if (existingTemplateId) {
        // Mevcut template'i güncelle
        savedTemplate = await templateAPI.update(existingTemplateId, templateData)
        alert('Template başarıyla güncellendi!')
      } else {
        // Yeni template oluştur
        savedTemplate = await templateAPI.create(templateData)
        // MongoDB _id kullan
        setExistingTemplateId(savedTemplate._id || savedTemplate.id || null)
        alert('Template başarıyla kaydedildi!')
      }
      
    } catch (error) {
      console.error('Template kaydetme hatası:', error)
      alert('Template kaydedilirken bir hata oluştu. API servisinin çalıştığından emin olun.')
    } finally {
      setSaving(false)
    }
  }

  const handleSendTestMail = async () => {
    if (!testEmail.trim()) {
      alert('Lütfen test email adresi girin')
      return
    }

    try {
      setSaving(true)
      
      // HTML generate et
      const html = await generateEmailHTML(elements, templateName)
      
      // Test maili gönder
      await mailAPI.sendTest(html, testEmail, `Test: ${templateName}`)

      alert('Test maili başarıyla gönderildi!')
      setShowTestEmailPopup(false)
    } catch (error) {
      console.error('Mail gönderme hatası:', error)
      alert('Mail gönderilirken bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = async () => {
    try {
      const html = await generateEmailHTML(elements, templateName)
      const previewWindow = window.open('', '_blank')
      if (previewWindow) {
        previewWindow.document.write(html)
        previewWindow.document.close()
      }
    } catch (error) {
      console.error('Preview error:', error)
      alert('Önizleme oluşturulurken hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="template-editor-loading">
        <div className="loading-spinner"></div>
        <p>Template yükleniyor...</p>
      </div>
    )
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="template-editor">
        <div className="editor-header">
          <div className="editor-header-left">
            <div className="editor-info">
              <span className="editor-fcode-badge">{fcode}</span>
              <span className="editor-scode-badge">{scode}</span>
              <span className="editor-subject-id">#{subjectId}</span>
            </div>
            <span className='template-name-input'> {templateName}</span>
          </div>
          <div className="editor-header-right">
            {/* Hazır Şablonlar Butonu */}
            
            <span className="header-divider"></span>
            
            {/* Şablon Yönetimi Butonları */}
            <button 
              className="btn btn-primary" 
              onClick={handleSave}
              disabled={saving}
              title="Template'i veritabanına kaydet"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <path d="M17 21v-8H7v8M7 3v5h8"/>
              </svg>
              {saving ? 'Kaydediliyor...' : (existingTemplateId ? 'Güncelle' : 'Kaydet')}
            </button>
            <span style={{ borderLeft: '1px solid var(--border-medium)', margin: '0 8px', height: '20px' }}></span>
            <button className="btn btn-preview" onClick={handlePreview}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Önizle
            </button>
            <button 
              className="btn btn-save" 
              onClick={() => setShowTestEmailPopup(true)}
              disabled={saving}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              Test Gönder
            </button>
            <button className="btn btn-cancel" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Kapat
            </button>
          </div>
        </div>
        
        {/* Test Email Popup */}
        {showTestEmailPopup && (
          <div className="test-email-popup-overlay" onClick={() => setShowTestEmailPopup(false)}>
            <div className="test-email-popup" onClick={(e) => e.stopPropagation()}>
              <div className="test-email-popup-header">
                <h3>Test Email Gönder</h3>
                <button 
                  className="test-email-popup-close"
                  onClick={() => setShowTestEmailPopup(false)}
                >
                  ✕
                </button>
              </div>
              <div className="test-email-popup-body">
                <label htmlFor="test-email-input">Email Adresi</label>
                <input
                  id="test-email-input"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="test-email-input"
                  placeholder="ornek@email.com"
                  autoFocus
                />
              </div>
              <div className="test-email-popup-footer">
                <button 
                  className="btn btn-cancel"
                  onClick={() => setShowTestEmailPopup(false)}
                >
                  İptal
                </button>
                <button 
                  className="btn btn-save"
                  onClick={handleSendTestMail}
                  disabled={saving || !testEmail.trim()}
                >
                  {saving ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="editor-content">
          {templateNotFound ? (
            <div className="template-not-found">
              <div className="template-not-found-card">
                <div className="template-not-found-icon">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" stroke="#e74c3c"/>
                  </svg>
                </div>
                <h2 className="template-not-found-title">Şablon Bulunamadı</h2>
                <p className="template-not-found-desc">
                  <strong>#{subjectId}</strong> numaralı konu için <strong>{scode}</strong> mağazasında kayıtlı bir şablon bulunamadı.
                </p>
                <div className="template-not-found-details">
                  <div className="template-not-found-detail-item">
                    <span className="detail-label">Mağaza Kodu</span>
                    <span className="detail-value">{scode}</span>
                  </div>
                  <div className="template-not-found-detail-item">
                    <span className="detail-label">Firma Kodu</span>
                    <span className="detail-value">{fcode}</span>
                  </div>
                  <div className="template-not-found-detail-item">
                    <span className="detail-label">Konu ID</span>
                    <span className="detail-value">#{subjectId}</span>
                  </div>
                  {title && (
                    <div className="template-not-found-detail-item">
                      <span className="detail-label">Başlık</span>
                      <span className="detail-value">{title}</span>
                    </div>
                  )}
                </div>
                <div className="template-not-found-actions">
                  <button className="btn btn-cancel" onClick={onBack}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 12H5M12 19l-7-7 7-7"/>
                    </svg>
                    Şablon Listesine Dön
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <ElementPalette onAddElement={handleAddElement} />
              
              <Canvas
                elements={elements}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                onDeleteElement={handleDeleteElement}
                onReorderElements={handleReorderElements}
              />
              
              <PropertyEditor
                element={selectedElement}
                onUpdateElement={handleUpdateElement}
              />
            </>
          )}
        </div>
      </div>
    </DndProvider>
  )
}

export default TemplateEditor
