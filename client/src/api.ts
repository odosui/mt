import {
  DataExport,
  IBoard,
  IBoardSearch,
  INote,
  INoteImage,
  INoteSearch,
  ITag,
  Question,
  ReviewLog,
  TimelineItem,
} from './types'

const PER_PAGE = 500

export default {
  changelogs: {
    fetch: (note_sid: number, ts: string): Promise<{ body: string }> =>
      api('get', `/change_logs/${ts}?sid=${note_sid}`),
  },
  notes: {
    list: (
      query: string,
      page: number,
      tags?: string[],
      isReview?: boolean,
      isFav?: boolean,
    ): Promise<Array<INoteSearch>> =>
      api('get', '/notes', {
        query,
        tags: (tags ?? []).join(','),
        is_review: isReview ? 'true' : 'false',
        fav_only: isFav ? 'true' : 'false',
        page: `${page}`,
        per_page: `${PER_PAGE}`,
      }),
    fetch: (id: number): Promise<INote> => api('get', `/notes/${id}`),
    update: (id: number, body: string): Promise<INote> =>
      api('PATCH', `/notes/${id}`, { body }),
    del: (id: number): Promise<void> => api('DELETE', `/notes/${id}`),
    create: (body: string): Promise<INote> => api('post', `/notes`, { body }),
    changelogs: (id: number): Promise<string[]> =>
      api('get', `/notes/${id}/changelogs`),
    reviewlogs: (id: number): Promise<ReviewLog[]> =>
      api('get', `/notes/${id}/reviewlogs`),
    counts: (): Promise<{ total_notes: number; timeline_count: number }> =>
      api('get', `/notes/counts`),
    publish: (
      id: number,
      slug: string,
      title: string,
      description: string,
    ): Promise<INote> =>
      api('post', `/notes/${id}/publish`, {
        slug,
        seo_title: title,
        seo_description: description,
      }),
    unpublish: (id: number): Promise<{ success: boolean }> =>
      api('post', `/notes/${id}/unpublish`, {}),
    fav: (id: number): Promise<void> => api('post', `/notes/${id}/fav`),
    unfav: (id: number): Promise<void> => api('post', `/notes/${id}/unfav`),
    pin: (id: number): Promise<void> => api('post', `/notes/${id}/pin`),
    unpin: (id: number): Promise<void> => api('post', `/notes/${id}/unpin`),
    timeline: (): Promise<TimelineItem[]> => api('get', '/notes/timeline'),
  },
  tags: {
    list: (): Promise<Array<ITag>> => api('get', '/tags'),
  },
  boards: {
    list: (): Promise<Array<IBoardSearch>> => api('get', '/boards'),
    fetch: (id: string | number): Promise<IBoard> =>
      api('get', '/boards/' + id),
    update: (id: string | number, config: any): Promise<IBoard> => {
      return api('PATCH', '/boards/' + id, { config: JSON.stringify(config) })
    },
    create: (title: string): Promise<IBoard> =>
      api('post', '/boards', { title }),
  },
  reviews: {
    list: (): Promise<{ counts: { notes: number; questions: number } }> =>
      api('get', '/reviews'),
    done: (id: number): Promise<{ success: boolean }> =>
      api('post', `/reviews/${id}/done`, {}),
  },
  users: {
    rmself: (): Promise<{ success: boolean }> => api('delete', '/users/rmself'),
    updateself: (data: {
      username: string
      ignore_review_tags: string
    }): Promise<{ success: boolean }> =>
      api('PATCH', '/users/updateself', data),
  },
  dataExports: {
    list: (): Promise<DataExport[]> => api('get', '/data_exports'),
    create: (): Promise<DataExport> => api('post', `/data_exports`, {}),
  },
  noteImages: {
    list: (noteSid: number): Promise<INoteImage[]> => {
      return api('get', `/note_images?note_sid=${noteSid}`)
    },
    delete: (id: number): Promise<{ success: boolean }> =>
      api('delete', `/note_images/${id}`),
    upload: async (noteSid: number, file: File) => {
      const result = await multipart<INoteImage>('/note_images', {
        note_sid: `${noteSid}`,
        image: file,
        name: file.name,
      })
      if ('error' in result) {
        throw new Error(result.error)
      }
      return result
    },
  },
  questions: {
    list: (noteId?: number): Promise<Question[]> => {
      let url = `/questions`
      if (noteId) {
        url += `?note_id=${noteId}`
      }
      return api('get', url)
    },
    listForReview: (): Promise<Question[]> =>
      api('get', '/questions?for_review=true'),
    reviewGood: (id: number): Promise<void> =>
      api('post', `/questions/${id}/review_good`, {}),
    reviewBad: (id: number): Promise<void> =>
      api('post', `/questions/${id}/review_bad`, {}),
    create: (
      noteId: number,
      question: string,
      answer: string,
    ): Promise<Question> =>
      api('post', `/questions/`, { note_id: `${noteId}`, question, answer }),
    update: (id: number, question: string, answer: string): Promise<Question> =>
      api('PATCH', `/questions/${id}`, { question, answer }),
    del: (id: number): Promise<{ success: boolean }> =>
      api('delete', `/questions/${id}`),
    ai: (text: string): Promise<Array<{ question: string; answer: string }>> =>
      api('post', `/questions/ai`, { text }),
  },
}

type FetchParams = Parameters<typeof fetch>[1]

async function api(
  method: string,
  url: string,
  data?: { [k: string]: string },
) {
  const attrs: FetchParams = {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }

  if (data) {
    if (method === 'get') {
      url = `${url}?${toQuery(data)}`
    } else {
      attrs.body = JSON.stringify(data)
    }
  }

  // csrf
  const meta = document.querySelectorAll<HTMLMetaElement>(
    "[name='csrf-token']",
  )[0]
  if (meta) {
    // @ts-ignore
    attrs.headers['X-CSRF-Token'] = meta.content
  }

  // @ts-ignore
  const base = window.API_SERVER_URL
  return fetch(`${base}/api${url}`, attrs).then((x) => x.json())
}

function toQuery(data: { [k: string]: string }) {
  const esc = window.encodeURIComponent
  return (
    Object.keys(data)
      // @ts-ignore
      .map((k) => esc(k) + '=' + esc(data[k]))
      .join('&')
  )
}

async function multipart<T>(
  url: string,
  data?: { [key: string]: string | Blob },
  method: 'POST' | 'PATCH' = 'POST',
): Promise<T | { error: string }> {
  const formData = new FormData()

  for (const name in data) {
    const val = data[name]
    if (val) {
      formData.append(name, val)
    }
  }

  // csrf
  const meta = document.querySelectorAll<HTMLMetaElement>(
    "[name='csrf-token']",
  )[0]

  const response = await fetch(`/api${url}`, {
    method,
    body: formData,
    credentials: 'include',
    headers: {
      'X-CSRF-Token': meta ? meta.content : '',
    },
  })

  if (response.status === 400) {
    const e = await response.json()
    return { error: e.error }
  }

  if (response.status > 299) {
    throw new Error(response.statusText)
  }

  const res: T = (await response.json()) as T
  return res
}
