import { ArrowSwitchIcon } from '@primer/octicons-react'
import * as React from 'react'
import { useEffect, useState } from 'react'
import api from '../../api'
import { ChangeLog } from '../../types'
import Button from '../../ui/Button'
import GenericModal from '../../ui/GenericModal'
import { formatIso } from '../../utils/dates'

const ChangelogsModal: React.FC<{
  open: boolean
  onClose: () => void
  sid: number
}> = ({ open, onClose, sid }) => {
  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      contentLabel="Using the editor"
      contentClass="changelog-content"
    >
      {open && <ChangeLogs sid={sid} />}
    </GenericModal>
  )
}

const ChangeLogs: React.FC<{ sid: number }> = ({ sid }) => {
  const [logs, setLogs] = useState<string[]>([])
  const [current, setCurrent] = useState<string | null>(null)
  const [item, setItem] = useState<ChangeLog | null>(null)

  useEffect(() => {
    const getLogs = async () => {
      const l = await api.notes.changelogs(sid)
      setLogs(l)
      if (l && l[0]) {
        setCurrent(l[0])
      }
    }

    getLogs()
  }, [sid])

  useEffect(() => {
    const loadChangeLog = async (ts: string) => {
      const cl = await api.changelogs.fetch(sid, ts)
      setItem(cl)
    }

    if (current) {
      loadChangeLog(current)
    }
  }, [sid, current])

  return (
    <div className="changelogs">
      <div className="left">
        <h3>Latest changes</h3>
        <div className="logs-list">
          {logs.map((l) => (
            <div
              className={`item ${l === current ? 'active' : ''}`}
              key={l}
              onClick={() => setCurrent(l)}
            >
              {formatIso(l)}
            </div>
          ))}
        </div>
      </div>

      <div className="right">
        {item && <div className="body">{item.body}</div>}
        <div className="actions">
          <Button icon={<ArrowSwitchIcon />}>Revert to this revision</Button>
        </div>
      </div>
    </div>
  )
}

export default ChangelogsModal
