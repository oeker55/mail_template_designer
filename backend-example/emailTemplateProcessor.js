/**
 * Email Template Processor
 * 
 * Bu dosya, email template editor'den çıkan HTML şablonlarını
 * gerçek verilerle nasıl işleyeceğinizi gösterir.
 * 
 * Kullanım: Node.js backend'inizde bu fonksiyonları import edip kullanabilirsiniz.
 */

/**
 * Basit değişkenleri replace eder
 * [[değişken_adı]] formatındaki değişkenleri gerçek değerlerle değiştirir
 * 
 * @param {string} template - HTML şablonu
 * @param {object} data - Değişken değerleri
 * @returns {string} - İşlenmiş HTML
 */
function replaceVariables(template, data) {
  let result = template;
  
  // Tüm [[key]] formatındaki değişkenleri bul ve değiştir
  const variableRegex = /\[\[([^\]]+)\]\]/g;
  
  result = result.replace(variableRegex, (match, key) => {
    // Nested key desteği (örn: "customer.name", "order.total")
    const value = getNestedValue(data, key);
    return value !== undefined ? value : match; // Değer yoksa orijinal placeholder'ı bırak
  });
  
  return result;
}

/**
 * Nested object değerlerine erişim
 * Örn: getNestedValue({order: {total: 100}}, 'order.total') => 100
 */
function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Tekrarlanabilir elementleri (product_row) işler
 * <!-- REPEAT_START:key:alias --> ve <!-- REPEAT_END:key --> arasındaki
 * içeriği array'deki her item için çoğaltır
 * 
 * @param {string} template - HTML şablonu
 * @param {object} data - Veri objesi (array'leri içerir)
 * @returns {string} - İşlenmiş HTML
 */
function processRepeaters(template, data) {
  let result = template;
  
  // Tüm repeater bloklarını bul
  // Format: <!-- REPEAT_START:arrayKey:itemAlias -->...<!-- REPEAT_END:arrayKey -->
  const repeaterRegex = /<!-- REPEAT_START:(\w+):(\w+) -->([\s\S]*?)<!-- REPEAT_END:\1 -->/g;
  
  result = result.replace(repeaterRegex, (match, arrayKey, itemAlias, content) => {
    const items = data[arrayKey];
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`Repeater için array bulunamadı: ${arrayKey}`);
      return ''; // Array yoksa boş döndür
    }
    
    // Her item için satırı tekrarla
    const rows = items.map((item, index) => {
      // Satır içeriğini al (REPEAT_ROW_START/END arasındaki kısım)
      const rowMatch = content.match(/<!-- REPEAT_ROW_START -->([\s\S]*?)<!-- REPEAT_ROW_END -->/);
      
      if (!rowMatch) {
        console.warn('REPEAT_ROW_START/END bulunamadı');
        return content;
      }
      
      let rowContent = rowMatch[1];
      
      // [[alias.property]] formatındaki değişkenleri değiştir
      const aliasRegex = new RegExp(`\\[\\[${itemAlias}\\.([^\\]]+)\\]\\]`, 'g');
      rowContent = rowContent.replace(aliasRegex, (m, prop) => {
        const value = item[prop];
        return value !== undefined ? value : m;
      });
      
      // Alternatif satır rengi için index'i ekle (opsiyonel)
      if (index % 2 === 1) {
        // Çift satırlar için arkaplan rengi değiştirilebilir
        // rowContent = rowContent.replace(/background-color:\s*#ffffff/gi, 'background-color: #fafafa');
      }
      
      return rowContent;
    });
    
    return rows.join('\n');
  });
  
  return result;
}

/**
 * Ana template işleme fonksiyonu
 * Hem basit değişkenleri hem de repeater'ları işler
 * 
 * @param {string} template - HTML şablonu
 * @param {object} data - Tüm veriler
 * @returns {string} - Gönderime hazır HTML
 */
function processEmailTemplate(template, data) {
  // 1. Önce repeater'ları işle
  let result = processRepeaters(template, data);
  
  // 2. Sonra basit değişkenleri değiştir
  result = replaceVariables(result, data);
  
  return result;
}

// ============================================
// ÖRNEK KULLANIM
// ============================================

// Örnek sipariş verisi
const orderData = {
  // Müşteri bilgileri
  müşteri_adı: 'Ahmet Yılmaz',
  müşteri_email: 'ahmet@example.com',
  müşteri_telefon: '+90 532 123 4567',
  
  // Sipariş bilgileri
  sipariş_no: 'ORD-2026-12345',
  sipariş_tarihi: '20.01.2026',
  sipariş_durumu: 'Hazırlanıyor',
  
  // Sipariş özeti (info_table için)
  order: {
    subtotal: '299,99 TL',
    discount: '-135,00 TL',
    shipping: '15,00 TL',
    tax: '29,70 TL',
    total: '209,69 TL'
  },
  
  // Teslimat adresi
  address: {
    title: 'Ev Adresi',
    name: 'Ahmet Yılmaz',
    line1: 'Atatürk Caddesi No: 123',
    line2: 'Daire: 5',
    city: 'Kadıköy / İstanbul',
    zip: '34710',
    phone: '0532 123 4567'
  },
  
  // Ürün listesi (product_row repeater için)
  order_items: [
    {
      image_url: 'https://cdn.example.com/products/sweatshirt-ekru.jpg',
      name: '3 İplik Şardonsuz Yakası Ribanalı Sweatshirt - Ekru',
      details: 'Adet: 1 - Beden: L',
      quantity: '1',
      price: '149,99 TL',
      total: '149,99 TL',
      sku: 'SWT-001-L',
      variant: 'Ekru / L'
    },
    {
      image_url: 'https://cdn.example.com/products/tshirt-beyaz.jpg',
      name: 'Basic Pamuklu T-Shirt - Beyaz',
      details: 'Adet: 2 - Beden: M',
      quantity: '2',
      price: '49,99 TL',
      total: '99,98 TL',
      sku: 'TSH-002-M',
      variant: 'Beyaz / M'
    },
    {
      image_url: 'https://cdn.example.com/products/jean-mavi.jpg',
      name: 'Slim Fit Jean Pantolon - Mavi',
      details: 'Adet: 1 - Beden: 32',
      quantity: '1',
      price: '199,99 TL',
      total: '199,99 TL',
      sku: 'JNS-003-32',
      variant: 'Mavi / 32'
    }
  ],
  
  // Şirket bilgileri
  şirket_adı: 'ABC Moda',
  şirket_email: 'info@abcmoda.com',
  şirket_telefon: '+90 212 555 1234',
  logo_url: 'https://cdn.example.com/logo.png'
};

