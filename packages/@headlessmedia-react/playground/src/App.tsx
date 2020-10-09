import React from 'react'
import { useMedia, useMediaValue } from '@headlessmedia/react'

const mediaID = 'tadatada'

const Control = () => {
  const { currentTime, setPaused, paused } = useMediaValue({
    id: mediaID,
    selector: ({ currentTime, paused }) => ({ currentTime, paused }),
  })

  const togglePlay = () => setPaused(!paused)

  return (
    <>
      <button onClick={togglePlay}>{paused ? 'Play' : 'Pause'}</button>
      <h6>Current time: {currentTime}</h6>
    </>
  )
}

const Video = () => {
  const { getMediaProps } = useMedia({ id: mediaID })
  return (
    <video
      width={800}
      height={400}
      {...getMediaProps()}
      controls
      src="http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
    />
  )
}

const App = () => {
  return (
    <>
      <Control />
      <Video />
    </>
  )
}

export default App
