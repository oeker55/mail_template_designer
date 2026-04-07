import React, { useRef, useState } from 'react'
import { TEMPLATE_VARIABLES } from '../../config/templateVariables'
import { TemplateVariable } from '../../types'

interface VariableSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  filterCategories?: string[]
}

const VariableSelector: React.FC<VariableSelectorProps> = ({ value, onChange, placeholder, filterCategories }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filteredCategories = filterCategories
    ? Object.entries(TEMPLATE_VARIABLES).filter(([key]) => filterCategories.includes(key))
    : Object.entries(TEMPLATE_VARIABLES)

  const selectVariable = (variableKey: string) => {
    onChange(variableKey)
    setIsOpen(false)
    setActiveCategory(null)
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="property-input"
          placeholder={placeholder || 'item.name'}
          style={{ flex: 1 }}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            padding: '6px 10px',
            background: isOpen ? '#1976d2' : '#e3f2fd',
            color: isOpen ? 'white' : '#1976d2',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s',
          }}
          title="Değişken Seç"
        >
          📋
        </button>
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
            maxHeight: '300px',
            overflow: 'hidden',
          }}
        >
          {!activeCategory && (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {filteredCategories.map(([catKey, category]) => (
                <div
                  key={catKey}
                  onClick={() => setActiveCategory(catKey)}
                  style={{
                    padding: '10px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderBottom: '1px solid #f0f0f0',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '16px' }}>{category.icon}</span>
                  <span style={{ flex: 1, fontWeight: 500 }}>{category.label}</span>
                  <span style={{ color: '#9e9e9e' }}>→</span>
                </div>
              ))}
            </div>
          )}

          {activeCategory && (
            <div>
              <div
                onClick={() => setActiveCategory(null)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f5f5f5',
                }}
              >
                <span>←</span>
                <span style={{ fontWeight: 500 }}>{TEMPLATE_VARIABLES[activeCategory]?.label}</span>
              </div>
              <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                {TEMPLATE_VARIABLES[activeCategory]?.variables.map((variable: TemplateVariable) => (
                  <div
                    key={variable.key}
                    onClick={() => selectVariable(variable.key)}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f0f0f0',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#e3f2fd')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{ fontWeight: 500, marginBottom: '2px' }}>{variable.label}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      <code
                        style={{
                          backgroundColor: '#f5f5f5',
                          padding: '2px 6px',
                          borderRadius: '3px',
                          marginRight: '8px',
                        }}
                      >
                        [[{variable.key}]]
                      </code>
                      <span style={{ color: '#9e9e9e' }}>Örn: {variable.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default VariableSelector
