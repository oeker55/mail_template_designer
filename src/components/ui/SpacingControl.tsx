import React from 'react'
import SpacingInput from './SpacingInput'
import { capitalize } from '../../utils/spacing'

interface SpacingControlProps {
  type: 'padding' | 'margin'
  props: Record<string, unknown>
  onChange: (propName: string, value: number) => void
  prefix?: string  // prefix for nested props, e.g. 'img' => imgPaddingTop
}

const LABELS: Record<string, { label: string; icon: string }> = {
  padding: { label: 'İç Boşluk (Padding)', icon: '📦' },
  margin: { label: 'Dış Boşluk (Margin)', icon: '↔️' },
}

/** 
 * Convenience wrapper around SpacingInput that auto-maps element props.
 * Usage: <SpacingControl type="padding" props={element.props} onChange={handleChange} />
 */
const SpacingControl: React.FC<SpacingControlProps> = ({ type, props, onChange, prefix = '' }) => {
  const { label, icon } = LABELS[type]

  const getPropName = (side: string) => `${prefix}${prefix ? capitalize(type) : type}${capitalize(side)}`

  const values = {
    top: (props[getPropName('top')] as number) || 0,
    right: (props[getPropName('right')] as number) || 0,
    bottom: (props[getPropName('bottom')] as number) || 0,
    left: (props[getPropName('left')] as number) || 0,
  }

  return (
    <SpacingInput
      label={prefix ? `${label}` : label}
      icon={icon}
      values={values}
      onChange={(side, value) => onChange(getPropName(side), value)}
    />
  )
}

export default SpacingControl
