import { CanvasElement } from '../types'
import { ELEMENT_TYPES } from '../config/elementTypes'
import { TEMPLATE_VARIABLES } from '../config/templateVariables'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const GEMINI_API_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const GEMINI_FALLBACK_MODEL = 'gemini-2.5-flash-lite'
const GEMINI_RETRY_DELAYS = [800, 1800]
const GROQ_BASE64_IMAGE_LIMIT = 4 * 1024 * 1024

export type AIProvider = 'openai' | 'gemini' | 'groq'

export type AIModelCategory =
  | 'flagship'
  | 'previous'
  | 'reasoning'
  | 'gemini-preview'
  | 'gemini-stable'
  | 'groq-vision'

/** AI model tanımı */
export interface AIModel {
  id: string
  name: string
  provider: AIProvider
  inputPrice?: string
  outputPrice?: string
  vision: boolean
  category: AIModelCategory
  description: string
  badge?: string
}

/** Eski importlar bozulmasın diye OpenAIModel alias'ı korunuyor. */
export type OpenAIModel = AIModel

export const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai: 'OpenAI',
  gemini: 'Gemini',
  groq: 'Groq'
}

export const MODEL_CATEGORY_LABELS: Record<AIModelCategory, string> = {
  flagship: 'Flagship - GPT-5.4 Ailesi',
  previous: 'Önceki Nesil - Hala Aktif',
  reasoning: 'Reasoning Modelleri',
  'gemini-preview': 'Gemini 3 - Preview',
  'gemini-stable': 'Gemini 2.5 - Stable',
  'groq-vision': 'Groq Vision - Free Plan'
}

/** OpenAI modelleri ve fiyatları (1M token başına) */
export const OPENAI_MODELS: AIModel[] = [
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    provider: 'openai',
    inputPrice: '$2.50',
    outputPrice: '$15.00',
    vision: true,
    category: 'flagship',
    description: 'En yetenekli model - agentic ve profesyonel iş akışları'
  },
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    provider: 'openai',
    inputPrice: '$0.75',
    outputPrice: '$4.50',
    vision: true,
    category: 'flagship',
    description: 'Güçlü mini model - kodlama ve alt görevler'
  },
  {
    id: 'gpt-5.4-nano',
    name: 'GPT-5.4 Nano',
    provider: 'openai',
    inputPrice: '$0.20',
    outputPrice: '$1.25',
    vision: true,
    category: 'flagship',
    description: 'En ucuz 5.4 - yüksek hacimli basit işler'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    inputPrice: '$2.50',
    outputPrice: '$10.00',
    vision: true,
    category: 'previous',
    description: 'Önceki nesil flagship - güvenilir ve hızlı'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    inputPrice: '$0.15',
    outputPrice: '$0.60',
    vision: true,
    category: 'previous',
    description: 'En ucuz vision model - düşük bütçe için ideal'
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    inputPrice: '$2.00',
    outputPrice: '$8.00',
    vision: true,
    category: 'previous',
    description: 'Kodlama ve talimat takibinde güçlü'
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    provider: 'openai',
    inputPrice: '$0.40',
    outputPrice: '$1.60',
    vision: true,
    category: 'previous',
    description: 'Hızlı, akıllı ve ekonomik'
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    inputPrice: '$0.10',
    outputPrice: '$0.40',
    vision: true,
    category: 'previous',
    description: 'En ucuz seçenek - basit şablonlar için yeterli'
  },
  {
    id: 'o4-mini',
    name: 'o4-mini',
    provider: 'openai',
    inputPrice: '$1.10',
    outputPrice: '$4.40',
    vision: true,
    category: 'reasoning',
    description: 'Hızlı reasoning - karmaşık tasarımlar için'
  },
  {
    id: 'o3',
    name: 'o3',
    provider: 'openai',
    inputPrice: '$2.00',
    outputPrice: '$8.00',
    vision: true,
    category: 'reasoning',
    description: 'Güçlü reasoning - detaylı analiz'
  }
]

