import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import KeyboardButton, { styles } from './KeyboardButton';
import { KeyboardMode } from '../../logic/KeyboardStateManager';

interface NumericLayoutProps {
  onPress: (key: string) => void;
  onSetMode: (mode: KeyboardMode) => void;
  onBackspacePressIn: () => void;
  onBackspacePressOut: () => void;
}

const NumericLayout: React.FC<NumericLayoutProps> = ({
  onPress,
  onSetMode,
  onBackspacePressIn,
  onBackspacePressOut,
}) => {
  const { colors } = useTheme();

  const row1 = ['Left', 'Right', '(', ')', 'Backspace'];
  const row2 = ['.', '1', '2', '3', '+'];
  const row3 = [',', '4', '5', '6', '-'];
  const row4 = ['가', '7', '8', '9', '÷'];

  const renderKey = (key: string, idx: number, row: string) => {
    if (key === 'Left')
      return (
        <KeyboardButton
          key={`${row}-${idx}`}
          label={<MaterialCommunityIcons name="keyboard-tab-reverse" size={20} color={colors.buttonText} />}
          value="Left"
          onPress={onPress}
        />
      );
    if (key === 'Right')
      return (
        <KeyboardButton
          key={`${row}-${idx}`}
          label={<MaterialCommunityIcons name="keyboard-tab" size={20} color={colors.buttonText} />}
          value="Right"
          onPress={onPress}
        />
      );
    if (key === '가')
      return (
        <TouchableOpacity
          key={`${row}-${key}`}
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('ko')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>가</Text>
        </TouchableOpacity>
      );
    if (key === 'Backspace')
      return (
        <KeyboardButton
          key={`${row}-${idx}`}
          label={<MaterialCommunityIcons name="backspace-outline" size={24} color={colors.buttonText} />}
          value="Backspace"
          onPress={onPress}
          onPressIn={onBackspacePressIn}
          onPressOut={onBackspacePressOut}
        />
      );
    return <KeyboardButton key={`${row}-${key}`} label={key} value={key} onPress={onPress} />;
  };

  return (
    <>
      <View style={styles.row}>{row1.map((k, i) => renderKey(k, i, 'num-r1'))}</View>
      <View style={styles.row}>{row2.map((k, i) => renderKey(k, i, 'num-r2'))}</View>
      <View style={styles.row}>{row3.map((k, i) => renderKey(k, i, 'num-r3'))}</View>
      <View style={styles.row}>{row4.map((k, i) => renderKey(k, i, 'num-r4'))}</View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('sym1')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>기호</Text>
        </TouchableOpacity>
        <KeyboardButton
          label={<MaterialCommunityIcons name="keyboard-return" size={24} color={colors.buttonText} />}
          value="Enter"
          onPress={onPress}
        />
        <KeyboardButton label="0" value="0" onPress={onPress} />
        <KeyboardButton
          label={<MaterialCommunityIcons name="keyboard-space" size={24} color={colors.buttonText} />}
          value="Space"
          onPress={onPress}
        />
        <KeyboardButton label="×" value="×" onPress={onPress} />
      </View>
    </>
  );
};

export default NumericLayout;
