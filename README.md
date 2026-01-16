# 📧 Email Template Designer with React Email

**React Email** ile profesyonel email template tasarlama ve yönetim sistemi.

## 🚀 Özellikler

- ✨ **React Email Integration** - Profesyonel, production-ready email componentleri
- 🎨 **Drag & Drop Interface** - Elementleri sürükle bırak ile tasarlayın
- 📱 **Mail Client Uyumluluğu** - React Email sayesinde tüm platformlarda mükemmel görünüm
- 💾 **Dual Storage** - Template'ler hem JSON hem HTML olarak kaydedilir
- 🔄 **Template Düzenleme** - Kaydedilen template'leri yeniden düzenleyin
- 🏷️ **Değişken Desteği** - [[firmName]], [[firmAddress]] gibi değişkenlerle dinamik içerik
- 🏢 **Multi-Company** - Firma koduyla (fcode) çoklu şirket desteği

## 🎯 Neden React Email?

[React Email](https://react.email/) kullanmanın avantajları:

✅ **Production-ready components** - Gmail, Outlook, Apple Mail test edilmiş  
✅ **Otomatik inline CSS** - Mail clientları için optimize edilmiş  
✅ **Responsive design** - Mobil ve desktop uyumlu  
✅ **TypeScript support** - Type-safe email geliştirme  
✅ **Developer-friendly** - React component mantığı ile kolay geliştirme  

## 📦 Kurulum

```bash
cd email
npm install
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 🎨 Mevcut Element Tipleri

### 1. Text Element 📝
Paragraf metinleri için

### 2. Heading Element 📰
Başlıklar için (H1-H6)

### 3. Image Element 🖼️
Resimler için

### 4. Button Element 🔘
CTA butonları için

### 5. Link Element 🔗
Metin linkleri için

### 6. HR Element ➖
Ayırıcı çizgi

### 7. Section Element 📦
Gruplandırma için

## 🔧 Yeni Element Ekleme

`src/config/elementTypes.js` dosyasına ekleyin:

```javascript
FOOTER: {
  id: 'footer',
  name: 'Footer',
  icon: '📄',
  component: 'Section',
  defaultProps: {
    backgroundColor: '#f5f5f5',
    padding: '20px'
  }
}
```

## 📝 Değişken Kullanımı

```
Merhaba [[firmName]],
[[firmAddress]] adresimizi ziyaret edin.
```

Backend'de:
```javascript
html = html.replace(/\[\[firmName\]\]/g, 'ABC Şirketi')
```

## 🎯 Mail Client Uyumluluğu

✅ Gmail, Outlook, Apple Mail, Yahoo, Thunderbird ve tüm mobil clientlar

## 📊 Database Schema

```sql
CREATE TABLE email_templates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  fcode VARCHAR(50) NOT NULL,
  elements JSON NOT NULL,
  html LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🔄 Workflow

1. **Template Oluştur** → Elementleri sürükle
2. **Özelleştir** → Her elementi düzenle
3. **Kaydet** → JSON + HTML olarak kaydet
4. **Mail Gönder** → HTML'i çek, replace et, gönder

## 📚 Kaynaklar

- [React Email Docs](https://react.email/)
- Backend örneği: `backend-example.js`
- Database: `database-schema.sql`

## 📄 Lisans

MIT
