import React, { useMemo } from 'react'
import { useTags } from '../state/TagsProvider'
import AutocompleteList, { CaretPosition } from '../ui/AutocompleteList'

interface TagAutocompleteProps {
  isVisible: boolean
  query: string
  position: CaretPosition
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

  const filteredTags = useMemo(() => {
    const q = query.toLowerCase()
    return (tags.data ?? [])
      .map((tag) => tag.title)
      .filter((title) => title.toLowerCase().startsWith(q))
      .slice(0, MAX_RESULTS)
  }, [query, tags.data])

  return (
    <AutocompleteList
      label="Tags"
      isVisible={isVisible}
      items={filteredTags}
      position={position}
      getKey={(tag) => tag}
      renderItem={(tag) => `#${tag}`}
      onSelect={onSelect}
      onClose={onClose}
    />
  )
}

export default TagAutocomplete
