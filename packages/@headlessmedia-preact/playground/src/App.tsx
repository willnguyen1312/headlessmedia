/* eslint-disable */
import { h, Fragment } from 'preact'
import { useState } from 'preact/hooks'
import { useMedia, useMediaValue } from 'headlessmedia-preact'
import { mediaSources } from 'headlessmedia-shared'

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
        style={{ display: 'block', width: 800, maxWidth: '100%' }}
        {...getMediaProps()}
        controls
      />
    </>
  )
}

const App = () => {
  const [show, setShow] = useState(true)
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
