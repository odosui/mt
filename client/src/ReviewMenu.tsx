import * as React from 'react'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const ReviewMenu: React.FC<{
  // noteSid: number;
  upcomingReviews: { level: number; days_left: number }[]
}> = ({ upcomingReviews }) => {
  // const [reviewLogs, setReviewLogs] = useState<ReviewLog[]>([]);

  // useEffect(() => {
  //   const load = async () => {
  //     const d = await api.notes.reviewlogs(noteSid);
  //     setReviewLogs(d);
  //   };

  //   load();
  // }, [noteSid]);

  const nextLevel = upcomingReviews[0] ? upcomingReviews[0].level : null

  const all = [
    ...upcomingReviews.map((r) => ({
      level: r.level,
      d: daysTill(r.days_left),
      done: false,
      next: nextLevel === r.level,
    })),
    // ...reviewLogs.map((r) => ({
    //   level: r.new_level,
    //   d: daysAgo(r.created_at),
    //   done: true,
    //   next: false,
    // })),
  ].sort((a, b) => b.level - a.level)

  return (
    <div className="review-menu">
      <div className="review-logs">
        {all.map((r) => (
          <div
            className={`item ${r.done ? 'done' : ''} ${r.next ? 'next' : ''}`}
            key={r.level}
          >
            <div className="log-level">L{r.level}</div>
            <div className="log-date">{r.d}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// function daysAgo(str: string) {
//   const d = dayjs().diff(dayjs(str), "days");
//   if (d === 0) {
//     return "today";
//   }
//   return `${d} days ago`;
// }

function daysTill(days: number) {
  if (days <= 0) {
    return 'review now'
  }
  if (days === 1) {
    return 'tomorrow'
  }
  return 'in ' + days + ' ' + (days % 10 === 1 ? 'day' : 'days')
}

export default ReviewMenu
