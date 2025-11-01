import { visit, Visitor } from 'unist-util-visit'

export default function HashTagPlugin() {
  const visitor: Visitor = (node, index, parent) => {
    // @ts-expect-error - we know this is a text node
    const parts = node.value.split(/(#\w+(?:=[^\s]+)?)/)

    if (parts.length === 1) {
      return
    }

    if (parent === null) {
      return
    }

    if (index === null) {
      return
    }

    const newNodes = parts.map((part: string) => {
      if (part.startsWith('#')) {
        // very special hacky span
        // which will be rendered in Preview
        return {
          type: 'element',
          tagName: 'span',
          hashtag: part,
          children: [],
          properties: { className: ['tag'] },
        }
      } else {
        return {
          type: 'text',
          value: part,
        }
      }
    })

    parent.children.splice(index, 1, ...newNodes)
  }

  const transformer = (tree: any) => {
    visit(tree, 'text', visitor)
  }

  return transformer
}
