import React, { useRef, useState } from 'react'
import { TEMPLATE_VARIABLES, formatVariable } from '../../config/templateVariables'
import { RichTextEditorProps, TemplateVariable } from '../../types'

interface ExtendedVariable extends TemplateVariable {
  categoryIcon: string
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
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

  const getSelection = () => {
    const textarea = textareaRef.current
    if (!textarea) return { start: 0, end: 0, text: '' }
    return { start: textarea.selectionStart, end: textarea.selectionEnd, text: value.substring(textarea.selectionStart, textarea.selectionEnd) }
  }

  const insertAtCursor = (before: string, after: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return
    const { start, end, text } = getSelection()
    const selectedText = text || defaultText
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newValue)
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const wrapSelection = (tag: string, attributes: string = '') => {
    const { start, end, text } = getSelection()
    if (text) {
      const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`
      const closeTag = `</${tag}>`
      const newValue = value.substring(0, start) + openTag + text + closeTag + value.substring(end)
      onChange(newValue)
    } else {
      const openTag = attributes ? `<${tag} ${attributes}>` : `<${tag}>`
      const closeTag = `</${tag}>`
      const placeholder = tag === 'a' ? 'link metni' : 'metin'
      insertAtCursor(openTag, closeTag, placeholder)
    }
  }

  const insertLineBreak = () => insertAtCursor('<br>\n')
  const insertParagraph = () => insertAtCursor('<br><br>\n')
  const insertHorizontalRule = () => insertAtCursor('<hr>\n')

  const openLinkModal = () => {
    const { text } = getSelection()
    setLinkText(text || '')
    setLinkUrl('')
    setShowLinkModal(true)
  }

  const insertLink = () => {
    if (linkUrl) {
      const linkHtml = `<a href="${linkUrl}" style="color: #007bff; text-decoration: underline;">${linkText || linkUrl}</a>`
      const textarea = textareaRef.current
      const { start, end } = getSelection()
      const newValue = value.substring(0, start) + linkHtml + value.substring(end)
      onChange(newValue)
      setShowLinkModal(false)
      setLinkUrl('')
      setLinkText('')
    }
  }

  const makeBold = () => wrapSelection('strong')
  const makeItalic = () => wrapSelection('em')
  const makeUnderline = () => wrapSelection('u')
  const makeStrikethrough = () => wrapSelection('s')

  const applyColor = () => {
    const { text } = getSelection()
    if (text) wrapSelection('span', `style="color: ${textColor}"`)
    setShowColorPicker(false)
  }

  const applyBgColor = () => {
    const { text } = getSelection()
    if (text) wrapSelection('span', `style="background-color: ${bgColor}; padding: 2px 4px;"`)
    setShowBgColorPicker(false)
  }

  const applyFontSize = () => {
    const { text } = getSelection()
    if (text) wrapSelection('span', `style="font-size: ${selectedFontSize}px"`)
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
          <button type="button" className="toolbar-btn" onClick={makeBold} title="Kalın"><strong>B</strong></button>
          <button type="button" className="toolbar-btn" onClick={makeItalic} title="İtalik"><em>I</em></button>
          <button type="button" className="toolbar-btn" onClick={makeUnderline} title="Altı Çizili"><u>U</u></button>
          <button type="button" className="toolbar-btn" onClick={makeStrikethrough} title="Üstü Çizili"><s>S</s></button>
        </div>
        <div className="toolbar-divider"></div>
        <div className="toolbar-group">
          <button type="button" className="toolbar-btn" onClick={openLinkModal} title="Link Ekle">🔗</button>
          <div className="toolbar-color-wrapper">
            <button type="button" className="toolbar-btn" onClick={() => { closeAllDropdowns(); setShowFontSizePicker(!showFontSizePicker) }} title="Yazı Boyutu">
              <span style={{ fontSize: '11px', fontWeight: 'bold' }}>A</span><span style={{ fontSize: '14px', fontWeight: 'bold' }}>A</span>
            </button>
            {showFontSizePicker && (
              <div className="color-picker-dropdown font-size-dropdown">
                <label className="dropdown-label">Yazı Boyutu (px)</label>
                <div className="font-size-grid">
                  {fontSizeOptions.map(size => (
                    <button key={size} type="button" className={`font-size-option ${selectedFontSize === size ? 'active' : ''}`} onClick={() => setSelectedFontSize(size)}>{size}</button>
                  ))}
                </div>
                <input type="number" value={selectedFontSize} onChange={(e) => setSelectedFontSize(e.target.value)} className="font-size-input" min="8" max="72" placeholder="Özel" />
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
                <label className="dropdown-label">Arka Plan (Highlight)</label>
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
          <button type="button" className="toolbar-btn toolbar-btn-text" onClick={insertLineBreak} title="Satır Sonu">↵ Satır</button>
          <button type="button" className="toolbar-btn toolbar-btn-text" onClick={insertParagraph} title="Paragraf Boşluğu">¶ Paragraf</button>
          <button type="button" className="toolbar-btn toolbar-btn-text" onClick={insertHorizontalRule} title="Yatay Çizgi">― Çizgi</button>
        </div>
        <div className="toolbar-divider"></div>
        <div className="toolbar-group toolbar-variable-group">
          <button type="button" className={`toolbar-btn toolbar-variable-btn ${showVariableDropdown ? 'active' : ''}`} onClick={() => { setShowVariableDropdown(!showVariableDropdown); setShowColorPicker(false) }} title="Değişken Ekle">
            <span className="variable-icon">{`{{x}}`}</span><span className="variable-text">Değişken</span><span className="dropdown-arrow">▼</span>
          </button>
          {showVariableDropdown && (
            <div className="variable-dropdown">
              <div className="variable-dropdown-header">
                <span className="variable-dropdown-title">📝 Değişken Ekle</span>
                <button type="button" className="variable-dropdown-close" onClick={() => { setShowVariableDropdown(false); setActiveCategory(null); setSearchTerm('') }} title="Kapat">✕</button>
              </div>
              <div className="variable-search"><input type="text" placeholder="Değişken ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} autoFocus /></div>
              {searchTerm && filteredVariables && (
                <div className="variable-list">
                  {filteredVariables.length > 0 ? filteredVariables.map((v, idx) => (
                    <button key={idx} type="button" className="variable-item" onClick={() => insertVariable(v.key)}>
                      <span className="var-icon">{v.categoryIcon}</span><span className="var-label">{v.label}</span><span className="var-example">{v.example}</span>
                    </button>
                  )) : <div className="variable-empty">Sonuç bulunamadı</div>}
                </div>
              )}
              {!searchTerm && (
                <div className="variable-categories">
                  {Object.entries(TEMPLATE_VARIABLES).map(([catKey, category]) => (
                    <div key={catKey} className="variable-category">
                      <button type="button" className={`category-header ${activeCategory === catKey ? 'active' : ''}`} onClick={() => setActiveCategory(activeCategory === catKey ? null : catKey)}>
                        <span className="cat-icon">{category.icon}</span><span className="cat-label">{category.label}</span><span className="cat-arrow">{activeCategory === catKey ? '▲' : '▼'}</span>
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
      <textarea ref={textareaRef} value={value} onChange={(e) => onChange(e.target.value)} rows={6} className="property-input property-textarea rich-textarea" placeholder="Metninizi buraya yazın... Değişkenler için [[değişken_adı]] formatını kullanın." />
      <div className="rich-text-help">💡 Metni seçip formatlama butonlarına tıklayın | Değişkenler [[değişken_adı]] formatında eklenir</div>
      {showLinkModal && (
        <div className="link-modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="link-modal" onClick={(e) => e.stopPropagation()}>
            <h4>🔗 Link Ekle</h4>
            <div className="link-modal-field"><label>Link Metni</label><input type="text" value={linkText} onChange={(e) => setLinkText(e.target.value)} placeholder="Görünecek metin" className="property-input" /></div>
            <div className="link-modal-field"><label>URL</label><input type="text" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="property-input" /></div>
            <div className="link-modal-actions">
              <button type="button" className="link-modal-btn link-modal-cancel" onClick={() => setShowLinkModal(false)}>İptal</button>
              <button type="button" className="link-modal-btn link-modal-insert" onClick={insertLink} disabled={!linkUrl}>Ekle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RichTextEditor
