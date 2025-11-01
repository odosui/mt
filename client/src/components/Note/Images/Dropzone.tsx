import React from 'react'
import { useCallback, useRef, useState } from 'react'

type Props = {
  onUpload: (file: File) => void
}

export default function Dropzone({ onUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // invoked on file‐picker change or drop
  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return
    if (files.length === 0) return
    const file = files[0]
    if (!file) return
    onUpload(file)
  }, [])

  // click on dropzone → trigger hidden input
  const onClick = () => fileInputRef.current?.click()

  // when user picks via dialog
  const onChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    handleFiles(e.target.files)
    e.target.value = '' // reset so same file can be re‑picked
  }

  // drag events
  const onDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const onDragLeave: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }
  const onDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div
      className="dropzone"
      onClick={onClick}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={onChange}
      />
      {isDragging
        ? 'Release to upload your file'
        : 'Click here or drag & drop a file to upload'}
    </div>
  )
}
