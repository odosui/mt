import React, { memo, useEffect, useRef } from 'react'

let mermaidInitialized = false

async function getMermaid() {
  const { default: mermaid } = await import('mermaid')
  if (!mermaidInitialized) {
    mermaid.initialize({ startOnLoad: false })
    mermaidInitialized = true
  }
  return mermaid
}

const Mermaid: React.FC<{ code: string }> = ({ code }) => {
  const ref: React.Ref<HTMLDivElement> | null = useRef(null)

  const render = async () => {
    const mermaid = await getMermaid()
    if (ref.current !== null) {
      const { svg } = await mermaid.render(nextId(), code, ref.current)
      ref.current.innerHTML = svg
    }
  }

  useEffect(() => {
    if (ref.current !== null) {
      render()
    }
  }, [code])

  return <div ref={ref} />
}

function nextId() {
  return 'id' + uuid().replaceAll(/[\s|-]/g, '')
}

export default memo(Mermaid)

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
