import { useEffect, useState } from 'react'
import api from '../../api'
import { TimelineItem } from '../../types'
import {
  extractYears,
  formatMonthYear,
  groupTimeline,
  sorted,
  takeYear,
} from '../../utils/timeline'
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

  const {
    passedEvents,
    todaysEvents,
    tomorrowsEvents,
    thisWeeksEvents,
    nextWeeksEvents,
    thisMonthsEvents,
    nextMonthsEvents,
    secondNextMonthsEvents,
    thirdNextMonthsEvents,
    thisYearsEvents,
    nextYearsEvents,
    futureEvents,
  } = groupTimeline(filteredItems)

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

          {passedEvents && passedEvents.length > 0 && (
            <TimelineGroup events={passedEvents} title="Passed Events" />
          )}

          {todaysEvents && todaysEvents.length > 0 && (
            <TimelineGroup events={todaysEvents} title="Today" />
          )}

          {tomorrowsEvents && tomorrowsEvents.length > 0 && (
            <TimelineGroup events={tomorrowsEvents} title="Tomorrow" />
          )}

          {thisWeeksEvents && thisWeeksEvents.length > 0 && (
            <TimelineGroup events={thisWeeksEvents} title="This Week" />
          )}

          {nextWeeksEvents && nextWeeksEvents.length > 0 && (
            <TimelineGroup events={nextWeeksEvents} title="Next Week" />
          )}

          {thisMonthsEvents && thisMonthsEvents.length > 0 && (
            <TimelineGroup events={thisMonthsEvents} title="This Month" />
          )}

          {nextMonthsEvents && nextMonthsEvents.length > 0 && (
            <TimelineGroup events={nextMonthsEvents} title="Next Month" />
          )}

          {secondNextMonthsEvents && secondNextMonthsEvents.length > 0 && (
            <TimelineGroup
              events={secondNextMonthsEvents}
              title={formatMonthYear(secondNextMonthsEvents[0]?.date ?? '')}
            />
          )}

          {thirdNextMonthsEvents && thirdNextMonthsEvents.length > 0 && (
            <TimelineGroup
              events={thirdNextMonthsEvents}
              title={formatMonthYear(thirdNextMonthsEvents[0]?.date ?? '')}
            />
          )}

          {thisYearsEvents && thisYearsEvents.length > 0 && (
            <TimelineGroup
              events={thisYearsEvents}
              title={`This Year (${takeYear(thisYearsEvents[0]?.date ?? '')})`}
            />
          )}

          {nextYearsEvents && nextYearsEvents.length > 0 && (
            <TimelineGroup
              events={nextYearsEvents}
              title={`Next Year (${takeYear(nextYearsEvents[0]?.date ?? '')})`}
            />
          )}

          {futureEvents && futureEvents.length > 0 && (
            <TimelineGroup events={futureEvents} title="Future Events" />
          )}
        </div>
      </div>
    </div>
  )
}

export default Timeline
