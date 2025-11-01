import * as React from 'react'
import { createContext, useCallback, useEffect, useState, useRef } from 'react'
import api from '../api'
import { INote, INoteSearch, ITag } from '../types'
import tagsDiff from '../utils/tag_diff'

interface Loadable<T> {
  loading: boolean
  data: T | null
}

interface IState {
  tags: Loadable<ITag[]>
  totalNoteCount: number | null
  notes: Loadable<INoteSearch[]>
  previewNote: Loadable<INote>
  reviewCount: number | null // notes
  questionsCount: number | null
  focusMode: boolean
  search: (
    query: string,
    isReview: boolean,
    isFav: boolean,
    tag?: string,
  ) => Promise<INoteSearch[]>
  addNewNote: () => Promise<number>
  loadPreviewNote: (sid: number | null) => Promise<void>
  saveCurrentNote: (val: string) => Promise<void>
  toggleFavCurrentNote: () => Promise<void>
  deleteCurrentNote: () => Promise<void>
  markReviewedCurrentNote: () => Promise<void>
  publishCurrentNote: (
    slug: string,
    title: string,
    description: string,
  ) => Promise<void>
  unpublishCurrentNote: () => Promise<void>
  toggleFocusMode: () => void
  reloadCounters: () => Promise<void>
  removeCurrentNote: () => void
  getCurrentNodeNeighborSid: () => number | null
  switchNote: (sid: number) => Promise<void>
  currentNote: INote | null
  noteSaving: boolean
  noteLoading: boolean
  sid: number | null
  flashcardsVisible: boolean
  toggleFlashcardsVisible: () => void
  imagesVisible: boolean
  toggleImagesVisible: () => void
  createNoteAndLinkFromCurrent: (title: string) => Promise<void>
  timelineCount: number | null
  pinNote: (sid: number) => Promise<void>
  unpinNote: (sid: number) => Promise<void>
}

export const INITIAL_STATE: IState = {
  tags: empty(),
  notes: empty(),
  currentNote: null,
  previewNote: empty(),
  reviewCount: null,
  questionsCount: null,
  search: async () => [],
  addNewNote: async () => 0,
  loadPreviewNote: async () => {},
  saveCurrentNote: async () => {},
  deleteCurrentNote: async () => {},
  markReviewedCurrentNote: async () => {},
  publishCurrentNote: async () => {},
  unpublishCurrentNote: async () => {},
  toggleFocusMode: () => {},
  focusMode: false,
  reloadCounters: async () => {},
  removeCurrentNote: () => {},
  getCurrentNodeNeighborSid: () => null,
  switchNote: async () => {},
  noteSaving: false,
  noteLoading: false,
  sid: null,
  toggleFavCurrentNote: async () => {},
  flashcardsVisible: true,
  toggleFlashcardsVisible: () => {},
  imagesVisible: true,
  toggleImagesVisible: () => {},
  totalNoteCount: null,
  timelineCount: null,
  createNoteAndLinkFromCurrent: async () => {},
  pinNote: async () => {},
  unpinNote: async () => {},
}

export const StateContext = createContext<IState>(INITIAL_STATE)

