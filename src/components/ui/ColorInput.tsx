import React from 'react'

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const ColorInput: React.FC<ColorInputProps> = ({ label, value, onChange, placeholder }) => {
  const displayValue = value === 'transparent' ? '#ffffff' : (value || '#ffffff')

  return (
    <div className="property-item">
      <label className="property-label">{label}</label>
      <div className="color-input-wrapper">
        <input
          type="color"
          value={displayValue}
          onChange={(e) => onChange(e.target.value)}
          className="property-color-input"
        />
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="property-input property-color-text"
          placeholder={placeholder || 'transparent'}
        />
      </div>
    </div>
  )
}

export default ColorInput
