import React, { useState, useEffect } from 'react'
import { templateAPI } from '../utils/api'
import { TemplateListProps, Template } from '../types'
import './TemplateList.css'

// Sabit konu listesi (id, scode, subjectId, title)
const SUBJECTS = [
  { id: 1, scode: 'FATURA_ONIZLEME', subjectId: 'fatura-onizleme', title: 'Fatura Önizleme' },
  { id: 2, scode: 'YENI_KULLANICI_BILGILENDIRME', subjectId: 'yeni-kullanici-bilgilendirme', title: 'Sistem Yeni Kullanıcı Bilgilendirmesi' },
  { id: 3, scode: 'SIFRE_HATIRLATMA', subjectId: 'sifre-hatirlatma', title: 'Sistem Kullanıcı Şifre Hatırlatma' },
  { id: 4, scode: 'YENI_SIPARIS', subjectId: 'yeni-siparis', title: 'Yeni Gelen Sipariş Bildirimi' },
  { id: 5, scode: 'ODEME_ONAY_BEKLEYEN', subjectId: 'odeme-onay-bekleyen', title: 'Ödeme Onayı Bekleyen Sipariş Bildirimi' },
  { id: 6, scode: 'KAPIDA_ODEME_BEKLEYEN', subjectId: 'kapida-odeme-bekleyen', title: 'Kapıda Ödeme Onayı Beklenen Sipariş Bildirimi' },
  { id: 7, scode: 'KAPIDA_ODEME_ONAYLANAN', subjectId: 'kapida-odeme-onaylanan', title: 'Kapıda Ödeme Onayı Alınan Sipariş Bildirimi' },
  { id: 8, scode: 'TEDARIK_BASLADI', subjectId: 'tedarik-basladi', title: 'Tedariği Başlatılan Sipariş Bildirimi' },
  { id: 9, scode: 'TEDARIK_EKSIK_URUN', subjectId: 'tedarik-eksik-urun', title: 'Tedariği Sırasında Eksik Ürün Çıkan Sipariş Bildirimi' },
  { id: 10, scode: 'EKSIK_URUN_ULASILAMAYAN', subjectId: 'eksik-urun-ulasilamayan', title: 'Eksik Ürün Sebebi İle Aranan ve Ulaşılamayan Müşteriye Bildirim' },
  { id: 11, scode: 'KAPIDA_ODEME_ULASILAMAYAN', subjectId: 'kapida-odeme-ulasilamayan', title: 'Kapıda Ödeme Sebebi İle Aranan ve Ulaşılamayan Müşteriye Bildirim' },
  { id: 12, scode: 'ODEME_SONRADAN_ONAY', subjectId: 'odeme-sonradan-onay', title: 'Ödemesi Sonradan Onaylanan Siparişin Bildirimi' },
  { id: 13, scode: 'IPTAL_SIPARIS', subjectId: 'iptal-siparis', title: 'İptal Siparişin Bildirimi' },
  { id: 14, scode: 'IPTAL_ODEME_IADE', subjectId: 'iptal-odeme-iade', title: 'İptal sonucu Ödeme Çıkarılacağının Bildirimi' },
  { id: 15, scode: 'IBAN_TALEP', subjectId: 'iban-talep', title: 'Ödeme İçin IBAN Hesabı Bekleniyorsa IBAN Talep Bildirimi' },
  { id: 16, scode: 'TEDARIK_TAMAMLANDI', subjectId: 'tedarik-tamamlandi', title: 'Ürünlerin Tedariği Tamamlandığında Bildirim' },
  { id: 17, scode: 'FATURA_KESILDI', subjectId: 'fatura-kesildi', title: 'Siparişin Faturası Kesildiğinde Bildirim' },
  { id: 18, scode: 'SON_KONTROL_TAMAMLANDI', subjectId: 'son-kontrol-tamamlandi', title: 'Siparişin Son Kontrolü Tamamlandığında Bildirim' },
  { id: 19, scode: 'KARGOYA_TESLIM', subjectId: 'kargoya-teslim', title: 'Sipariş Kargoya Teslim Edildiğinde Bildirim' },
  { id: 20, scode: 'IADE_GELDI', subjectId: 'iade-geldi', title: 'Siparişin İadesi Geldiğinde Bildirim' },
  { id: 21, scode: 'IADE_KREDI_KARTI', subjectId: 'iade-kredi-karti', title: 'Siparişin İadesi Tamamlandığında ve Geri Ödemesi Kredi Kartına İade İse' },
  { id: 22, scode: 'EKSIK_URUN_ALTERNATIF', subjectId: 'eksik-urun-alternatif', title: 'Eksik Ürün Alternatif Ürün Gönderimi' },
  { id: 23, scode: 'IADE_ULASILAMAYAN', subjectId: 'iade-ulasilamayan', title: 'İade İşlemi İçin Aranıp Ulaşamadığında Bildirim' },
  { id: 24, scode: 'IADE_IBAN', subjectId: 'iade-iban', title: 'Siparişin İadesi Tamamlandığında ve Geri Ödemesi IBAN Hesabına İade İse' },
  { id: 25, scode: 'IADE_HEDIYE_CEKI', subjectId: 'iade-hediye-ceki', title: 'Siparişin İadesi Tamamlandığında ve Geri Ödemesi Hediye Çeki Olarak Tanımlandıysa' },
  { id: 26, scode: 'IADE_BAKIYE', subjectId: 'iade-bakiye', title: 'Siparişin İadesi Tamamlandığında ve Geri Ödemesi Bakiyesine Yüklendiyse' },
  { id: 27, scode: 'BEKLEYEN_ODEME_TAMAMLANDI', subjectId: 'bekleyen-odeme-tamamlandi', title: 'Bekleyen Ödemenin Tamamlanması Anında' },
  { id: 28, scode: 'EKSIK_URUN_IPTAL', subjectId: 'eksik-urun-iptal', title: 'Eksik Ürün Sebebi ile Aranan ve Ulaşılamadığından İptal Edilen Sipariş Bildirimi' },
  { id: 29, scode: 'BAKIYE_KULLANILDI', subjectId: 'bakiye-kullanildi', title: 'Siparişte Bakiye Kullanıldığında Gönder' },
  { id: 30, scode: 'SIFREMI_UNUTTUM', subjectId: 'sifremi-unuttum', title: 'Şifremi Unuttum' },
  { id: 31, scode: 'KAPIDA_ODEME_SMS', subjectId: 'kapida-odeme-sms', title: 'Kapıda Ödeme SMS Onayı' },
  { id: 32, scode: 'UYELIKSIZ_ALISVERIS', subjectId: 'uyeliksiz-alisveris', title: 'Üyeliksiz Alışveriş Bildirimi' },
  { id: 33, scode: 'ILETISIM_FORMU_CEVAP', subjectId: 'iletisim-formu-cevap', title: 'İletişim Formuna Cevap Verildiğinde' },
  { id: 34, scode: 'SIPARIS_KAPIDA_NAKIT', subjectId: 'siparis-kapida-nakit', title: 'Yeni Gelen Sipariş Bildirimi, Kapıda Ödeme - Nakit' },
  { id: 35, scode: 'SIPARIS_KAPIDA_POS', subjectId: 'siparis-kapida-pos', title: 'Yeni Gelen Sipariş Bildirimi, Kapıda Ödeme - Pos' },
  { id: 36, scode: 'SIPARIS_KREDI_KARTI', subjectId: 'siparis-kredi-karti', title: 'Yeni Gelen Sipariş Bildirimi, Kredi Kartı' },
  { id: 37, scode: 'SIPARIS_HAVALE', subjectId: 'siparis-havale', title: 'Yeni Gelen Sipariş Bildirimi, Havale' },
  { id: 38, scode: 'SIPARIS_UCRETSIZ_TESLIMAT', subjectId: 'siparis-ucretsiz-teslimat', title: 'Yeni Gelen Sipariş Bildirimi, Ücretsiz Teslimat' },
  { id: 39, scode: 'MUSTERI_IADE_TALEP', subjectId: 'musteri-iade-talep', title: 'Müşteri Tarafından Oluşturulan İade Talep Bildirimi' },
  { id: 40, scode: 'MUSTERI_IADE_IPTAL', subjectId: 'musteri-iade-iptal', title: 'Müşteri Tarafından Oluşturulan İade Talep İptali Bildirimi' },
  { id: 41, scode: 'PERSONEL_IADE_IPTAL', subjectId: 'personel-iade-iptal', title: 'Personel Tarafından Müşteri İade Talep İptali' },
  { id: 42, scode: 'ACILMADAN_IADE', subjectId: 'acilmadan-iade', title: 'Açılmadan Gelen İade Teslim Alındığında' },
  { id: 43, scode: 'MUSTERI_IADE_TESLIM', subjectId: 'musteri-iade-teslim', title: 'Müşteriden Gelen İade Teslim Alındığında' },
]

