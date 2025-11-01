import React, { useCallback, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism } from 'react-syntax-highlighter'
import { atomDark as theme } from 'react-syntax-highlighter/dist/esm/styles/prism'
import remarkGfm from 'remark-gfm'
import CrossLink from './CrossLink'
import Mermaid from './Mermaid'
import HashTagPlugin from '../../utils/rehype/tag_plugin'
import { IImageMetas } from '../../types'

const Preview: React.FC<{
  markdown: string
  imageMetas: IImageMetas
}> = ({ markdown, imageMetas }) => {
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

      const meta = imageMetas[src]
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

  const components = useMemo(() => {
    return {
      code: renderCode,
      a: renderLink,
      span: renderSpan,
      img: renderImage,
    }
  }, [renderImage])

  return (
    <div className="note-preview">
      <ReactMarkdown
        linkTarget="_blank"
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[HashTagPlugin]}
        components={components}
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

function renderCode(aprops: any) {
  const { inline, className, children, ...props } = aprops

  if (inline) {
    return (
      <code className="inline" {...props}>
        {children}
      </code>
    )
  }

  const content = String(children).replace(/\n$/, '')

  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : 'none'

  if (content.trim() && lang === 'soundcloud') {
    const c = props.node.children[0].value

    const meta = Object.fromEntries(
      c.split('\n').map((p: string) => {
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
    // } else {
    //   return <div className="code-error">Mermaid parse error: ${res}</div>
    // }
  }

  if (content.trim() && lang === 'mermaid') {
    const props = parseProps(aprops.node.data?.meta)

    // props to styles

    const styles: any = {}

    if (props.width) {
      styles.width = props.width
    }

    if (props.align) {
      if (props.align === 'center') {
        styles.marginLeft = 'auto'
        styles.marginRight = 'auto'
      } else if (props.align === 'left') {
        styles.marginLeft = 0
        styles.marginRight = 'auto'
      } else {
        console.error('Invalid align value', props.align)
      }
    }

    // const res = tryParsingMermaid(content)

    // if (res === true) {
    return (
      <div className="mermaid" style={styles}>
        <Mermaid code={content} />
      </div>
    )
    // } else {
    //   return <div className="code-error">Mermaid parse error: ${res}</div>
    // }
  }

  return (
    <div className="code-block">
      <Prism style={theme as any} language={lang} {...props}>
        {content}
      </Prism>
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