/** Gemini modelleri - görsel anlama destekli modeller */
export const GEMINI_MODELS: AIModel[] = [
  {
    id: 'gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'gemini',
    vision: true,
    category: 'gemini-preview',
    badge: 'Preview',
    description: 'En yeni multimodal Gemini 3 flash modeli'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    provider: 'gemini',
    vision: true,
    category: 'gemini-preview',
    badge: 'Preview',
    description: 'Daha güçlü analiz ve karmaşık şablon yorumlama'
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    vision: true,
    category: 'gemini-stable',
    badge: 'Stable',
    description: 'Hızlı, ekonomik ve üretim için stabil seçenek'
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    provider: 'gemini',
    vision: true,
    category: 'gemini-stable',
    badge: 'Stable',
    description: 'En hızlı ve bütçe dostu Gemini 2.5 seçeneği'
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'gemini',
    vision: true,
    category: 'gemini-stable',
    badge: 'Stable',
    description: 'Derin reasoning gerektiren şablonlar için güçlü model'
  }
]

/** Groq modelleri - OpenAI uyumlu vision endpoint */
export const GROQ_MODELS: AIModel[] = [
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout',
    provider: 'groq',
    vision: true,
    category: 'groq-vision',
    badge: 'Free plan',
    description: 'GroqCloud uzerinde hizli vision modeli - ucretsiz plan limitli'
  }
]

export const AI_MODELS: AIModel[] = [...OPENAI_MODELS, ...GEMINI_MODELS, ...GROQ_MODELS]

export const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini'
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
export const DEFAULT_GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'
export const DEFAULT_PROVIDER: AIProvider = 'openai'
export const DEFAULT_MODEL = DEFAULT_OPENAI_MODEL

const STORAGE_KEYS = {
  provider: 'ai_provider',
  openaiKey: 'openai_api_key',
  geminiKey: 'gemini_api_key',
  groqKey: 'groq_api_key',
  openaiModel: 'openai_model',
  geminiModel: 'gemini_model',
  groqModel: 'groq_model'
} as const

const isAIProvider = (value: string | null): value is AIProvider => {
  return value === 'openai' || value === 'gemini' || value === 'groq'
}

export const getModelsByProvider = (provider: AIProvider): AIModel[] => {
  return AI_MODELS.filter(model => model.provider === provider)
}

export const getModelInfo = (modelId: string): AIModel | undefined => {
  return AI_MODELS.find(model => model.id === modelId)
}

export const getSelectedProvider = (): AIProvider => {
  const provider = localStorage.getItem(STORAGE_KEYS.provider)
  return isAIProvider(provider) ? provider : DEFAULT_PROVIDER
}

export const setSelectedProvider = (provider: AIProvider): void => {
  localStorage.setItem(STORAGE_KEYS.provider, provider)
}

const getDefaultModelForProvider = (provider: AIProvider): string => {
  if (provider === 'groq') return DEFAULT_GROQ_MODEL
  return provider === 'gemini' ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_MODEL
}

const getModelStorageKey = (provider: AIProvider): string => {
  if (provider === 'groq') return STORAGE_KEYS.groqModel
  return provider === 'gemini' ? STORAGE_KEYS.geminiModel : STORAGE_KEYS.openaiModel
}

const getKeyStorageKey = (provider: AIProvider): string => {
  if (provider === 'groq') return STORAGE_KEYS.groqKey
  return provider === 'gemini' ? STORAGE_KEYS.geminiKey : STORAGE_KEYS.openaiKey
}

/**
 * localStorage'dan provider'a ait API key al
 */
export const getAIKey = (provider: AIProvider): string | null => {
  return localStorage.getItem(getKeyStorageKey(provider))
}

/**
 * localStorage'a provider'a ait API key kaydet
 */
export const setAIKey = (provider: AIProvider, key: string): void => {
  const storageKey = getKeyStorageKey(provider)
  if (key.trim()) {
    localStorage.setItem(storageKey, key.trim())
    return
  }
  localStorage.removeItem(storageKey)
}

/**
 * localStorage'dan OpenAI API key al
 */
export const getOpenAIKey = (): string | null => {
  return getAIKey('openai')
}

/**
 * localStorage'a OpenAI API key kaydet
 */
export const setOpenAIKey = (key: string): void => {
  setAIKey('openai', key)
}

/**
 * localStorage'dan Gemini API key al
 */
export const getGeminiKey = (): string | null => {
  return getAIKey('gemini')
}

/**
 * localStorage'a Gemini API key kaydet
 */
export const setGeminiKey = (key: string): void => {
  setAIKey('gemini', key)
}

