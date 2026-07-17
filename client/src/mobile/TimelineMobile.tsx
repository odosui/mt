import { useEffect, useState } from 'react'
import { Link } from 'slim-react-router'
import api from '../api'
import Preview from '../components/Preview'
import { TimelineItem } from '../types'
import Spinner from '../ui/Spinner'
import {
  extractYears,
  groupTimeline,
  humanDays,
  sorted,
} from '../utils/timeline'

const ALL_YEARS = 'ALL'

const TimelineMobile = () => {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [yearFilter, setYearFilter] = useState<string>(ALL_YEARS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const resp = await api.notes.timeline()
        setItems(sorted(resp))
      } catch (error) {
        console.error('Failed to load timeline:', error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const years = extractYears(items)

  const filteredItems =
    yearFilter === ALL_YEARS
      ? items
      : items.filter((item) => item.date.startsWith(yearFilter))

  const groups = groupTimeline(filteredItems)

  if (loading) {
    return (
      <div className="mobile-page timeline-mobile">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mobile-page timeline-page">
      <div className="timeline">
        {years.length > 1 && (
          <div className="timeline-filters">
            <div className="timeline-filters-years">
              <button
                className={`timeline-filter-year ${
                  yearFilter === ALL_YEARS ? 'active' : ''
                }`}
                onClick={() => setYearFilter(ALL_YEARS)}
              >
                {ALL_YEARS}
              </button>
              {years.map((year) => (
                <button
                  key={year}
                  className={`timeline-filter-year ${
                    yearFilter === year ? 'active' : ''
                  }`}
                  onClick={() => setYearFilter(year)}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="timeline-list">
          {items.length === 0 && (
            <div className="timeline-empty">No activity yet</div>
          )}

          {groups.map((group) => (
            <ItemGroup
              key={group.key}
              events={group.events}
              title={group.title}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimelineMobile

function ItemGroup({
  events,
  title,
}: {
  events: TimelineItem[]
  title: string
}) {
  return (
    <div className="timeline-group">
      <h2>{title}</h2>
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
              <Link to={`/app/notes/${item.note_sid}`}>{item.note_title}</Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
