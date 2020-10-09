import React from 'react'
import { useMedia, useMediaValue } from '@headlessmedia/react'

const mediaID = 'tadatada'

const Child = () => {
  const { currentTime } = useMediaValue({
    id: mediaID,
    selector: mediaContext => mediaContext,
  })
  return <h1>Current time: {currentTime}</h1>
}

const App = () => {
  const { getMediaProps } = useMedia({ id: mediaID })
  return (
    <div>
      <Child />
      <h1>Hello World</h1>
      <video
        onLoadedMetadata={event => {}}
        width={800}
        height={400}
        {...getMediaProps()}
        controls
        src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
      />
    </div>
  )
}

export default App
