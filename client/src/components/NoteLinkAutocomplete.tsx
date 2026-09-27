import React, { useMemo } from 'react'
import { useNoteRefs } from '../hooks/useNoteRefs'
import { NoteRef } from '../types'
import AutocompleteList, { CaretPosition } from '../ui/AutocompleteList'
import { filterNoteRefs } from '../utils/noteRefs'

interface NoteLinkAutocompleteProps {
  isVisible: boolean
  query: string
  position: CaretPosition
  currentNoteSid: number
  onSelect: (ref: NoteRef) => void
  onClose: () => void
}

const NoteLinkAutocomplete: React.FC<NoteLinkAutocompleteProps> = ({
  isVisible,
  query,
  position,
  currentNoteSid,
  onSelect,
  onClose,
}) => {
  const refs = useNoteRefs()

  const matches = useMemo(
    () => filterNoteRefs(refs, query, currentNoteSid),
    [refs, query, currentNoteSid],
  )

  return (
    <AutocompleteList
      label="Notes"
      isVisible={isVisible}
      items={matches}
      position={position}
      getKey={(ref) => String(ref.sid)}
      renderItem={(ref) => (
        <>
          <span className="autocomplete-item-title">{ref.title}</span>
          <span className="autocomplete-item-hint">#{ref.sid}</span>
        </>
      )}
      onSelect={onSelect}
      onClose={onClose}
    />
  )
}

export default NoteLinkAutocomplete
