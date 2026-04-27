import React, { useCallback, useEffect, useRef, useState } from 'react'
import { ElementPropsBase, getMargin, getPadding } from '../utils/spacing'

interface InlineHtmlBlockProps {
  elementId: string
  props: ElementPropsBase
  isSelected: boolean
  onSelect: () => void
  onHtmlChange: (html: string) => void
}

interface HtmlTargetState {
  path: number[]
  tagName: string
  isImage: boolean
  fontSize: string
  fontWeight: string
  color: string
  backgroundColor: string
  imageUrl: string
}

const EDITABLE_SELECTOR = 'img,h1,h2,h3,h4,h5,h6,p,td,th,span,a,div,li,strong,b,em,i'
const FONT_WEIGHT_OPTIONS = ['normal', 'bold', '300', '400', '500', '600', '700', '900']

const getElementPath = (element: HTMLElement, root: HTMLElement): number[] => {
  const path: number[] = []
  let current: HTMLElement | null = element

  while (current && current !== root) {
    const parent: HTMLElement | null = current.parentElement
    if (!parent) break

    path.unshift(Array.from(parent.children).indexOf(current))
    current = parent
  }

  return path
}

const getElementByPath = (root: HTMLElement, path: number[]): HTMLElement | null => {
  let current: Element = root

  for (const index of path) {
    const next = current.children[index]
    if (!next) return null
    current = next
  }

  return current instanceof HTMLElement ? current : null
}

const normalizeColor = (value?: string): string => {
  if (!value || value === 'transparent') return '#ffffff'
  if (value.startsWith('#')) {
    if (value.length === 4) {
      return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase()
    }
    return value.slice(0, 7).toLowerCase()
  }

  const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/i)
  if (!match || match[4] === '0') return '#ffffff'

  return `#${[match[1], match[2], match[3]]
    .map((part) => Math.max(0, Math.min(255, Number(part))).toString(16).padStart(2, '0'))
    .join('')}`
}

const clearEditorArtifacts = (root: ParentNode) => {
  root.querySelectorAll('.html-inline-edit-target, .html-inline-image-target').forEach((node) => {
    node.classList.remove('html-inline-edit-target', 'html-inline-image-target')
    if (node instanceof HTMLElement && node.className.trim() === '') {
      node.removeAttribute('class')
    }
  })

  root.querySelectorAll('[data-html-inline-editing="true"]').forEach((node) => {
    if (node instanceof HTMLElement) {
      node.removeAttribute('contenteditable')
      node.removeAttribute('spellcheck')
      node.removeAttribute('data-html-inline-editing')
    }
  })
}

const setCaretToEnd = (element: HTMLElement) => {
  const range = document.createRange()
  range.selectNodeContents(element)
  range.collapse(false)

  const selection = window.getSelection()
  selection?.removeAllRanges()
  selection?.addRange(range)
}

