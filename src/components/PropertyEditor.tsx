import React, { useRef, useState, ChangeEvent, RefObject } from 'react'
import { ELEMENT_TYPES, ICONS } from '../config/elementTypes'
import { TEMPLATE_VARIABLES, formatVariable } from '../config/templateVariables'
import { PropertyEditorProps, RichTextEditorProps, SpacingInputProps, SpacingValues, CanvasElement, TemplateVariable } from '../types'
import './PropertyEditor.css'

interface ExtendedVariable extends TemplateVariable {
  categoryIcon: string
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

  const renderImageElementProperties = () => (
    <>
      <div className="property-item"><label className="property-label">Resim URL</label><input type="text" value={(element.props.src as string) || ''} onChange={(e) => handleChange('src', e.target.value)} className="property-input" placeholder="https://example.com/image.jpg" /></div>
      <div className="property-item"><label className="property-label">Alternatif Metin</label><input type="text" value={(element.props.alt as string) || ''} onChange={(e) => handleChange('alt', e.target.value)} className="property-input" placeholder="Resim açıklaması" /></div>
      <div className="property-item"><label className="property-label">Genişlik (px)</label><input type="number" value={(element.props.width as number) || 600} onChange={(e) => handleChange('width', parseInt(e.target.value) || 600)} className="property-input" disabled={element.props.keepAspectRatio as boolean} /></div>
      <div className="property-item"><label className="property-label">Yükseklik (px)</label><input type="number" value={(element.props.height as number) || 300} onChange={(e) => handleChange('height', parseInt(e.target.value) || 300)} className="property-input" /></div>
      <div className="property-item"><label className="property-label">En/Boy Oranını Koru</label><input type="checkbox" checked={(element.props.keepAspectRatio as boolean) !== false} onChange={(e) => handleChange('keepAspectRatio', e.target.checked)} className="property-checkbox" /></div>
      <div className="property-item"><label className="property-label">Hizalama</label><select value={(element.props.textAlign as string) || 'center'} onChange={(e) => handleChange('textAlign', e.target.value)} className="property-input property-select"><option value="left">Sol</option><option value="center">Orta</option><option value="right">Sağ</option></select></div>
      <div className="property-item"><label className="property-label">Arkaplan Rengi</label><div className="color-input-wrapper"><input type="color" value={(element.props.backgroundColor as string) === 'transparent' ? '#ffffff' : ((element.props.backgroundColor as string) || '#ffffff')} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="property-color-input" /><input type="text" value={(element.props.backgroundColor as string) || 'transparent'} onChange={(e) => handleChange('backgroundColor', e.target.value)} className="property-input property-color-text" placeholder="transparent" /></div></div>
      <SpacingInput label="İç Boşluk (Padding)" icon="📦" values={{ top: (element.props.paddingTop as number) || 0, right: (element.props.paddingRight as number) || 0, bottom: (element.props.paddingBottom as number) || 0, left: (element.props.paddingLeft as number) || 0 }} onChange={(side, value) => handleChange(`padding${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
      <SpacingInput label="Dış Boşluk (Margin)" icon="↔️" values={{ top: (element.props.marginTop as number) || 0, right: (element.props.marginRight as number) || 0, bottom: (element.props.marginBottom as number) || 0, left: (element.props.marginLeft as number) || 0 }} onChange={(side, value) => handleChange(`margin${side.charAt(0).toUpperCase() + side.slice(1)}`, value)} />
    </>
  )

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
        {element.type === 'text' ? renderTextElementProperties() : element.type === 'image' ? renderImageElementProperties() : (
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
