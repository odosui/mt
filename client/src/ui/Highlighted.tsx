import { Fragment } from 'react'
import { splitByTerm } from '../utils/highlight'

const Highlighted: React.FC<{ text: string; term: string }> = ({
  text,
  term,
}) => (
  <>
    {splitByTerm(text, term).map((part, i) =>
      part.isMatch ? (
        <mark key={i}>{part.text}</mark>
      ) : (
        <Fragment key={i}>{part.text}</Fragment>
      ),
    )}
  </>
)

export default Highlighted
