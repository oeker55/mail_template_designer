/**
 * Email Template Processor - TypeScript Version
 * 
 * Bu dosya, email template editor'den çıkan HTML şablonlarını
 * gerçek verilerle nasıl işleyeceğinizi gösterir.
 * 
 * Kullanım: NestJS veya diğer TypeScript backend'lerde kullanabilirsiniz.
 */

// ============================================
// TİP TANIMLARI
// ============================================

export interface ProductItem {
  image_url: string;
  name: string;
  details: string;
  quantity: string;
  price: string;
  total: string;
  sku?: string;
  variant?: string;
  discount?: string;
}

export interface OrderSummary {
  subtotal: string;
  discount?: string;
  shipping?: string;
  tax?: string;
  total: string;
  paid?: string;
  remaining?: string;
}

export interface Address {
  title?: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  zip?: string;
  country?: string;
  phone?: string;
}

export interface EmailTemplateData {
  // Müşteri bilgileri
  müşteri_adı?: string;
  müşteri_email?: string;
  müşteri_telefon?: string;
  müşteri_adres?: string;

  // Sipariş bilgileri
  sipariş_no?: string;
  sipariş_tarihi?: string;
  sipariş_tutarı?: string;
  sipariş_durumu?: string;
  kargo_takip_no?: string;
  kargo_firması?: string;
  tahmini_teslimat?: string;

  // Ürün listesi (repeater için)
  order_items?: ProductItem[];
  products?: ProductItem[];
  cart_items?: ProductItem[];

  // Sipariş özeti
  order?: OrderSummary;

  // Adres bilgileri
  address?: Address;
  shipping_address?: Address;
  billing_address?: Address;

  // Şirket bilgileri
  şirket_adı?: string;
  şirket_email?: string;
  şirket_telefon?: string;
  şirket_adres?: string;
  şirket_web?: string;
  logo_url?: string;

  // Dinamik alanlar için
  [key: string]: unknown;
}

// ============================================
// YARDIMCI FONKSİYONLAR
// ============================================

/**
 * Nested object değerlerine erişim
 * Örn: getNestedValue({order: {total: 100}}, 'order.total') => 100
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((current: unknown, key: string) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

/**
 * Basit değişkenleri replace eder
 * [[değişken_adı]] formatındaki değişkenleri gerçek değerlerle değiştirir
 */
export function replaceVariables(template: string, data: EmailTemplateData): string {
  let result = template;
  
  const variableRegex = /\[\[([^\]]+)\]\]/g;
  
  result = result.replace(variableRegex, (match: string, key: string) => {
    const value = getNestedValue(data as Record<string, unknown>, key);
    if (value !== undefined && value !== null) {
      return String(value);
    }
    return match; // Değer yoksa orijinal placeholder'ı bırak
  });
  
  return result;
}

/**
 * Tekrarlanabilir elementleri (product_row) işler
 */
export function processRepeaters(template: string, data: EmailTemplateData): string {
  let result = template;
  
  const repeaterRegex = /<!-- REPEAT_START:(\w+):(\w+) -->([\s\S]*?)<!-- REPEAT_END:\1 -->/g;
  
  result = result.replace(repeaterRegex, (
    match: string, 
    arrayKey: string, 
    itemAlias: string, 
    content: string
  ) => {
    const items = data[arrayKey];
    
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`Repeater için array bulunamadı: ${arrayKey}`);
      return '';
    }
    
    const rows = items.map((item: Record<string, unknown>, index: number) => {
      const rowMatch = content.match(/<!-- REPEAT_ROW_START -->([\s\S]*?)<!-- REPEAT_ROW_END -->/);
      
      if (!rowMatch) {
        console.warn('REPEAT_ROW_START/END bulunamadı');
        return content;
      }
      
      let rowContent = rowMatch[1];
      
      const aliasRegex = new RegExp(`\\[\\[${itemAlias}\\.([^\\]]+)\\]\\]`, 'g');
      rowContent = rowContent.replace(aliasRegex, (m: string, prop: string) => {
        const value = item[prop];
        return value !== undefined ? String(value) : m;
      });
      
      return rowContent;
    });
    
    return rows.join('\n');
  });
  
  return result;
}

/**
 * Ana template işleme fonksiyonu
 */
export function processEmailTemplate(template: string, data: EmailTemplateData): string {
  let result = processRepeaters(template, data);
  result = replaceVariables(result, data);
  return result;
}

