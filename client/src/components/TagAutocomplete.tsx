import React, { useState, useEffect, useContext } from 'react'
import { StateContext } from '../state/StateProvider'

interface TagAutocompleteProps {
  isVisible: boolean
  query: string
  position: { top: number; left: number }
  onSelect: (tag: string) => void
  onClose: () => void
}

const TagAutocomplete: React.FC<TagAutocompleteProps> = ({
  isVisible,
  query,
  position,
  onSelect,
  onClose,
}) => {
  const { tags } = useContext(StateContext)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [filteredTags, setFilteredTags] = useState<string[]>([])

  useEffect(() => {
    if (!tags.data) return

    const filtered = tags.data
      .filter((tag) => tag.title.toLowerCase().includes(query.toLowerCase()))
      .map((tag) => tag.title)
      .slice(0, 10)

    setFilteredTags(filtered)
    setSelectedIndex(0)
  }, [query, tags.data])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return

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
          e.preventDefault()
          if (filteredTags[selectedIndex]) {
            onSelect(filteredTags[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isVisible, filteredTags, selectedIndex, onSelect, onClose])

  if (!isVisible || filteredTags.length === 0) {
    return null
  }

  return (
    <div
      className="tag-autocomplete"
      style={{
        position: 'absolute',
        top: position.top,
        left: position.left,
        zIndex: 1000,
      }}
    >
      {filteredTags.map((tag, index) => (
        <div
          key={tag}
          className={`tag-autocomplete-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(tag)}
          onMouseEnter={() => setSelectedIndex(index)}
        >
          #{tag}
        </div>
      ))}
    </div>
  )
}

export default TagAutocomplete