const InlineHtmlBlock: React.FC<InlineHtmlBlockProps> = ({
  elementId,
  props,
  isSelected,
  onSelect,
  onHtmlChange
}) => {
  const blockRef = useRef<HTMLDivElement>(null)
  const targetRef = useRef<HTMLElement | null>(null)
  const [targetState, setTargetState] = useState<HtmlTargetState | null>(null)
  const [toolbarPosition, setToolbarPosition] = useState({ top: 8, left: 8 })

  const html = (props.html as string) || ''

  const serializeCleanHtml = useCallback(() => {
    if (!blockRef.current) return html

    const clone = blockRef.current.cloneNode(true) as HTMLElement
    clearEditorArtifacts(clone)
    return clone.innerHTML
  }, [html])

  const readTargetState = useCallback((target: HTMLElement, path: number[]): HtmlTargetState => {
    const computedStyle = window.getComputedStyle(target)
    const inlineStyle = target.style
    const fontSize = parseFloat(inlineStyle.fontSize || computedStyle.fontSize || '16')

    return {
      path,
      tagName: target.tagName.toLowerCase(),
      isImage: target.tagName === 'IMG',
      fontSize: String(Number.isFinite(fontSize) ? Math.round(fontSize) : 16),
      fontWeight: inlineStyle.fontWeight || computedStyle.fontWeight || 'normal',
      color: normalizeColor(inlineStyle.color || computedStyle.color),
      backgroundColor: normalizeColor(inlineStyle.backgroundColor || computedStyle.backgroundColor),
      imageUrl: target.tagName === 'IMG' ? (target as HTMLImageElement).getAttribute('src') || '' : ''
    }
  }, [])

  const updateToolbarPosition = useCallback((target: HTMLElement) => {
    if (!blockRef.current) return

    const rootRect = blockRef.current.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const preferredTop = targetRect.top - rootRect.top - 46
    const top = preferredTop > 4 ? preferredTop : targetRect.bottom - rootRect.top + 6
    const left = Math.max(8, Math.min(targetRect.left - rootRect.left, rootRect.width - 260))

    setToolbarPosition({
      top: Number.isFinite(top) ? top : 8,
      left: Number.isFinite(left) ? left : 8
    })
  }, [])

  const activateTarget = useCallback((target: HTMLElement, path: number[], shouldFocus = false) => {
    const root = blockRef.current
    if (!root) return

    clearEditorArtifacts(root)
    target.classList.add(target.tagName === 'IMG' ? 'html-inline-image-target' : 'html-inline-edit-target')

    if (target.tagName !== 'IMG') {
      target.setAttribute('contenteditable', 'true')
      target.setAttribute('spellcheck', 'false')
      target.setAttribute('data-html-inline-editing', 'true')
    }

    targetRef.current = target
    setTargetState(readTargetState(target, path))
    requestAnimationFrame(() => updateToolbarPosition(target))

    if (shouldFocus && target.tagName !== 'IMG') {
      requestAnimationFrame(() => {
        target.focus()
        setCaretToEnd(target)
      })
    }
  }, [readTargetState, updateToolbarPosition])

  const getEditableTarget = useCallback((rawTarget: EventTarget | null): HTMLElement | null => {
    const root = blockRef.current
    if (!(rawTarget instanceof HTMLElement) || !root) return null

    const image = rawTarget.closest('img')
    if (image && root.contains(image)) return image as HTMLElement

    const heading = rawTarget.closest('h1,h2,h3,h4,h5,h6')
    if (heading && root.contains(heading)) return heading as HTMLElement

    const tableCell = rawTarget.closest('td,th')
    if (tableCell && root.contains(tableCell)) return tableCell as HTMLElement

    const editable = rawTarget.closest(EDITABLE_SELECTOR)
    if (!editable || editable === root || !root.contains(editable)) return null

    return editable as HTMLElement
  }, [])

  const commitHtmlChange = useCallback(() => {
    onHtmlChange(serializeCleanHtml())
  }, [onHtmlChange, serializeCleanHtml])

  const handleBlockClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    onSelect()

    const root = blockRef.current
    const target = getEditableTarget(event.target)
    if (!root || !target) return

    activateTarget(target, getElementPath(target, root), true)
  }

  const handleBlockInput = () => {
    const target = targetRef.current
    if (!target || !targetState || targetState.isImage) return

    setTargetState(readTargetState(target, targetState.path))
  }

  const handleBlockBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (targetRef.current && event.target === targetRef.current) {
      commitHtmlChange()
    }
  }

  const applyTextStyle = (styleName: 'fontSize' | 'fontWeight' | 'color' | 'backgroundColor', value: string) => {
    const target = targetRef.current
    if (!target || !targetState || targetState.isImage) return

    if (styleName === 'fontSize') {
      target.style.fontSize = `${Math.max(1, Number(value) || 1)}px`
    } else {
      target.style[styleName] = value
    }

    setTargetState(readTargetState(target, targetState.path))
    commitHtmlChange()
  }

  const applyImageUrl = (value: string) => {
    const target = targetRef.current
    if (!(target instanceof HTMLImageElement) || !targetState) return

    target.setAttribute('src', value)
    setTargetState({ ...targetState, imageUrl: value })
    commitHtmlChange()
  }

  useEffect(() => {
    if (!isSelected) {
      if (blockRef.current) clearEditorArtifacts(blockRef.current)
      targetRef.current = null
      setTargetState(null)
      return
    }

    if (!targetState || !blockRef.current) return

    const target = getElementByPath(blockRef.current, targetState.path)
    if (target) {
      activateTarget(target, targetState.path)
    }
  }, [activateTarget, html, isSelected, targetState?.path])

  return (
    <div className="html-inline-editor-shell">
      <div
        ref={blockRef}
        className={`email-html-block el-${elementId}`}
        style={{
          backgroundColor: props.backgroundColor && props.backgroundColor !== 'transparent' ? props.backgroundColor as string : undefined,
          margin: getMargin(props),
          padding: getPadding(props)
        }}
        onMouseDown={(event) => event.stopPropagation()}
        onClick={handleBlockClick}
        onInput={handleBlockInput}
        onBlur={handleBlockBlur}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {isSelected && targetState && (
        <div
          className="html-inline-toolbar"
          style={{ top: toolbarPosition.top, left: toolbarPosition.left }}
          onMouseDown={(event) => event.stopPropagation()}
          onClick={(event) => event.stopPropagation()}
        >
          {targetState.isImage ? (
            <input
              type="url"
              className="html-inline-url-input"
              value={targetState.imageUrl}
              onChange={(event) => applyImageUrl(event.target.value)}
              placeholder="https://..."
              title="Resim URL"
            />
          ) : (
            <>
              <input
                type="number"
                className="html-inline-number-input"
                min={1}
                value={targetState.fontSize}
                onChange={(event) => applyTextStyle('fontSize', event.target.value)}
                title="Font size"
              />
              <select
                className="html-inline-select"
                value={targetState.fontWeight}
                onChange={(event) => applyTextStyle('fontWeight', event.target.value)}
                title="Font weight"
              >
                {FONT_WEIGHT_OPTIONS.map((weight) => (
                  <option key={weight} value={weight}>{weight}</option>
                ))}
              </select>
              <input
                type="color"
                className="html-inline-color-input"
                value={targetState.color}
                onChange={(event) => applyTextStyle('color', event.target.value)}
                title="Yazi rengi"
              />
              <input
                type="color"
                className="html-inline-color-input"
                value={targetState.backgroundColor}
                onChange={(event) => applyTextStyle('backgroundColor', event.target.value)}
                title="Arkaplan rengi"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default InlineHtmlBlock
