import { useColorScheme as useDeviceColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useColorScheme() {
  const deviceColorScheme = useDeviceColorScheme();
  const [manualTheme, setManualTheme] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('theme').then(theme => {
      if (theme) setManualTheme(theme as 'light' | 'dark');
    });
  }, []);

  return manualTheme || deviceColorScheme;
}
