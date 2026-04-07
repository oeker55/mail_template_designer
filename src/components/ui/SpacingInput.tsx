import React from 'react'
import { SpacingInputProps } from '../../types'

const SpacingInput: React.FC<SpacingInputProps> = ({ label, values, onChange, icon }) => {
  const handleValueChange = (side: 'top' | 'right' | 'bottom' | 'left', value: string) => {
    const numValue = parseInt(value) || 0
    onChange(side, Math.max(0, numValue))
  }

  const increment = (side: 'top' | 'right' | 'bottom' | 'left') => {
    const currentValue = values[side] || 0
    onChange(side, currentValue + 1)
  }

  const decrement = (side: 'top' | 'right' | 'bottom' | 'left') => {
    const currentValue = values[side] || 0
    onChange(side, Math.max(0, currentValue - 1))
  }

  const renderSide = (side: 'top' | 'right' | 'bottom' | 'left', labelText: string) => (
    <div className="spacing-input-item">
      <span className="spacing-label">{labelText}</span>
      <div className="spacing-input-wrapper">
        <button type="button" className="spacing-btn spacing-btn-down" onClick={() => decrement(side)}>▼</button>
        <input
          type="number"
          value={values[side] || 0}
          onChange={(e) => handleValueChange(side, e.target.value)}
          className="spacing-input"
          min="0"
        />
        <button type="button" className="spacing-btn spacing-btn-up" onClick={() => increment(side)}>▲</button>
      </div>
    </div>
  )

  return (
    <div className="spacing-input-container">
      <label className="property-label">{icon} {label}</label>
      <div className="spacing-input-grid">
        <div className="spacing-input-top">
          {renderSide('top', 'Üst')}
        </div>
        <div className="spacing-input-middle">
          {renderSide('left', 'Sol')}
          <div className="spacing-preview-box">
            <div className="spacing-preview-inner"></div>
          </div>
          {renderSide('right', 'Sağ')}
        </div>
        <div className="spacing-input-bottom">
          {renderSide('bottom', 'Alt')}
        </div>
      </div>
    </div>
  )
}

export default SpacingInput
