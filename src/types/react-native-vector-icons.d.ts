declare module 'react-native-vector-icons/Ionicons' {
  import { Component } from 'react';
  import { ImageSourcePropType } from 'react-native';

  interface IconProps {
    name: string;
    size?: number;
    color?: string;
    style?: any;
  }

  class Icon extends Component<IconProps> {}
  
  export default Icon;
}
