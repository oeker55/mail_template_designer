import React from 'react'

interface SectionDividerProps {
  icon: string
  text: string
}

const SectionDivider: React.FC<SectionDividerProps> = ({ icon, text }) => (
  <div className="property-section-divider">
    <span className="divider-icon">{icon}</span>
    <span className="divider-text">{text}</span>
  </div>
)

export default SectionDivider
