import React from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type { editor as MonacoEditor } from 'monaco-editor'

interface MonacoPropertyEditorProps {
  value: string
  onChange: (value: string) => void
  language?: string
  height?: number | string
  path?: string
  className?: string
  theme?: string
  formatOnMount?: boolean
  onMount?: OnMount
  options?: MonacoEditor.IStandaloneEditorConstructionOptions
}

const baseOptions: MonacoEditor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  fontSize: 11,
  lineHeight: 17,
  lineNumbers: 'off',
  lineDecorationsWidth: 8,
  lineNumbersMinChars: 0,
  glyphMargin: false,
  folding: false,
  wordWrap: 'on',
  formatOnPaste: true,
  formatOnType: true,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  renderLineHighlight: 'line',
  tabSize: 2,
  padding: { top: 8, bottom: 8 },
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    useShadows: false,
  },
}

const MonacoPropertyEditor: React.FC<MonacoPropertyEditorProps> = ({
  value,
  onChange,
  language = 'html',
  height = 160,
  path,
  className,
  theme = 'vs-dark',
  formatOnMount = true,
  onMount,
  options,
}) => {
  const handleMount: OnMount = (editor, monaco) => {
    onMount?.(editor, monaco)

    if (!formatOnMount) return

    requestAnimationFrame(() => {
      editor.getAction('editor.action.formatDocument')?.run().then(() => {
        onChange(editor.getValue())
      }).catch(() => undefined)
    })
  }

  return (
    <div
      className={`monaco-property-editor ${className || ''}`}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <Editor
        height="100%"
        language={language}
        path={path}
        value={value}
        theme={theme}
        loading={<div className="monaco-property-loading">Editor yukleniyor...</div>}
        onMount={handleMount}
        onChange={(nextValue) => onChange(nextValue || '')}
        options={{
          ...baseOptions,
          ...options,
        }}
      />
    </div>
  )
}

export default MonacoPropertyEditor
