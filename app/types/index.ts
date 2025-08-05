export interface BookAudioFiles {
  [chapter: number]: {
    id: string;
    chapter: number;
  };
}

export interface AudioCacheStatus {
  totalSize: number;
  cachedBooks: { [book: string]: number[] };
  isOnline: boolean;
}
