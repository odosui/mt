import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTags } from '../state/TagsProvider'

interface TagAutocompleteProps {
  isVisible: boolean
  query: string
  position: { top: number; left: number }
  onSelect: (tag: string) => void
  onClose: () => void
}

const MAX_RESULTS = 10

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  isVisible,
  query,
  position,
  onSelect,
  onClose,
}) => {
  const { tags } = useTags()

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredTags, setFilteredTags] = useState<string[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const [adjusted, setAdjusted] = useState(position)

  useEffect(() => {
    if (!tags.data) {
      setFilteredTags([])
      return
    }

    const q = query.toLowerCase()
    const matches = tags.data
      .map((tag) => tag.title)
      .filter((title) => title.toLowerCase().startsWith(q))
      .slice(0, MAX_RESULTS)

    setFilteredTags(matches)
    setSelectedIndex(0)
  }, [query, tags.data])

  const active = isVisible && filteredTags.length > 0

  useEffect(() => {
    if (!active) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < filteredTags.length - 1 ? prev + 1 : 0,
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredTags.length - 1,
          )
          break
        case 'Enter':
        case 'Tab': {
          const pick = filteredTags[selectedIndex]
          if (pick) {
            e.preventDefault()
            onSelect(pick)
          }
          break
        }
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [active, filteredTags, selectedIndex, onSelect, onClose])

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
  }, [active, position.top, position.left, filteredTags.length])

  // Scroll the selected item into view on keyboard navigation.
  useLayoutEffect(() => {
    const el = itemRefs.current[selectedIndex]
    if (el) el.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  if (!active) return null

  return (
    <div
      ref={containerRef}
      className="tag-autocomplete"
      style={{
        position: 'fixed',
        top: adjusted.top,
        left: adjusted.left,
        zIndex: 1000,
      }}
    >
      {filteredTags.map((tag, index) => (
        <div
          key={tag}
          ref={(el) => {
            itemRefs.current[index] = el
          }}
          className={`tag-autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
          // mousedown (not click) so the textarea doesn't blur first
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(tag)
          }}
          // mousemove (not mouseenter) avoids stealing focus from the
          // keyboard when the cursor merely happens to overlap the list.
          onMouseMove={() => setSelectedIndex(index)}
        >
          #{tag}
        </div>
      ))}
    </div>
  )
}

export default TagAutocomplete
