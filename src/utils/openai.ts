import { CanvasElement } from '../types'
import { ELEMENT_TYPES } from '../config/elementTypes'
import { TEMPLATE_VARIABLES } from '../config/templateVariables'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

/** OpenAI model tanımı */
export interface OpenAIModel {
  id: string
  name: string
  inputPrice: string   // 1M token başına
  outputPrice: string  // 1M token başına
  vision: boolean
  category: 'flagship' | 'previous' | 'reasoning'
  description: string
}

/** OpenAI modelleri ve güncel fiyatları (Nisan 2026 — openai.com/api/pricing) */
export const OPENAI_MODELS: OpenAIModel[] = [
  // ── Flagship (GPT-5.4 ailesi) ──
  {
    id: 'gpt-5.4',
    name: 'GPT-5.4',
    inputPrice: '$2.50',
    outputPrice: '$15.00',
    vision: true,
    category: 'flagship',
    description: 'En yetenekli model — agentic & profesyonel iş akışları'
  },
  {
    id: 'gpt-5.4-mini',
    name: 'GPT-5.4 Mini',
    inputPrice: '$0.75',
    outputPrice: '$4.50',
    vision: true,
    category: 'flagship',
    description: 'Güçlü mini model — kodlama ve alt görevler'
  },
  {
    id: 'gpt-5.4-nano',
    name: 'GPT-5.4 Nano',
    inputPrice: '$0.20',
    outputPrice: '$1.25',
    vision: true,
    category: 'flagship',
    description: 'En ucuz 5.4 — yüksek hacimli basit işler'
  },
  // ── Önceki nesil (hâlâ aktif) ──
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    inputPrice: '$2.50',
    outputPrice: '$10.00',
    vision: true,
    category: 'previous',
    description: 'Önceki nesil flaghsip — güvenilir ve hızlı'
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    inputPrice: '$0.15',
    outputPrice: '$0.60',
    vision: true,
    category: 'previous',
    description: 'En ucuz vision model — düşük bütçe için ideal'
  },
  {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    inputPrice: '$2.00',
    outputPrice: '$8.00',
    vision: true,
    category: 'previous',
    description: 'Kodlama & talimat takibinde güçlü'
  },
  {
    id: 'gpt-4.1-mini',
    name: 'GPT-4.1 Mini',
    inputPrice: '$0.40',
    outputPrice: '$1.60',
    vision: true,
    category: 'previous',
    description: 'Hızlı, akıllı ve ekonomik'
  },
  {
    id: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    inputPrice: '$0.10',
    outputPrice: '$0.40',
    vision: true,
    category: 'previous',
    description: 'En ucuz seçenek — basit şablonlar için yeterli'
  },
  // ── Reasoning modelleri ──
  {
    id: 'o4-mini',
    name: 'o4-mini',
    inputPrice: '$1.10',
    outputPrice: '$4.40',
    vision: true,
    category: 'reasoning',
    description: 'Hızlı reasoning — karmaşık tasarımlar için'
  },
  {
    id: 'o3',
    name: 'o3',
    inputPrice: '$2.00',
    outputPrice: '$8.00',
    vision: true,
    category: 'reasoning',
    description: 'Güçlü reasoning — detaylı analiz'
  }
]

export const DEFAULT_MODEL = 'gpt-4o-mini'

/**
 * localStorage'dan OpenAI API key al
 */
export const getOpenAIKey = (): string | null => {
  return localStorage.getItem('openai_api_key')
}

/**
 * localStorage'a OpenAI API key kaydet
 */
export const setOpenAIKey = (key: string): void => {
  localStorage.setItem('openai_api_key', key)
}

/**
 * localStorage'dan seçili modeli al
 */
export const getSelectedModel = (): string => {
  return localStorage.getItem('openai_model') || DEFAULT_MODEL
}

/**
 * localStorage'a seçili modeli kaydet
 */
export const setSelectedModel = (model: string): void => {
  localStorage.setItem('openai_model', model)
}

/**
 * Dosyayı base64'e çevir
 */
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // data:image/png;base64, kısmını ayır
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
  // Element tiplerini ve defaultProps'larını topla
  const elementDefs = Object.entries(ELEMENT_TYPES).map(([key, config]) => {
    return `### ${config.name} (type: "${config.id}")
defaultProps: ${JSON.stringify(config.defaultProps, null, 2)}`
  }).join('\n\n')

  // Değişken listesini topla
  const variableDefs = Object.entries(TEMPLATE_VARIABLES).map(([_catKey, cat]) => {
    const vars = cat.variables.map(v => `  - [[${v.key}]] → ${v.label} (ör: ${v.example})`).join('\n')
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
7. Ürün tablo listesi için "product_row" kullan (displayMode: "table")
8. Sipariş özeti (alt toplam, vergi vs.) için "info_table" kullan
9. Sadece JSON array döndür, başka bir şey yazma
10. Tüm prop'ları ilgili element tipinin defaultProps yapısına uygun doldur - eksik prop bırakma`
}

/**
 * Ekran görüntüsünden AI ile template elementleri üret
 */
export const generateTemplateFromScreenshot = async (
  imageFile: File,
  onProgress?: (message: string) => void,
  modelId?: string
): Promise<CanvasElement[]> => {
  const apiKey = getOpenAIKey()
  if (!apiKey) {
    throw new Error('OpenAI API anahtarı bulunamadı. Lütfen ayarlardan ekleyin.')
  }

  const model = modelId || getSelectedModel()
  const modelInfo = OPENAI_MODELS.find(m => m.id === model)
  
  if (modelInfo && !modelInfo.vision) {
    throw new Error(`${modelInfo.name} modeli görsel analizi desteklemiyor. Lütfen vision destekli bir model seçin.`)
  }

  onProgress?.('Görüntü hazırlanıyor...')
  const base64Image = await fileToBase64(imageFile)

  onProgress?.(`${modelInfo?.name || model} analiz ediyor...`)
  
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
    throw new Error('AI yanıt üretemedi. Lütfen tekrar deneyin.')
  }

  onProgress?.('JSON ayrıştırılıyor...')

  // JSON çıktısını parse et (markdown code block içinde olabilir)
  let jsonString = content.trim()
  // ```json ... ``` bloğunu temizle
  const jsonMatch = jsonString.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonString = jsonMatch[1].trim()
  }

  let elements: CanvasElement[]
  try {
    elements = JSON.parse(jsonString)
  } catch {
    throw new Error('AI çıktısı geçerli JSON formatında değil. Lütfen tekrar deneyin.')
  }

  if (!Array.isArray(elements)) {
    throw new Error('AI çıktısı geçerli bir element dizisi değil.')
  }

  // Her elementin id'sini benzersiz yap
  elements = elements.map((el, index) => ({
    ...el,
    id: `${Date.now()}-ai-${index}-${Math.random().toString(36).substr(2, 6)}`
  }))

  onProgress?.(`${elements.length} element başarıyla oluşturuldu!`)

  return elements
}
