import { TemplateVariableCategories, TemplateVariable } from '../types'

// Email şablonlarında kullanılabilecek değişkenler
// Değişkenler [[değişkenAdı]] formatında kullanılır

export const TEMPLATE_VARIABLES: TemplateVariableCategories = {
  customer: {
    label: 'Müşteri Bilgileri',
    icon: '👤',
    variables: [
      { key: 'müşteri_adı', label: 'Müşteri Adı', example: 'Ahmet Yılmaz' },
      { key: 'müşteri_email', label: 'Müşteri E-posta', example: 'ahmet@email.com' },
      { key: 'müşteri_telefon', label: 'Müşteri Telefon', example: '+90 555 123 4567' },
      { key: 'müşteri_adres', label: 'Müşteri Adresi', example: 'İstanbul, Türkiye' },
    ]
  },
  order: {
    label: 'Sipariş Bilgileri',
    icon: '📦',
    variables: [
      { key: 'sipariş_no', label: 'Sipariş Numarası', example: 'ORD-12345' },
      { key: 'sipariş_tarihi', label: 'Sipariş Tarihi', example: '13.01.2026' },
      { key: 'sipariş_tutarı', label: 'Sipariş Tutarı', example: '₺1.250,00' },
      { key: 'sipariş_durumu', label: 'Sipariş Durumu', example: 'Kargoya Verildi' },
      { key: 'kargo_takip_no', label: 'Kargo Takip No', example: 'TR123456789' },
      { key: 'kargo_firması', label: 'Kargo Firması', example: 'Yurtiçi Kargo' },
      { key: 'tahmini_teslimat', label: 'Tahmini Teslimat', example: '15.01.2026' },
    ]
  },
  product: {
    label: 'Ürün Bilgileri',
    icon: '🛍️',
    variables: [
      { key: 'ürün_adı', label: 'Ürün Adı', example: 'Akıllı Saat Pro' },
      { key: 'ürün_fiyatı', label: 'Ürün Fiyatı', example: '₺999,00' },
      { key: 'ürün_miktarı', label: 'Ürün Miktarı', example: '2 adet' },
      { key: 'ürün_kodu', label: 'Ürün Kodu', example: 'SKU-001' },
    ]
  },
  payment: {
    label: 'Ödeme Bilgileri',
    icon: '💳',
    variables: [
      { key: 'ödeme_yöntemi', label: 'Ödeme Yöntemi', example: 'Kredi Kartı' },
      { key: 'ödeme_tutarı', label: 'Ödeme Tutarı', example: '₺1.250,00' },
      { key: 'ödeme_tarihi', label: 'Ödeme Tarihi', example: '13.01.2026' },
      { key: 'fatura_no', label: 'Fatura No', example: 'INV-2026-001' },
    ]
  },
  company: {
    label: 'Şirket Bilgileri',
    icon: '🏢',
    variables: [
      { key: 'şirket_adı', label: 'Şirket Adı', example: 'ABC Teknoloji Ltd.' },
      { key: 'şirket_email', label: 'Şirket E-posta', example: 'info@abctech.com' },
      { key: 'şirket_telefon', label: 'Şirket Telefon', example: '+90 212 123 4567' },
      { key: 'şirket_adres', label: 'Şirket Adresi', example: 'İstanbul, Türkiye' },
      { key: 'şirket_web', label: 'Web Sitesi', example: 'www.abctech.com' },
      { key: 'logo_url', label: 'Logo URL', example: 'https://example.com/logo.png' },
    ]
  },
  date: {
    label: 'Tarih & Zaman',
    icon: '📅',
    variables: [
      { key: 'bugün', label: 'Bugünün Tarihi', example: '13.01.2026' },
      { key: 'saat', label: 'Şu Anki Saat', example: '14:30' },
      { key: 'yıl', label: 'Yıl', example: '2026' },
      { key: 'ay', label: 'Ay', example: 'Ocak' },
    ]
  },
  other: {
    label: 'Diğer',
    icon: '📝',
    variables: [
      { key: 'doğrulama_kodu', label: 'Doğrulama Kodu', example: '123456' },
      { key: 'şifre_sıfırlama_linki', label: 'Şifre Sıfırlama Linki', example: 'https://...' },
      { key: 'aktivasyon_linki', label: 'Aktivasyon Linki', example: 'https://...' },
      { key: 'özel_mesaj', label: 'Özel Mesaj', example: 'Teşekkür ederiz!' },
    ]
  }
}

interface ExtendedVariable extends TemplateVariable {
  category: string
  categoryLabel: string
  categoryIcon: string
}

// Tüm değişkenleri düz liste olarak al
export const getAllVariables = (): ExtendedVariable[] => {
  const allVars: ExtendedVariable[] = []
  Object.entries(TEMPLATE_VARIABLES).forEach(([category, data]) => {
    data.variables.forEach(v => {
      allVars.push({
        ...v,
        category,
        categoryLabel: data.label,
        categoryIcon: data.icon
      })
    })
  })
  return allVars
}

// Değişkeni [[]] formatında döndür
export const formatVariable = (key: string): string => `[[${key}]]`

// Şablondaki değişkenleri gerçek değerlerle değiştir
export const replaceVariables = (template: string, values: Record<string, string>): string => {
  let result = template
  Object.entries(values).forEach(([key, value]) => {
    const regex = new RegExp(`\\[\\[${key}\\]\\]`, 'g')
    result = result.replace(regex, value)
  })
  return result
}

// Şablondaki tüm değişkenleri bul
export const findVariablesInTemplate = (template: string): string[] => {
  const regex = /\[\[([^\]]+)\]\]/g
  const matches: string[] = []
  let match
  while ((match = regex.exec(template)) !== null) {
    matches.push(match[1])
  }
  return [...new Set(matches)] // Benzersiz değişkenler
}
