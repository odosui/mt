import { Link } from 'slim-react-router'
import Preview from '../../components/Preview'
import { TimelineItem } from '../../types'
import { humanDays } from '../../utils/timeline'

type Props = {
  events: TimelineItem[]
  title: string
}

const TimelineGroup = ({ events, title }: Props) => {
  return (
    <div className="timeline-group">
      <h2>{title}</h2>
      {events.map((item) => (
        <div className="timeline-item" key={item.date + item.content}>
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
              <Link to={`/app/notes/${item.note_sid}`}>{item.note_title}</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TimelineGroup
