import React, { useState, useEffect, useRef, useCallback } from 'react'
import Editor from '@monaco-editor/react'
import { CanvasElement } from '../types'
import { generateEmailHTML } from '../utils/htmlGenerator'
import './CodePanel.css'

type TabType = 'html' | 'css'

interface CodePanelProps {
  elements: CanvasElement[]
  templateName: string
  customCSS: string
  onCustomCSSChange: (css: string) => void
}

/** Simple HTML formatter — indents tags for readability */
const formatHTML = (html: string): string => {
  const selfClosing = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'])
  let result = ''
  let indent = 0
  // Split by tags while keeping tag content
  const tokens = html.replace(/>\s*</g, '>\n<').split('\n')
  for (const raw of tokens) {
    const token = raw.trim()
    if (!token) continue
    // Closing tag
    if (/^<\//.test(token)) {
      indent = Math.max(0, indent - 1)
      result += '  '.repeat(indent) + token + '\n'
    }
    // Self-closing or void tag
    else if (/\/>$/.test(token) || selfClosing.has((token.match(/^<(\w+)/)?.[1] || '').toLowerCase())) {
      result += '  '.repeat(indent) + token + '\n'
    }
    // Opening tag
    else if (/^<\w/.test(token)) {
      result += '  '.repeat(indent) + token + '\n'
      indent++
    }
    // Text / other content
    else {
      result += '  '.repeat(indent) + token + '\n'
    }
  }
  return result.trimEnd()
}

const CodePanel: React.FC<CodePanelProps> = ({ elements, templateName, customCSS, onCustomCSSChange }) => {
  const [activeTab, setActiveTab] = useState<TabType>('css')
  const [htmlContent, setHtmlContent] = useState<string>('')
  const [panelHeight, setPanelHeight] = useState<number>(300)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Generate HTML when elements change
  useEffect(() => {
    let cancelled = false
    const generate = async () => {
      try {
        const html = await generateEmailHTML(elements, templateName, customCSS)
        if (!cancelled) setHtmlContent(formatHTML(html))
      } catch {
        if (!cancelled) setHtmlContent('<p>HTML oluşturulamadı</p>')
      }
    }
    generate()
    return () => { cancelled = true }
  }, [elements, templateName, customCSS])

  // Resize handling  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startY = e.clientY
    const startHeight = panelHeight

    const onMouseMove = (ev: MouseEvent) => {
      const delta = startY - ev.clientY
      const newHeight = Math.max(150, Math.min(window.innerHeight - 200, startHeight + delta))
      setPanelHeight(newHeight)
    }

    const onMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }, [panelHeight])

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'html', label: 'HTML Kodu', icon: '</>' },
    { key: 'css', label: 'Custom CSS', icon: '🎨' },
  ]

  return (
    <div
      ref={panelRef}
      className="code-panel"
      style={{ height: `${panelHeight}px` }}
    >
      {/* Resize handle */}
      <div
        className={`code-panel-resize-handle ${isResizing ? 'active' : ''}`}
        onMouseDown={handleMouseDown}
      >
        <span className="resize-dots">⠿⠿⠿</span>
      </div>

      {/* Tab bar */}
      <div className="code-panel-tabs">
        <div className="code-panel-tabs-left">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`code-panel-tab ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="code-panel-content">
        {activeTab === 'html' && (
          <Editor
            height="100%"
            language="html"
            value={htmlContent}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        )}

        {activeTab === 'css' && (
          <Editor
            height="100%"
            language="css"
            value={customCSS}
            theme="vs-dark"
            onChange={(value) => onCustomCSSChange(value || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              suggestOnTriggerCharacters: true,
            }}
          />
        )}
      </div>
    </div>
  )
}

export default CodePanel
