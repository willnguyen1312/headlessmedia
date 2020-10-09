import React from 'react'
import { useMedia, useMediaValue } from '@headlessmedia/react'

const mediaID = 'tadatada'

const Child = () => {
  const { currentTime, setPaused, paused } = useMediaValue({
    id: mediaID,
    selector: mediaContext => mediaContext,
  })

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', width: 600, justifyContent: 'space-between' }}
    >
      <h1>Current time: {currentTime}</h1>
      <button onClick={() => setPaused(!paused)}>{paused ? 'Play' : 'Pause'}</button>
    </div>
  )
}

const App = () => {
  const { getMediaProps } = useMedia({ id: mediaID })
  return (
    <div>
      <Child />
      <h1>Hello Media</h1>
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
