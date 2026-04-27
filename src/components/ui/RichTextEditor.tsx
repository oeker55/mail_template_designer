import React, { useRef, useState } from 'react'
import type { OnMount } from '@monaco-editor/react'
import type { Selection, editor as MonacoEditor } from 'monaco-editor'
import { TEMPLATE_VARIABLES, formatVariable } from '../../config/templateVariables'
import { RichTextEditorProps, TemplateVariable } from '../../types'
import MonacoPropertyEditor from './MonacoPropertyEditor'

interface ExtendedVariable extends TemplateVariable {
  categoryIcon: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null)
  const savedSelectionRef = useRef<Selection | null>(null)
  const editorPathRef = useRef(`text-content-${Math.random().toString(36).slice(2)}.html`)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const [showVariableDropdown, setShowVariableDropdown] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showColorPicker, setShowColorPicker] = useState(false)
  const [textColor, setTextColor] = useState('#ff0000')
  const [showBgColorPicker, setShowBgColorPicker] = useState(false)
  const [bgColor, setBgColor] = useState('#ffff00')
  const [showFontSizePicker, setShowFontSizePicker] = useState(false)
  const [selectedFontSize, setSelectedFontSize] = useState('16')

  const fontSizeOptions = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48']

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor
  }

  const getSelection = (selectionOverride?: Selection | null) => {
    const editor = editorRef.current
    const model = editor?.getModel()
    const selection = selectionOverride || editor?.getSelection()

    if (!editor || !model || !selection) {
      return null
    }

    return {
      editor,
      model,
      selection,
      text: model.getValueInRange(selection)
    }
  }

  const replaceSelection = (replacement: string, selectionOverride?: Selection | null, cursorOffset = replacement.length) => {
    const selectionInfo = getSelection(selectionOverride)
    if (!selectionInfo) return

    const { editor, model, selection } = selectionInfo
    const startOffset = model.getOffsetAt(selection.getStartPosition())

    editor.pushUndoStop()
    editor.executeEdits('rich-text-editor', [{
      range: selection,
      text: replacement,
      forceMoveMarkers: true
    }])
    editor.pushUndoStop()

    const cursorPosition = model.getPositionAt(startOffset + cursorOffset)
    editor.focus()
    editor.setSelection({
      startLineNumber: cursorPosition.lineNumber,
      startColumn: cursorPosition.column,
      endLineNumber: cursorPosition.lineNumber,
      endColumn: cursorPosition.column
    })
    onChange(model.getValue())
  }

  const insertAtCursor = (before: string, after = '', defaultText = '') => {
    const selectionInfo = getSelection()
    if (!selectionInfo) return

    const selectedText = selectionInfo.text || defaultText
    const replacement = `${before}${selectedText}${after}`
    replaceSelection(replacement, selectionInfo.selection, replacement.length)
  }

  const wrapSelection = (tag: string, attributes = '') => {
    const selectionInfo = getSelection()
    const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`
    const closeTag = `</${tag}>`

    if (selectionInfo?.text) {
      const replacement = `${openTag}${selectionInfo.text}${closeTag}`
      replaceSelection(replacement, selectionInfo.selection, replacement.length)
      return
    }

    const placeholder = tag === 'a' ? 'link metni' : 'metin'
    insertAtCursor(openTag, closeTag, placeholder)
  }

  const insertLineBreak = () => insertAtCursor('<br>\n')
  const insertParagraph = () => insertAtCursor('<br><br>\n')
  const insertHorizontalRule = () => insertAtCursor('<hr>\n')

  const openLinkModal = () => {
    const selectionInfo = getSelection()
    savedSelectionRef.current = selectionInfo?.selection || null
    setLinkText(selectionInfo?.text || '')
    setLinkUrl('')
    setShowLinkModal(true)
  }

  const insertLink = () => {
    if (!linkUrl) return

    const linkHtml = `<a href="${linkUrl}" style="color: #007bff; text-decoration: underline;">${linkText || linkUrl}</a>`
    replaceSelection(linkHtml, savedSelectionRef.current, linkHtml.length)
    savedSelectionRef.current = null
    setShowLinkModal(false)
    setLinkUrl('')
    setLinkText('')
  }

  const makeBold = () => wrapSelection('strong')
  const makeItalic = () => wrapSelection('em')
  const makeUnderline = () => wrapSelection('u')
  const makeStrikethrough = () => wrapSelection('s')

  const applyColor = () => {
    const selectionInfo = getSelection()
    if (selectionInfo?.text) wrapSelection('span', `style="color: ${textColor}"`)
    setShowColorPicker(false)
  }

  const applyBgColor = () => {
    const selectionInfo = getSelection()
    if (selectionInfo?.text) wrapSelection('span', `style="background-color: ${bgColor}; padding: 2px 4px;"`)
    setShowBgColorPicker(false)
  }

  const applyFontSize = () => {
    const selectionInfo = getSelection()
    if (selectionInfo?.text) wrapSelection('span', `style="font-size: ${selectedFontSize}px"`)
    setShowFontSizePicker(false)
  }

  const closeAllDropdowns = () => {
    setShowColorPicker(false)
    setShowBgColorPicker(false)
    setShowFontSizePicker(false)
    setShowVariableDropdown(false)
  }

  const insertVariable = (variableKey: string) => {
    insertAtCursor(formatVariable(variableKey))
    setShowVariableDropdown(false)
    setActiveCategory(null)
    setSearchTerm('')
  }

  const getFilteredVariables = (): ExtendedVariable[] | null => {
    if (!searchTerm) return null
    const filtered: ExtendedVariable[] = []
    Object.entries(TEMPLATE_VARIABLES).forEach(([_catKey, category]) => {
      category.variables.forEach((v) => {
        if (v.label.toLowerCase().includes(searchTerm.toLowerCase()) || v.key.toLowerCase().includes(searchTerm.toLowerCase())) {
          filtered.push({ ...v, categoryIcon: category.icon })
        }
      })
    })
    return filtered
  }

  const filteredVariables = getFilteredVariables()

  return (
    <div className="rich-text-editor">
      <div className="rich-text-toolbar">
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={makeBold} title="Kalin"><strong>B</strong></button>
          <button type="button" className="toolbar-btn" onClick={makeItalic} title="Italik"><em>I</em></button>
          <button type="button" className="toolbar-btn" onClick={makeUnderline} title="Alti Cizili"><u>U</u></button>
          <button type="button" className="toolbar-btn" onClick={makeStrikethrough} title="Ustu Cizili"><s>S</s></button>
        </div>
        <div className="toolbar-divider"></div>
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={openLinkModal} title="Link Ekle">Link</button>
          <div className="toolbar-color-wrapper">
            <button type="button" className="toolbar-btn" onClick={() => { closeAllDropdowns(); setShowFontSizePicker(!showFontSizePicker) }} title="Yazi Boyutu">
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>A</span><span style={{ fontSize: '14px', fontWeight: 'bold' }}>A</span>
            </button>
            {showFontSizePicker && (
              <div className="color-picker-dropdown font-size-dropdown">
                <label className="dropdown-label">Yazi Boyutu (px)</label>
                <div className="font-size-grid">
                  {fontSizeOptions.map(size => (
                    <button key={size} type="button" className={`font-size-option ${selectedFontSize === size ? 'active' : ''}`} onClick={() => setSelectedFontSize(size)}>{size}</button>
                  ))}
                </div>
                <input type="number" value={selectedFontSize} onChange={(e) => setSelectedFontSize(e.target.value)} className="font-size-input" min="8" max="72" placeholder="Ozel" />
                <button type="button" className="color-apply-btn" onClick={applyFontSize}>Uygula</button>
              </div>
            )}
          </div>
          <div className="toolbar-color-wrapper">
            <button type="button" className="toolbar-btn" onClick={() => { closeAllDropdowns(); setShowColorPicker(!showColorPicker) }} title="Metin Rengi">
              <span style={{ color: textColor, fontWeight: 'bold' }}>A</span>
              <span className="color-indicator" style={{ backgroundColor: textColor }}></span>
            </button>
            {showColorPicker && (
              <div className="color-picker-dropdown">
                <label className="dropdown-label">Metin Rengi</label>
                <div className="color-presets">
                  {['#000000', '#E53935', '#43A047', '#1E88E5', '#FB8C00', '#8E24AA', '#3A416F', '#5A6178'].map(color => (
                    <button key={color} type="button" className={`color-preset ${textColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => setTextColor(color)} />
                  ))}
                </div>
                <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="toolbar-color-input" />
                <button type="button" className="color-apply-btn" onClick={applyColor}>Uygula</button>
              </div>
            )}
          </div>
          <div className="toolbar-color-wrapper">
            <button type="button" className="toolbar-btn" onClick={() => { closeAllDropdowns(); setShowBgColorPicker(!showBgColorPicker) }} title="Arka Plan Rengi">
              <svg width="14" height="14" viewBox="0 0 24 24" fill={bgColor} stroke="currentColor" strokeWidth="2">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
            {showBgColorPicker && (
              <div className="color-picker-dropdown">
                <label className="dropdown-label">Arka Plan</label>
                <div className="color-presets">
                  {['#FFFF00', '#00FF00', '#00FFFF', '#FF69B4', '#FFA500', '#E8E9ED', '#FFE0B2', '#C8E6C9'].map(color => (
                    <button key={color} type="button" className={`color-preset ${bgColor === color ? 'active' : ''}`} style={{ backgroundColor: color }} onClick={() => setBgColor(color)} />
                  ))}
                </div>
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="toolbar-color-input" />
                <button type="button" className="color-apply-btn" onClick={applyBgColor}>Uygula</button>
              </div>
            )}
          </div>
        </div>
        <div className="toolbar-divider"></div>
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn toolbar-btn-text" onClick={insertLineBreak} title="Satir Sonu">Satir</button>
          <button type="button" className="toolbar-btn toolbar-btn-text" onClick={insertParagraph} title="Paragraf Boslugu">Paragraf</button>
          <button type="button" className="toolbar-btn toolbar-btn-text" onClick={insertHorizontalRule} title="Yatay Cizgi">Cizgi</button>
        </div>
        <div className="toolbar-divider"></div>
        <div className="toolbar-group toolbar-variable-group">
          <button type="button" className={`toolbar-btn toolbar-variable-btn ${showVariableDropdown ? 'active' : ''}`} onClick={() => { setShowVariableDropdown(!showVariableDropdown); setShowColorPicker(false) }} title="Degisken Ekle">
            <span className="variable-icon">{`{{x}}`}</span><span className="variable-text">Degisken</span><span className="dropdown-arrow">v</span>
          </button>
          {showVariableDropdown && (
            <div className="variable-dropdown">
              <div className="variable-dropdown-header">
                <span className="variable-dropdown-title">Degisken Ekle</span>
                <button type="button" className="variable-dropdown-close" onClick={() => { setShowVariableDropdown(false); setActiveCategory(null); setSearchTerm('') }} title="Kapat">x</button>
              </div>
              <div className="variable-search"><input type="text" placeholder="Degisken ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus /></div>
              {searchTerm && filteredVariables && (
                <div className="variable-list">
                  {filteredVariables.length > 0 ? filteredVariables.map((v, idx) => (
                    <button key={idx} type="button" className="variable-item" onClick={() => insertVariable(v.key)}>
                      <span className="var-icon">{v.categoryIcon}</span><span className="var-label">{v.label}</span><span className="var-example">{v.example}</span>
                    </button>
                  )) : <div className="variable-empty">Sonuc bulunamadi</div>}
                </div>
              )}
              {!searchTerm && (
                <div className="variable-categories">
                  {Object.entries(TEMPLATE_VARIABLES).map(([catKey, category]) => (
                    <div key={catKey} className="variable-category">
                      <button type="button" className={`category-header ${activeCategory === catKey ? 'active' : ''}`} onClick={() => setActiveCategory(activeCategory === catKey ? null : catKey)}>
                        <span className="cat-icon">{category.icon}</span><span className="cat-label">{category.label}</span><span className="cat-arrow">{activeCategory === catKey ? '^' : 'v'}</span>
                      </button>
                      {activeCategory === catKey && (
                        <div className="category-variables">
                          {category.variables.map((v, idx) => (
                            <button key={idx} type="button" className="variable-item" onClick={() => insertVariable(v.key)}>
                              <span className="var-label">{v.label}</span><span className="var-key">[[{v.key}]]</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <MonacoPropertyEditor
        value={value}
        onChange={onChange}
        language="html"
        height={128}
        path={editorPathRef.current}
        className="rich-text-monaco-editor"
        onMount={handleEditorMount}
        options={{
          suggestOnTriggerCharacters: true,
          quickSuggestions: false,
        }}
      />
      <div className="rich-text-help">Metni secip formatlama butonlarini kullanin. Degiskenler [[degisken_adi]] formatinda eklenir.</div>
      {showLinkModal && (
        <div className="link-modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="link-modal" onClick={(e) => e.stopPropagation()}>
            <h4>Link Ekle</h4>
            <div className="link-modal-field"><label>Link Metni</label><input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Gorunecek metin" className="property-input" /></div>
            <div className="link-modal-field"><label>URL</label><input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="property-input" /></div>
            <div className="link-modal-actions">
              <button type="button" className="link-modal-btn link-modal-cancel" onClick={() => setShowLinkModal(false)}>Iptal</button>
              <button type="button" className="link-modal-btn link-modal-insert" onClick={insertLink} disabled={!linkUrl}>Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
