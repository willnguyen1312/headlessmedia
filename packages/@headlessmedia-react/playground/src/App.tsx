import React, { useState } from 'react'
import { useMedia, useMediaValue } from '@headlessmedia/react'
import { videoSources } from '@headlessmedia/shared'

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

const mediaSources = [
  'https://storage.googleapis.com/shaka-demo-assets/angel-one/dash.mpd',
  'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps.mpd',
]

const Video = () => {
  const [src, setSrc] = useState(mediaSources[0])
  const { getMediaProps } = useMedia({ id: mediaID, mediaSource: src })
  return (
    <>
      <select
        onChange={event => {
          setSrc(event.target.value)
        }}
        value={src}
      >
        {mediaSources.map(videoSrc => {
          return (
            <option key={videoSrc} value={videoSrc}>
              {videoSrc}
            </option>
          )
        })}
      </select>
      <video
        id={mediaID}
        style={{ display: 'block' }}
        width={800}
        height={400}
        {...getMediaProps()}
        controls
      />
    </>
  )
}

const App = () => {
  const [show, setShow] = React.useState(true)
  return (
    <>
      <button onClick={() => setShow(!show)}>{show ? 'Hide' : 'Show'}</button>
      {show ? (
        <>
          <Control />
          <Video />
        </>
      ) : null}
    </>
  )
}

export default App