/**
 * localStorage'dan Groq API key al
 */
export const getGroqKey = (): string | null => {
  return getAIKey('groq')
}

/**
 * localStorage'a Groq API key kaydet
 */
export const setGroqKey = (key: string): void => {
  setAIKey('groq', key)
}

/**
 * localStorage'dan seçili modeli al
 */
export const getSelectedModel = (provider: AIProvider = getSelectedProvider()): string => {
  const storedModel = localStorage.getItem(getModelStorageKey(provider))
  const models = getModelsByProvider(provider)
  const fallbackModel = getDefaultModelForProvider(provider)

  if (storedModel && models.some(model => model.id === storedModel)) {
    return storedModel
  }

  return fallbackModel
}

/**
 * localStorage'a seçili modeli kaydet
 */
export const setSelectedModel = (model: string, provider?: AIProvider): void => {
  const modelInfo = getModelInfo(model)
  const selectedProvider = provider || modelInfo?.provider || getSelectedProvider()
  localStorage.setItem(getModelStorageKey(selectedProvider), model)
}

/**
 * Dosyayı base64'e çevir
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Proje element yapısının system prompt'unu oluştur
 */
const buildSystemPrompt = (): string => {
  const elementDefs = Object.entries(ELEMENT_TYPES).map(([_key, config]) => {
    return `### ${config.name} (type: "${config.id}")
defaultProps: ${JSON.stringify(config.defaultProps, null, 2)}`
  }).join('\n\n')

  const variableDefs = Object.entries(TEMPLATE_VARIABLES).map(([_catKey, cat]) => {
    const vars = cat.variables.map(v => `  - [[${v.key}]] -> ${v.label} (ör: ${v.example})`).join('\n')
    return `${cat.icon} ${cat.label}:\n${vars}`
  }).join('\n\n')

  return `Sen bir email şablon tasarım asistanısın. Kullanıcı sana bir ekran görüntüsü gönderecek ve sen bu görüntüdeki email tasarımını analiz edip, aşağıdaki element formatına uygun JSON çıktısı üreteceksin.

## ÇIKTI FORMATI
Sadece geçerli JSON dizisi döndür (açıklama yok, markdown yok). Her eleman şu yapıda:
{
  "id": "el_<unique_timestamp>",
  "type": "<element_type>",
  "props": { ... }
}

## KULLANILACAK ELEMENT TİPLERİ VE ÖZELLİKLERİ:

${elementDefs}

## KULLANILACAK TEMPLATE DEĞİŞKENLERİ:
Metin içeriklerinde dinamik veri olması gereken yerlerde [[değişken_adı]] formatını kullan.

${variableDefs}

## KURALLAR:
1. Ekran görüntüsündeki her görsel blok için uygun element tipini seç
2. Renkleri, fontları, boyutları mümkün olduğunca görüntüye yakın ayarla
3. Statik metin içeriklerini doğrudan yaz, dinamik verilerin olduğu yerlerde [[değişken_adı]] kullan
4. Her elementin benzersiz bir id'si olsun (el_<timestamp> formatında)
5. Logo/banner için "image" elementi kullan
6. Sipariş bilgileri gibi 2 sütunlu alanlar için "multi_column" kullan
7. Urun listeleri icin "product_row" kullan; tablo icin displayMode: "table", gorsel kataloglar icin "gallery", buyuk urun sunumu icin "feature", kompakt siparis satiri icin "compact"
8. Sipariş özeti (alt toplam, vergi vs.) için "info_table" kullan
9. Sadece JSON array döndür, başka bir şey yazma
10. Tüm prop'ları ilgili element tipinin defaultProps yapısına uygun doldur - eksik prop bırakma`
}

const extractJsonString = (content: string): string => {
  let jsonString = content.trim()
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/)

  if (jsonMatch) {
    jsonString = jsonMatch[1].trim()
  }

  if (!jsonString.startsWith('[')) {
    const arrayStart = jsonString.indexOf('[')
    const arrayEnd = jsonString.lastIndexOf(']')

    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      jsonString = jsonString.slice(arrayStart, arrayEnd + 1)
    }
  }

  return jsonString
}

