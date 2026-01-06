import { CheckIcon, GitBranchIcon } from '@primer/octicons-react'
import { useEffect, useState } from 'react'
import api from '../api'

const GitStatus = () => {
  const [changedFiles, setChangedFiles] = useState(0)
  const [branch, setBranch] = useState<string | null>(null)
  const [ahead, setAhead] = useState(0)
  const [behind, setBehind] = useState(0)
  const [isGitRepo, setIsGitRepo] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const res = await api.sync.status()
      setChangedFiles(res.changed_files)
      setBranch(res.branch)
      setAhead(res.ahead)
      setBehind(res.behind)
      setIsGitRepo(res.is_git_repo ?? true)
    }
    fetch()
  }, [])

  const hasChanges = changedFiles > 0
  const hasRemoteDiff = ahead > 0 || behind > 0

  if (!isGitRepo) {
    return null
  }

  return (
    <div className={`git-status ${hasChanges ? 'has-changes' : ''}`}>
      <GitBranchIcon />
      <span className="git-status-branch">{branch}</span>
      {hasRemoteDiff && (
        <span className="git-status-remote">
          {ahead > 0 && `↑${ahead}`}
          {behind > 0 && `↓${behind}`}
        </span>
      )}
      {hasChanges ? (
        <span className="git-status-count">{changedFiles}</span>
      ) : (
        <CheckIcon className="git-status-check" />
      )}
    </div>
  )
}

export default GitStatus
