# ASP Kurulum Rehberi

## 1. Build Dosyalarını Kopyalama

`dist/` klasöründeki dosyaları IIS sunucunuza kopyalayın:

```
IIS Root/
├── email-designer/
│   ├── assets/
│   │   ├── index-BaW9nlTE.css
│   │   ├── index-Bo4Bcrp-.js
│   │   └── server.browser-BELqgjWE.js
│   └── index.html (opsiyonel)
├── email-template-designer.asp
└── ... diğer asp dosyalarınız
```

## 2. ASP Dosyasını Düzenleme

`email-template-designer.asp` dosyasındaki asset dosya isimlerini kontrol edin.
Her build'de dosya isimleri değişebilir (hash değerleri).

Build sonrası `dist/` klasöründeki gerçek dosya isimlerini kullanın:
- CSS: `index-XXXXXXXX.css`
- JS: `index-XXXXXXXX.js`

## 3. API URL Ayarı

ASP dosyasında `apiUrl` değişkenini backend servisinizin adresine göre ayarlayın:

```asp
' Geliştirme ortamı
apiUrl = "http://localhost:5000/api"

' Canlı ortam
apiUrl = "https://api.siteniz.com/api"
```

## 4. scode Parametresi

Sayfayı açarken `scode` parametresini URL'den alabilirsiniz:

```
http://siteniz.com/email-template-designer.asp?scode=FIRMA_KODU
```

Ya da session/cookie'den okuyabilirsiniz:

```asp
scode = Session("FirmaKodu")
' veya
scode = Request.Cookies("scode")
```

## 5. CORS Ayarları (Backend)

Backend servisinizde CORS'u etkinleştirmeyi unutmayın:

```javascript
// NestJS main.ts
app.enableCors({
  origin: ['http://siteniz.com', 'http://localhost'],
  credentials: true,
});
```

## 6. IIS MIME Types

IIS'de `.js` dosyaları için doğru MIME type ayarlı olmalı:
- `.js` → `application/javascript`
- `.css` → `text/css`

## 7. Örnek Kullanım Senaryoları

### Doğrudan Açma (Liste Görünümü)
```
/email-template-designer.asp?scode=ACME
```

### Belirli Bir Template'i Düzenleme
```
/email-template-designer.asp?scode=ACME&templateId=4
```
(templateId = subjectId, yani konu numarası)

### Template ile Başlık Gösterme
```
/email-template-designer.asp?scode=ACME&templateId=4&title=Yeni%20Gelen%20Siparis
```

## 8. Güvenlik Önerileri

1. `scode` değerini kullanıcıdan almadan önce doğrulayın
2. API isteklerinde authentication kullanın
3. XSS koruması için kullanıcı girdilerini sanitize edin

## 9. Troubleshooting

### Sayfa Boş Görünüyor
- Browser console'da hata var mı kontrol edin (F12)
- Asset dosyalarının doğru yolda olduğunu kontrol edin
- CORS hatası var mı kontrol edin

### API Bağlantı Hatası
- Backend servisinin çalıştığından emin olun
- `apiUrl` değerinin doğru olduğunu kontrol edin
- Firewall ayarlarını kontrol edin

### Template Kaydedilmiyor
- MongoDB bağlantısını kontrol edin
- Backend loglarına bakın
- Network sekmesinde request/response'u inceleyin
