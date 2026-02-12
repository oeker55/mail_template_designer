import React, { useState, useEffect } from 'react'
import { templateAPI } from '../utils/api'
import { TemplateListProps, Template } from '../types'
import { EMAIL_SUBJECTS } from '../config/subjects'
import './TemplateList.css'

const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onCreate }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // ASP den gelen scode ve fcode degerlerini al
    const scode = window.emailSettings?.scode || 'LOCAL_MAGAZA'
    const fcode = window.emailSettings?.fcode || 'LOCAL_FIRMA'

  useEffect(() => {
    loadTemplates()
  }, [scode])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      // scode ile bu firmaya ait templateleri cek
      const data = await templateAPI.getAllByScode(scode)
      setTemplates(data || [])
    } catch (err) {
      console.error('Template yuklenirken hata:', err)
      setError('Template listesi yuklenirken bir hata olustu.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  // Belirli bir subject icin template var mi? (subjectId ile eslestir)
  const findTemplateBySubjectId = (subjectId: string) => {
    return templates.find(t => t.subjectId === subjectId)
  }

  const handleRefresh = () => {
    loadTemplates()
  }

  return (
    <div className="template-list-subjects">
      <div className="template-list-header">
        <h2>Email Konulari</h2>
        <div className="header-info">
          <span className="fcode-label">Firma:</span>
          <span className="fcode-value">{fcode}</span>
          <span className="scode-label">Mağaza:</span>
          <span className="scode-value">{scode}</span>
        </div>
        <div className="header-actions">
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
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Yukleniyor...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            Tekrar Dene
          </button>
        </div>
      ) : (
        <table className="subject-table">
          <thead>
            <tr>
              <th style={{width: 50}}>ID</th>
              <th>Konu Başlığı</th>
              <th style={{width: 130}}>Durum</th>
              <th style={{width: 120}}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {EMAIL_SUBJECTS.map(subject => {
              const template = findTemplateBySubjectId(subject.id)
              return (
                <tr key={subject.id} className={template ? 'has-template' : 'no-template'}>
                  <td>{subject.id}</td>
                  <td>{subject.title}</td>
                  <td>
                    {template ? (
                      <span className="status-ready">Tasarım Var</span>
                    ) : (
                      <span className="status-missing">Tasarım Yok</span>
                    )}
                  </td>
                  <td>
                    {template ? (
                      <button className="btn-edit" onClick={() => onEdit(subject.id, scode, fcode, subject.title)}>Düzenle</button>
                    ) : (
                      <button className="btn-add" onClick={() => onCreate(subject.id, scode, fcode, subject.title)}>Ekle</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default TemplateList
