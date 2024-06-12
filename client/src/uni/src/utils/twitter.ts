import { openInNewTab } from './win'

const SHARE_URL = 'https://twitter.com/intent/tweet'

export function tweet(url: string) {
  const pars = new URLSearchParams({
    url,
    hashtags: 'candlapp',
  }).toString()
  openInNewTab(`${SHARE_URL}?${pars}`)
}
