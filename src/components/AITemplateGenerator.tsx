import React, { useState, useRef, useCallback } from 'react'
import { CanvasElement } from '../types'
import { generateTemplateFromScreenshot, getOpenAIKey, setOpenAIKey, OPENAI_MODELS, getSelectedModel, setSelectedModel } from '../utils/openai'
import './AITemplateGenerator.css'

interface AITemplateGeneratorProps {
  onGenerated: (elements: CanvasElement[]) => void
  onClose: () => void
}

const AITemplateGenerator: React.FC<AITemplateGeneratorProps> = ({ onGenerated, onClose }) => {
  const [apiKey, setApiKeyState] = useState<string>(getOpenAIKey() || '')
  const [selectedModelId, setSelectedModelId] = useState<string>(getSelectedModel())
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleApiKeyChange = (value: string) => {
    setApiKeyState(value)
    if (value.trim()) {
      setOpenAIKey(value.trim())
    }
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModelId(modelId)
    setSelectedModel(modelId)
  }

  const processFile = (file: File) => {
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
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) processFile(file)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false)
  }, [])

  const handleGenerate = async () => {
    if (!apiKey.trim()) {
      setError('Lütfen OpenAI API anahtarını girin')
      return
    }
    if (!imageFile) {
      setError('Lütfen bir ekran görüntüsü yükleyin')
      return
    }

    setOpenAIKey(apiKey.trim())
    setLoading(true)
    setError('')
    setProgress('')

    try {
      const elements = await generateTemplateFromScreenshot(imageFile, setProgress, selectedModelId)
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
  }, [])

  return (
    <div className="ai-generator-overlay" onClick={onClose}>
      <div className="ai-generator-panel" onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        {/* Header */}
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

        {/* Body */}
        <div className="ai-generator-body">
          {/* API Key */}
          <div className="ai-generator-section">
            <label className="ai-generator-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
              </svg>
              OpenAI API Anahtarı
            </label>
            <input
              type="password"
              className="ai-generator-input"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              placeholder="sk-..."
              autoComplete="off"
            />
            <span className="ai-generator-hint">Anahtarınız tarayıcıda yerel olarak saklanır</span>
          </div>

          {/* Model Selection */}
          <div className="ai-generator-section">
            <label className="ai-generator-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Model Seçimi
            </label>
            <div className="ai-model-list">
              {/* Flagship */}
              <div className="ai-model-category">Flagship — GPT-5.4 Ailesi</div>
              {OPENAI_MODELS.filter(m => m.category === 'flagship').map((model) => (
                <label
                  key={model.id}
                  className={`ai-model-option ${selectedModelId === model.id ? 'selected' : ''} ${!model.vision ? 'no-vision' : ''}`}
                >
                  <input
                    type="radio"
                    name="ai-model"
                    value={model.id}
                    checked={selectedModelId === model.id}
                    onChange={() => handleModelChange(model.id)}
                    className="ai-model-radio"
                  />
                  <div className="ai-model-info">
                    <div className="ai-model-name-row">
                      <span className="ai-model-name">{model.name}</span>
                      {!model.vision && <span className="ai-model-no-vision-badge">Görsel yok</span>}
                    </div>
                    <span className="ai-model-desc">{model.description}</span>
                  </div>
                  <div className="ai-model-pricing">
                    <span className="ai-model-price-in" title="1M input token">↓ {model.inputPrice}</span>
                    <span className="ai-model-price-out" title="1M output token">↑ {model.outputPrice}</span>
                  </div>
                </label>
              ))}
              {/* Previous Gen */}
              <div className="ai-model-category">Önceki Nesil — Hâlâ Aktif</div>
              {OPENAI_MODELS.filter(m => m.category === 'previous').map((model) => (
                <label
                  key={model.id}
                  className={`ai-model-option ${selectedModelId === model.id ? 'selected' : ''} ${!model.vision ? 'no-vision' : ''}`}
                >
                  <input
                    type="radio"
                    name="ai-model"
                    value={model.id}
                    checked={selectedModelId === model.id}
                    onChange={() => handleModelChange(model.id)}
                    className="ai-model-radio"
                  />
                  <div className="ai-model-info">
                    <div className="ai-model-name-row">
                      <span className="ai-model-name">{model.name}</span>
                      {!model.vision && <span className="ai-model-no-vision-badge">Görsel yok</span>}
                    </div>
                    <span className="ai-model-desc">{model.description}</span>
                  </div>
                  <div className="ai-model-pricing">
                    <span className="ai-model-price-in" title="1M input token">↓ {model.inputPrice}</span>
                    <span className="ai-model-price-out" title="1M output token">↑ {model.outputPrice}</span>
                  </div>
                </label>
              ))}
              {/* Reasoning */}
              <div className="ai-model-category">Reasoning Modelleri</div>
              {OPENAI_MODELS.filter(m => m.category === 'reasoning').map((model) => (
                <label
                  key={model.id}
                  className={`ai-model-option ${selectedModelId === model.id ? 'selected' : ''} ${!model.vision ? 'no-vision' : ''}`}
                >
                  <input
                    type="radio"
                    name="ai-model"
                    value={model.id}
                    checked={selectedModelId === model.id}
                    onChange={() => handleModelChange(model.id)}
                    className="ai-model-radio"
                  />
                  <div className="ai-model-info">
                    <div className="ai-model-name-row">
                      <span className="ai-model-name">{model.name}</span>
                      {!model.vision && <span className="ai-model-no-vision-badge">Görsel yok</span>}
                    </div>
                    <span className="ai-model-desc">{model.description}</span>
                  </div>
                  <div className="ai-model-pricing">
                    <span className="ai-model-price-in" title="1M input token">↓ {model.inputPrice}</span>
                    <span className="ai-model-price-out" title="1M output token">↑ {model.outputPrice}</span>
                  </div>
                </label>
              ))}
            </div>
            <span className="ai-generator-hint">Fiyatlar 1M token başına (yaklaşık istek: ~$0.01–$0.10)</span>
          </div>

          {/* Image Upload */}
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

          {/* Error */}
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

          {/* Progress */}
          {loading && (
            <div className="ai-generator-progress">
              <div className="ai-generator-spinner"></div>
              <span>{progress || 'AI çalışıyor...'}</span>
            </div>
          )}
        </div>

        {/* Footer */}
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
