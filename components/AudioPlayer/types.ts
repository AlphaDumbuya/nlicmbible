export interface Track {
  book: string;
  chapter: number;
}

export interface AudioPlayerProps {
  onPlaybackStateChange?: (isPlaying: boolean) => void;
  currentTrack?: Track;
  onNext?: () => void;
  onPrevious?: () => void;
  onSeek?: (position: number) => void;
  onVolumeChange?: (volume: number) => void;
  onSpeedChange?: (speed: number) => void;
  duration: number;
  position: number;
  isLoading: boolean;
  isPlaying: boolean;
  volume: number;
  playbackSpeed: number;
}
