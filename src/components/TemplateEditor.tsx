import React, { useState, useEffect, useRef, ChangeEvent } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import ElementPalette from './ElementPalette'
import Canvas from './Canvas'
import PropertyEditor from './PropertyEditor'
import { ELEMENT_TYPES } from '../config/elementTypes'
import { generateEmailHTML } from '../utils/htmlGenerator'
import { templateAPI, mailAPI } from '../utils/api'
import presetTemplatesData from '../data/presetTemplates.json'
import { TemplateEditorProps, CanvasElement, LocalTemplate, PresetTemplate, Template } from '../types'
import './TemplateEditor.css'

const TemplateEditor: React.FC<TemplateEditorProps> = ({ subjectId, scode, fcode, title, onBack }) => {
  const [templateName, setTemplateName] = useState<string>(title || 'Yeni Template')
  const [testEmail, setTestEmail] = useState<string>('oeker55@outlook.com')
  const [elements, setElements] = useState<CanvasElement[]>([])
  const [selectedElement, setSelectedElement] = useState<CanvasElement | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(true)
  const [existingTemplateId, setExistingTemplateId] = useState<string | null>(null)
  const [savedTemplates, setSavedTemplates] = useState<LocalTemplate[]>([])
  const [showSavedTemplates, setShowSavedTemplates] = useState<boolean>(false)
  const [showPresetTemplates, setShowPresetTemplates] = useState<boolean>(false)
  const [presetTemplates, setPresetTemplates] = useState<PresetTemplate[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Template'i yükle (scode + subjectId ile)
    loadTemplateBySubject()
    // LocalStorage'dan kayıtlı şablonları yükle
    loadSavedTemplates()
    // Hazır şablonları yükle
    loadPresetTemplates()
  }, [subjectId, scode])

  const loadTemplateBySubject = async () => {
    try {
      setLoading(true)
      // scode ve subjectId ile template'i çek
      const template: Template = await templateAPI.getBySubject(scode, subjectId)
      
      if (template) {
        setTemplateName(template.title || title)
        setExistingTemplateId(template._id || template.id || null)
        
        // elements_json alanı string ise parse et, değilse direkt kullan
        const elementsData = typeof template.elements_json === 'string' 
          ? JSON.parse(template.elements_json) 
          : template.elements_json
        
        setElements(elementsData || [])
      } else {
        // Template yoksa boş başla
        setTemplateName(title)
        setExistingTemplateId(null)
        setElements([])
      }
    } catch (error) {
      // 404 veya hata durumunda yeni template olarak başla
      console.log('Template bulunamadı, yeni olarak başlanıyor:', error)
      setTemplateName(title)
      setExistingTemplateId(null)
      setElements([])
    } finally {
      setLoading(false)
    }
  }

  const loadPresetTemplates = () => {
    try {
      // JSON dosyasından hazır şablonları yükle
      const data = presetTemplatesData as { templates: PresetTemplate[] }
      setPresetTemplates(data.templates || [])
    } catch (error) {
      console.error('Hazır şablonlar yüklenirken hata:', error)
      setPresetTemplates([])
    }
  }

  // Hazır şablonu yükle
  const loadPresetTemplate = (template: PresetTemplate) => {
    if (elements.length > 0) {
      if (!confirm('Mevcut çalışmanız kaybolacak. Devam etmek istiyor musunuz?')) {
        return
      }
    }
    
    setElements(template.elements || [])
    setSelectedElement(null)
    setShowPresetTemplates(false)
    alert(`"${template.name}" hazır şablonu yüklendi!`)
  }

  const loadSavedTemplates = () => {
    try {
      const saved = localStorage.getItem('emailTemplates')
      if (saved) {
        setSavedTemplates(JSON.parse(saved))
      }
    } catch (error) {
      console.error('Kayıtlı şablonlar yüklenirken hata:', error)
    }
  }

  // Şablonu LocalStorage'a kaydet
  const saveToLocalStorage = () => {
    try {
      const templateData: LocalTemplate = {
        id: `template-${scode}-${subjectId}-${Date.now()}`,
        name: `${title} (${fcode})`,
        fcode: fcode,
        elements: elements,
        savedAt: new Date().toISOString()
      }

      const saved = localStorage.getItem('emailTemplates')
      const templates: LocalTemplate[] = saved ? JSON.parse(saved) : []
      
      // Aynı scode+subjectId varsa güncelle, yoksa ekle
      const existingIndex = templates.findIndex(t => t.name === templateData.name)
      if (existingIndex >= 0) {
        templates[existingIndex] = templateData
      } else {
        templates.push(templateData)
      }

      localStorage.setItem('emailTemplates', JSON.stringify(templates))
      setSavedTemplates(templates)
      alert('Şablon başarıyla yerel olarak kaydedildi!')
    } catch (error) {
      console.error('Şablon kaydetme hatası:', error)
      alert('Şablon kaydedilirken hata oluştu')
    }
  }

  // LocalStorage'dan şablon yükle
  const loadFromLocalStorage = (template: LocalTemplate) => {
    if (elements.length > 0) {
      if (!confirm('Mevcut çalışmanız kaybolacak. Devam etmek istiyor musunuz?')) {
        return
      }
    }
    
    setElements(template.elements || [])
    setSelectedElement(null)
    setShowSavedTemplates(false)
    alert(`"${template.name}" şablonu yüklendi!`)
  }

  // LocalStorage'dan şablon sil
  const deleteFromLocalStorage = (templateId: string) => {
    if (!confirm('Bu şablonu silmek istediğinize emin misiniz?')) {
      return
    }

    try {
      const saved = localStorage.getItem('emailTemplates')
      const templates: LocalTemplate[] = saved ? JSON.parse(saved) : []
      const filtered = templates.filter(t => t.id !== templateId)
      localStorage.setItem('emailTemplates', JSON.stringify(filtered))
      setSavedTemplates(filtered)
    } catch (error) {
      console.error('Şablon silme hatası:', error)
    }
  }

  // JSON olarak dışa aktar
  const exportToJSON = () => {
    const templateData = {
      name: templateName,
      scode: scode,
      subjectId: subjectId,
      title: title,
      elements: elements,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(templateData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${scode}_${subjectId}_template.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // JSON'dan içe aktar
  const importFromJSON = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const result = e.target?.result
        if (typeof result !== 'string') return
        
        const templateData = JSON.parse(result) as { elements?: CanvasElement[] }
        
        if (elements.length > 0) {
          if (!confirm('Mevcut çalışmanız kaybolacak. Devam etmek istiyor musunuz?')) {
            return
          }
        }

        setElements(templateData.elements || [])
        setSelectedElement(null)
        alert('Şablon başarıyla içe aktarıldı!')
      } catch (error) {
        console.error('JSON parse hatası:', error)
        alert('Geçersiz şablon dosyası')
      }
    }
    reader.readAsText(file)
    
    // Input'u sıfırla
    event.target.value = ''
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
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="template-name-input"
              placeholder="Template Adı"
            />
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="fcode-input-small"
              placeholder="Test Email"
              style={{ width: '180px', marginLeft: '8px' }}
            />
          </div>
          <div className="editor-header-right">
            {/* Hazır Şablonlar Butonu */}
            <div className="preset-templates-wrapper">
              <button 
                className="btn btn-preset" 
                onClick={() => setShowPresetTemplates(!showPresetTemplates)}
                title="Hazır şablonları göster"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
                Hazır Şablonlar
              </button>
              
              {/* Hazır Şablonlar Modal/Dropdown */}
              {showPresetTemplates && (
                <div className="preset-templates-modal">
                  <div className="preset-templates-header">
                    <span>Hazır E-posta Şablonları</span>
                    <button 
                      className="preset-templates-close"
                      onClick={() => setShowPresetTemplates(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <p className="preset-templates-desc">
                    Aşağıdaki hazır şablonlardan birini seçerek hızlıca başlayabilirsiniz.
                  </p>
                  {presetTemplates.length > 0 ? (
                    <div className="preset-templates-grid">
                      {presetTemplates.map(template => (
                        <div 
                          key={template.id} 
                          className="preset-template-card"
                          onClick={() => loadPresetTemplate(template)}
                        >
                          <div className="preset-template-icon">
                            {template.thumbnail === 'welcome' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                              </svg>
                            )}
                            {template.thumbnail === 'order' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M9 12l2 2 4-4"/>
                                <circle cx="12" cy="12" r="10"/>
                              </svg>
                            )}
                            {template.thumbnail === 'campaign' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                              </svg>
                            )}
                            {template.thumbnail === 'security' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0110 0v4"/>
                              </svg>
                            )}
                            {template.thumbnail === 'shipping' && (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="1" y="3" width="15" height="13"/>
                                <path d="M16 8h4l3 3v5h-7V8z"/>
                                <circle cx="5.5" cy="18.5" r="2.5"/>
                                <circle cx="18.5" cy="18.5" r="2.5"/>
                              </svg>
                            )}
                          </div>
                          <div className="preset-template-info">
                            <div className="preset-template-name">{template.name}</div>
                            <div className="preset-template-category">{template.category}</div>
                            <div className="preset-template-desc">{template.description}</div>
                          </div>
                          <div className="preset-template-badge">
                            {template.elements?.length || 0} element
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="preset-templates-empty">
                      Hazır şablon bulunamadı
                    </div>
                  )}
                </div>
              )}
            </div>
            
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
            <button 
              className="btn btn-secondary" 
              onClick={saveToLocalStorage}
              title="Şablonu tarayıcıya kaydet"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
              </svg>
              Yerel Kaydet
            </button>
            <div className="local-templates-wrapper">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowSavedTemplates(!showSavedTemplates)}
                title="Kayıtlı şablonları göster"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
                  <path d="M9 22V12h6v10"/>
                </svg>
                Yerel ({savedTemplates.length})
              </button>
              
              {/* Kayıtlı Şablonlar Dropdown */}
              {showSavedTemplates && (
                <div className="local-templates-dropdown">
                  <div className="local-templates-header">
                    <span>Yerelde Kayıtlı Şablonlar</span>
                    <button 
                      className="local-templates-close"
                      onClick={() => setShowSavedTemplates(false)}
                    >
                      ✕
                    </button>
                  </div>
                  {savedTemplates.length > 0 ? (
                    <div className="local-templates-list">
                      {savedTemplates.map(template => (
                        <div key={template.id} className="local-template-item">
                          <div 
                            className="local-template-info"
                            onClick={() => loadFromLocalStorage(template)}
                          >
                            <div className="local-template-name">{template.name}</div>
                            <div className="local-template-date">
                              {new Date(template.savedAt).toLocaleString('tr-TR')}
                            </div>
                          </div>
                          <button
                            className="local-template-delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteFromLocalStorage(template.id)
                            }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="local-templates-empty">
                      Henüz kayıtlı şablon yok
                    </div>
                  )}
                </div>
              )}
            </div>
            <button 
              className="btn btn-secondary" 
              onClick={exportToJSON}
              title="JSON olarak dışa aktar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              Dışa Aktar
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => fileInputRef.current?.click()}
              title="JSON dosyasından içe aktar"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              İçe Aktar
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={importFromJSON}
              style={{ display: 'none' }}
            />
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
              onClick={handleSendTestMail}
              disabled={saving}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
              </svg>
              {saving ? 'Gönderiliyor...' : 'Test Gönder'}
            </button>
            <button className="btn btn-cancel" onClick={onBack}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
              Kapat
            </button>
          </div>
        </div>
        

        <div className="editor-content">
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
        </div>
      </div>
    </DndProvider>
  )
}

export default TemplateEditor
