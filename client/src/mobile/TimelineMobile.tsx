import React, { useEffect, useState } from 'react'
import { TimelineItem } from '../types'
import api from '../api'
import Preview from '../components/Preview'
import { Link } from 'react-router-dom'
import Spinner from '../ui/Spinner'
import {
  sorted,
  extractYears,
  group,
  humanDays,
  takeYear,
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

  const {
    passedEvents,
    todaysEvents,
    tomorrowsEvents,
    thisWeeksEvents,
    thisMonthsEvents,
    nextMonthsEvents,
    thisYearsEvents,
    nextYearsEvents,
    futureEvents,
  } = group(filteredItems)

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

          {todaysEvents && todaysEvents.length > 0 && (
            <ItemGroup events={todaysEvents} title="Today" />
          )}

          {tomorrowsEvents && tomorrowsEvents.length > 0 && (
            <ItemGroup events={tomorrowsEvents} title="Tomorrow" />
          )}

          {thisWeeksEvents && thisWeeksEvents.length > 0 && (
            <ItemGroup events={thisWeeksEvents} title="This Week" />
          )}

          {thisMonthsEvents && thisMonthsEvents.length > 0 && (
            <ItemGroup events={thisMonthsEvents} title="This Month" />
          )}

          {nextMonthsEvents && nextMonthsEvents.length > 0 && (
            <ItemGroup events={nextMonthsEvents} title="Next Month" />
          )}

          {thisYearsEvents && thisYearsEvents.length > 0 && (
            <ItemGroup
              events={thisYearsEvents}
              title={`This Year (${takeYear(thisYearsEvents[0]?.date ?? '')})`}
            />
          )}

          {nextYearsEvents && nextYearsEvents.length > 0 && (
            <ItemGroup
              events={nextYearsEvents}
              title={`Next Year (${takeYear(nextYearsEvents[0]?.date ?? '')})`}
            />
          )}

          {passedEvents && passedEvents.length > 0 && (
            <ItemGroup events={passedEvents} title="Passed Events" />
          )}

          {futureEvents && futureEvents.length > 0 && (
            <ItemGroup events={futureEvents} title="Future Events" />
          )}
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
