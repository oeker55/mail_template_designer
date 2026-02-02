import React, { useState, useEffect, MouseEvent } from 'react'
import TemplateList from './components/TemplateList'
import TemplateEditor from './components/TemplateEditor'
import './App.css'

interface EditorState {
  subjectId: string
  scode: string
  title: string
}

function App() {
  const [editorState, setEditorState] = useState<EditorState | null>(null)

  useEffect(() => {
    // URL'den subjectId'yi oku (URL param adı templateId ama değeri subjectId)
    const params = new URLSearchParams(window.location.search)
    const subjectId = params.get('templateId')
    const title = params.get('title') || ''
    
    // ASP'den gelen scode
    const scode = window.emailSettings?.scode || 'DEFAULT'
    
    if (subjectId) {
      setEditorState({ subjectId, scode, title })
    }

    // Browser back/forward butonlarını dinle
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const subjectId = params.get('templateId')
      const title = params.get('title') || ''
      const scode = window.emailSettings?.scode || 'DEFAULT'
      
      if (subjectId) {
        setEditorState({ subjectId, scode, title })
      } else {
        setEditorState(null)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (subjectId: string | null, scode?: string, title?: string) => {
    if (subjectId && scode && title) {
      const url = new URL(window.location.href)
      url.searchParams.set('templateId', subjectId)
      url.searchParams.set('title', title)
      window.history.pushState({}, '', url)
      setEditorState({ subjectId, scode, title })
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('templateId')
      url.searchParams.delete('title')
      window.history.pushState({}, '', url)
      setEditorState(null)
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
            className={!editorState ? 'active' : ''}
          >
            Şablonlar
          </a>
        </nav>
      </header>
      <main>
        {editorState ? (
          <TemplateEditor 
            subjectId={editorState.subjectId}
            scode={editorState.scode}
            title={editorState.title}
            onBack={() => handleNavigate(null)} 
          />
        ) : (
          <TemplateList 
            onEdit={(subjectId: string, scode: string, title: string) => handleNavigate(subjectId, scode, title)}
            onCreate={(subjectId: string, scode: string, title: string) => handleNavigate(subjectId, scode, title)}
          />
        )}
      </main>
    </div>
  )
}

export default App
