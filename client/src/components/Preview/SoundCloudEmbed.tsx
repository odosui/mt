const CAPTION_STYLE: React.CSSProperties = {
  fontSize: '10px',
  color: '#cccccc',
  lineBreak: 'anywhere',
  wordBreak: 'normal',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  fontFamily:
    'Interstate,Lucida Grande,Lucida Sans Unicode,Lucida Sans,Garuda,Verdana,Tahoma,sans-serif',
  fontWeight: 100,
}

const LINK_STYLE: React.CSSProperties = {
  color: '#cccccc',
  textDecoration: 'none',
}

function parseMeta(content: string): Record<string, string> {
  return Object.fromEntries(
    content.split('\n').map((line) => {
      const [key, value] = line.split(':')
      return [key, value?.trim() || '']
    }),
  )
}

const SoundCloudEmbed: React.FC<{ content: string }> = ({ content }) => {
  const meta = parseMeta(content)
  const trackId = encodeURIComponent(meta.track_id ?? '')
  const user = encodeURIComponent(meta.user ?? '')
  const trackName = encodeURIComponent(meta.track_name ?? '')
  const trackTitle = meta.track_title ?? ''

  if (!trackId || !user) {
    return (
      <div className="code-error">
        SoundCloud embed error: missing track_id or user
      </div>
    )
  }

  return (
    <div
      className="soundcloud"
      style={{ backgroundColor: '#222', borderRadius: '4px', padding: '8px' }}
    >
      <div className="soundcloud-embed">
        <iframe
          width="100%"
          height="20"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/${trackId}&color=%23ff5500&inverse=true&auto_play=false&show_user=true`}
        ></iframe>
        <div style={CAPTION_STYLE}>
          <a
            href={`https://soundcloud.com/${user}`}
            title="YT"
            target="_blank"
            style={LINK_STYLE}
          >
            YT
          </a>
          {' · '}
          <a
            href={`https://soundcloud.com/${user}/${trackName}`}
            title={trackTitle}
            target="_blank"
            style={LINK_STYLE}
          >
            {trackTitle}
          </a>
        </div>
      </div>
    </div>
  )
}

export default SoundCloudEmbed
