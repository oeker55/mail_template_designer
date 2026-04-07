import React from 'react'

interface CheckboxInputProps {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

const CheckboxInput: React.FC<CheckboxInputProps> = ({ label, checked, onChange, description }) => (
  <div className="property-item">
    <label className="property-label">{label}</label>
    {description ? (
      <div className="checkbox-with-label">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="property-checkbox"
        />
        <span className="checkbox-description">{description}</span>
      </div>
    ) : (
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="property-checkbox"
      />
    )}
  </div>
)

export default CheckboxInput
