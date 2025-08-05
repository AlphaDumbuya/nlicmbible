import { useColorScheme } from 'react-native';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'text' | 'background' | 'tint' | string
) {
  const theme = useColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    switch (colorName) {
      case 'text':
        return theme === 'light' ? '#000' : '#fff';
      case 'background':
        return theme === 'light' ? '#fff' : '#000';
      case 'tint':
        return theme === 'light' ? '#ff8c00' : '#ff8c00'; // Using orange as the tint color
      default:
        return theme === 'light' ? '#000' : '#fff';
    }
  }
}
