import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

interface Props extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  disabled?: boolean;
}
export function Button({title, isLoading, ...rest}: Props): React.JSX.Element {
  return (
    <TouchableOpacity style={[$defaultContainerStyle]} {...rest}>
      {isLoading ? (
        <ActivityIndicator color={'white'} size={30} />
      ) : (
        <Text>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const $defaultContainerStyle: ViewStyle = {
  width: '100%',
  height: 50,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
};
