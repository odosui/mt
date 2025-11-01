import { LinkIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useContext, useState } from 'react'
import { StateContext } from '../../state/StateProvider'
import { INote } from '../../types'
import GenericModal from '../../ui/GenericModal'

const PublishSettingsModal: React.FC<{
  open: boolean
  onClose: () => void
  note: INote
}> = ({ open, onClose, note }) => {
  const [title, setTitle] = useState(note.seo_title || figureTitle(note.body))
  const [slug, setSlug] = useState(
    note.slug || dashCase(figureTitle(note.body)),
  )
  const [desc, setDesc] = useState(note.seo_description || '')

  const { publishCurrentNote, unpublishCurrentNote } = useContext(StateContext)

  const publish: React.MouseEventHandler = (e) => {
    e.preventDefault()
    if (!slug || !title) {
      return
    }
    if (slug.length < 3 || title.length < 3) {
      return
    }
    publishCurrentNote(slug, title, desc)
  }

  const unpublish: React.MouseEventHandler = (e) => {
    e.preventDefault()
    unpublishCurrentNote()
  }

  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      contentLabel="Publish settings"
    >
      <div className="publish-form">
        <h2>Publish note</h2>
        {note.published && note.seo_url ? (
          <p className="link">
            <LinkIcon />
            <a href={note.seo_url} target="_blank" rel="noopener nofollow">
              {note.seo_url}
            </a>
          </p>
        ) : (
          <p className="warning">
            Publishing makes a note visible for anyone on the internet
            (including search engines).
          </p>
        )}

        {
          <form>
            <div className="form-input">
              <label>
                Title*
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </label>
            </div>
            <div className="form-input">
              <label>
                Slug*
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </label>
            </div>
            <div className="form-input">
              <label>
                Short description
                <textarea
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </label>
            </div>
            <div className="form-input buttons">
              {note.published && (
                <a href="#" onClick={unpublish}>
                  Unpublish
                </a>
              )}
              <button className="btn big" onClick={publish}>
                {note.published ? 'Update' : 'Publish'}
              </button>
            </div>
          </form>
        }
      </div>
    </GenericModal>
  )
}

export default PublishSettingsModal

function figureTitle(body: string) {
  if (!body) {
    return ''
  }

  const firstLine = body.split('\n')[0]
  if (!firstLine) {
    return ''
  }
  if (!firstLine.startsWith('# ')) {
    return ''
  }

  return firstLine.substring(2)
}

function dashCase(str: string): string {
  return str.replace(/\s+/g, '-').toLowerCase()
}
