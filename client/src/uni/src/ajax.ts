const Api = {
  get,
  post,
  put,
  del,
  patch,
  multipart,
}

export default Api

function get<T>(url: string, params?: { [k: string]: string }): Promise<T> {
  let fullUrl = url
  if (params) {
    const p = new URLSearchParams(params).toString()
    fullUrl = `${fullUrl}?${p}`
  }
  return apic<T>('GET', fullUrl)
}

async function multipart<T>(
  url: string,
  data?: { [key: string]: string | Blob },
): Promise<T> {
  const formData = new FormData()

  for (const name in data) {
    const val = data[name]
    if (val) {
      formData.append(name, val)
    }
  }

  const response = await fetch(`/api${url}`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  })

  if (response.status > 299) {
    throw new Error(response.statusText)
  }

  const res: T = (await response.json()) as T
  return res
}

function post<T>(url: string, payload?: object) {
  return apic<T>('POST', url, payload)
}

function put<T>(url: string, payload?: object) {
  return apic<T>('PUT', url, payload)
}

function patch<T>(url: string, payload?: object) {
  return apic<T>('PATCH', url, payload)
}

function del<T>(url: string) {
  return apic<T>('DELETE', url)
}

async function apic<T>(method: string, url: string, data?: object) {
  const headers = new Headers()
  headers.set('Accept', 'application/json')
  headers.set('Content-Type', 'application/json')

  // csrf
  const meta = document.querySelectorAll<HTMLMetaElement>(
    "[name='csrf-token']",
  )[0]

  if (meta) {
    headers.set('X-CSRF-Token', meta.content)
  }

  const attrs: RequestInit = {
    method,
    headers,
    credentials: 'include',
  }

  if (data) {
    attrs.body = JSON.stringify(data)
  }

  const x = await fetch(`/api${url}`, attrs)
  return x.json() as T
}
