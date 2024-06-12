export interface INoteSearch {
  id: number
  snippet: string
  sid: number
  updated_at_in_words?: string
  tags: string[]
}

export interface INote extends INoteSearch {
  body: string
  updated_at: string
  created_at: string
  level: number | null
  published: boolean
  slug: string | null
  upcoming_reviews_in_days: { level: number; days_left: number }[]
  question_count: number
  needs_review: boolean
  favorite: boolean

  seo_url: string | null
  seo_title: string | null
  seo_description: string | null
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
  id: number
  question: string
  answer: string
  days_till_review_after_current: number
  days_till_next_review: number
  tags: string[]
  image_url: string | null
}

type Col = {
  uuid: string
  items: { sid: number; height?: number | 'full' }[]
}

export interface IBoardSearch {
  id: number
  title: string
  updated_at: string
  created_at: string
  updated_at_in_words: string
}

export type IBoard = IBoardSearch & {
  config: { cols: Col[] }
}