const parseElements = (content: string): CanvasElement[] => {
  let parsed: unknown

  try {
    parsed = JSON.parse(extractJsonString(content))
  } catch {
    throw new Error('AI çıktısı geçerli JSON formatında değil. Lütfen tekrar deneyin.')
  }

  const elements = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && Array.isArray((parsed as { elements?: unknown }).elements)
      ? (parsed as { elements: CanvasElement[] }).elements
      : null

  if (!Array.isArray(elements)) {
    throw new Error('AI çıktısı geçerli bir element dizisi değil.')
  }

  return elements.map((el, index) => ({
    ...el,
    id: `${Date.now()}-ai-${index}-${Math.random().toString(36).slice(2, 8)}`
  }))
}

class GeminiApiError extends Error {
  status: number
  apiStatus?: string

  constructor(status: number, message: string, apiStatus?: string) {
    super(message)
    this.name = 'GeminiApiError'
    this.status = status
    this.apiStatus = apiStatus
  }
}

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => window.setTimeout(resolve, ms))
}

const isRetryableGeminiError = (error: unknown): error is GeminiApiError => {
  if (!(error instanceof GeminiApiError)) return false

  return (
    [429, 500, 502, 503, 504].includes(error.status) ||
    error.apiStatus === 'UNAVAILABLE' ||
    error.apiStatus === 'RESOURCE_EXHAUSTED'
  )
}

const getGeminiModelAttempts = (model: string): string[] => {
  return model === GEMINI_FALLBACK_MODEL ? [model] : [model, GEMINI_FALLBACK_MODEL]
}

const buildGeminiGenerationConfig = (model: string) => {
  const config: {
    maxOutputTokens: number
    temperature: number
    responseMimeType: string
    thinkingConfig?: {
      thinkingBudget?: number
      thinkingLevel?: 'minimal' | 'low' | 'high'
    }
  } = {
    maxOutputTokens: 8192,
    temperature: 0.1,
    responseMimeType: 'application/json'
  }

  if (model.includes('gemini-2.5-flash')) {
    config.thinkingConfig = {
      thinkingBudget: 0
    }
  } else if (model.includes('gemini-3-flash')) {
    config.thinkingConfig = {
      thinkingLevel: 'minimal'
    }
  }

  return config
}

const generateWithOpenAI = async (
  apiKey: string,
  model: string,
  imageFile: File,
  base64Image: string
): Promise<string> => {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt()
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Bu ekran görüntüsündeki email tasarımını analiz et ve projemizin element formatına uygun JSON üret. Sadece JSON array döndür.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageFile.type};base64,${base64Image}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_completion_tokens: 4096,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData?.error?.message || `HTTP ${response.status}`
    throw new Error(`OpenAI API hatası: ${errorMessage}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('OpenAI yanıt üretemedi. Lütfen tekrar deneyin.')
  }

  return content
}

const generateWithGroq = async (
  apiKey: string,
  model: string,
  imageFile: File,
  base64Image: string
): Promise<string> => {
  if (base64Image.length > GROQ_BASE64_IMAGE_LIMIT) {
    throw new Error('Groq base64 gorsel istegi 4MB sinirini asiyor. Lutfen ekran goruntusunu kirpin, sikistirin veya Gemini kullanin.')
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: buildSystemPrompt()
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Bu ekran goruntusundeki email tasarimini analiz et ve projemizin element formatina uygun JSON uret. Sadece JSON array dondur.'
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageFile.type || 'image/png'};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_completion_tokens: 4096,
      temperature: 0.1
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData?.error?.message || `HTTP ${response.status}`
    throw new Error(`Groq API hatasi: ${errorMessage}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('Groq yanit uretemedi. Lutfen tekrar deneyin.')
  }

  return content
}

