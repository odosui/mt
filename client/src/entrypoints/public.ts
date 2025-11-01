import '../styles/notes/index.scss'
import 'highlight.js/styles/atom-one-dark-reasonable.css'

import hljs from 'highlight.js/lib/core'

import ts from 'highlight.js/lib/languages/typescript'
import bash from 'highlight.js/lib/languages/bash'
hljs.registerLanguage('typescript', ts)
hljs.registerLanguage('bash', bash)

document.addEventListener('DOMContentLoaded', () => {
  hljs.highlightAll()
})
