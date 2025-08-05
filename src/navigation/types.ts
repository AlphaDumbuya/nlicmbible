export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  Library: { testament?: 'old' | 'new' } | undefined;
  Favorites: undefined;
  Settings: undefined;
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