const generateWithGemini = async (
  apiKey: string,
  model: string,
  imageFile: File,
  base64Image: string,
  onProgress?: (message: string) => void
): Promise<string> => {
  let lastError: unknown

  for (const attemptModel of getGeminiModelAttempts(model)) {
    const totalAttempts = GEMINI_RETRY_DELAYS.length + 1

    for (let attempt = 0; attempt < totalAttempts; attempt++) {
      if (attemptModel !== model && attempt === 0) {
        onProgress?.(`${model} yoğun. ${attemptModel} ile deneniyor...`)
      } else if (attempt > 0) {
        onProgress?.(`${attemptModel} geçici yoğunlukta. Tekrar deneniyor (${attempt + 1}/${totalAttempts})...`)
      }

      try {
        return await requestGeminiContent(apiKey, attemptModel, imageFile, base64Image)
      } catch (error) {
        lastError = error

        if (!isRetryableGeminiError(error)) {
          throw error
        }

        if (attempt === totalAttempts - 1) {
          break
        }

        await sleep(GEMINI_RETRY_DELAYS[attempt])
      }
    }
  }

  if (lastError instanceof GeminiApiError && isRetryableGeminiError(lastError)) {
    throw new Error('Gemini servisinde geçici yoğunluk var. Otomatik tekrar denendi ama cevap alınamadı. Biraz sonra tekrar deneyin veya OpenAI sağlayıcısını seçin.')
  }

  if (lastError instanceof Error) {
    throw lastError
  }

  throw new Error('Gemini API hatası: Bilinmeyen hata')
}

const requestGeminiContent = async (
  apiKey: string,
  model: string,
  imageFile: File,
  base64Image: string
): Promise<string> => {
  const response = await fetch(`${GEMINI_API_BASE_URL}/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [
          {
            text: buildSystemPrompt()
          }
        ]
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              inline_data: {
                mime_type: imageFile.type || 'image/png',
                data: base64Image
              }
            },
            {
              text: 'Bu ekran görüntüsündeki email tasarımını analiz et ve projemizin element formatına uygun JSON üret. Sadece JSON array döndür.'
            }
          ]
        }
      ],
      generationConfig: buildGeminiGenerationConfig(model)
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    const errorMessage = errorData?.error?.message || `HTTP ${response.status}`
    throw new GeminiApiError(response.status, `Gemini API hatası: ${errorMessage}`, errorData?.error?.status)
  }

  const data = await response.json()
  const blockedReason = data.promptFeedback?.blockReason
  const finishReason = data.candidates?.[0]?.finishReason
  const parts = data.candidates?.[0]?.content?.parts || []
  const content = parts.map((part: { text?: string }) => part.text || '').join('').trim()

  if (blockedReason) {
    throw new Error(`Gemini yanıtı güvenlik filtresi nedeniyle engellendi: ${blockedReason}`)
  }

  if (!content) {
    throw new Error(`Gemini yanıt üretemedi.${finishReason ? ` Bitiş nedeni: ${finishReason}` : ''}`)
  }

  if (finishReason === 'MAX_TOKENS') {
    throw new Error('Gemini yanıtı token limitine takıldığı için JSON eksik geldi. Daha kısa bir ekran görüntüsü deneyin veya Gemini 2.5 Flash/Flash-Lite modelini kullanın.')
  }

  return content
}

/**
 * Ekran görüntüsünden AI ile template elementleri üret
 */
export const generateTemplateFromScreenshot = async (
  imageFile: File,
  onProgress?: (message: string) => void,
  modelId?: string,
  provider?: AIProvider
): Promise<CanvasElement[]> => {
  const selectedProvider = provider || (modelId ? getModelInfo(modelId)?.provider : undefined) || getSelectedProvider()
  const apiKey = getAIKey(selectedProvider)

  if (!apiKey) {
    throw new Error(`${PROVIDER_LABELS[selectedProvider]} API anahtarı bulunamadı. Lütfen ayarlardan ekleyin.`)
  }

  const model = modelId || getSelectedModel(selectedProvider)
  const modelInfo = getModelInfo(model)

  if (modelInfo && !modelInfo.vision) {
    throw new Error(`${modelInfo.name} modeli görsel analizi desteklemiyor. Lütfen vision destekli bir model seçin.`)
  }

  onProgress?.('Görüntü hazırlanıyor...')
  const base64Image = await fileToBase64(imageFile)

  onProgress?.(`${modelInfo?.name || model} analiz ediyor...`)

  const content = selectedProvider === 'gemini'
    ? await generateWithGemini(apiKey, model, imageFile, base64Image, onProgress)
    : selectedProvider === 'groq'
      ? await generateWithGroq(apiKey, model, imageFile, base64Image)
      : await generateWithOpenAI(apiKey, model, imageFile, base64Image)

  onProgress?.('JSON ayrıştırılıyor...')
  const elements = parseElements(content)

  onProgress?.(`${elements.length} element başarıyla oluşturuldu!`)

  return elements
}
