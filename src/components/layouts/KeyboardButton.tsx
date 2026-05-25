import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface KeyboardButtonProps {
  label: React.ReactNode;
  value: string;
  flex?: number;
  onPress: (value: string) => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  style?: ViewStyle | ViewStyle[];
  textStyle?: TextStyle | TextStyle[];
  isEnMode?: boolean;
}

export const BUTTON_HEIGHT = 48;
export const BUTTON_MARGIN_VER = 3;
export const BUTTON_MARGIN_HOZ = 2;

const KeyboardButton: React.FC<KeyboardButtonProps> = React.memo(({
  label,
  value,
  flex = 1,
  onPress,
  onPressIn,
  onPressOut,
  style,
  textStyle,
  isEnMode = false,
}) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (value !== 'Backspace') {
      onPress(value);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { flex, backgroundColor: colors.buttonBackground },
        style,
      ]}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={0.7}
    >
      {typeof label === 'string' ? (
        <Text
          style={[
            styles.buttonText,
            { color: colors.buttonText },
            isEnMode && { fontSize: 22 },
            textStyle,
          ]}
        >
          {label}
        </Text>
      ) : (
        label
      )}
    </TouchableOpacity>
  );
});

export const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    marginHorizontal: BUTTON_MARGIN_HOZ,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    lineHeight: 28,
    width: '100%',
  },
  specialButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    marginBottom: BUTTON_MARGIN_VER,
  },
  splitButtonContainer: {
    flexDirection: 'row',
    height: BUTTON_HEIGHT,
    marginHorizontal: BUTTON_MARGIN_HOZ,
    borderRadius: 8,
    overflow: 'hidden',
  },
  splitButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    marginVertical: 10,
  },
});

export default KeyboardButton;
