import { clamp } from './utils'
import { mediaStore } from './mediaStore'

export interface MediaValueUtils {
  setCurrentTime: (currentTime: number) => void
  setPlaybackRate: (playbackRate: number) => void
  setVolume: (volume: number) => void
  setPaused: (paused: boolean) => void
  setMuted: (muted: boolean) => void
  setTrack: (trackId: number) => void
}

export const makeMediaUtils = ({ id }: { id: string }): MediaValueUtils => {
  const { getState } = mediaStore
  const getMedia = () => getState(id)?.mediaElement
  const getShakaPlayer = () => getState(id)?.shakaPlayer
  let paused = true
  let lastPlayPromise: null | Promise<void> = null

  const setCurrentTime = (currentTime: number) => {
    const media = getMedia()
    if (media) {
      const newCurrentTime = clamp(currentTime, 0, media.duration)
      media.currentTime = newCurrentTime
    }
  }

  const setPlaybackRate = (playbackRate: number) => {
    const media = getMedia()
    if (media) {
      media.playbackRate = playbackRate
    }
  }

  const setVolume = (volume: number) => {
    const media = getMedia()
    // Browsers only allow 0 to 1 volume value
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/volume
    if (media) {
      const newVolume = clamp(volume, 0, 1)
      media.volume = newVolume
    }
  }

  const setMuted = (muted: boolean) => {
    const media = getMedia()
    if (media) {
      media.muted = muted
    }
  }

  // We need this special handler to handle play/pause methods across browsers
  // https://developers.google.com/web/updates/2017/06/play-request-was-interrupted
  const setPaused = async (newPaused: boolean) => {
    const media = getMedia()
    if (media) {
      // We need to store the latest paused state in ref for later access
      paused = newPaused

      if (newPaused) {
        const playPromise = lastPlayPromise
        if (playPromise) {
          await playPromise

          lastPlayPromise = null
          // Check the latest paused state
          if (paused) {
            media.pause()
          }
        } else {
          // IE doesn't return promise, we can just hit pause method
          media.pause()
        }
      } else {
        // Modern browser return a promise, undefined in IE
        lastPlayPromise = media.play()
      }
    }
  }

  const setTrack = (trackId: number | undefined) => {
    const shakaPlayer = getShakaPlayer()
    if (!shakaPlayer) {
      return
    }

    if (!trackId) {
      shakaPlayer.configure({ abr: { enabled: true } })
      return
    }
    const track = getState(id).trackInfo.find(track => track.id === trackId)
    if (track) {
      shakaPlayer.selectVariantTrack()
    }
  }

  return {
    setTrack,
    setCurrentTime,
    setMuted,
    setPaused,
    setPlaybackRate,
    setVolume,
  }
}
