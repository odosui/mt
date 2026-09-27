import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type CaretPosition = { top: number; left: number }

type Props<T> = {
  label: string
  isVisible: boolean
  items: T[]
  position: CaretPosition
  getKey: (item: T) => string
  renderItem: (item: T) => React.ReactNode
  onSelect: (item: T) => void
  onClose: () => void
}

function AutocompleteList<T>({
  label,
  isVisible,
  items,
  position,
  getKey,
  renderItem,
  onSelect,
  onClose,
}: Props<T>) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [adjusted, setAdjusted] = useState(position)

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  const active = isVisible && items.length > 0

  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const handled = () => {
        e.preventDefault()
        // keeps the editor's own shortcuts (e.g. Escape = cancel) from firing
        e.stopPropagation()
      }

      switch (e.key) {
        case 'ArrowDown':
          handled()
          setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))
          break
        case 'ArrowUp':
          handled()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))
          break
        case 'Enter':
        case 'Tab': {
          const pick = items[selectedIndex]
          if (pick) {
            handled()
            onSelect(pick)
          }
          break
        }
        case 'Escape':
          handled()
          onClose()
          break
      }
    }

    // Capture phase, so we see the key before React's handlers do.
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [active, items, selectedIndex, onSelect, onClose])

  // Clamp to viewport; flip above caret if not enough room below.
  useLayoutEffect(() => {
    if (!active || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const margin = 8
    let top = position.top
    let left = position.left

    if (top + rect.height > window.innerHeight - margin) {
      // Flip: place above caret line (approx 20px line height).
      const flipped = position.top - rect.height - 24
      if (flipped >= margin) top = flipped
      else top = window.innerHeight - rect.height - margin
    }
    if (left + rect.width > window.innerWidth - margin) {
      left = Math.max(margin, window.innerWidth - rect.width - margin)
    }
    setAdjusted({ top, left })
  }, [active, position.top, position.left, items.length])

  // Scroll the selected item into view on keyboard navigation.
  useLayoutEffect(() => {
    const el = itemRefs.current[selectedIndex]
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className="autocomplete"
      role="listbox"
      aria-label={label}
      style={{
        position: 'fixed',
        top: adjusted.top,
        left: adjusted.left,
        zIndex: 1000,
      }}
    >
      {items.map((item, index) => (
        <div
          key={getKey(item)}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          role="option"
          aria-selected={index === selectedIndex}
          className={`autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
          // mousedown (not click) so the textarea doesn't blur first
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(item)
          }}
          // mousemove (not mouseenter) avoids stealing focus from the
          // keyboard when the cursor merely happens to overlap the list.
          onMouseMove={() => setSelectedIndex(index)}
        >
          {renderItem(item)}
        </div>
      ))}
    </div>
  )
}

export default AutocompleteList
