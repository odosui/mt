import { DashIcon, PlusIcon } from '@primer/octicons-react'
import { useState } from 'react'
import { Link } from 'slim-react-router'
import Preview from '../../components/Preview'
import { TimelineItem } from '../../types'
import { humanDays } from '../../utils/timeline'

type Props = {
  events: TimelineItem[]
  title: string
}

const TimelineGroup = ({ events, title }: Props) => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={`timeline-group ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 onClick={() => setIsCollapsed(!isCollapsed)}>
        {title}
        <span className="timeline-group-toggle">
          {isCollapsed ? <PlusIcon /> : <DashIcon />}
        </span>
      </h2>
      <div className="timeline-items-container">
        {events.map((item, ind) => (
          <div
            className="timeline-item"
            key={`${item.note_sid}-${item.date}-${ind}`}
          >
            <span className="timeline-item-date" title={humanDays(item.date)}>
              {item.date}
            </span>
            <div
              className="timeline-item-content"
              style={{
                borderLeft: item.color
                  ? `4px solid ${item.color}`
                  : '4px solid #e0e0e0',
              }}
            >
              <Preview markdown={item.content} imageMetas={{}} />
              <div className="timeline-item-note">
                <Link to={`/app/notes/${item.note_sid}`}>
                  {item.note_title}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TimelineGroup