// HTML şablonu (editor'dan export edilmiş)
const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <title>Sipariş Onayı</title>
</head>
<body>
  <h1>Merhaba [[müşteri_adı]]!</h1>
  <p>Siparişiniz alındı. Sipariş numaranız: <strong>[[sipariş_no]]</strong></p>
  
  <h2>Sipariş Detayları</h2>
  
  <!-- Ürün Listesi (Repeater) -->
  <!-- REPEAT_START:order_items:item -->
  <!-- REPEAT_ROW_START -->
  <table style="width: 100%; margin-bottom: 10px; border: 1px solid #eee;">
    <tr>
      <td style="width: 80px; padding: 10px;">
        <img src="[[item.image_url]]" width="80" height="80" alt="Ürün"/>
      </td>
      <td style="padding: 10px;">
        <div style="font-weight: bold;">[[item.name]]</div>
        <div style="color: #666;">[[item.details]]</div>
        <div style="color: #f57c00; font-weight: bold;">[[item.price]]</div>
      </td>
    </tr>
  </table>
  <!-- REPEAT_ROW_END -->
  <!-- REPEAT_END:order_items -->
  
  <h2>Sipariş Özeti</h2>
  <table style="width: 100%;">
    <tr><td>Ara Toplam</td><td style="text-align: right;">[[order.subtotal]]</td></tr>
    <tr><td>İndirim</td><td style="text-align: right; color: #4caf50;">[[order.discount]]</td></tr>
    <tr><td>Kargo</td><td style="text-align: right;">[[order.shipping]]</td></tr>
    <tr><td><strong>Toplam</strong></td><td style="text-align: right;"><strong>[[order.total]]</strong></td></tr>
  </table>
  
  <h2>Teslimat Adresi</h2>
  <p>
    <strong>[[address.title]]</strong><br>
    [[address.name]]<br>
    [[address.line1]]<br>
    [[address.line2]]<br>
    [[address.city]] [[address.zip]]<br>
    Tel: [[address.phone]]
  </p>
  
  <p>Teşekkürler,<br>[[şirket_adı]]</p>
</body>
</html>
`;

// Template'i işle
const processedHtml = processEmailTemplate(htmlTemplate, orderData);
console.log('İşlenmiş HTML:');
console.log(processedHtml);

// ============================================
// EXPRESS.JS ENTEGRASYONU ÖRNEĞİ
// ============================================

/*
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Email gönderme endpoint'i
app.post('/api/send-email', async (req, res) => {
  const { templateHtml, recipientEmail, subject, data } = req.body;
  
  // Template'i işle
  const processedHtml = processEmailTemplate(templateHtml, data);
  
  // Nodemailer ile gönder
  const transporter = nodemailer.createTransport({
    host: 'smtp.example.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  
  await transporter.sendMail({
    from: '"ABC Moda" <noreply@abcmoda.com>',
    to: recipientEmail,
    subject: subject,
    html: processedHtml
  });
  
  res.json({ success: true, message: 'Email gönderildi' });
});
*/

// ============================================
// NESTJS ENTEGRASYONU ÖRNEĞİ
// ============================================

/*
// mail.service.ts
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOrderConfirmation(order: Order, template: string) {
    // Sipariş verisini hazırla
    const data = {
      müşteri_adı: order.customer.name,
      sipariş_no: order.orderNumber,
      order_items: order.items.map(item => ({
        image_url: item.product.imageUrl,
        name: item.product.name,
        details: `Adet: ${item.quantity} - Beden: ${item.variant}`,
        price: this.formatPrice(item.price),
        total: this.formatPrice(item.price * item.quantity)
      })),
      order: {
        subtotal: this.formatPrice(order.subtotal),
        discount: this.formatPrice(order.discount),
        total: this.formatPrice(order.total)
      }
    };

    // Template'i işle
    const processedHtml = processEmailTemplate(template, data);

    // Email gönder
    await this.mailerService.sendMail({
      to: order.customer.email,
      subject: `Sipariş Onayı - ${order.orderNumber}`,
      html: processedHtml
    });
  }

  private formatPrice(price: number): string {
    return price.toLocaleString('tr-TR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    }) + ' TL';
  }
}
*/

// Export fonksiyonlar
module.exports = {
  replaceVariables,
  processRepeaters,
  processEmailTemplate,
  getNestedValue
};
