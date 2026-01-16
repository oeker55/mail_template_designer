import React, { useState, useEffect } from 'react'
import { templateAPI } from '../utils/api'
import { TemplateListProps, Template } from '../types'
import './TemplateList.css'

const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onCreate }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [fcode, setFcode] = useState<string>('DEMO_COMPANY')

  useEffect(() => {
    loadTemplates()
  }, [fcode])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // API'den template listesini çek
      const data = await templateAPI.getAll(fcode)
      setTemplates(data || [])
    } catch (error) {
      console.error('Template yüklenirken hata:', error)
      setError('Template listesi yüklenirken bir hata oluştu. Lütfen API servisinin çalıştığından emin olun.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu template\'i silmek istediğinizden emin misiniz?')) {
      return
    }
    
    try {
      await templateAPI.delete(id)
      // Silme başarılı, listeyi yenile
      loadTemplates()
    } catch (error) {
      console.error('Silme hatası:', error)
      alert('Template silinirken bir hata oluştu')
    }
  }

  const handleRefresh = () => {
    loadTemplates()
  }

  // HTML olarak indir
  const downloadHTML = async (templateId: string, templateName: string) => {
    try {
      const template = await templateAPI.getById(templateId)
      if (!template.html_content) {
        alert('Bu template için HTML içeriği bulunamadı')
        return
      }
      
      const blob = new Blob([template.html_content], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${templateName.replace(/\s+/g, '_')}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('HTML indirme hatası:', error)
      alert('HTML indirilirken bir hata oluştu')
    }
  }

  // JSON olarak indir
  const downloadJSON = async (templateId: string, templateName: string) => {
    try {
      const template = await templateAPI.getById(templateId)
      
      const jsonData = {
        name: template.name,
        fcode: template.fcode,
        elements_json: template.elements_json,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${templateName.replace(/\s+/g, '_')}_template.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('JSON indirme hatası:', error)
      alert('JSON indirilirken bir hata oluştu')
    }
  }

  if (loading) {
    return (
      <div className="template-list-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="template-list-container">
      <div className="template-list-header">
        <h2>Email Şablonları</h2>
        <div className="header-actions">
          <input
            type="text"
            placeholder="Firma Kodu"
            value={fcode}
            onChange={(e) => setFcode(e.target.value)}
            className="fcode-input"
          />
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            title="Listeyi Yenile"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Yenile
          </button>
          <button
            className="btn btn-primary"
            onClick={onCreate}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            Yeni Şablon
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            Tekrar Dene
          </button>
        </div>
      )}

      <div className="template-grid">
        {templates.map((template) => (
          <div key={template._id || template.id} className="template-card">
            <div className="template-card-header">
              <h3>{template.name}</h3>
              <span className="fcode-badge">{template.fcode}</span>
            </div>
            <div className="template-card-body">
              <p className="template-date">
                Oluşturulma: {new Date(template.createdAt || template.created_at || '').toLocaleDateString('tr-TR')}
              </p>
              <p className="template-date">
                Güncelleme: {new Date(template.updatedAt || template.updated_at || '').toLocaleDateString('tr-TR')}
              </p>
              {template.html_content && (
                <p className="template-status">HTML mevcut</p>
              )}
            </div>
            <div className="template-card-actions">
              <button
                className="btn btn-edit"
                onClick={() => onEdit(template._id || template.id || '')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Düzenle
              </button>
              <button
                className="btn btn-download"
                onClick={() => downloadHTML(template._id || template.id || '', template.name)}
                title="HTML olarak indir"
              >
                HTML
              </button>
              <button
                className="btn btn-download"
                onClick={() => downloadJSON(template._id || template.id || '', template.name)}
                title="JSON olarak indir"
              >
                JSON
              </button>
              <button
                className="btn btn-delete"
                onClick={() => handleDelete(template._id || template.id || '')}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14"/>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {!error && templates.length === 0 && (
        <div className="empty-state">
          <p>"{fcode}" firma kodu için henüz şablon oluşturulmamış</p>
          <button
            className="btn btn-primary"
            onClick={onCreate}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            İlk Şablonu Oluştur
          </button>
        </div>
      )}
    </div>
  )
}

export default TemplateList
