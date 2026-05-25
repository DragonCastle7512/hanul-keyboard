import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import KeyboardButton, { styles } from './KeyboardButton';
import { KeyboardMode } from '../../logic/KeyboardStateManager';

interface SymbolLayoutProps {
  mode: KeyboardMode;
  onPress: (key: string) => void;
  onSetMode: (mode: KeyboardMode) => void;
  onBackspacePressIn: () => void;
  onBackspacePressOut: () => void;
}

const SymbolLayout: React.FC<SymbolLayoutProps> = React.memo(({
  mode,
  onPress,
  onSetMode,
  onBackspacePressIn,
  onBackspacePressOut,
}) => {
  const { colors } = useTheme();

  const isSym1 = mode === 'sym1';

  const sym1Rows = {
    row1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    row2: ['+', '×', '÷', '=', '/', '_', '<', '>', '[', ']'],
    row3: ['!', '@', '#', '~', '%', '^', '&', '*', '(', ')'],
    row4: ['-', '\'', '\"', ':', ';', ',', '?'],
  };

  const sym2Rows = {
    row1: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    row2: ['\`', '$', '\\', '|', '{', '}', '€', '£', '¥', '₩'],
    row3: ['°', '•', '○', '●', '□', '■', '♤', '♡', '◇', '♧'],
    row4: ['☆', '▪', '¤', '《', '》', '¡', '¿'],
  };

  const rows = isSym1 ? sym1Rows : sym2Rows;

  return (
    <>
      <View style={styles.row}>
        {rows.row1.map((key) => (
          <KeyboardButton key={key} label={key} value={key} onPress={onPress} />
        ))}
      </View>
      <View style={styles.row}>
        {rows.row2.map((key) => (
          <KeyboardButton key={key} label={key} value={key} onPress={onPress} />
        ))}
      </View>
      <View style={styles.row}>
        {rows.row3.map((key) => (
          <KeyboardButton key={key} label={key} value={key} onPress={onPress} />
        ))}
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { flex: 1.5, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode(isSym1 ? 'sym2' : 'sym1')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>
            {isSym1 ? '1/2' : '2/2'}
          </Text>
        </TouchableOpacity>
        {rows.row4.map((key) => (
          <KeyboardButton key={key} label={key} value={key} onPress={onPress} />
        ))}
        <KeyboardButton
          label={<MaterialCommunityIcons name="backspace-outline" size={24} color={colors.buttonText} />}
          value="Backspace"
          flex={1.5}
          onPress={onPress}
          onPressIn={onBackspacePressIn}
          onPressOut={onBackspacePressOut}
        />
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('ko')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>가</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('en')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>abc</Text>
        </TouchableOpacity>
        <KeyboardButton
          label={<MaterialCommunityIcons name="keyboard-space" size={24} color={colors.buttonText} />}
          value="Space"
          flex={2}
          onPress={onPress}
        />
        <KeyboardButton label="." value="." flex={0.7} onPress={onPress} />
        <KeyboardButton
          label={<MaterialCommunityIcons name="keyboard-return" size={24} color={colors.buttonText} />}
          value="Enter"
          onPress={onPress}
        />
      </View>
    </>
  );
});

export default SymbolLayout;
