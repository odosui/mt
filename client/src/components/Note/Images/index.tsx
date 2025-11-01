import * as React from 'react'
import { useContext, useEffect, useState } from 'react'
import api from '../../../api'
import { StateContext } from '../../../state/StateProvider'
import { INoteImage } from '../../../types'
import SidePanel from '../../SidePanel'
import Dropzone from './Dropzone'
import { CopyIcon, TrashIcon } from '@primer/octicons-react'
import IconButton from '../../../ui/IconButton'

const Images: React.FC<{ noteSid: number }> = ({ noteSid }) => {
  const { imagesVisible, toggleImagesVisible } = useContext(StateContext)

  const [images, setImages] = useState<INoteImage[]>([])

  useEffect(() => {
    const loadData = async () => {
      const imgs = await api.noteImages.list(noteSid)
      setImages(imgs)
    }

    loadData()
  }, [noteSid])

  const handleUpload = async (file: File) => {
    try {
      const img = await api.noteImages.upload(noteSid, file)
      setImages((prev) => [...prev, img])
    } catch (error) {
      console.error('Error uploading image:', error)
    }
  }

  const handleDelete = async (img: INoteImage) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return
    }

    await api.noteImages.delete(img.id)
    setImages((prev) => prev.filter((i) => i.id !== img.id))
  }

  const handleCopyNameToClipboard = (img: INoteImage) => {
    navigator.clipboard.writeText(img.name).then(
      () => {
        console.log('Image name copied to clipboard:', img.name)
      },
      (err) => {
        console.error('Could not copy image name:', err)
      },
    )
  }

  return (
    <SidePanel
      visible={imagesVisible}
      toggleVisible={toggleImagesVisible}
      className="images-panel"
    >
      <h3>Images</h3>
      <div>
        <Dropzone onUpload={handleUpload} />
      </div>
      <div className="note-images-list">
        {images.map((img) => (
          <div key={img.id} className="note-image">
            <img
              src={img.url}
              alt={img.name}
              onClick={() => {
                window.open(img.url, '_blank')
              }}
            />
            <p>
              {img.name}
              <IconButton
                icon={<CopyIcon />}
                onClick={() => handleCopyNameToClipboard(img)}
              />
              <IconButton
                variant="danger"
                icon={<TrashIcon />}
                onClick={() => handleDelete(img)}
              />
            </p>
          </div>
        ))}
      </div>
    </SidePanel>
  )
}

export default Images