const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onCreate }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      // Tüm template'leri çek
      const data = await templateAPI.getAll()
      setTemplates(data || [])
    } catch (err) {
      console.error('Template yüklenirken hata:', err)
      setError('Template listesi yüklenirken bir hata oluştu.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  // Belirli bir subject için template var mı?
  const findTemplateBySubject = (scode: string, subjectId: string) => {
    return templates.find(t => t.scode === scode && t.subjectId === subjectId)
  }

  const handleRefresh = () => {
    loadTemplates()
  }

  return (
    <div className="template-list-subjects">
      <div className="template-list-header">
        <h2>Email Konuları</h2>
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleRefresh}
            title="Listeyi Yenile"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Yenile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <p>{error}</p>
          <button className="btn btn-secondary" onClick={handleRefresh}>
            Tekrar Dene
          </button>
        </div>
      ) : (
        <table className="subject-table">
          <thead>
            <tr>
              <th style={{width: 50}}>ID</th>
              <th>Konu Başlığı</th>
              <th style={{width: 130}}>Durum</th>
              <th style={{width: 120}}>Aksiyon</th>
            </tr>
          </thead>
          <tbody>
            {SUBJECTS.map(subject => {
              const template = findTemplateBySubject(subject.scode, subject.subjectId)
              return (
                <tr key={subject.id} className={template ? 'has-template' : 'no-template'}>
                  <td>{subject.id}</td>
                  <td>{subject.title}</td>
                  <td>
                    {template ? (
                      <span className="status-ready">Tasarım Var</span>
                    ) : (
                      <span className="status-missing">Tasarım Yok</span>
                    )}
                  </td>
                  <td>
                    {template ? (
                      <button className="btn-edit" onClick={() => onEdit(template.id || template._id!)}>Düzenle</button>
                    ) : (
                      <button className="btn-add" onClick={() => onCreate()}>Ekle</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default TemplateList
