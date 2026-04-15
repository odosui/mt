export interface INoteSearch {
  id: number
  snippet: string
  sid: number
  updated_at_in_words?: string
  tags: string[]
  pinned: boolean
}

export interface ImageMeta {
  url: string
  ratio: number | null
}

export type IImageMetas = Record<string, ImageMeta>

export interface INote extends INoteSearch {
  body: string
  updated_at: string
  created_at: string
  level: number | null
  slug: string | null
  upcoming_reviews_in_days: { level: number; days_left: number }[]
  question_count: number
  needs_review: boolean
  favorite: boolean

  published: boolean
  seo_url: string | null
  seo_title: string | null
  seo_description: string | null
  seo_category: string | null
  image_metas: IImageMetas
}

export interface ITag {
  name: string
  title: string
  count: number
}

export interface DataExport {
  id: number
  status: string
  created_at: string
  export_file_url: string
}

export interface ChangeLog {
  body: string
}

export interface ReviewLog {
  new_level: number
  created_at: string
}

export interface Question {
  question: string
  answer: string
  days_till_review_after_current: number | null
  days_till_next_review: number | null
  completed: boolean
  tags: string[]
  note_id: string
}

export type QuizItem = {
  question: string
  answers: [string, string, string, string]
  correctIndex: number
}

export type QuizAttempt = {
  taken_at: string
  score: number
}

export type Quiz = {
  id: number
  noteId: string
  title: string
  items: QuizItem[]
  created_at: string
  attempts?: QuizAttempt[]
  last_taken_at?: string
  last_score?: number
}

export function getLastQuizAttempt(quiz: Quiz): QuizAttempt | null {
  if (Array.isArray(quiz.attempts) && quiz.attempts.length > 0) {
    return quiz.attempts[quiz.attempts.length - 1]
  }
  if (quiz.last_taken_at && typeof quiz.last_score === 'number') {
    return { taken_at: quiz.last_taken_at, score: quiz.last_score }
  }
  return null
}

export type INoteImage = {
  id: string
  name: string
  url: string
  created_at: string
}

export type TimelineItem = {
  date: string
  note_sid: number
  note_title: string
  content: string
  color: string | null
}

export type SyncStatus = {
  changed_files: number
  branch: string | null
  ahead: number
  behind: number
  is_git_repo?: boolean
}
