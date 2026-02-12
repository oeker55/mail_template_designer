import React, { useState, useEffect } from 'react'
import { templateAPI } from '../utils/api'
import { TemplateListProps, Template } from '../types'
import './TemplateList.css'

// Sabit konu listesi (id = subjectId olarak kullanilacak)
const SUBJECTS = [
  { id: '1', title: 'Fatura Onizleme' },
  { id: '2', title: 'Sistem Yeni Kullanici Bilgilendirmesi' },
  { id: '3', title: 'Sistem Kullanici Sifre Hatirlatma' },
  { id: '4', title: 'Yeni Gelen Siparis Bildirimi' },
  { id: '5', title: 'Odeme Onayi Bekleyen Siparis Bildirimi' },
  { id: '6', title: 'Kapida Odeme Onayi Beklenen Siparis Bildirimi' },
  { id: '7', title: 'Kapida Odeme Onayi Alinan Siparis Bildirimi' },
  { id: '8', title: 'Tedarigi Baslatilan Siparis Bildirimi' },
  { id: '9', title: 'Tedarigi Sirasinda Eksik Urun Cikan Siparis Bildirimi' },
  { id: '10', title: 'Eksik Urun Sebebi Ile Aranan ve Ulasilamayan Musteriye Bildirim' },
  { id: '11', title: 'Kapida Odeme Sebebi Ile Aranan ve Ulasilamayan Musteriye Bildirim' },
  { id: '12', title: 'Odemesi Sonradan Onaylanan Siparisin Bildirimi' },
  { id: '13', title: 'Iptal Siparisin Bildirimi' },
  { id: '14', title: 'Iptal sonucu Odeme Cikarilacaginin Bildirimi' },
  { id: '15', title: 'Odeme Icin IBAN Hesabi Bekleniyorsa IBAN Talep Bildirimi' },
  { id: '16', title: 'Urunlerin Tedarigi Tamamlandiginda Bildirim' },
  { id: '17', title: 'Siparisin Faturasi Kesildiginde Bildirim' },
  { id: '18', title: 'Siparisin Son Kontrolu Tamamlandiginda Bildirim' },
  { id: '19', title: 'Siparis Kargoya Teslim Edildiginde Bildirim' },
  { id: '20', title: 'Siparisin Iadesi Geldiginde Bildirim' },
  { id: '21', title: 'Siparisin Iadesi Tamamlandiginda ve Geri Odemesi Kredi Kartina Iade Ise' },
  { id: '22', title: 'Eksik Urun Alternatif Urun Gonderimi' },
  { id: '23', title: 'Iade Islemi Icin Aranip Ulasamadiginda Bildirim' },
  { id: '24', title: 'Siparisin Iadesi Tamamlandiginda ve Geri Odemesi IBAN Hesabina Iade Ise' },
  { id: '25', title: 'Siparisin Iadesi Tamamlandiginda ve Geri Odemesi Hediye Ceki Olarak Tanimlandiysa' },
  { id: '26', title: 'Siparisin Iadesi Tamamlandiginda ve Geri Odemesi Bakiyesine Yuklendiyse' },
  { id: '27', title: 'Bekleyen Odemenin Tamamlanmasi Aninda' },
  { id: '28', title: 'Eksik Urun Sebebi ile Aranan ve Ulasilamadigindan Iptal Edilen Siparis Bildirimi' },
  { id: '29', title: 'Sipariste Bakiye Kullanildiginda Gonder' },
  { id: '30', title: 'Sifremi Unuttum' },
  { id: '31', title: 'Kapida Odeme SMS Onayi' },
  { id: '32', title: 'Uyeliksiz Alisveris Bildirimi' },
  { id: '33', title: 'Iletisim Formuna Cevap Verildiginde' },
  { id: '34', title: 'Yeni Gelen Siparis Bildirimi, Kapida Odeme - Nakit' },
  { id: '35', title: 'Yeni Gelen Siparis Bildirimi, Kapida Odeme - Pos' },
  { id: '36', title: 'Yeni Gelen Siparis Bildirimi, Kredi Karti' },
  { id: '37', title: 'Yeni Gelen Siparis Bildirimi, Havale' },
  { id: '38', title: 'Yeni Gelen Siparis Bildirimi, Ucretsiz Teslimat' },
  { id: '39', title: 'Musteri Tarafindan Olusturulan Iade Talep Bildirimi' },
  { id: '40', title: 'Musteri Tarafindan Olusturulan Iade Talep Iptali Bildirimi' },
  { id: '41', title: 'Personel Tarafindan Musteri Iade Talep Iptali' },
  { id: '42', title: 'Acilmadan Gelen Iade Teslim Alindiginda' },
  { id: '43', title: 'Musteriden Gelen Iade Teslim Alindiginda' },
]

const TemplateList: React.FC<TemplateListProps> = ({ onEdit, onCreate }) => {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // ASP den gelen scode ve fcode degerlerini al
    const scode = window.emailSettings?.scode || 'LOCAL_MAGAZA'
    const fcode = window.emailSettings?.fcode || 'LOCAL_FIRMA'

  useEffect(() => {
    loadTemplates()
  }, [scode])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      setError(null)
      // scode ile bu firmaya ait templateleri cek
      const data = await templateAPI.getAllByScode(scode)
      setTemplates(data || [])
    } catch (err) {
      console.error('Template yuklenirken hata:', err)
      setError('Template listesi yuklenirken bir hata olustu.')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  // Belirli bir subject icin template var mi? (subjectId ile eslestir)
  const findTemplateBySubjectId = (subjectId: string) => {
    return templates.find(t => t.subjectId === subjectId)
  }

  const handleRefresh = () => {
    loadTemplates()
  }

  return (
    <div className="template-list-subjects">
      <div className="template-list-header">
        <h2>Email Konulari</h2>
        <div className="header-info">
          <span className="fcode-label">Firma:</span>
          <span className="fcode-value">{fcode}</span>
          <span className="scode-label">Mağaza:</span>
          <span className="scode-value">{scode}</span>
        </div>
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
          <p>Yukleniyor...</p>
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
              const template = findTemplateBySubjectId(subject.id)
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
                      <button className="btn-edit" onClick={() => onEdit(subject.id, scode, fcode, subject.title)}>Düzenle</button>
                    ) : (
                      <button className="btn-add" onClick={() => onCreate(subject.id, scode, fcode, subject.title)}>Ekle</button>
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
