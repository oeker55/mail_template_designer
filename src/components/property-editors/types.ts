import { CanvasElement } from '../../types'

/** Common props for all element-specific property editor components */
export interface ElementEditorProps {
  element: CanvasElement
  onChange: (propName: string, value: unknown) => void
}
