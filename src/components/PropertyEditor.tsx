import React, { useRef, useState, ChangeEvent, RefObject } from 'react'
import { ELEMENT_TYPES, ICONS } from '../config/elementTypes'
import { TEMPLATE_VARIABLES, formatVariable } from '../config/templateVariables'
import { PropertyEditorProps, RichTextEditorProps, SpacingInputProps, SpacingValues, CanvasElement, TemplateVariable } from '../types'
import './PropertyEditor.css'

interface ExtendedVariable extends TemplateVariable {
  categoryIcon: string
}

// Değişken Seçici Bileşeni
interface VariableSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filterCategories?: string[]  // Sadece belirli kategorileri göster
}

const VariableSelector: React.FC<VariableSelectorProps> = ({ value, onChange, placeholder, filterCategories }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredCategories = filterCategories 
    ? Object.entries(TEMPLATE_VARIABLES).filter(([key]) => filterCategories.includes(key))
    : Object.entries(TEMPLATE_VARIABLES)

  const selectVariable = (variableKey: string) => {
    onChange(variableKey)
    setIsOpen(false)
    setActiveCategory(null)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="property-input"
          placeholder={placeholder || 'item.name'}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '6px 10px',
            background: isOpen ? '#1976d2' : '#e3f2fd',
            color: isOpen ? 'white' : '#1976d2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s'
          }}
          title="Değişken Seç"
        >
          📋
        </button>
      </div>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '300px',
          overflow: 'hidden'
        }}>
          {/* Kategori listesi */}
          {!activeCategory && (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredCategories.map(([catKey, category]) => (
                <div
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '16px' }}>{category.icon}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{category.label}</span>
                  <span style={{ color: '#9e9e9e' }}>→</span>
                </div>
              ))}
            </div>
          )}
          
          {/* Değişken listesi */}
          {activeCategory && (
            <div>
              <div
                onClick={() => setActiveCategory(null)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5'
                }}
              >
                <span>←</span>
                <span style={{ fontWeight: 500 }}>{TEMPLATE_VARIABLES[activeCategory]?.label}</span>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {TEMPLATE_VARIABLES[activeCategory]?.variables.map((variable) => (
                  <div
                    key={variable.key}
                    onClick={() => selectVariable(variable.key)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#e3f2fd'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '2px' }}>{variable.label}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      <code style={{ 
                        backgroundColor: '#f5f5f5', 
                        padding: '2px 6px', 
                        borderRadius: '3px',
                        marginRight: '8px'
                      }}>
                        [[{variable.key}]]
                      </code>
                      <span style={{ color: '#9e9e9e' }}>Örn: {variable.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Zengin Metin Editörü Komponenti (Değişken desteği ile)
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
      category.variables.forEach(v => {
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
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
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

// 4 yönlü boşluk düzenleyici komponenti
const SpacingInput: React.FC<SpacingInputProps> = ({ label, values, onChange, icon }) => {
  const handleValueChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const numValue = parseInt(value) || 0
    onChange(side, Math.max(0, numValue))
  }

  const increment = (side: 'top' | 'right' | 'bottom' | 'left') => {
    const currentValue = values[side] || 0
    onChange(side, currentValue + 1)
  }

  const decrement = (side: 'top' | 'right' | 'bottom' | 'left') => {
    const currentValue = values[side] || 0
    onChange(side, Math.max(0, currentValue - 1))
  }

  return (
    <div className="spacing-input-container">
      <label className="property-label">{icon} {label}</label>
      <div className="spacing-input-grid">
        <div className="spacing-input-top">
          <div className="spacing-input-item">
            <span className="spacing-label">Üst</span>
            <div className="spacing-input-wrapper">
              <button type="button" className="spacing-btn spacing-btn-down" onClick={() => decrement('top')}>▼</button>
              <input type="number" value={values.top || 0} onChange={(e) => handleValueChange('top', e.target.value)} className="spacing-input" min="0" />
              <button type="button" className="spacing-btn spacing-btn-up" onClick={() => increment('top')}>▲</button>
            </div>
          </div>
        </div>
        <div className="spacing-input-middle">
          <div className="spacing-input-item">
            <span className="spacing-label">Sol</span>
            <div className="spacing-input-wrapper">
              <button type="button" className="spacing-btn spacing-btn-down" onClick={() => decrement('left')}>▼</button>
              <input type="number" value={values.left || 0} onChange={(e) => handleValueChange('left', e.target.value)} className="spacing-input" min="0" />
              <button type="button" className="spacing-btn spacing-btn-up" onClick={() => increment('left')}>▲</button>
            </div>
          </div>
          <div className="spacing-preview-box"><div className="spacing-preview-inner"></div></div>
          <div className="spacing-input-item">
            <span className="spacing-label">Sağ</span>
            <div className="spacing-input-wrapper">
              <button type="button" className="spacing-btn spacing-btn-down" onClick={() => decrement('right')}>▼</button>
              <input type="number" value={values.right || 0} onChange={(e) => handleValueChange('right', e.target.value)} className="spacing-input" min="0" />
              <button type="button" className="spacing-btn spacing-btn-up" onClick={() => increment('right')}>▲</button>
            </div>
          </div>
        </div>
        <div className="spacing-input-bottom">
          <div className="spacing-input-item">
            <span className="spacing-label">Alt</span>
            <div className="spacing-input-wrapper">
              <button type="button" className="spacing-btn spacing-btn-down" onClick={() => decrement('bottom')}>▼</button>
              <input type="number" value={values.bottom || 0} onChange={(e) => handleValueChange('bottom', e.target.value)} className="spacing-input" min="0" />
              <button type="button" className="spacing-btn spacing-btn-up" onClick={() => increment('bottom')}>▲</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const EmptyPropertyIcon: React.FC = () => (
  <svg className="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"/>
    <circle cx="12" cy="12" r="4"/>
  </svg>
)

const PropertyEditor: React.FC<PropertyEditorProps> = ({ element, onUpdateElement }) => {
  if (!element) {
    return (
      <div className="property-editor">
        <div className="property-editor-empty">
          <EmptyPropertyIcon />
          <h3>Özellik Paneli</h3>
          <p>Düzenlemek için bir element seçin</p>
        </div>
      </div>
    )
  }

  const handleChange = (propName: string, value: unknown) => {
    onUpdateElement(element.id, { [propName]: value })
  }

  const handleColumnChange = (index: number, field: string, value: unknown) => {
    const columns = element.props.columns as Array<Record<string, unknown>>
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    handleChange('columns', newColumns)
  }

  const addColumn = () => {
    const columns = (element.props.columns || []) as Array<Record<string, unknown>>
    const newColumns = [...columns, {
      width: '100%', type: 'text', content: 'Yeni Kolon', fontSize: 16, fontWeight: 'normal', fontFamily: 'Arial, sans-serif',
      color: '#000000', textAlign: 'left', lineHeight: 1.5, backgroundColor: 'transparent',
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0, marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
      borderTop: '', borderBottom: '', borderLeft: '', borderRight: '',
      src: 'https://via.placeholder.com/300x200', alt: 'Resim', imgWidth: 300, imgHeight: '', imgKeepAspectRatio: true, imgAlign: 'center', imgBackgroundColor: 'transparent',
      imgPaddingTop: 0, imgPaddingRight: 0, imgPaddingBottom: 0, imgPaddingLeft: 0, imgMarginTop: 0, imgMarginRight: 0, imgMarginBottom: 0, imgMarginLeft: 0,
      btnText: 'Buton', btnLink: '#', btnBg: '#007bff', btnColor: '#ffffff', btnFontSize: 16, btnBorderRadius: 4, btnPadding: '12px 24px'
    }]
    handleChange('columns', newColumns)
  }

  const removeColumn = (index: number) => {
    const columns = element.props.columns as Array<Record<string, unknown>>
    const newColumns = columns.filter((_: unknown, i: number) => i !== index)
    handleChange('columns', newColumns)
  }

  const getInputType = (propName: string, propValue: unknown): string => {
    if (propName === 'columns') return 'custom'
    if (propName === 'content') return 'textarea'
    if (propName === 'leftContent') return 'textarea'
    if (propName === 'rightContent') return 'textarea'
    if (propName === 'style') return 'skip'
    if (propName === 'keepAspectRatio') return 'checkbox'
    if (propName.toLowerCase().includes('color')) return 'color'
    if (typeof propValue === 'number') return 'number'
    if (propName === 'as') return 'select'
    if (propName === 'fontWeight') return 'select'
    if (propName === 'textAlign') return 'select'
    if (propName === 'align') return 'select'
    if (propName === 'textDecoration') return 'select'
    return 'text'
  }

  const getSelectOptions = (propName: string): { value: string; label: string }[] => {
    switch (propName) {
      case 'align': return [{ value: 'left', label: 'Sol' }, { value: 'center', label: 'Orta' }, { value: 'right', label: 'Sağ' }]
      case 'as': return [{ value: 'h1', label: 'H1' }, { value: 'h2', label: 'H2' }, { value: 'h3', label: 'H3' }, { value: 'h4', label: 'H4' }, { value: 'h5', label: 'H5' }, { value: 'h6', label: 'H6' }]
      case 'fontWeight': return [{ value: 'normal', label: 'Normal' }, { value: 'bold', label: 'Kalın' }, { value: '100', label: 'İnce' }, { value: '300', label: 'Hafif' }, { value: '500', label: 'Orta' }, { value: '600', label: 'Yarı Kalın' }, { value: '700', label: 'Kalın (700)' }, { value: '900', label: 'Ekstra Kalın' }]
      case 'textAlign': return [{ value: 'left', label: 'Sol' }, { value: 'center', label: 'Orta' }, { value: 'right', label: 'Sağ' }, { value: 'justify', label: 'İki Yana' }]
      case 'textDecoration': return [{ value: 'none', label: 'Yok' }, { value: 'underline', label: 'Alt Çizgi' }, { value: 'line-through', label: 'Üstü Çizili' }]
      case 'leftType': case 'rightType': return [{ value: 'text', label: 'Metin' }, { value: 'image', label: 'Resim' }, { value: 'button', label: 'Buton' }]
      default: return []
    }
  }

  const formatPropName = (propName: string): string => {
    const translations: Record<string, string> = {
      content: 'İçerik', as: 'Başlık Tipi', fontSize: 'Font Boyutu', fontWeight: 'Font Kalınlığı', fontFamily: 'Font Ailesi',
      color: 'Renk', backgroundColor: 'Arkaplan Rengi', padding: 'İç Boşluk', margin: 'Dış Boşluk', textAlign: 'Hizalama',
      lineHeight: 'Satır Yüksekliği', borderColor: 'Kenarlık Rengi', borderRadius: 'Köşe Yuvarlaklığı', width: 'Genişlik',
      height: 'Yükseklik', keepAspectRatio: 'En/Boy Oranını Koru', src: 'Resim URL', alt: 'Alternatif Metin', text: 'Metin',
      href: 'Link URL', textDecoration: 'Metin Dekorasyonu', columns: 'Kolonlar', facebook: 'Facebook Linki',
      twitter: 'X (Twitter) Linki', instagram: 'Instagram Linki', linkedin: 'LinkedIn Linki', youtube: 'YouTube Linki',
      iconSize: 'İkon Boyutu', align: 'Hizalama', gap: 'Boşluk', style: 'Özel Stiller'
    }
    return translations[propName] || propName
  }

  const renderPropertyInput = (propName: string, propValue: unknown): React.ReactNode => {
    if (propName === 'columns') {
      const columns = propValue as Array<Record<string, unknown>>
      return (
        <div className="columns-editor">
          {columns.map((col, index) => (
            <div key={index} className="column-item" style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px', borderRadius: '4px' }}>
              <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>Kolon {index + 1}</h4>
                <button onClick={() => removeColumn(index)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer' }}>Sil</button>
              </div>
              <div className="property-item">
                <label className="property-label">Tip</label>
                <select value={(col.type as string) || 'text'} onChange={(e) => handleColumnChange(index, 'type', e.target.value)} className="property-input property-select">
                  <option value="text">Metin</option><option value="image">Resim</option><option value="button">Buton</option>
                </select>
              </div>
              <div className="property-item">
                <label className="property-label">Genişlik</label>
                <input type="text" value={col.width as string} onChange={(e) => handleColumnChange(index, 'width', e.target.value)} className="property-input" />
              </div>
              {(!col.type || col.type === 'text') && (
                <>
                  <div className="property-item"><label className="property-label">İçerik</label><RichTextEditor value={(col.content as string) || ''} onChange={(newContent) => handleColumnChange(index, 'content', newContent)} /></div>
                  <div className="property-item"><label className="property-label">Font Boyutu</label><input type="number" value={(col.fontSize as number) || 16} onChange={(e) => handleColumnChange(index, 'fontSize', parseInt(e.target.value) || 16)} className="property-input" /></div>
                  <div className="property-item"><label className="property-label">Font Kalınlığı</label><select value={(col.fontWeight as string) || 'normal'} onChange={(e) => handleColumnChange(index, 'fontWeight', e.target.value)} className="property-input property-select"><option value="normal">Normal</option><option value="bold">Kalın</option></select></div>
                  <div className="property-item"><label className="property-label">Yazı Rengi</label><div className="color-input-wrapper"><input type="color" value={(col.color as string) || '#000000'} onChange={(e) => handleColumnChange(index, 'color', e.target.value)} className="property-color-input" /><input type="text" value={(col.color as string) || '#000000'} onChange={(e) => handleColumnChange(index, 'color', e.target.value)} className="property-input property-color-text" /></div></div>
                  <div className="property-item"><label className="property-label">Hizalama</label><select value={(col.textAlign as string) || 'left'} onChange={(e) => handleColumnChange(index, 'textAlign', e.target.value)} className="property-input property-select"><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option></select></div>
                  <SpacingInput label="İç Boşluk" icon="📦" values={{ top: (col.paddingTop as number) || 0, right: (col.paddingRight as number) || 0, bottom: (col.paddingBottom as number) || 0, left: (col.paddingLeft as number) || 0 }} onChange={(side, value) => handleColumnChange(index, `padding${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
                  <SpacingInput label="Dış Boşluk" icon="↔️" values={{ top: (col.marginTop as number) || 0, right: (col.marginRight as number) || 0, bottom: (col.marginBottom as number) || 0, left: (col.marginLeft as number) || 0 }} onChange={(side, value) => handleColumnChange(index, `margin${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
                </>
              )}
              {col.type === 'image' && (
                <>
                  <div className="property-item"><label className="property-label">Resim URL</label><input type="text" value={col.src as string} onChange={(e) => handleColumnChange(index, 'src', e.target.value)} className="property-input" /></div>
                  <div className="property-item"><label className="property-label">Alt Metin</label><input type="text" value={col.alt as string} onChange={(e) => handleColumnChange(index, 'alt', e.target.value)} className="property-input" /></div>
                  <div className="property-item"><label className="property-label">Yükseklik</label><input type="number" value={(col.imgHeight as number) || ''} onChange={(e) => handleColumnChange(index, 'imgHeight', e.target.value ? parseInt(e.target.value) : '')} className="property-input" /></div>
                  <div className="property-item"><label className="property-label">Hizalama</label><select value={(col.imgAlign as string) || 'center'} onChange={(e) => handleColumnChange(index, 'imgAlign', e.target.value)} className="property-input property-select"><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option></select></div>
                </>
              )}
              {col.type === 'button' && (
                <>
                  <div className="property-item"><label className="property-label">Buton Metni</label><input type="text" value={col.btnText as string} onChange={(e) => handleColumnChange(index, 'btnText', e.target.value)} className="property-input" /></div>
                  <div className="property-item"><label className="property-label">Link</label><input type="text" value={col.btnLink as string} onChange={(e) => handleColumnChange(index, 'btnLink', e.target.value)} className="property-input" /></div>
                  <div className="property-item"><label className="property-label">Arkaplan</label><div className="color-input-wrapper"><input type="color" value={(col.btnBg as string) || '#007bff'} onChange={(e) => handleColumnChange(index, 'btnBg', e.target.value)} className="property-color-input" /><input type="text" value={(col.btnBg as string) || '#007bff'} onChange={(e) => handleColumnChange(index, 'btnBg', e.target.value)} className="property-input property-color-text" /></div></div>
                  <div className="property-item"><label className="property-label">Yazı Rengi</label><div className="color-input-wrapper"><input type="color" value={(col.btnColor as string) || '#ffffff'} onChange={(e) => handleColumnChange(index, 'btnColor', e.target.value)} className="property-color-input" /><input type="text" value={(col.btnColor as string) || '#ffffff'} onChange={(e) => handleColumnChange(index, 'btnColor', e.target.value)} className="property-input property-color-text" /></div></div>
                </>
              )}
            </div>
          ))}
          <button onClick={addColumn} style={{ width: '100%', padding: '8px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Kolon Ekle</button>
        </div>
      )
    }

    const inputType = getInputType(propName, propValue)
    switch (inputType) {
      case 'skip': return null
      case 'textarea': return <textarea value={propValue as string} onChange={(e) => handleChange(propName, e.target.value)} rows={4} className="property-input property-textarea" />
      case 'number': return <input type="number" value={propValue as number} onChange={(e) => handleChange(propName, parseFloat(e.target.value) || 0)} className="property-input" />
      case 'checkbox': return <input type="checkbox" checked={propValue as boolean} onChange={(e) => handleChange(propName, e.target.checked)} className="property-checkbox" />
      case 'color': return <div className="color-input-wrapper"><input type="color" value={propValue as string} onChange={(e) => handleChange(propName, e.target.value)} className="property-color-input" /><input type="text" value={propValue as string} onChange={(e) => handleChange(propName, e.target.value)} className="property-input property-color-text" /></div>
      case 'select':
        const options = getSelectOptions(propName)
        return <select value={propValue as string} onChange={(e) => handleChange(propName, e.target.value)} className="property-input property-select">{options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
      default: return <input type="text" value={propValue as string} onChange={(e) => handleChange(propName, e.target.value)} className="property-input" />
    }
  }

  const renderTextElementProperties = () => (
    <>
      <div className="property-item"><label className="property-label">İçerik</label><RichTextEditor value={(element.props.content as string) || ''} onChange={(newContent) => handleChange('content', newContent)} /></div>
      <div className="property-item"><label className="property-label">Font Boyutu</label><input type="number" value={(element.props.fontSize as number) || 16} onChange={(e) => handleChange('fontSize', parseInt(e.target.value) || 16)} className="property-input" /></div>
      <div className="property-item"><label className="property-label">Font Kalınlığı</label><select value={(element.props.fontWeight as string) || 'normal'} onChange={(e) => handleChange('fontWeight', e.target.value)} className="property-input property-select"><option value="normal">Normal</option><option value="bold">Kalın</option></select></div>
      <div className="property-item"><label className="property-label">Font Ailesi</label><input type="text" value={(element.props.fontFamily as string) || 'Arial, sans-serif'} onChange={(e) => handleChange('fontFamily', e.target.value)} className="property-input" /></div>
      <div className="property-item"><label className="property-label">Yazı Rengi</label><div className="color-input-wrapper"><input type="color" value={(element.props.color as string) || '#000000'} onChange={(e) => handleChange('color', e.target.value)} className="property-color-input" /><input type="text" value={(element.props.color as string) || '#000000'} onChange={(e) => handleChange('color', e.target.value)} className="property-input property-color-text" /></div></div>
      <div className="property-item"><label className="property-label">Arkaplan Rengi</label><div className="color-input-wrapper"><input type="color" value={(element.props.backgroundColor as string) === 'transparent' ? '#ffffff' : ((element.props.backgroundColor as string) || '#ffffff')} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="property-color-input" /><input type="text" value={(element.props.backgroundColor as string) || 'transparent'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="property-input property-color-text" placeholder="transparent" /></div></div>
      <div className="property-item"><label className="property-label">Hizalama</label><select value={(element.props.textAlign as string) || 'left'} onChange={(e) => handleChange('textAlign', e.target.value)} className="property-input property-select"><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option><option value="justify">İki Yana</option></select></div>
      <div className="property-item"><label className="property-label">Satır Yüksekliği</label><input type="number" step="0.1" value={(element.props.lineHeight as number) || 1.5} onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value) || 1.5)} className="property-input" /></div>
      <SpacingInput label="İç Boşluk (Padding)" icon="📦" values={{ top: (element.props.paddingTop as number) || 0, right: (element.props.paddingRight as number) || 0, bottom: (element.props.paddingBottom as number) || 0, left: (element.props.paddingLeft as number) || 0 }} onChange={(side, value) => handleChange(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
      <SpacingInput label="Dış Boşluk (Margin)" icon="↔️" values={{ top: (element.props.marginTop as number) || 0, right: (element.props.marginRight as number) || 0, bottom: (element.props.marginBottom as number) || 0, left: (element.props.marginLeft as number) || 0 }} onChange={(side, value) => handleChange(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
    </>
  )

  const [showUrlVariableDropdown, setShowUrlVariableDropdown] = useState(false)
  const [showLinkUrlVariableDropdown, setShowLinkUrlVariableDropdown] = useState(false)

  const insertUrlVariable = (variableKey: string) => {
    handleChange('src', formatVariable(variableKey))
    setShowUrlVariableDropdown(false)
  }

  const insertLinkUrlVariable = (variableKey: string) => {
    handleChange('linkUrl', formatVariable(variableKey))
    setShowLinkUrlVariableDropdown(false)
  }

  // URL değişkenleri için filtreleme (logo ve link değişkenleri)
  const getUrlVariables = () => {
    const urlVars: Array<{ key: string; label: string; example: string; categoryIcon: string }> = []
    Object.entries(TEMPLATE_VARIABLES).forEach(([_catKey, category]) => {
      category.variables.forEach(v => {
        if (v.key.toLowerCase().includes('url') || v.key.toLowerCase().includes('logo') || v.key.toLowerCase().includes('link') || v.key.toLowerCase().includes('web')) {
          urlVars.push({ ...v, categoryIcon: category.icon })
        }
      })
    })
    return urlVars
  }

  const renderImageElementProperties = () => (
    <>
      <div className="property-item">
        <label className="property-label">Resim URL</label>
        <div className="url-input-with-variable">
          <input type="text" value={(element.props.src as string) || ''} onChange={(e) => handleChange('src', e.target.value)} className="property-input url-input" placeholder="https://example.com/image.jpg" />
          <div className="url-variable-wrapper">
            <button type="button" className={`url-variable-btn ${showUrlVariableDropdown ? 'active' : ''}`} onClick={() => setShowUrlVariableDropdown(!showUrlVariableDropdown)} title="Değişken Seç">
              <span className="variable-icon">{`{{x}}`}</span>
            </button>
            {showUrlVariableDropdown && (
              <div className="url-variable-dropdown">
                <div className="url-variable-header">
                  <span>🔗 URL Değişkeni Seç</span>
                  <button type="button" className="url-variable-close" onClick={() => setShowUrlVariableDropdown(false)}>✕</button>
                </div>
                <div className="url-variable-list">
                  {getUrlVariables().map((v, idx) => (
                    <button key={idx} type="button" className="url-variable-item" onClick={() => insertUrlVariable(v.key)}>
                      <span className="var-icon">{v.categoryIcon}</span>
                      <span className="var-label">{v.label}</span>
                      <span className="var-key">[[{v.key}]]</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="property-item"><label className="property-label">Alternatif Metin</label><input type="text" value={(element.props.alt as string) || ''} onChange={(e) => handleChange('alt', e.target.value)} className="property-input" placeholder="Resim açıklaması" /></div>
      <div className="property-item"><label className="property-label">Genişlik (px)</label><input type="number" value={(element.props.width as number) || 600} onChange={(e) => handleChange('width', parseInt(e.target.value) || 600)} className="property-input" disabled={element.props.keepAspectRatio as boolean} /></div>
      <div className="property-item"><label className="property-label">Yükseklik (px)</label><input type="number" value={(element.props.height as number) || 300} onChange={(e) => handleChange('height', parseInt(e.target.value) || 300)} className="property-input" /></div>
      <div className="property-item"><label className="property-label">En/Boy Oranını Koru</label><input type="checkbox" checked={(element.props.keepAspectRatio as boolean) !== false} onChange={(e) => handleChange('keepAspectRatio', e.target.checked)} className="property-checkbox" /></div>
      <div className="property-item"><label className="property-label">Hizalama</label><select value={(element.props.textAlign as string) || 'center'} onChange={(e) => handleChange('textAlign', e.target.value)} className="property-input property-select"><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option></select></div>
      <div className="property-item"><label className="property-label">Arkaplan Rengi</label><div className="color-input-wrapper"><input type="color" value={(element.props.backgroundColor as string) === 'transparent' ? '#ffffff' : ((element.props.backgroundColor as string) || '#ffffff')} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="property-color-input" /><input type="text" value={(element.props.backgroundColor as string) || 'transparent'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="property-input property-color-text" placeholder="transparent" /></div></div>
      
      {/* Linkli Resim Bölümü */}
      <div className="property-section-divider">
        <span className="divider-icon">🔗</span>
        <span className="divider-text">Linkli Resim</span>
      </div>
      <div className="property-item">
        <label className="property-label">Linkli Resim</label>
        <div className="checkbox-with-label">
          <input type="checkbox" checked={(element.props.isLinked as boolean) || false} onChange={(e) => handleChange('isLinked', e.target.checked)} className="property-checkbox" />
          <span className="checkbox-description">Resme tıklandığında linke yönlendir</span>
        </div>
      </div>
      {(element.props.isLinked as boolean) && (
        <div className="property-item">
          <label className="property-label">Link URL</label>
          <div className="url-input-with-variable">
            <input type="text" value={(element.props.linkUrl as string) || ''} onChange={(e) => handleChange('linkUrl', e.target.value)} className="property-input url-input" placeholder="https://example.com" />
            <div className="url-variable-wrapper">
              <button type="button" className={`url-variable-btn ${showLinkUrlVariableDropdown ? 'active' : ''}`} onClick={() => setShowLinkUrlVariableDropdown(!showLinkUrlVariableDropdown)} title="Değişken Seç">
                <span className="variable-icon">{`{{x}}`}</span>
              </button>
              {showLinkUrlVariableDropdown && (
                <div className="url-variable-dropdown">
                  <div className="url-variable-header">
                    <span>🔗 Link Değişkeni Seç</span>
                    <button type="button" className="url-variable-close" onClick={() => setShowLinkUrlVariableDropdown(false)}>✕</button>
                  </div>
                  <div className="url-variable-list">
                    {getUrlVariables().map((v, idx) => (
                      <button key={idx} type="button" className="url-variable-item" onClick={() => insertLinkUrlVariable(v.key)}>
                        <span className="var-icon">{v.categoryIcon}</span>
                        <span className="var-label">{v.label}</span>
                        <span className="var-key">[[{v.key}]]</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <SpacingInput label="İç Boşluk (Padding)" icon="📦" values={{ top: (element.props.paddingTop as number) || 0, right: (element.props.paddingRight as number) || 0, bottom: (element.props.paddingBottom as number) || 0, left: (element.props.paddingLeft as number) || 0 }} onChange={(side, value) => handleChange(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
      <SpacingInput label="Dış Boşluk (Margin)" icon="↔️" values={{ top: (element.props.marginTop as number) || 0, right: (element.props.marginRight as number) || 0, bottom: (element.props.marginBottom as number) || 0, left: (element.props.marginLeft as number) || 0 }} onChange={(side, value) => handleChange(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
    </>
  )

  // Product Row için kolon değişiklik fonksiyonu
  const handleProductColumnChange = (index: number, field: string, value: unknown) => {
    const columns = element.props.columns as Array<Record<string, unknown>>
    const newColumns = [...columns]
    newColumns[index] = { ...newColumns[index], [field]: value }
    handleChange('columns', newColumns)
  }

  const addProductColumn = () => {
    const columns = (element.props.columns || []) as Array<Record<string, unknown>>
    const newColumns = [...columns, {
      id: `col_${Date.now()}`,
      label: 'Yeni Kolon',
      variableKey: 'item.new_field',
      width: 'auto',
      type: 'text',
      fontSize: 14,
      fontWeight: 'normal',
      color: '#333333',
      textAlign: 'left',
      imgWidth: 60,
      imgHeight: 60
    }]
    handleChange('columns', newColumns)
  }

  const removeProductColumn = (index: number) => {
    const columns = element.props.columns as Array<Record<string, unknown>>
    const newColumns = columns.filter((_: unknown, i: number) => i !== index)
    handleChange('columns', newColumns)
  }

  // Product Row özellikleri düzenleme arayüzü
  const renderProductRowProperties = () => {
    const displayMode = (element.props.displayMode as string) || 'card'
    
    return (
    <>
      {/* Görünüm Modu Seçimi */}
      <div className="property-section-divider">
        <span className="divider-icon">🎨</span>
        <span className="divider-text">Görünüm Modu</span>
      </div>
      
      <div className="property-item">
        <label className="property-label">Görünüm Tipi</label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleChange('displayMode', 'card')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: displayMode === 'card' ? '2px solid #1976d2' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: displayMode === 'card' ? '#e3f2fd' : '#fff',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>🃏</div>
            <div style={{ fontSize: '12px', fontWeight: displayMode === 'card' ? 'bold' : 'normal' }}>Kart</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Resim + Bilgi yan yana</div>
          </button>
          <button
            type="button"
            onClick={() => handleChange('displayMode', 'table')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: displayMode === 'table' ? '2px solid #1976d2' : '1px solid #ddd',
              borderRadius: '8px',
              backgroundColor: displayMode === 'table' ? '#e3f2fd' : '#fff',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '4px' }}>📊</div>
            <div style={{ fontSize: '12px', fontWeight: displayMode === 'table' ? 'bold' : 'normal' }}>Tablo</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Kolonlu liste</div>
          </button>
        </div>
      </div>
      
      {/* Repeater Ayarları Bölümü */}
      <div className="property-section-divider">
        <span className="divider-icon">🔄</span>
        <span className="divider-text">Tekrarlama Ayarları</span>
      </div>
      
      <div className="property-info-box" style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '16px',
        fontSize: '12px',
        lineHeight: '1.6'
      }}>
        <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#1565c0' }}>
          ℹ️ Tekrarlanabilir Element
        </p>
        <p style={{ margin: 0, color: '#333' }}>
          Bu element, e-posta gönderilirken backend tarafından belirlenen <strong>repeatKey</strong> array'ine göre otomatik olarak çoğaltılır. 
          Her satır için <strong>repeatItemAlias</strong> kullanarak değişkenlere erişebilirsiniz.
        </p>
      </div>

      <div className="property-item">
        <label className="property-label">🔑 Array Key (repeatKey)</label>
        <input 
          type="text" 
          value={(element.props.repeatKey as string) || 'order_items'} 
          onChange={(e) => handleChange('repeatKey', e.target.value)} 
          className="property-input" 
          placeholder="order_items, products, cart_items"
        />
        <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
          Backend'den gelecek array adı (örn: order_items, products)
        </small>
      </div>

      <div className="property-item">
        <label className="property-label">📝 Item Alias (repeatItemAlias)</label>
        <input 
          type="text" 
          value={(element.props.repeatItemAlias as string) || 'item'} 
          onChange={(e) => handleChange('repeatItemAlias', e.target.value)} 
          className="property-input" 
          placeholder="item, product"
        />
        <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
          Kolonlarda kullanılacak alias (örn: item.name, item.price)
        </small>
      </div>

      {/* KART MODU AYARLARI */}
      {displayMode === 'card' && (
        <>
          <div className="property-section-divider">
            <span className="divider-icon">🖼️</span>
            <span className="divider-text">Ürün Resmi</span>
          </div>
          
          <div className="property-item">
            <label className="property-label">Resim Değişkeni</label>
            <VariableSelector
              value={(element.props.cardImgVariableKey as string) || 'item.image_url'}
              onChange={(val) => handleChange('cardImgVariableKey', val)}
              placeholder="item.image_url"
              filterCategories={['product_item']}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Genişlik (px)</label>
              <input type="number" value={(element.props.cardImgWidth as number) || 80} onChange={(e) => handleChange('cardImgWidth', parseInt(e.target.value) || 80)} className="property-input" />
            </div>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Yükseklik (px)</label>
              <input type="number" value={(element.props.cardImgHeight as number) || 80} onChange={(e) => handleChange('cardImgHeight', parseInt(e.target.value) || 80)} className="property-input" />
            </div>
          </div>
          
          <div className="property-item">
            <label className="property-label">Resim Köşe Yuvarlaklığı</label>
            <input type="number" value={(element.props.cardImgBorderRadius as number) || 4} onChange={(e) => handleChange('cardImgBorderRadius', parseInt(e.target.value) || 0)} className="property-input" />
          </div>

          <div className="property-section-divider">
            <span className="divider-icon">📝</span>
            <span className="divider-text">Ürün Başlığı</span>
          </div>
          
          <div className="property-item">
            <label className="property-label">Başlık Değişkeni</label>
            <VariableSelector
              value={(element.props.cardTitleVariableKey as string) || 'item.name'}
              onChange={(val) => handleChange('cardTitleVariableKey', val)}
              placeholder="item.name"
              filterCategories={['product_item']}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Font Boyutu</label>
              <input type="number" value={(element.props.cardTitleFontSize as number) || 14} onChange={(e) => handleChange('cardTitleFontSize', parseInt(e.target.value) || 14)} className="property-input" />
            </div>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Font Kalınlığı</label>
              <select value={(element.props.cardTitleFontWeight as string) || 'normal'} onChange={(e) => handleChange('cardTitleFontWeight', e.target.value)} className="property-input property-select">
                <option value="normal">Normal</option>
                <option value="bold">Kalın</option>
              </select>
            </div>
          </div>
          
          <div className="property-item">
            <label className="property-label">Başlık Rengi</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.cardTitleColor as string) || '#333333'} onChange={(e) => handleChange('cardTitleColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.cardTitleColor as string) || '#333333'} onChange={(e) => handleChange('cardTitleColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>

          <div className="property-section-divider">
            <span className="divider-icon">📄</span>
            <span className="divider-text">Alt Bilgi (Adet, Beden vb.)</span>
          </div>
          
          <div className="property-item">
            <label className="property-label">Alt Bilgi Değişkeni</label>
            <VariableSelector
              value={(element.props.cardSubtitleVariableKey as string) || 'item.details'}
              onChange={(val) => handleChange('cardSubtitleVariableKey', val)}
              placeholder="item.details"
              filterCategories={['product_item']}
            />
            <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
              Backend'de birleştirilmiş string: "Adet : 1 - Beden : L"
            </small>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Font Boyutu</label>
              <input type="number" value={(element.props.cardSubtitleFontSize as number) || 13} onChange={(e) => handleChange('cardSubtitleFontSize', parseInt(e.target.value) || 13)} className="property-input" />
            </div>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Renk</label>
              <div className="color-input-wrapper">
                <input type="color" value={(element.props.cardSubtitleColor as string) || '#666666'} onChange={(e) => handleChange('cardSubtitleColor', e.target.value)} className="property-color-input" />
                <input type="text" value={(element.props.cardSubtitleColor as string) || '#666666'} onChange={(e) => handleChange('cardSubtitleColor', e.target.value)} className="property-input property-color-text" />
              </div>
            </div>
          </div>

          <div className="property-section-divider">
            <span className="divider-icon">💰</span>
            <span className="divider-text">Fiyat</span>
          </div>
          
          <div className="property-item">
            <label className="property-label">Fiyat Değişkeni</label>
            <VariableSelector
              value={(element.props.cardPriceVariableKey as string) || 'item.price'}
              onChange={(val) => handleChange('cardPriceVariableKey', val)}
              placeholder="item.price"
              filterCategories={['product_item']}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Font Boyutu</label>
              <input type="number" value={(element.props.cardPriceFontSize as number) || 15} onChange={(e) => handleChange('cardPriceFontSize', parseInt(e.target.value) || 15)} className="property-input" />
            </div>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Font Kalınlığı</label>
              <select value={(element.props.cardPriceFontWeight as string) || 'bold'} onChange={(e) => handleChange('cardPriceFontWeight', e.target.value)} className="property-input property-select">
                <option value="normal">Normal</option>
                <option value="bold">Kalın</option>
              </select>
            </div>
          </div>
          
          <div className="property-item">
            <label className="property-label">Fiyat Rengi</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.cardPriceColor as string) || '#f57c00'} onChange={(e) => handleChange('cardPriceColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.cardPriceColor as string) || '#f57c00'} onChange={(e) => handleChange('cardPriceColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>

          <div className="property-section-divider">
            <span className="divider-icon">🎴</span>
            <span className="divider-text">Kart Stili</span>
          </div>
          
          <div className="property-item">
            <label className="property-label">Kart Arkaplan</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.cardBgColor as string) || '#ffffff'} onChange={(e) => handleChange('cardBgColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.cardBgColor as string) || '#ffffff'} onChange={(e) => handleChange('cardBgColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>
          
          <div className="property-item">
            <label className="property-label">Kenarlık Rengi</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.cardBorderColor as string) || '#eeeeee'} onChange={(e) => handleChange('cardBorderColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.cardBorderColor as string) || '#eeeeee'} onChange={(e) => handleChange('cardBorderColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">Köşe Yuvarlaklığı</label>
              <input type="number" value={(element.props.cardBorderRadius as number) || 8} onChange={(e) => handleChange('cardBorderRadius', parseInt(e.target.value) || 0)} className="property-input" />
            </div>
            <div className="property-item" style={{ flex: 1 }}>
              <label className="property-label">İç Boşluk</label>
              <input type="text" value={(element.props.cardPadding as string) || '12px'} onChange={(e) => handleChange('cardPadding', e.target.value)} className="property-input" placeholder="12px" />
            </div>
          </div>
          
          <div className="property-item">
            <label className="property-label">Gölge Efekti</label>
            <input 
              type="checkbox" 
              checked={(element.props.cardShadow as boolean) || false} 
              onChange={(e) => handleChange('cardShadow', e.target.checked)} 
              className="property-checkbox" 
            />
          </div>
        </>
      )}

      {/* TABLO MODU AYARLARI */}
      {displayMode === 'table' && (
        <>
          {/* Tablo Başlık Ayarları */}
          <div className="property-section-divider">
            <span className="divider-icon">📋</span>
            <span className="divider-text">Tablo Başlık Ayarları</span>
          </div>

          <div className="property-item">
            <label className="property-label">Başlık Göster</label>
            <input 
              type="checkbox" 
              checked={(element.props.showHeader as boolean) !== false} 
              onChange={(e) => handleChange('showHeader', e.target.checked)} 
              className="property-checkbox" 
            />
          </div>

          {(element.props.showHeader as boolean) !== false && (
            <>
              <div className="property-item">
                <label className="property-label">Başlık Arkaplan</label>
                <div className="color-input-wrapper">
                  <input type="color" value={(element.props.headerBgColor as string) || '#f8f9fa'} onChange={(e) => handleChange('headerBgColor', e.target.value)} className="property-color-input" />
                  <input type="text" value={(element.props.headerBgColor as string) || '#f8f9fa'} onChange={(e) => handleChange('headerBgColor', e.target.value)} className="property-input property-color-text" />
                </div>
              </div>
              <div className="property-item">
                <label className="property-label">Başlık Yazı Rengi</label>
                <div className="color-input-wrapper">
                  <input type="color" value={(element.props.headerTextColor as string) || '#333333'} onChange={(e) => handleChange('headerTextColor', e.target.value)} className="property-color-input" />
                  <input type="text" value={(element.props.headerTextColor as string) || '#333333'} onChange={(e) => handleChange('headerTextColor', e.target.value)} className="property-input property-color-text" />
                </div>
              </div>
              <div className="property-item">
                <label className="property-label">Başlık Font Boyutu</label>
                <input type="number" value={(element.props.headerFontSize as number) || 14} onChange={(e) => handleChange('headerFontSize', parseInt(e.target.value) || 14)} className="property-input" />
              </div>
            </>
          )}

          {/* Satır Stilleri */}
          <div className="property-section-divider">
            <span className="divider-icon">📊</span>
            <span className="divider-text">Satır Stilleri</span>
          </div>

          <div className="property-item">
            <label className="property-label">Satır Arkaplan</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.rowBgColor as string) || '#ffffff'} onChange={(e) => handleChange('rowBgColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.rowBgColor as string) || '#ffffff'} onChange={(e) => handleChange('rowBgColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>

          <div className="property-item">
            <label className="property-label">Alternatif Satır Arkaplan</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.rowAltBgColor as string) || '#f9f9f9'} onChange={(e) => handleChange('rowAltBgColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.rowAltBgColor as string) || '#f9f9f9'} onChange={(e) => handleChange('rowAltBgColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>

          <div className="property-item">
            <label className="property-label">Satır Kenarlık Rengi</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.rowBorderColor as string) || '#e0e0e0'} onChange={(e) => handleChange('rowBorderColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.rowBorderColor as string) || '#e0e0e0'} onChange={(e) => handleChange('rowBorderColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>

          {/* Kolonlar */}
          <div className="property-section-divider">
            <span className="divider-icon">📏</span>
            <span className="divider-text">Kolonlar</span>
          </div>

          <div className="columns-editor">
            {((element.props.columns || []) as Array<Record<string, unknown>>).map((col, index) => (
              <div key={index} className="column-item" style={{ 
            border: '1px solid #e0e0e0', 
            padding: '12px', 
            marginBottom: '12px', 
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <div className="column-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                {col.type === 'image' ? '🖼️' : col.type === 'price' ? '💰' : '📝'} Kolon {index + 1}: {col.label as string}
              </h4>
              <button onClick={() => removeProductColumn(index)} style={{ background: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Sil</button>
            </div>

            <div className="property-item">
              <label className="property-label">Başlık Etiketi</label>
              <input type="text" value={(col.label as string) || ''} onChange={(e) => handleProductColumnChange(index, 'label', e.target.value)} className="property-input" placeholder="Ürün Adı" />
            </div>

            <div className="property-item">
              <label className="property-label">Tip</label>
              <select value={(col.type as string) || 'text'} onChange={(e) => handleProductColumnChange(index, 'type', e.target.value)} className="property-input property-select">
                <option value="text">Metin</option>
                <option value="image">Resim</option>
                <option value="price">Fiyat</option>
              </select>
            </div>

            <div className="property-item">
              <label className="property-label">🔗 Değişken Anahtarı</label>
              <input 
                type="text" 
                value={(col.variableKey as string) || ''} 
                onChange={(e) => handleProductColumnChange(index, 'variableKey', e.target.value)} 
                className="property-input" 
                placeholder="item.name, item.price"
              />
              <small style={{ color: '#666', fontSize: '11px', display: 'block', marginTop: '4px' }}>
                Backend'den gelecek veri yolu (örn: item.name, item.quantity)
              </small>
            </div>

            <div className="property-item">
              <label className="property-label">Genişlik</label>
              <input type="text" value={(col.width as string) || 'auto'} onChange={(e) => handleProductColumnChange(index, 'width', e.target.value)} className="property-input" placeholder="100px, 20%, auto" />
            </div>

            <div className="property-item">
              <label className="property-label">Hizalama</label>
              <select value={(col.textAlign as string) || 'left'} onChange={(e) => handleProductColumnChange(index, 'textAlign', e.target.value)} className="property-input property-select">
                <option value="left">Sol</option>
                <option value="center">Orta</option>
                <option value="right">Sağ</option>
              </select>
            </div>

            {col.type !== 'image' && (
              <>
                <div className="property-item">
                  <label className="property-label">Font Boyutu</label>
                  <input type="number" value={(col.fontSize as number) || 14} onChange={(e) => handleProductColumnChange(index, 'fontSize', parseInt(e.target.value) || 14)} className="property-input" />
                </div>
                <div className="property-item">
                  <label className="property-label">Font Kalınlığı</label>
                  <select value={(col.fontWeight as string) || 'normal'} onChange={(e) => handleProductColumnChange(index, 'fontWeight', e.target.value)} className="property-input property-select">
                    <option value="normal">Normal</option>
                    <option value="bold">Kalın</option>
                  </select>
                </div>
                <div className="property-item">
                  <label className="property-label">Yazı Rengi</label>
                  <div className="color-input-wrapper">
                    <input type="color" value={(col.color as string) || '#333333'} onChange={(e) => handleProductColumnChange(index, 'color', e.target.value)} className="property-color-input" />
                    <input type="text" value={(col.color as string) || '#333333'} onChange={(e) => handleProductColumnChange(index, 'color', e.target.value)} className="property-input property-color-text" />
                  </div>
                </div>
              </>
            )}

            {col.type === 'image' && (
              <>
                <div className="property-item">
                  <label className="property-label">Resim Genişliği (px)</label>
                  <input type="number" value={(col.imgWidth as number) || 60} onChange={(e) => handleProductColumnChange(index, 'imgWidth', parseInt(e.target.value) || 60)} className="property-input" />
                </div>
                <div className="property-item">
                  <label className="property-label">Resim Yüksekliği (px)</label>
                  <input type="number" value={(col.imgHeight as number) || 60} onChange={(e) => handleProductColumnChange(index, 'imgHeight', parseInt(e.target.value) || 60)} className="property-input" />
                </div>
              </>
            )}
          </div>
        ))}
          <button onClick={addProductColumn} style={{ 
            width: '100%', 
            padding: '10px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            + Kolon Ekle
          </button>
          </div>

          {/* Genel Stiller */}
          <div className="property-section-divider">
            <span className="divider-icon">🎨</span>
            <span className="divider-text">Genel Stiller</span>
          </div>

          <div className="property-item">
            <label className="property-label">Tablo Genişliği</label>
            <input type="text" value={(element.props.tableWidth as string) || '100%'} onChange={(e) => handleChange('tableWidth', e.target.value)} className="property-input" placeholder="100%, 600px" />
          </div>

          <div className="property-item">
            <label className="property-label">Tablo Kenarlık Rengi</label>
            <div className="color-input-wrapper">
              <input type="color" value={(element.props.tableBorderColor as string) || '#e0e0e0'} onChange={(e) => handleChange('tableBorderColor', e.target.value)} className="property-color-input" />
              <input type="text" value={(element.props.tableBorderColor as string) || '#e0e0e0'} onChange={(e) => handleChange('tableBorderColor', e.target.value)} className="property-input property-color-text" />
            </div>
          </div>

          <div className="property-item">
            <label className="property-label">Köşe Yuvarlaklığı (px)</label>
            <input type="number" value={(element.props.borderRadius as number) || 4} onChange={(e) => handleChange('borderRadius', parseInt(e.target.value) || 0)} className="property-input" />
          </div>
        </>
      )}
    </>
  )
  }

  // ==================== INFO TABLE ====================
  const renderInfoTableProperties = () => {
    const rows = (element.props.rows as Array<Record<string, unknown>>) || []

    const handleRowChange = (rowIndex: number, field: string, value: unknown) => {
      const newRows = [...rows]
      newRows[rowIndex] = { ...newRows[rowIndex], [field]: value }
      handleChange('rows', newRows)
    }

    const addRow = () => {
      const newRows = [...rows, {
        id: `row_${Date.now()}`,
        label: 'Yeni Satır',
        valueKey: 'variable.key',
        labelStyle: 'normal',
        valueStyle: 'normal',
        valueColor: '#333333'
      }]
      handleChange('rows', newRows)
    }

    const removeRow = (rowIndex: number) => {
      const newRows = rows.filter((_, idx) => idx !== rowIndex)
      handleChange('rows', newRows)
    }

    const moveRow = (fromIndex: number, toIndex: number) => {
      if (toIndex < 0 || toIndex >= rows.length) return
      const newRows = [...rows]
      const [movedRow] = newRows.splice(fromIndex, 1)
      newRows.splice(toIndex, 0, movedRow)
      handleChange('rows', newRows)
    }

    return (
      <>
        {/* Başlık Ayarları */}
        <div className="property-section-divider">
          <span className="divider-icon">📋</span>
          <span className="divider-text">Başlık Ayarları</span>
        </div>

        <div className="property-item">
          <label className="property-label">Başlık Göster</label>
          <input 
            type="checkbox" 
            checked={(element.props.showTitle as boolean) !== false} 
            onChange={(e) => handleChange('showTitle', e.target.checked)} 
            className="property-checkbox" 
          />
        </div>

        {(element.props.showTitle as boolean) !== false && (
          <>
            <div className="property-item">
              <label className="property-label">Başlık Metni</label>
              <input 
                type="text" 
                value={(element.props.title as string) || 'Sipariş Özeti'} 
                onChange={(e) => handleChange('title', e.target.value)} 
                className="property-input" 
                placeholder="Sipariş Özeti"
              />
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <div className="property-item" style={{ flex: 1 }}>
                <label className="property-label">Font Boyutu</label>
                <input type="number" value={(element.props.titleFontSize as number) || 14} onChange={(e) => handleChange('titleFontSize', parseInt(e.target.value) || 14)} className="property-input" />
              </div>
              <div className="property-item" style={{ flex: 1 }}>
                <label className="property-label">Font Kalınlığı</label>
                <select value={(element.props.titleFontWeight as string) || 'bold'} onChange={(e) => handleChange('titleFontWeight', e.target.value)} className="property-input property-select">
                  <option value="normal">Normal</option>
                  <option value="bold">Kalın</option>
                </select>
              </div>
            </div>

            <div className="property-item">
              <label className="property-label">Başlık Rengi</label>
              <div className="color-input-wrapper">
                <input type="color" value={(element.props.titleColor as string) || '#333333'} onChange={(e) => handleChange('titleColor', e.target.value)} className="property-color-input" />
                <input type="text" value={(element.props.titleColor as string) || '#333333'} onChange={(e) => handleChange('titleColor', e.target.value)} className="property-input property-color-text" />
              </div>
            </div>
            
            <div className="property-item">
              <label className="property-label">Başlık Arkaplanı</label>
              <div className="color-input-wrapper">
                <input type="color" value={(element.props.titleBgColor as string) || '#f5f5f5'} onChange={(e) => handleChange('titleBgColor', e.target.value)} className="property-color-input" />
                <input type="text" value={(element.props.titleBgColor as string) || '#f5f5f5'} onChange={(e) => handleChange('titleBgColor', e.target.value)} className="property-input property-color-text" />
              </div>
            </div>
          </>
        )}

        {/* Tablo Stilleri */}
        <div className="property-section-divider">
          <span className="divider-icon">🎨</span>
          <span className="divider-text">Tablo Stilleri</span>
        </div>

        <div className="property-item">
          <label className="property-label">Tablo Arkaplanı</label>
          <div className="color-input-wrapper">
            <input type="color" value={(element.props.tableBgColor as string) || '#ffffff'} onChange={(e) => handleChange('tableBgColor', e.target.value)} className="property-color-input" />
            <input type="text" value={(element.props.tableBgColor as string) || '#ffffff'} onChange={(e) => handleChange('tableBgColor', e.target.value)} className="property-input property-color-text" />
          </div>
        </div>

        <div className="property-item">
          <label className="property-label">Kenarlık Rengi</label>
          <div className="color-input-wrapper">
            <input type="color" value={(element.props.tableBorderColor as string) || '#e0e0e0'} onChange={(e) => handleChange('tableBorderColor', e.target.value)} className="property-color-input" />
            <input type="text" value={(element.props.tableBorderColor as string) || '#e0e0e0'} onChange={(e) => handleChange('tableBorderColor', e.target.value)} className="property-input property-color-text" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Tablo Genişliği</label>
            <input type="text" value={(element.props.tableWidth as string) || '100%'} onChange={(e) => handleChange('tableWidth', e.target.value)} className="property-input" placeholder="100%" />
          </div>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Köşe Yuvarlaklığı</label>
            <input type="number" value={(element.props.tableBorderRadius as number) || 0} onChange={(e) => handleChange('tableBorderRadius', parseInt(e.target.value) || 0)} className="property-input" />
          </div>
        </div>

        {/* Kolon Ayarları */}
        <div className="property-section-divider">
          <span className="divider-icon">📊</span>
          <span className="divider-text">Kolon Ayarları</span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Etiket Genişliği</label>
            <input type="text" value={(element.props.labelWidth as string) || '50%'} onChange={(e) => handleChange('labelWidth', e.target.value)} className="property-input" placeholder="50%" />
          </div>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Değer Genişliği</label>
            <input type="text" value={(element.props.valueWidth as string) || '50%'} onChange={(e) => handleChange('valueWidth', e.target.value)} className="property-input" placeholder="50%" />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Etiket Hizalama</label>
            <select value={(element.props.labelAlign as string) || 'left'} onChange={(e) => handleChange('labelAlign', e.target.value)} className="property-input property-select">
              <option value="left">Sol</option>
              <option value="center">Orta</option>
              <option value="right">Sağ</option>
            </select>
          </div>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Değer Hizalama</label>
            <select value={(element.props.valueAlign as string) || 'right'} onChange={(e) => handleChange('valueAlign', e.target.value)} className="property-input property-select">
              <option value="left">Sol</option>
              <option value="center">Orta</option>
              <option value="right">Sağ</option>
            </select>
          </div>
        </div>

        <div className="property-item">
          <label className="property-label">Satır İç Boşluğu</label>
          <input type="text" value={(element.props.rowPadding as string) || '8px 16px'} onChange={(e) => handleChange('rowPadding', e.target.value)} className="property-input" placeholder="8px 16px" />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Etiket Font</label>
            <input type="number" value={(element.props.labelFontSize as number) || 14} onChange={(e) => handleChange('labelFontSize', parseInt(e.target.value) || 14)} className="property-input" />
          </div>
          <div className="property-item" style={{ flex: 1 }}>
            <label className="property-label">Değer Font</label>
            <input type="number" value={(element.props.valueFontSize as number) || 14} onChange={(e) => handleChange('valueFontSize', parseInt(e.target.value) || 14)} className="property-input" />
          </div>
        </div>

        {/* Satırlar */}
        <div className="property-section-divider">
          <span className="divider-icon">📝</span>
          <span className="divider-text">Satırlar ({rows.length})</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {rows.map((row, index) => (
            <div key={row.id as string || index} style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>Satır {index + 1}</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button 
                    onClick={() => moveRow(index, index - 1)} 
                    disabled={index === 0}
                    style={{ 
                      padding: '4px 8px', 
                      background: index === 0 ? '#ccc' : '#2196F3', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: index === 0 ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >↑</button>
                  <button 
                    onClick={() => moveRow(index, index + 1)} 
                    disabled={index === rows.length - 1}
                    style={{ 
                      padding: '4px 8px', 
                      background: index === rows.length - 1 ? '#ccc' : '#2196F3', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: index === rows.length - 1 ? 'not-allowed' : 'pointer',
                      fontSize: '12px'
                    }}
                  >↓</button>
                  <button 
                    onClick={() => removeRow(index)} 
                    style={{ 
                      padding: '4px 8px', 
                      background: '#f44336', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >×</button>
                </div>
              </div>

              <div className="property-item">
                <label className="property-label">Etiket</label>
                <input 
                  type="text" 
                  value={(row.label as string) || ''} 
                  onChange={(e) => handleRowChange(index, 'label', e.target.value)} 
                  className="property-input" 
                  placeholder="Ürün Toplamı"
                />
              </div>

              <div className="property-item">
                <label className="property-label">Değer Değişkeni</label>
                <VariableSelector
                  value={(row.valueKey as string) || ''}
                  onChange={(val) => handleRowChange(index, 'valueKey', val)}
                  placeholder="order.subtotal"
                  filterCategories={['order_summary', 'address', 'order', 'payment']}
                />
                <small style={{ color: '#666', fontSize: '10px' }}>Çıktıda: [[{String(row.valueKey || 'order.subtotal')}]]</small>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="property-item" style={{ flex: 1 }}>
                  <label className="property-label">Etiket Stili</label>
                  <select 
                    value={(row.labelStyle as string) || 'normal'} 
                    onChange={(e) => handleRowChange(index, 'labelStyle', e.target.value)} 
                    className="property-input property-select"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Kalın</option>
                    <option value="italic">İtalik</option>
                  </select>
                </div>
                <div className="property-item" style={{ flex: 1 }}>
                  <label className="property-label">Değer Stili</label>
                  <select 
                    value={(row.valueStyle as string) || 'normal'} 
                    onChange={(e) => handleRowChange(index, 'valueStyle', e.target.value)} 
                    className="property-input property-select"
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Kalın</option>
                    <option value="italic">İtalik</option>
                    <option value="strikethrough">Üstü Çizili</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <div className="property-item" style={{ flex: 1 }}>
                  <label className="property-label">Değer Rengi</label>
                  <div className="color-input-wrapper">
                    <input type="color" value={(row.valueColor as string) || '#333333'} onChange={(e) => handleRowChange(index, 'valueColor', e.target.value)} className="property-color-input" />
                    <input type="text" value={(row.valueColor as string) || '#333333'} onChange={(e) => handleRowChange(index, 'valueColor', e.target.value)} className="property-input property-color-text" />
                  </div>
                </div>
                <div className="property-item" style={{ flex: 1 }}>
                  <label className="property-label">Değer Font</label>
                  <input type="number" value={(row.valueFontSize as number) || ''} onChange={(e) => handleRowChange(index, 'valueFontSize', e.target.value ? parseInt(e.target.value) : undefined)} className="property-input" placeholder="Varsayılan" />
                </div>
              </div>
            </div>
          ))}

          <button onClick={addRow} style={{ 
            width: '100%', 
            padding: '10px', 
            background: '#4CAF50', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            + Yeni Satır Ekle
          </button>
        </div>
      </>
    )
  }

  const elementType = ELEMENT_TYPES[element.type.toUpperCase()]

  return (
    <div className="property-editor">
      <div className="property-editor-header">
        <h3>
          <span className="header-element-icon" dangerouslySetInnerHTML={{ __html: ICONS[elementType?.icon] || ICONS.text }} />
          <span className="header-element-name">{elementType?.name}</span>
        </h3>
      </div>
      <div className="property-list">
        {element.type === 'text' ? renderTextElementProperties() : 
         element.type === 'image' ? renderImageElementProperties() : 
         element.type === 'product_row' ? renderProductRowProperties() :
         element.type === 'info_table' ? renderInfoTableProperties() : (
          Object.entries(element.props).map(([propName, propValue]) => {
            const input = renderPropertyInput(propName, propValue)
            if (!input) return null
            return <div key={propName} className="property-item"><label className="property-label">{formatPropName(propName)}</label>{input}</div>
          })
        )}
      </div>
      <div className="property-footer"><p className="property-hint">💡 Değişkenleri [[değişkenAdı]] formatında kullanın</p></div>
    </div>
  )
}

export default PropertyEditor
