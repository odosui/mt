import { useEffect, useState } from 'react'
import api from '../../api'
import { TimelineItem } from '../../types'
import { extractYears, groupTimeline, sorted } from '../../utils/timeline'
import TimelineGroup from './TimelineGroup'

const ALL_YEARS = 'ALL'

const Timeline = () => {
  const [items, setItems] = useState<TimelineItem[]>([])
  const [yearFilter, setYearFilter] = useState<string>(ALL_YEARS)

  useEffect(() => {
    async function load() {
      const resp = await api.notes.timeline()
      setItems(sorted(resp))
    }

    load()
  }, [])

  const years = extractYears(items)

  const filteredItems =
    yearFilter === ALL_YEARS
      ? items
      : items.filter((item) => item.date.startsWith(yearFilter))

  const groups = groupTimeline(filteredItems)

  return (
    <div className="timeline-page">
      <div className="timeline">
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
        <div className="timeline-list">
          {items.length === 0 && (
            <div className="timeline-empty">No activity yet</div>
          )}

          {groups.map((group) => (
            <TimelineGroup
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

export default Timeline