// ============================================
// NESTJS SERVICE ÖRNEĞİ
// ============================================

/*
import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { processEmailTemplate, EmailTemplateData, ProductItem } from './emailTemplateProcessor';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendOrderConfirmation(
    order: Order,
    templateHtml: string
  ): Promise<void> {
    // Veriyi hazırla
    const data: EmailTemplateData = {
      müşteri_adı: order.customer.firstName + ' ' + order.customer.lastName,
      müşteri_email: order.customer.email,
      sipariş_no: order.orderNumber,
      sipariş_tarihi: this.formatDate(order.createdAt),
      sipariş_durumu: order.status,
      
      // Ürün listesi
      order_items: order.items.map((item): ProductItem => ({
        image_url: item.product.images[0]?.url || '',
        name: item.product.name,
        details: `Adet: ${item.quantity}${item.variant ? ` - ${item.variant}` : ''}`,
        quantity: String(item.quantity),
        price: this.formatCurrency(item.unitPrice),
        total: this.formatCurrency(item.unitPrice * item.quantity),
        sku: item.product.sku,
        variant: item.variant
      })),
      
      // Sipariş özeti
      order: {
        subtotal: this.formatCurrency(order.subtotal),
        discount: order.discount ? `-${this.formatCurrency(order.discount)}` : undefined,
        shipping: this.formatCurrency(order.shippingCost),
        tax: this.formatCurrency(order.tax),
        total: this.formatCurrency(order.total)
      },
      
      // Teslimat adresi
      address: {
        title: order.shippingAddress.title || 'Teslimat Adresi',
        name: order.shippingAddress.fullName,
        line1: order.shippingAddress.addressLine1,
        line2: order.shippingAddress.addressLine2,
        city: `${order.shippingAddress.district} / ${order.shippingAddress.city}`,
        zip: order.shippingAddress.postalCode,
        phone: order.shippingAddress.phone
      },
      
      // Şirket bilgileri
      şirket_adı: 'ABC Moda',
      şirket_email: 'info@abcmoda.com',
      logo_url: 'https://cdn.abcmoda.com/logo.png'
    };

    // Template'i işle
    const processedHtml = processEmailTemplate(templateHtml, data);

    // Email gönder
    await this.mailerService.sendMail({
      to: order.customer.email,
      subject: `Sipariş Onayı - ${order.orderNumber}`,
      html: processedHtml
    });
  }

  private formatCurrency(amount: number): string {
    return amount.toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' TL';
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
}
*/

// ============================================
// KULLANIM ÖRNEĞİ
// ============================================

const exampleData: EmailTemplateData = {
  müşteri_adı: 'Ahmet Yılmaz',
  sipariş_no: 'ORD-2026-12345',
  
  order_items: [
    {
      image_url: 'https://cdn.example.com/product1.jpg',
      name: 'Premium Sweatshirt - Ekru',
      details: 'Adet: 1 - Beden: L',
      quantity: '1',
      price: '149,99 TL',
      total: '149,99 TL'
    },
    {
      image_url: 'https://cdn.example.com/product2.jpg',
      name: 'Basic T-Shirt - Beyaz',
      details: 'Adet: 2 - Beden: M',
      quantity: '2',
      price: '49,99 TL',
      total: '99,98 TL'
    }
  ],
  
  order: {
    subtotal: '249,97 TL',
    discount: '-50,00 TL',
    shipping: '15,00 TL',
    total: '214,97 TL'
  },
  
  address: {
    title: 'Ev Adresi',
    name: 'Ahmet Yılmaz',
    line1: 'Atatürk Cad. No: 123',
    city: 'Kadıköy / İstanbul',
    phone: '0532 123 4567'
  }
};

const exampleTemplate = `
<h1>Merhaba [[müşteri_adı]]!</h1>
<p>Sipariş No: [[sipariş_no]]</p>

<!-- REPEAT_START:order_items:item -->
<!-- REPEAT_ROW_START -->
<div>
  <img src="[[item.image_url]]" />
  <span>[[item.name]] - [[item.price]]</span>
</div>
<!-- REPEAT_ROW_END -->
<!-- REPEAT_END:order_items -->

<p>Toplam: [[order.total]]</p>
`;

// Test
const result = processEmailTemplate(exampleTemplate, exampleData);
console.log(result);
