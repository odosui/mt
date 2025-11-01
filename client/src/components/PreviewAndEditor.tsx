import React, { useCallback } from 'react'
import Editor from './Editor'
import Preview from './Preview'
import debounce from '../utils/debounce'
import { IImageMetas } from '../types'

const SAVE_THRESHOLD = 1500

const PreviewAndEditor: React.FC<{
  sid: number
  body: string
  mode: 'edit' | 'view'
  previewRef: React.RefObject<HTMLDivElement>
  saveFn: (body: string) => Promise<void>
  onPendingStart?: () => void
  onPendingEnd?: () => void
  imageMetas: IImageMetas
}> = ({
  sid,
  body,
  mode,
  previewRef,
  saveFn,
  onPendingEnd,
  onPendingStart,
  imageMetas,
}) => {
  const saveVal = useCallback(
    debounce(async (val: string) => {
      await saveFn(val)
      onPendingEnd && onPendingEnd()
    }, SAVE_THRESHOLD),
    [saveFn],
  )

  const handleChange = useCallback(
    (val: string) => {
      onPendingStart && onPendingStart()
      saveVal(val)
    },
    [saveVal],
  )

  return (
    <div className="note-editor-body" ref={previewRef}>
      {mode === 'view' && <Preview markdown={body} imageMetas={imageMetas} />}
      {mode === 'edit' && (
        <Editor initialText={body} onChange={handleChange} key={sid} />
      )}
    </div>
  )
}

export default PreviewAndEditor
