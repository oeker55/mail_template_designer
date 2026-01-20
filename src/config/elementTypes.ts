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
  }
}
