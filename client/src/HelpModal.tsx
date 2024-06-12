import * as React from 'react'
import GenericModal from './ui/GenericModal'

const HelpModal: React.FC<{
  open: boolean
  onClose: () => void
}> = ({ open, onClose }) => {
  return (
    <GenericModal
      isOpen={open}
      onClose={onClose}
      contentLabel="Using the editor"
    >
      <div className="help-text">
        <h2>Using the editor</h2>
        <p>
          MindThis editor is very similar to the popular{' '}
          <a
            href="https://www.markdownguide.org/"
            target="_blank"
            rel="noreferrer noopener nofollow"
          >
            Markdown markup language
          </a>
          . There are slight differences, though.
        </p>
        <h3>Headers</h3>
        <p>
          To create a header, start a new line with <code>`#`</code> symbol.
          Headers of second and third levels are <code>`##`</code> and{' '}
          <code>`###`</code>.
        </p>
        <h3>Inline styles</h3>
        <p>
          You can make a text look italic by wrapping it into asterisks like
          this: <code>*italic*</code>. To make text bold, use double asterisks{' '}
          <code>**bold**</code>.
        </p>
        <h3>External links</h3>
        <p>
          Any external links are auto highlighted are clickable (opens the link
          in a new tab). But
          <code>`[Google](https://google.com)`</code> format also works.
        </p>
        <h3>Cross-links</h3>
        <p>
          You can link other notes like this{' '}
          <code>`[See my other note](22)`</code>. Here 22 is the number of your
          note. You can see the note numbers in the sidebar. As an alternative,
          you link directly in the form of <code>`[[22]]`</code>
        </p>
        <h3>Lists</h3>
        <p>
          To add an unordered list, start a new line with <code>`-`</code>.
          Ordered lists begin with a number and a dot: <code>1.</code>,{' '}
          <code>2.</code>, etc.
        </p>
        <h3>Citations</h3>
        <p>
          Citations start with <code>&gt;</code> symbol are are highlighted
          accordingly.
        </p>
        <h3>Code snippets</h3>
        <p>
          Code can be instert either inline within a couple of backticks (
          <code>`const x = 123;`</code>), or using multiline block code within{' '}
          <code>```</code>.
        </p>
      </div>
    </GenericModal>
  )
}

export default HelpModal
