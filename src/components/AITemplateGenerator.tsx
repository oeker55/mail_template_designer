import React, { useMemo, useState, useRef, useCallback } from 'react'
import { CanvasElement } from '../types'
import {
  AIProvider,
  generateTemplateFromScreenshot,
  getAIKey,
  getModelsByProvider,
  getSelectedModel,
  getSelectedProvider,
  MODEL_CATEGORY_LABELS,
  PROVIDER_LABELS,
  setAIKey,
  setSelectedModel,
  setSelectedProvider
} from '../utils/openai'
import './AITemplateGenerator.css'

interface AITemplateGeneratorProps {
  onGenerated: (elements: CanvasElement[]) => void
  onClose: () => void
}

const PROVIDERS: AIProvider[] = ['openai', 'gemini', 'groq']

const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({ onGenerated, onClose }) => {
  const initialProvider = getSelectedProvider()
  const [provider, setProvider] = useState<AIProvider>(initialProvider)
  const [apiKey, setApiKeyState] = useState<string>(getAIKey(initialProvider) || '')
  const [selectedModelId, setSelectedModelId] = useState<string>(getSelectedModel(initialProvider))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const modelGroups = useMemo(() => {
    const models = getModelsByProvider(provider)
    const categories = Array.from(new Set(models.map(model => model.category)))

    return categories.map(category => ({
      category,
      models: models.filter(model => model.category === category)
    }))
  }, [provider])

  const handleProviderChange = (nextProvider: AIProvider) => {
    setProvider(nextProvider)
    setSelectedProvider(nextProvider)
    setApiKeyState(getAIKey(nextProvider) || '')
    setSelectedModelId(getSelectedModel(nextProvider))
    setError('')
  }

  const handleApiKeyChange = (value: string) => {
    setApiKeyState(value)
    setAIKey(provider, value)
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId)
    setSelectedModel(modelId, provider)
  }

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Lütfen bir görüntü dosyası seçin (PNG, JPG, WEBP)')
      return
    }
    if (file.size > 20 * 1024 * 1024) {
      setError('Dosya boyutu 20MB\'dan küçük olmalıdır')
      return
    }
    setError('')
    setImageFile(file)
    const reader = new FileReader()
    reader.onload = (e) => setImagePreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError(`Lütfen ${PROVIDER_LABELS[provider]} API anahtarını girin`)
      return
    }
    if (!imageFile) {
      setError('Lütfen bir ekran görüntüsü yükleyin')
      return
    }

    setAIKey(provider, apiKey.trim())
    setSelectedModel(selectedModelId, provider)
    setLoading(true)
    setError('')
    setProgress('')

    try {
      const elements = await generateTemplateFromScreenshot(imageFile, setProgress, selectedModelId, provider)
      onGenerated(elements)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items
    if (!items) return
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) processFile(file)
        break
      }
    }
  }, [processFile])

  return (
    <div className="ai-generator-overlay" onClick={onClose}>
      <div className="ai-generator-panel" onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        <div className="ai-generator-header">
          <div className="ai-generator-header-left">
            <div className="ai-generator-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v1a3 3 0 0 1-1.1 2.3"/>
                <path d="M6 7h1a4 4 0 0 1 4-4"/>
                <circle cx="12" cy="17" r="5"/>
                <path d="M12 14v3l2 1"/>
              </svg>
            </div>
            <div>
              <h3>AI ile Şablon Oluştur</h3>
              <p>Ekran görüntüsünden otomatik email şablonu</p>
            </div>
          </div>
          <button className="ai-generator-close" onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div className="ai-generator-body">
          <div className="ai-generator-section">
            <label className="ai-generator-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/>
                <path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>
              </svg>
              AI Sağlayıcı
            </label>
            <div className="ai-provider-switch" role="tablist" aria-label="AI sağlayıcı">
              {PROVIDERS.map(providerOption => (
                <button
                  key={providerOption}
                  type="button"
                  className={`ai-provider-option ${provider === providerOption ? 'selected' : ''}`}
                  onClick={() => handleProviderChange(providerOption)}
                  disabled={loading}
                >
                  <span className="ai-provider-dot" />
                  {PROVIDER_LABELS[providerOption]}
                </button>
              ))}
            </div>
          </div>

          <div className="ai-generator-section">
            <label className="ai-generator-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              {PROVIDER_LABELS[provider]} API Anahtarı
            </label>
            <input
              type="password"
              className="ai-generator-input"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder={provider === 'gemini' ? 'AIza...' : provider === 'groq' ? 'gsk_...' : 'sk-...'}
              autoComplete="off"
            />
            <span className="ai-generator-hint">Anahtarınız tarayıcıda yerel olarak saklanır</span>
          </div>

          <div className="ai-generator-section">
            <label className="ai-generator-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Model Seçimi
            </label>
            <div className="ai-model-list">
              {modelGroups.map(group => (
                <React.Fragment key={group.category}>
                  <div className="ai-model-category">{MODEL_CATEGORY_LABELS[group.category]}</div>
                  {group.models.map((model) => (
                    <label
                      key={model.id}
                      className={`ai-model-option ${selectedModelId === model.id ? 'selected' : ''} ${!model.vision ? 'no-vision' : ''}`}
                    >
                      <input
                        type="radio"
                        name={`ai-model-${provider}`}
                        value={model.id}
                        checked={selectedModelId === model.id}
                        onChange={() => handleModelChange(model.id)}
                        className="ai-model-radio"
                      />
                      <div className="ai-model-info">
                        <div className="ai-model-name-row">
                          <span className="ai-model-name">{model.name}</span>
                          {!model.vision && <span className="ai-model-no-vision-badge">Görsel yok</span>}
                          {model.badge && <span className="ai-model-badge">{model.badge}</span>}
                        </div>
                        <span className="ai-model-desc">{model.description}</span>
                      </div>
                      {model.inputPrice && model.outputPrice && (
                        <div className="ai-model-pricing">
                          <span className="ai-model-price-in" title="1M input token">↓ {model.inputPrice}</span>
                          <span className="ai-model-price-out" title="1M output token">↑ {model.outputPrice}</span>
                        </div>
                      )}
                    </label>
                  ))}
                </React.Fragment>
              ))}
            </div>
            <span className="ai-generator-hint">OpenAI, Gemini ve Groq anahtarları ayrı ayrı saklanır</span>
          </div>

          <div className="ai-generator-section">
            <label className="ai-generator-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
              Ekran Görüntüsü
            </label>

            {imagePreview ? (
              <div className="ai-generator-preview">
                <img src={imagePreview} alt="Yüklenen görüntü" />
                <button className="ai-generator-remove-img" onClick={handleRemoveImage} title="Kaldır">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ) : (
              <div
                className={`ai-generator-dropzone ${isDragOver ? 'drag-over' : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                <p className="dropzone-text">Tıklayın, sürükleyin veya yapıştırın</p>
                <p className="dropzone-hint">PNG, JPG, WEBP (max 20MB)</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && (
            <div className="ai-generator-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          {loading && (
            <div className="ai-generator-progress">
              <div className="ai-generator-spinner"></div>
              <span>{progress || 'AI çalışıyor...'}</span>
            </div>
          )}
        </div>

        <div className="ai-generator-footer">
          <button className="btn btn-cancel" onClick={onClose} disabled={loading}>
            İptal
          </button>
          <button
            className="btn btn-ai-generate"
            onClick={handleGenerate}
            disabled={loading || !imageFile || !apiKey.trim()}
          >
            {loading ? (
              <>
                <div className="ai-generator-spinner small"></div>
                Oluşturuluyor...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                Şablonu Oluştur
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AITemplateGenerator
