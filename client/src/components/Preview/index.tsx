import React, { lazy, Suspense, useCallback, useMemo, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { PrismAsyncLight as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark as theme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import { IImageMetas } from '../../types'
import HashTagPlugin from '../../utils/rehype/tag_plugin'
import CrossLink from './CrossLink'

const Mermaid = lazy(() => import('./Mermaid'))

function toggleCheckbox(markdown: string, index: number): string {
  const pattern = /- \[([ xX])\]/g
  let count = 0
  return markdown.replace(pattern, (match, check) => {
    if (count++ === index) {
      return check === ' ' ? '- [x]' : '- [ ]'
    }
    return match
  })
}

const Preview: React.FC<{
  markdown: string
  imageMetas: IImageMetas
  onCheckboxToggle?: (updatedMarkdown: string) => void
}> = ({ markdown, imageMetas, onCheckboxToggle }) => {
  const renderImage = useCallback(
    ({
      node: {
        properties: { alt, src },
      },
    }: any) => {
      if (!src) {
        console.error('Image src is empty')
        return null
      }

      const meta = imageMetas?.[src]
      if (!meta) {
        return (
          <div>
            ~~image <b>{src}</b> is missing~~
          </div>
        )
      }

      const imageUrl = meta.url
      const ratio = meta.ratio

      return (
        <figure>
          <div style={{ width: '100%', aspectRatio: ratio ?? 'inherit' }}>
            <img src={imageUrl} alt={alt} />
          </div>
          <figcaption>{alt}</figcaption>
        </figure>
      )
    },
    [imageMetas],
  )

  const checkboxIndex = useRef(0)

  const renderInput = useCallback(
    (props: any) => {
      const { node: _node, ...rest } = props
      if (rest.type === 'checkbox') {
        const idx = checkboxIndex.current++
        return (
          <input
            {...rest}
            disabled={!onCheckboxToggle}
            onChange={() => {
              if (onCheckboxToggle) {
                onCheckboxToggle(toggleCheckbox(markdown, idx))
              }
            }}
          />
        )
      }
      return <input {...rest} />
    },
    [markdown, onCheckboxToggle],
  )

  // Reset checkbox counter before each render
  checkboxIndex.current = 0

  const components = useMemo(() => {
    return {
      code: renderInlineCode,
      pre: renderPreBlock,
      a: renderLink,
      span: renderSpan,
      img: renderImage,
      input: renderInput,
    }
  }, [renderImage, renderInput])

  return (
    <div className="note-preview">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[HashTagPlugin]}
        components={components}
        urlTransform={(url) => url}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

function renderSpan({ node }: any) {
  if (node.hashtag) {
    return <span className="tag">{node.hashtag}</span>
  } else {
    return <span>{node.children}</span>
  }
}

function renderInlineCode({ children, ...props }: any) {
  return (
    <code className="inline" {...props}>
      {children}
    </code>
  )
}

function renderPreBlock({ node }: any) {
  const codeNode = node?.children?.find((c: any) => c.tagName === 'code')
  const className = codeNode?.properties?.className?.[0] || ''
  const content = String(codeNode?.children?.[0]?.value || '').replace(
    /\n$/,
    '',
  )

  const match = /language-(\w+)/.exec(className)
  const lang = match ? match[1] : 'none'

  if (content.trim() && lang === 'soundcloud') {
    const meta = Object.fromEntries(
      content.split('\n').map((p: string) => {
        const [key, value] = p.split(':')
        return [key, value?.trim() || '']
      }),
    )
    const { track_id, track_name, track_title, user } = meta

    if (!track_id || !user) {
      return (
        <div className="code-error">
          SoundCloud embed error: missing track_id or user
        </div>
      )
    }

    const embed = `
<iframe width="100%" height="20" scrolling="no" frameborder="no" allow="autoplay" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${track_id}&color=%23ff5500&inverse=true&auto_play=false&show_user=true"></iframe><div style="font-size: 10px; color: #cccccc;line-break: anywhere;word-break: normal;overflow: hidden;white-space: nowrap;text-overflow: ellipsis; font-family: Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif;font-weight: 100;"><a href="https://soundcloud.com/${user}" title="YT" target="_blank" style="color: #cccccc; text-decoration: none;">YT</a> · <a href="https://soundcloud.com/${user}/${track_name}" title="${track_title}" target="_blank" style="color: #cccccc; text-decoration: none;">${track_title}</a></div>
    `.trim()

    return (
      <div
        className="soundcloud"
        style={{
          backgroundColor: '#222',
          borderRadius: '4px',
          padding: '8px',
        }}
      >
        <div
          className="soundcloud-embed"
          dangerouslySetInnerHTML={{ __html: embed }}
        ></div>
      </div>
    )
  }

  if (content.trim() && lang === 'mermaid') {
    const metaProps = parseProps(codeNode?.data?.meta)

    const styles: any = {}

    if (metaProps.width) {
      styles.width = metaProps.width
    }

    if (metaProps.align) {
      if (metaProps.align === 'center') {
        styles.marginLeft = 'auto'
        styles.marginRight = 'auto'
      } else if (metaProps.align === 'left') {
        styles.marginLeft = 0
        styles.marginRight = 'auto'
      } else {
        console.error('Invalid align value', metaProps.align)
      }
    }

    return (
      <div className="mermaid" style={styles}>
        <Suspense fallback={null}>
          <Mermaid code={content} />
        </Suspense>
      </div>
    )
  }

  return (
    <div className="code-block">
      <SyntaxHighlighter style={theme as any} language={lang}>
        {content}
      </SyntaxHighlighter>
    </div>
  )
}

function renderLink(props: any) {
  const {
    children,
    node: { properties },
  } = props
  if (!properties) {
    return null
  }

  const href = properties['href']
  if (!href) {
    return null
  }

  const str = href.toString()
  const match = str.match(/^\d+$/)
  if (match) {
    const noteId = str
    return <CrossLink noteId={noteId}>{children}</CrossLink>
  } else {
    return (
      <a href={str} target="_blank" rel="noreferrer noopener">
        {children}
      </a>
    )
  }
}

function parseProps(meta: string | undefined) {
  if (!meta) {
    return {}
  }

  let props: any = {}
  try {
    props = JSON.parse(meta)
  } catch (e) {
    console.error('Error parsing mermaid meta', e, meta)
  }

  // props default values

  if (!props.width) {
    props.width = '100%'
  }

  if (!props.align) {
    props.align = 'left'
  }

  return props
}

export default Preview
