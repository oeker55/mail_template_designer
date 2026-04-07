import React from 'react'

export interface SelectOption {
  value: string
  label: string
}

interface SelectInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
}

const SelectInput: React.FC<SelectInputProps> = ({ label, value, onChange, options }) => (
  <div className="property-item">
    <label className="property-label">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="property-input property-select"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
)

export default SelectInput

// Common option sets used across multiple editors
export const FONT_WEIGHT_OPTIONS: SelectOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Kalın' },
  { value: '100', label: 'İnce' },
  { value: '300', label: 'Hafif' },
  { value: '500', label: 'Orta' },
  { value: '600', label: 'Yarı Kalın' },
  { value: '700', label: 'Kalın (700)' },
  { value: '900', label: 'Ekstra Kalın' },
]

export const FONT_WEIGHT_SIMPLE_OPTIONS: SelectOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Kalın' },
]

export const TEXT_ALIGN_OPTIONS: SelectOption[] = [
  { value: 'left', label: 'Sol' },
  { value: 'center', label: 'Orta' },
  { value: 'right', label: 'Sağ' },
  { value: 'justify', label: 'İki Yana' },
]

export const ALIGN_OPTIONS: SelectOption[] = [
  { value: 'left', label: 'Sol' },
  { value: 'center', label: 'Orta' },
  { value: 'right', label: 'Sağ' },
]

export const HEADING_OPTIONS: SelectOption[] = [
  { value: 'h1', label: 'H1' },
  { value: 'h2', label: 'H2' },
  { value: 'h3', label: 'H3' },
  { value: 'h4', label: 'H4' },
  { value: 'h5', label: 'H5' },
  { value: 'h6', label: 'H6' },
]

export const TEXT_DECORATION_OPTIONS: SelectOption[] = [
  { value: 'none', label: 'Yok' },
  { value: 'underline', label: 'Alt Çizgi' },
  { value: 'line-through', label: 'Üstü Çizili' },
]

export const COLUMN_TYPE_OPTIONS: SelectOption[] = [
  { value: 'text', label: 'Metin' },
  { value: 'image', label: 'Resim' },
  { value: 'button', label: 'Buton' },
]

export const LABEL_STYLE_OPTIONS: SelectOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Kalın' },
  { value: 'italic', label: 'İtalik' },
]

export const VALUE_STYLE_OPTIONS: SelectOption[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Kalın' },
  { value: 'italic', label: 'İtalik' },
  { value: 'strikethrough', label: 'Üstü Çizili' },
]
