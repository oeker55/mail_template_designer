import React, { useState, useEffect, MouseEvent } from 'react'
import TemplateList from './components/TemplateList'
import TemplateEditor from './components/TemplateEditor'
import './App.css'

interface EditorState {
  subjectId: string
  scode: string
  fcode: string
  title: string
  isCreateMode: boolean
}

const getEditorStateFromUrl = (): EditorState | null => {
  const params = new URLSearchParams(window.location.search)
  const subjectId = params.get('templateId')
  const title = params.get('title') || ''
  const isCreateMode = params.get('mode') === 'create'
  const scode = window.emailSettings?.scode || 'LOCAL_MAGAZA'
  const fcode = window.emailSettings?.fcode || 'LOCAL_FIRMA'

  if (!subjectId) {
    return null
  }

  return { subjectId, scode, fcode, title, isCreateMode }
}

function App() {
  const [editorState, setEditorState] = useState<EditorState | null>(null)

  useEffect(() => {
    setEditorState(getEditorStateFromUrl())

    // Browser back/forward butonlarını dinle
    const handlePopState = () => {
      setEditorState(getEditorStateFromUrl())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const handleNavigate = (subjectId: string | null, scode?: string, fcode?: string, title?: string, isCreateMode: boolean = false) => {
    if (subjectId && scode && fcode && title) {
      const url = new URL(window.location.href)
      url.searchParams.set('templateId', subjectId)
      url.searchParams.set('title', title)
      if (isCreateMode) {
        url.searchParams.set('mode', 'create')
      } else {
        url.searchParams.delete('mode')
      }
      window.history.pushState({}, '', url)
      setEditorState({ subjectId, scode, fcode, title, isCreateMode })
    } else {
      const url = new URL(window.location.href)
      url.searchParams.delete('templateId')
      url.searchParams.delete('title')
      url.searchParams.delete('mode')
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
          Email Şablon Yönetimi
        </h1>
      { editorState && <nav>
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
        </nav>}
      </header>
      <main>
        {editorState ? (
          <TemplateEditor 
            subjectId={editorState.subjectId}
            scode={editorState.scode}
            fcode={editorState.fcode}
            title={editorState.title}
            isCreateMode={editorState.isCreateMode}
            onBack={() => handleNavigate(null)} 
          />
        ) : (
          <TemplateList 
            onEdit={(subjectId: string, scode: string, fcode: string, title: string) => handleNavigate(subjectId, scode, fcode, title, false)}
            onCreate={(subjectId: string, scode: string, fcode: string, title: string) => handleNavigate(subjectId, scode, fcode, title, true)}
          />
        )}
      </main>
    </div>
  )
}

export default App
