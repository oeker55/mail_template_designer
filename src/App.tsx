import React, { useState, useEffect, MouseEvent } from 'react'
import TemplateList from './components/TemplateList'
import TemplateEditor from './components/TemplateEditor'
import './App.css'

function App() {
  const [templateId, setTemplateId] = useState<string | null>(null)

  useEffect(() => {
    // URL'den templateId'yi oku
    const params = new URLSearchParams(window.location.search)
    const id = params.get('templateId')
    if (id) {
      setTemplateId(id)
    }

    // Browser back/forward butonlarını dinle
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setTemplateId(params.get('templateId'))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (id: string | null) => {
    if (id) {
      const url = new URL(window.location.href)
      url.searchParams.set('templateId', id)
      window.history.pushState({}, '', url)
      setTemplateId(id)
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('templateId')
      window.history.pushState({}, '', url)
      setTemplateId(null)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Email Template Designer
        </h1>
        <nav>
          <a 
            href="#"
            onClick={(e: MouseEvent<HTMLAnchorElement>) => {
              e.preventDefault()
              handleNavigate(null)
            }}
            className={!templateId ? 'active' : ''}
          >
            Şablonlar
          </a>
        </nav>
      </header>
      <main>
        {templateId ? (
          <TemplateEditor 
            templateId={templateId} 
            onBack={() => handleNavigate(null)} 
          />
        ) : (
          <TemplateList 
            onEdit={(id: string) => handleNavigate(id)}
            onCreate={() => handleNavigate('new')}
          />
        )}
      </main>
    </div>
  )
}

export default App
