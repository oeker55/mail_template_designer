import axios, { AxiosInstance, AxiosError } from 'axios'
import { Template, TemplateData } from '../types'

// API base URL - NestJS backend (port 5000)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
})

// Request interceptor - token ekleme vs.
api.interceptors.request.use(
  (config) => {
    // Gerekirse auth token ekleyebilirsiniz
    // const token = localStorage.getItem('authToken')
    // if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error: AxiosError) => Promise.reject(error)
)

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

// Template API'leri
export const templateAPI = {
  /**
   * Tüm template'leri listele (opsiyonel fcode ile filtreleme)
   * @param fcode - Firma kodu (opsiyonel)
   * @returns Template listesi
   */
  getAll: async (fcode?: string): Promise<Template[]> => {
    try {
      const params = fcode ? { fcode } : {}
      const response = await api.get<Template[]>('/templates', { params })
      return response.data
    } catch (error) {
      console.error('Templates getAll error:', error)
      throw error
    }
  },

  /**
   * scode'a göre tüm templateleri getir
   * @param scode - Firma sabit kodu
   * @returns Template listesi
   */
  getAllByScode: async (scode: string): Promise<Template[]> => {
    try {
      const response = await api.get<Template[]>('/templates/by-scode', { params: { scode } })
      return response.data
    } catch (error) {
      console.error('Templates getAllByScode error:', error)
      throw error
    }
  },

  /**
   * scode'a göre sadece mevcut subject ID'leri getir (performans için)
   * @param scode - Firma sabit kodu
   * @returns Subject ID listesi
   */
  getSubjectIdsByScode: async (scode: string): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/templates/subject-ids', { params: { scode } })
      return response.data
    } catch (error) {
      console.error('Templates getSubjectIdsByScode error:', error)
      throw error
    }
  },

  /**
   * scode ve subjectId ile template getir
   * @param scode - Sabit kod
   * @param subjectId - Konu id
   * @returns Template verisi
   */
  getBySubject: async (scode: string, subjectId: string): Promise<Template> => {
    try {
      const response = await api.get<Template>('/templates/by-subject', { params: { scode, subjectId } })
      return response.data
    } catch (error) {
      console.error('Template getBySubject error:', error)
      throw error
    }
  },

  /**
   * Belirli bir template'i getir
   * @param id - Template ID
   * @returns Template verisi (id, fcode, name, elements_json, html_content, created_at, updated_at)
   */
  getById: async (id: string | number): Promise<Template> => {
    try {
      const response = await api.get<Template>(`/templates/${id}`)
      return response.data
    } catch (error) {
      console.error('Template getById error:', error)
      throw error
    }
  },

  /**
   * Yeni template oluştur
   * @param templateData - Template verisi
   * @returns Oluşturulan template
   */
  create: async (templateData: TemplateData): Promise<Template> => {
    try {
      const response = await api.post<Template>('/templates', templateData)
      return response.data
    } catch (error) {
      console.error('Template create error:', error)
      throw error
    }
  },

  /**
   * Template güncelle
   * @param id - Template ID
   * @param templateData - Güncellenecek veriler
   * @returns Güncellenen template
   */
  update: async (id: string | number, templateData: Partial<TemplateData>): Promise<Template> => {
    try {
      const response = await api.put<Template>(`/templates/${id}`, templateData)
      return response.data
    } catch (error) {
      console.error('Template update error:', error)
      throw error
    }
  },

  /**
   * Template sil
   * @param id - Template ID
   * @returns Silme sonucu
   */
  delete: async (id: string | number): Promise<{ message: string }> => {
    try {
      const response = await api.delete<{ message: string }>(`/templates/${id}`)
      return response.data
    } catch (error) {
      console.error('Template delete error:', error)
      throw error
    }
  }
}

interface MailSendResponse {
  success: boolean
  message: string
}

// Mail gönderme API'si
export const mailAPI = {
  /**
   * Template kullanarak mail gönder
   * @param templateId - Template ID
   * @param replacements - Değiştirilecek placeholder'lar
   * @param recipients - Alıcı email adresleri
   * @returns Gönderim sonucu
   */
  send: async (
    templateId: string | number,
    replacements: Record<string, string>,
    recipients: string[]
  ): Promise<MailSendResponse> => {
    try {
      const response = await api.post<MailSendResponse>('/mail/send', {
        templateId,
        replacements,
        recipients
      })
      return response.data
    } catch (error) {
      console.error('Mail send error:', error)
      throw error
    }
  },

  /**
   * Test maili gönder (HTML içeriği ile)
   * @param htmlContent - Email HTML içeriği
   * @param recipient - Alıcı email adresi
   * @param subject - Email konusu
   * @returns Gönderim sonucu
   */
  sendTest: async (
    htmlContent: string,
    recipient: string,
    subject: string = 'Test Email'
  ): Promise<MailSendResponse> => {
    try {
      const response = await api.post<MailSendResponse>('/mail/send-test', {
        htmlContent,
        recipient,
        subject
      })
      return response.data
    } catch (error) {
      console.error('Test mail send error:', error)
      throw error
    }
  }
}

export default api
