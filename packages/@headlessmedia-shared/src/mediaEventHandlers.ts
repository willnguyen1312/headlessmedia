import { Track } from './types'
import { MediaStatus } from './constant'
import { mediaStore } from './mediaStore'

export interface MediaHandlersArg {
  id: string
  mediaSource?: string
  shaka?: any
}

let shakaPolyfilled = false

export const makeMediaHandlers = ({ id, mediaSource, shaka }: MediaHandlersArg) => {
  let shakaPlayer: any
  const { update, remove, getState } = mediaStore

  const onAdaptation = () => {
    const tracks = shakaPlayer.getVariantTracks() as Track[]
    update(id, { tracks })
  }

  const onVariantChanged = () => {
    const tracks = shakaPlayer.getVariantTracks() as Track[]
    for (let iterator = 0; iterator < tracks.length; iterator++) {
      if (tracks[iterator].active) {
        update(id, { currentTrackId: tracks[iterator].id })
        break
      }
    }
  }

  const initShakaPlayer = (mediaElement: HTMLMediaElement) => {
    shakaPlayer = new shaka.Player(mediaElement)
    // Try to load a manifest.
    // This is an asynchronous process.
    shakaPlayer.load(mediaSource)

    // This is for bitrate change due to ABR
    shakaPlayer.addEventListener('adaptation', onAdaptation)

    //This is for bitrate change made by user
    shakaPlayer.addEventListener('variantchanged', onVariantChanged)

    update(id, { shakaPlayer })
  }

  if (shaka && mediaSource) {
    const mediaElement = document.getElementById(id) as HTMLMediaElement
    if (!shakaPolyfilled) {
      shaka.polyfill.installAll()
      shakaPolyfilled = true
    }

    if (shakaPlayer) {
      shakaPlayer.destroy().then(() => {
        initShakaPlayer(mediaElement)
      })
    } else {
      initShakaPlayer(mediaElement)
    }
  }

  let timeoutLoadingId: NodeJS.Timeout

  const handleLoadedMetadata = async (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { mediaElement })
  }

  const handleSeeked = () => update(id, { seeking: false })

  const handleError = () => update(id, { status: MediaStatus.ERROR })

  const handleTimeUpdate = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { currentTime: mediaElement.currentTime })
  }

  const handleRateChange = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { playbackRate: mediaElement.playbackRate })
  }

  const handlePause = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { paused: true, ended: mediaElement.ended })
  }

  const handlePlay = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { paused: false, ended: mediaElement.ended })
  }

  const handleDurationChange = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { duration: mediaElement.duration })
  }

  const checkMediaHasDataToPlay = (mediaElement: HTMLMediaElement) => {
    const { currentTime } = mediaElement

    const timeRanges = Array.from({ length: mediaElement.buffered.length }, (_, index) => {
      const start = mediaElement.buffered.start(index)
      const end = mediaElement.buffered.end(index)
      return [Math.floor(start), end]
    })

    // Detect whether timeRanges has data to play at current time of media element
    const result = timeRanges.some(timeRange => {
      const [start, end] = timeRange

      return currentTime >= start && currentTime <= end
    })

    return result
  }

  const setLoadingStatus = () => {
    if (timeoutLoadingId) {
      clearTimeout(timeoutLoadingId)
    }
    // Avoid showing loading indicator early on fast stream which can be annoying to user
    // Similar to Youtube's experience
    timeoutLoadingId = setTimeout(() => update(id, { status: MediaStatus.LOADING }), 1000)
  }

  const setCanPlayStatus = () => {
    if (timeoutLoadingId) {
      clearTimeout(timeoutLoadingId)
    }
    update(id, { status: MediaStatus.CAN_PLAY })
  }

  const handleSeeking = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, {
      seeking: true,
      currentTime: mediaElement.currentTime,
      ended: mediaElement.ended,
    })

    if (!checkMediaHasDataToPlay(mediaElement)) {
      setLoadingStatus()
    }
  }

  const handleVolumeChange = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    update(id, { muted: mediaElement.muted, volume: mediaElement.volume })
  }

  const handleCanPlay = () => setCanPlayStatus()
  const handleProgress = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    if (checkMediaHasDataToPlay(mediaElement)) {
      setCanPlayStatus()
    }
    update(id, { buffered: mediaElement.buffered })
  }

  const handleWaiting = (event: Event) => {
    const mediaElement = event.target as HTMLMediaElement
    if (checkMediaHasDataToPlay(mediaElement)) {
      setCanPlayStatus()
    } else {
      setLoadingStatus()
    }
  }

  const cleanup = () => remove(id)

  return {
    handleLoadedMetadata,
    handleSeeked,
    handleError,
    handleTimeUpdate,
    handleRateChange,
    handlePause,
    handlePlay,
    handleDurationChange,
    handleSeeking,
    handleVolumeChange,
    handleCanPlay,
    handleProgress,
    handleWaiting,
    cleanup,
  }
}
