import React, { memo, useEffect, useRef } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({ startOnLoad: false })

const Mermaid: React.FC<{ code: string }> = ({ code }) => {
  const ref: React.Ref<HTMLDivElement> | null = useRef(null)

  const render = async () => {
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

export const tryParsingMermaid = async (
  code: string,
): Promise<true | string> => {
  if (!code) {
    return 'Empty mermaid code'
  }

  try {
    const res = await mermaid.parse(code)
    console.log('mermaid parsable status', res)
    return true
  } catch (e: any) {
    return e.message
  }
}

export default memo(Mermaid)

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}
