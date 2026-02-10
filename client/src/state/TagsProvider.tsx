import * as React from 'react'
import { createContext, useCallback, useEffect, useState } from 'react'
import api from '../api'
import { ITag } from '../types'
import tagsDiff from '../utils/tag_diff'
import { empty, Loadable } from './StateProvider'

interface ITagsState {
  tags: Loadable<ITag[]>
  reflectNoteTagsChange: (oldTags: string[], newTags: string[]) => void
}

export const INITIAL_STATE: ITagsState = {
  tags: empty(),
  reflectNoteTagsChange: () => {},
}

export const TagsContext = createContext<ITagsState>(INITIAL_STATE)

export const useTags = () => React.useContext(TagsContext)

export const TagsProvider = ({ children }: { children: React.ReactNode }) => {
  const [tags, setTags] = useState<Loadable<ITag[]>>(empty())

  useEffect(() => {
    const initialLoad = async () => {
      setTags({ data: [], loading: true })
      const tt = await api.tags.list()
      setTags({ loading: false, data: tt })
    }

    initialLoad()
  }, [])

  const reflectNoteTagsChange = useCallback(
    (oldTags: string[], newTags: string[]) => {
      setTags({
        loading: false,
        data: updateTags(tags.data || [], oldTags, newTags),
      })
    },
    [tags.data],
  )

  const value: ITagsState = {
    tags,
    reflectNoteTagsChange,
  }

  return <TagsContext.Provider value={value}>{children}</TagsContext.Provider>
}

export function updateTags(tags: ITag[], oldTags: string[], newTags: string[]) {
  const diff = tagsDiff(oldTags, newTags)

  const tt = [...tags]

  Object.entries(diff).forEach(([k, v]) => {
    const t = tt.find((t) => t.title == k)
    if (t) {
      t.count = t.count + v
    } else {
      tt.push({ name: k, title: k, count: 1 })
    }
  })

  return tt.filter((t) => t.count > 0).sort((a, b) => b.count - a.count)
}
