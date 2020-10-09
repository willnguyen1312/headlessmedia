import React from 'react'
import { useMedia, useMediaValue } from '@headlessmedia/react'

import styles from './App.module.css'

const mediaID = 'tadatada'

const Control = () => {
  const { currentTime, setPaused, paused } = useMediaValue({
    id: mediaID,
    selector: ({ currentTime, paused }) => ({ currentTime, paused }),
  })

  const togglePlay = () => setPaused(!paused)

  return (
    <div className={styles.buttonWrapper}>
      <h1>Current time: {currentTime}</h1>
      <button onClick={togglePlay}>{paused ? 'Play' : 'Pause'}</button>
    </div>
  )
}

const Video = () => {
  const { getMediaProps } = useMedia({ id: mediaID })
  return (
    <video
      onLoadedMetadata={event => {}}
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
    <div className={styles.wrapper}>
      <Control />
      <h1>Hello Media</h1>
      <Video />
    </div>
  )
}

export default App