export const StateProvider = ({ children }: { children: React.ReactNode }) => {
  const [tags, setTags] = useState<Loadable<ITag[]>>(empty())
  const [notes, setNotes] = useState<Loadable<INoteSearch[]>>(empty())
  const [reviewCount, setReviewCount] = useState<number | null>(null)
  const [questionsCount, setQuestionsCount] = useState<number | null>(null)
  const [previewNote, setPreviewNote] = useState<Loadable<INote>>(empty())
  const [focusMode, setFocusMode] = useState(false)
  const [totalNoteCount, setTotalNoteCount] = useState<number | null>(null)
  const [timelineCount, setTimelineCount] = useState<number | null>(null)

  const [sid, setSid] = useState<number | null>(null)
  const [noteLoading, setNoteLoading] = useState(false)
  const [noteSaving, setNoteSaving] = useState(false)

  const [cachedSearchParams, setCachedSearchParams] = useState({
    q: '',
    isReview: false,
    tag: '',
  })

  // Flashcards
  const [flashcardsVisible, setFlashcardsVisible] = useState(false)

  const toggleFlashcardsVisible = useCallback(() => {
    setFlashcardsVisible((s) => !s)
  }, [])

  const [imagesVisible, setImagesVisible] = useState(false)

  const toggleImagesVisible = useCallback(() => {
    setImagesVisible((s) => !s)
  }, [])

  // App cache to store the full notes
  const fullNotes = useRef<Record<string, INote>>({})

  // === HELPERS ===
  const getCurrentNote = useCallback(() => {
    if (!sid) {
      return null
    }
    return fullNotes.current[sid.toString()] || null
  }, [sid, fullNotes])

  const toggleFocusMode = useCallback(() => {
    setFocusMode((s) => !s)
  }, [])

  const search = useCallback(
    async (q: string, isReview: boolean, isFav: boolean, tag?: string) => {
      if (
        notes.data !== null &&
        q === cachedSearchParams.q &&
        isReview === cachedSearchParams.isReview &&
        tag === cachedSearchParams.tag
      ) {
        return notes.data
      }

      setNotes({ loading: true, data: null })
      const n = await api.notes.list(
        q,
        0,
        tag ? [tag] : undefined,
        isReview,
        isFav,
      )

      setNotes({ loading: false, data: n })

      setCachedSearchParams({ q, isReview, tag: tag || '' })
      return n
    },
    [],
  )

  const loadNoteBySid = useCallback(
    async (s: number, force = false) => {
      const sidStr = s.toString()
      const note = fullNotes.current[sidStr]
      if (!note || force) {
        setNoteLoading(true)
        const n = await api.notes.fetch(s)
        fullNotes.current[s] = n
        setNoteLoading(false)
      }
    },
    [fullNotes],
  )

  const switchNote = useCallback(
    async (sid: number) => {
      setSid(sid)
      loadNoteBySid(sid)
    },
    [loadNoteBySid],
  )

  const loadPreviewNote = useCallback(async (sid: number | null) => {
    if (sid === null) {
      setTimeout(() => {
        setPreviewNote({ loading: false, data: null })
      }, 500)
      return
    }
    setPreviewNote({ loading: true, data: null })
    const n = await api.notes.fetch(sid)
    setPreviewNote({ loading: false, data: n })
  }, [])

  const saveCurrentNote = useCallback(
    async (val: string) => {
      const note = getCurrentNote()
      if (!note) {
        return
      }
      const oldTags = note.tags

      setNoteSaving(true)
      const updatedNote = await api.notes.update(note.sid, val)
      setNotes({
        loading: false,
        data: replaceNote(notes.data || [], note.sid, updatedNote),
      })
      fullNotes.current[note.sid] = {
        ...note,
        body: updatedNote.body,
        tags: updatedNote.tags,
      }
      setNoteSaving(false)

      const newTags = updatedNote.tags
      setTags({
        loading: false,
        data: updateTags(tags.data || [], oldTags, newTags),
      })
    },
    [fullNotes, notes.data, tags.data, getCurrentNote],
  )

  const toggleFavCurrentNote = useCallback(async () => {
    const note = getCurrentNote()
    if (!note) {
      return
    }

    const fn = fullNotes.current

    setNoteSaving(true)
    fn[note.sid] = {
      ...note,
      favorite: !note.favorite,
    }
    if (note.favorite) {
      await api.notes.unfav(note.sid)
    } else {
      await api.notes.fav(note.sid)
    }
    setNoteSaving(false)
  }, [getCurrentNote])

  const deleteCurrentNote = useCallback(async () => {
    const note = getCurrentNote()
    if (!note) {
      return
    }
    await api.notes.del(note.sid)

    const newNotes = (notes.data || []).filter((n) => n.sid !== note.sid)
    delete fullNotes.current[note.sid]
    setNotes({ loading: false, data: newNotes })

    setFocusMode(false)
  }, [notes.data, fullNotes, getCurrentNote])

  const addNewNote = useCallback(async () => {
    const newNote = await api.notes.create('# New note')
    const newSearchNote = {
      id: newNote.id,
      sid: newNote.sid,
      snippet: '# New note',
      tags: [],
      pinned: false,
    }
    setNotes({ loading: false, data: [newSearchNote, ...(notes.data || [])] })
    await loadNoteBySid(newNote.sid)
    return newNote.sid
  }, [notes.data, loadNoteBySid])

  const markReviewedCurrentNote = useCallback(async () => {
    const note = getCurrentNote()
    if (!note) {
      return
    }
    await api.reviews.done(note.sid)

    // TODO: update the schedule from the server

    fullNotes.current[note.sid] = { ...note, needs_review: false }

    const newCount = (reviewCount || 1) - 1
    setReviewCountWrapper({ notes: newCount, questions: questionsCount || 0 })
  }, [fullNotes, questionsCount, reviewCount, getCurrentNote])

  // only to remove it from the list, not physically delete it
  const removeCurrentNote = useCallback(() => {
    const note = getCurrentNote()
    if (!note) {
      return
    }
    const sid = note.sid
    const newNotes = (notes.data || []).filter((n) => n.sid !== sid)
    setNotes({ loading: false, data: newNotes })
  }, [notes.data, getCurrentNote])

  const getCurrentNodeNeighborSid = useCallback(() => {
    const cNote = getCurrentNote()

    if (!notes.data || !cNote) {
      return null
    }

    const ind = (notes.data || []).findIndex((n) => n.sid === cNote.sid)
    return (notes.data[ind + 1] || notes.data[ind - 1])?.sid || null
  }, [notes.data, getCurrentNote])

  const publishCurrentNote = useCallback(
    async (slug: string, title: string, description: string) => {
      const note = getCurrentNote()
      if (!note) {
        return
      }
      const newNote = await api.notes.publish(
        note.sid,
        slug,
        title,
        description,
      )

      fullNotes.current[newNote.sid] = {
        ...note,
        slug: slug,
        published: true,
        seo_title: title,
        seo_description: description,
        seo_url: newNote.seo_url,
      }

      // trigger a re-render
      setNotes((s) => ({
        ...s,
        data: s.data,
      }))
    },
    [fullNotes, getCurrentNote],
  )

  const unpublishCurrentNote = useCallback(async () => {
    const note = getCurrentNote()
    if (!note) {
      return
    }
    await api.notes.unpublish(note.sid)

    fullNotes.current[note.sid] = {
      ...note,
      published: false,
    }

    // trigger a re-render
    setNotes((s) => ({
      ...s,
      data: s.data,
    }))
  }, [fullNotes, getCurrentNote])

  function setReviewCountWrapper({
    questions,
    notes,
  }: {
    questions: number
    notes: number
  }) {
    setReviewCount(notes)
    setQuestionsCount(questions)

    const nav = window.navigator
    const n = questions + notes
    if (nav.setAppBadge) {
      n > 0 ? nav.setAppBadge(n) : nav.clearAppBadge()
    }
  }

  async function reloadCounters() {
    const n = await api.reviews.list()
    setReviewCountWrapper(n.counts)
  }

  async function createNoteAndLinkFromCurrent(title: string) {
    if (!title) {
      console.warn('createNoteAndLinkFromCurrent: no title')
      return
    }

    // create a new note
    const newNote = await api.notes.create(`# ${title}`)

    // update current note to insert the link
    const curNote = getCurrentNote()
    if (!curNote) {
      return
    }
    const newBody = curNote.body.replace(title, `[${title}](${newNote.sid})`)

    // save the current note
    setNoteSaving(true)
    const updatedNote = await api.notes.update(curNote.sid, newBody)

    // insert into notes
    setNotes({
      loading: false,
      data: replaceNote(notes.data || [], curNote.sid, updatedNote),
    })
    fullNotes.current[curNote.sid] = {
      ...curNote,
      body: updatedNote.body,
      tags: updatedNote.tags,
    }
    setNoteSaving(false)

    // now insert the new note
    setNotes({ loading: false, data: [newNote, ...(notes.data || [])] })
  }

  async function pinNote(sid: number) {
    const note = notes.data?.find((n) => n.sid === sid)
    if (!note) {
      return
    }

    await api.notes.pin(sid)

    setNotes((prev) => ({
      ...prev,
      data: (prev.data ?? []).map((n) =>
        n.sid === sid ? { ...n, pinned: true } : n,
      ),
    }))
  }

  async function unpinNote(sid: number) {
    const note = notes.data?.find((n) => n.sid === sid)
    if (!note) {
      return
    }

    await api.notes.unpin(sid)

    setNotes((prev) => ({
      ...prev,
      data: (prev.data ?? []).map((n) =>
        n.sid === sid ? { ...n, pinned: false } : n,
      ),
    }))
  }

  useEffect(() => {
    const initialLoad = async () => {
      // tags
      setTags({ data: [], loading: true })
      const tt = await api.tags.list()
      setTags({ loading: false, data: tt })

      // counters
      const counts = await api.notes.counts()
      setTotalNoteCount(counts.total_notes)
      setTimelineCount(counts.timeline_count)

      await reloadCounters()
    }

    initialLoad()
  }, [])

  const value: IState = {
    tags,
    reviewCount,
    questionsCount,
    notes,
    currentNote: getCurrentNote() || null,
    previewNote,
    focusMode,
    toggleFocusMode,
    noteSaving,
    noteLoading,
    sid,
    flashcardsVisible,
    imagesVisible,
    search,
    addNewNote,
    saveCurrentNote,
    deleteCurrentNote,
    loadPreviewNote,
    markReviewedCurrentNote,
    publishCurrentNote,
    unpublishCurrentNote,
    reloadCounters,
    removeCurrentNote,
    getCurrentNodeNeighborSid,
    switchNote,
    toggleFavCurrentNote,
    toggleFlashcardsVisible,
    toggleImagesVisible,
    totalNoteCount,
    timelineCount,
    createNoteAndLinkFromCurrent,
    pinNote,
    unpinNote,
  }

  return <StateContext.Provider value={value}>{children}</StateContext.Provider>
}

function empty() {
  return {
    loading: false,
    data: null,
  }
}

function updateTags(tags: ITag[], oldTags: string[], newTags: string[]) {
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

function replaceNote(notes: INoteSearch[], sid: number, note: INote) {
  const newNotes: INoteSearch[] = notes.map((n) =>
    n.sid === sid
      ? {
          ...n,
          snippet: note.snippet,
          tags: note.tags,
          updated_at_in_words: note.updated_at_in_words,
        }
      : n,
  )

  return newNotes
}
