import React from 'react'

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  placeholder?: string
}

const NumberInput: React.FC<NumberInputProps> = ({ label, value, onChange, min, max, step, disabled, placeholder }) => (
  <div className="property-item">
    <label className="property-label">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      className="property-input"
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      placeholder={placeholder}
    />
  </div>
)

export default NumberInput
