import Highlighted from '../ui/Highlighted'
import { hasMatch } from '../utils/highlight'
import { snippetLines } from '../utils/notes'

type Props = { snippet: string; query?: string; className?: string }

const NoteSnippet: React.FC<Props> = ({ snippet, query = '', className }) => {
  if (hasMatch(snippet, query)) {
    return (
      <div className={className}>
        <Highlighted text={snippet} term={query} />
      </div>
    )
  }

  const [head, ...tail] = snippetLines(snippet)
  return (
    <div className={className}>
      {head && <b>{head}</b>}
      {tail.length > 0 && `\n${tail.join('\n')}`}
    </div>
  )
}

export default NoteSnippet
