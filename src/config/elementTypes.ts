import { ElementTypeConfig } from '../types'

// Element tanımları - React Email componentleri ile
// SVG icon paths for professional look
export const ICONS: Record<string, string> = {
  text: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>`,
  heading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M4 12h16M4 6h16M4 18h10"/></svg>`,
  columns: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>`,
  button: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M8 12h8"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  hr: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/></svg>`,
  section: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
  column: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="9" y="3" width="6" height="18" rx="1"/></svg>`,
  social: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z"/><path d="M3 12h18"/></svg>`,
  product_row: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20M2 15h20M8 9v12M16 9v12"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/></svg>`,
  info_table: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M12 9v12"/><path d="M7 13h2M7 17h2M15 13h2M15 17h2"/></svg>`,
}

export const ELEMENT_TYPES: Record<string, ElementTypeConfig> = {
  TEXT: {
    id: 'text',
    name: 'Metin',
    icon: 'text',
    component: 'Text',
    defaultProps: {
      content: 'Buraya metin yazın',
      fontSize: 16,
      fontWeight: 'normal',
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      backgroundColor: 'transparent',
      textAlign: 'left',
      lineHeight: 1.5,
      marginTop: 0,
      marginRight: 0,
      marginBottom: 10,
      marginLeft: 0,
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0
    }
  },
  HEADING: {
    id: 'heading',
    name: 'Başlık',
    icon: 'heading',
    component: 'Heading',
    defaultProps: {
      content: 'Başlık',
      as: 'h2',
      fontSize: 24,
      fontWeight: 'bold',
      fontFamily: 'Arial, sans-serif',
      color: '#000000',
      textAlign: 'left',
      margin: '0 0 10px 0',
      padding: '0'
    }
  },
  MULTI_COLUMN: {
    id: 'multi_column',
    name: 'Çoklu Kolon',
    icon: 'columns',
    component: 'Row',
    defaultProps: {
      // Layout
      gap: 0,
      padding: '10px',
      backgroundColor: 'transparent',
      
      columns: [
        {
          width: '50%',
          type: 'text',
          // Metin özellikleri
          content: 'Sol Kolon',
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1.5,
          backgroundColor: 'transparent',
          // Metin Padding (4 yönlü)
          paddingTop: 0,
          paddingRight: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          // Metin Margin (4 yönlü)
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
          borderTop: '',
          borderBottom: '',
          borderLeft: '',
          borderRight: '',
          // Resim özellikleri
          src: 'https://via.placeholder.com/300x200',
          alt: 'Resim',
          imgWidth: 300,
          imgHeight: '',
          imgKeepAspectRatio: true,
          imgAlign: 'center',
          imgBackgroundColor: 'transparent',
          // Resim Padding (4 yönlü)
          imgPaddingTop: 0,
          imgPaddingRight: 0,
          imgPaddingBottom: 0,
          imgPaddingLeft: 0,
          // Resim Margin (4 yönlü)
          imgMarginTop: 0,
          imgMarginRight: 0,
          imgMarginBottom: 0,
          imgMarginLeft: 0,
          // Buton özellikleri
          btnText: 'Buton',
          btnLink: '#',
          btnBg: '#3A416F',
          btnColor: '#ffffff',
          btnFontSize: 16,
          btnBorderRadius: 4,
          btnPadding: '12px 24px'
        },
        {
          width: '50%',
          type: 'text',
          // Metin özellikleri
          content: 'Sağ Kolon',
          fontSize: 16,
          fontWeight: 'normal',
          fontFamily: 'Arial, sans-serif',
          color: '#000000',
          textAlign: 'left',
          lineHeight: 1.5,
          backgroundColor: 'transparent',
          // Metin Padding (4 yönlü)
          paddingTop: 0,
          paddingRight: 0,
          paddingBottom: 0,
          paddingLeft: 0,
          // Metin Margin (4 yönlü)
          marginTop: 0,
          marginRight: 0,
          marginBottom: 0,
          marginLeft: 0,
          borderTop: '',
          borderBottom: '',
          borderLeft: '',
          borderRight: '',
          // Resim özellikleri
          src: 'https://via.placeholder.com/300x200',
          alt: 'Resim',
          imgWidth: 300,
          imgHeight: '',
          imgKeepAspectRatio: true,
          imgAlign: 'center',
          imgBackgroundColor: 'transparent',
          // Resim Padding (4 yönlü)
          imgPaddingTop: 0,
          imgPaddingRight: 0,
          imgPaddingBottom: 0,
          imgPaddingLeft: 0,
          // Resim Margin (4 yönlü)
          imgMarginTop: 0,
          imgMarginRight: 0,
          imgMarginBottom: 0,
          imgMarginLeft: 0,
          // Buton özellikleri
          btnText: 'Buton',
          btnLink: '#',
          btnBg: '#3A416F',
          btnColor: '#ffffff',
          btnFontSize: 16,
          btnBorderRadius: 4,
          btnPadding: '12px 24px'
        }
      ]
    }
  },
  IMAGE: {
    id: 'image',
    name: 'Resim',
    icon: 'image',
    component: 'Img',
    defaultProps: {
      src: 'https://via.placeholder.com/600x300',
      alt: 'Image',
      width: 600,
      height: 300,
      keepAspectRatio: true,
      textAlign: 'center',
      backgroundColor: 'transparent',
      // Linkli resim özellikleri
      isLinked: false,
      linkUrl: '',
      // Margin (4 yönlü)
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
      // Padding (4 yönlü)
      paddingTop: 0,
      paddingRight: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      style: {}
    }
  },
  BUTTON: {
    id: 'button',
    name: 'Buton',
    icon: 'button',
    component: 'Button',
    defaultProps: {
      text: 'Tıklayın',
      href: '#',
      fontSize: 16,
      fontWeight: 'bold',
      color: '#ffffff',
      backgroundColor: '#3A416F',
      borderRadius: 4,
      padding: '12px 24px',
      textAlign: 'center'
    }
  },
  LINK: {
    id: 'link',
    name: 'Bağlantı',
    icon: 'link',
    component: 'Link',
    defaultProps: {
      text: 'Buraya tıklayın',
      href: '#',
      color: '#3A416F',
      textDecoration: 'underline',
      fontSize: 16
    }
  },
  HR: {
    id: 'hr',
    name: 'Ayırıcı',
    icon: 'hr',
    component: 'Hr',
    defaultProps: {
      borderColor: '#e0e0e0',
      margin: '20px 0'
    }
  },
  SECTION: {
    id: 'section',
    name: 'Bölüm',
    icon: 'section',
    component: 'Section',
    defaultProps: {
      backgroundColor: 'transparent',
      padding: '20px',
      borderRadius: 0
    }
  },
  COLUMN: {
    id: 'column',
    name: 'Kolon',
    icon: 'column',
    component: 'Column',
    defaultProps: {
      width: '50%'
    }
  },
  SOCIAL: {
    id: 'social',
    name: 'Sosyal Medya',
    icon: 'social',
    component: 'Social',
    defaultProps: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
      iconSize: 32,
      gap: 10,
      align: 'center',
      padding: '10px 0'
    }
  },
  PRODUCT_ROW: {
    id: 'product_row',
    name: 'Ürün Satırı',
    icon: 'product_row',
    component: 'ProductRow',
    defaultProps: {
      // Repeater ayarları - Backend'de bu element çoğaltılacak
      isRepeatable: true,
      repeatKey: 'order_items',  // Backend'de kullanılacak array key
      repeatItemAlias: 'item',    // Her item için alias (örn: item.name, item.price)
      
      // Görünüm Modu: 'table' veya 'card'
      displayMode: 'card',
      
      // === KART MODU AYARLARI ===
      cardLayout: 'horizontal',  // horizontal veya vertical
      cardBgColor: '#ffffff',
      cardBorderColor: '#eeeeee',
      cardBorderRadius: 8,
      cardPadding: '12px',
      cardGap: 12,
      cardShadow: false,
      
      // Resim ayarları (kart modu)
      cardImgWidth: 80,
      cardImgHeight: 80,
      cardImgBorderRadius: 4,
      cardImgVariableKey: 'item.image_url',
      cardImgLinkEnabled: false,
      cardImgLinkIsStatic: false,
      cardImgLinkVariableKey: 'item.url',
      cardImgLinkStaticUrl: '',
      
      // Başlık (ürün adı)
      cardTitleVariableKey: 'item.name',
      cardTitleFontSize: 14,
      cardTitleFontWeight: 'normal',
      cardTitleColor: '#333333',
      
      // Alt bilgi (adet, beden vb.)
      cardSubtitleVariableKey: 'item.details',
      cardSubtitleFontSize: 13,
      cardSubtitleColor: '#666666',
      
      // Fiyat
      cardPriceVariableKey: 'item.price',
      cardPriceFontSize: 15,
      cardPriceFontWeight: 'bold',
      cardPriceColor: '#f57c00',
      
      // === TABLO MODU AYARLARI ===
      // Tablo başlık stilleri
      showHeader: true,
      headerBgColor: '#f8f9fa',
      headerTextColor: '#333333',
      headerFontSize: 14,
      headerFontWeight: 'bold',
      
      // Satır stilleri
      rowBgColor: '#ffffff',
      rowAltBgColor: '#f9f9f9',
      rowBorderColor: '#e0e0e0',
      
      // Kolonlar - varsayılan sipariş satırı yapısı
      columns: [
        {
          id: 'product_image',
          label: 'Ürün',
          variableKey: 'item.image_url',
          width: '80px',
          type: 'image',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#333333',
          textAlign: 'center',
          imgWidth: 60,
          imgHeight: 60,
          linkEnabled: false,
          linkVariableKey: 'item.url'
        },
        {
          id: 'product_name',
          label: 'Ürün Adı',
          variableKey: 'item.name',
          width: 'auto',
          type: 'text',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#333333',
          textAlign: 'left'
        },
        {
          id: 'product_quantity',
          label: 'Adet',
          variableKey: 'item.quantity',
          width: '60px',
          type: 'text',
          fontSize: 14,
          fontWeight: 'normal',
          color: '#333333',
          textAlign: 'center'
        },
        {
          id: 'product_price',
          label: 'Fiyat',
          variableKey: 'item.price',
          width: '100px',
          type: 'price',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#333333',
          textAlign: 'right'
        }
      ],
      
      // Genel stiller
      padding: '0',
      borderRadius: 4,
      tableBorderColor: '#e0e0e0',
      tableWidth: '100%'
    }
  },
  INFO_TABLE: {
    id: 'info_table',
    name: 'Bilgi Tablosu',
    icon: 'info_table',
    component: 'InfoTable',
    defaultProps: {
      // Başlık ayarları
      showTitle: true,
      title: 'Sipariş Özeti',
      titleFontSize: 14,
      titleFontWeight: 'bold',
      titleColor: '#333333',
      titleBgColor: '#f5f5f5',
      titlePadding: '12px 16px',
      titleBorderBottom: '1px solid #e0e0e0',
      
      // Tablo stilleri
      tableBgColor: '#ffffff',
      tableBorderColor: '#e0e0e0',
      tableBorderRadius: 0,
      tableWidth: '100%',
      
      // Satır stilleri
      rowPadding: '8px 16px',
      rowBorderBottom: '1px solid #f0f0f0',
      
      // Etiket stilleri (sol kolon)
      labelWidth: '50%',
      labelFontSize: 14,
      labelFontWeight: 'normal',
      labelColor: '#333333',
      labelAlign: 'left',
      
      // Değer stilleri (sağ kolon)
      valueWidth: '50%',
      valueFontSize: 14,
      valueFontWeight: 'normal',
      valueColor: '#333333',
      valueAlign: 'right',
      
      // Satırlar
      rows: [
        {
          id: 'row_1',
          label: 'Ürün Toplamı',
          valueKey: 'order.subtotal',
          labelStyle: 'normal',
          valueStyle: 'normal',
          valueColor: '#333333'
        },
        {
          id: 'row_2',
          label: 'Kampanya',
          valueKey: 'order.discount',
          labelStyle: 'normal',
          valueStyle: 'strikethrough',
          valueColor: '#999999'
        },
        {
          id: 'row_3',
          label: 'Ara Toplam',
          valueKey: 'order.subtotal_after_discount',
          labelStyle: 'normal',
          valueStyle: 'normal',
          valueColor: '#333333'
        },
        {
          id: 'row_4',
          label: 'Toplam',
          valueKey: 'order.total',
          labelStyle: 'bold',
          valueStyle: 'bold',
          valueColor: '#333333',
          valueFontSize: 16
        }
      ]
    }
  }
}
