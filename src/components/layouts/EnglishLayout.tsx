import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import KeyboardButton, { styles } from './KeyboardButton';
import { KeyboardMode } from '../../logic/KeyboardStateManager';

interface EnglishLayoutProps {
  onPress: (key: string) => void;
  onSetMode: (mode: KeyboardMode) => void;
  onBackspacePressIn: () => void;
  onBackspacePressOut: () => void;
  shiftState: number;
}

const EnglishLayout: React.FC<EnglishLayoutProps> = React.memo(({
  onPress,
  onSetMode,
  onBackspacePressIn,
  onBackspacePressOut,
  shiftState,
}) => {
  const { colors } = useTheme();

  const row1 = ['Left', 'Right', '?', '@', '~', ':', 'Backspace'];
  const row2 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
  const row3 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
  const row4 = ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '/'];

  const renderKey = (key: string, idx: number, row: string) => {
    if (key === 'Left')
      return (
        <KeyboardButton
          key={`${row}-${idx}`}
          label={<MaterialCommunityIcons name="keyboard-tab-reverse" size={18} color={colors.buttonText} />}
          value="Left"
          onPress={onPress}
        />
      );
    if (key === 'Right')
      return (
        <KeyboardButton
          key={`${row}-${idx}`}
          label={<MaterialCommunityIcons name="keyboard-tab" size={18} color={colors.buttonText} />}
          value="Right"
          onPress={onPress}
        />
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
    if (key === 'Shift') {
      return (
        <TouchableOpacity
          key={`${row}-${key}`}
          style={[styles.button, { flex: 2, backgroundColor: colors.buttonBackground }]}
          onPress={() => onPress('Shift')}
        >
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <MaterialCommunityIcons
              name={shiftState === 0 ? 'arrow-up-bold-outline' : 'arrow-up-bold'}
              size={22}
              color={colors.buttonText}
            />
            {shiftState === 2 && (
              <MaterialCommunityIcons
                name="lock"
                size={10}
                color={colors.buttonText}
                style={{ position: 'absolute', bottom: -2, right: -4 }}
              />
            )}
          </View>
        </TouchableOpacity>
      );
    }

    const displayKey = shiftState > 0 ? key.toUpperCase() : key;

    return (
      <KeyboardButton
        key={`${row}-${key}`}
        label={displayKey}
        value={key}
        onPress={onPress}
        isEnMode={true}
      />
    );
  };

  return (
    <>
      <View style={styles.row}>{row1.map((k, i) => renderKey(k, i, 'en-r1'))}</View>
      <View style={styles.row}>{row2.map((k, i) => renderKey(k, i, 'en-r2'))}</View>
      <View style={styles.row}>{row3.map((k, i) => renderKey(k, i, 'en-r3'))}</View>
      <View style={styles.row}>{row4.map((k, i) => renderKey(k, i, 'en-r4'))}</View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('sym1')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>기호</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('ko')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>가</Text>
        </TouchableOpacity>
        <KeyboardButton
          label={<MaterialCommunityIcons name="keyboard-return" size={24} color={colors.buttonText} />}
          value="Enter"
          onPress={onPress}
        />
        <KeyboardButton
          label={<MaterialCommunityIcons name="keyboard-space" size={24} color={colors.buttonText} />}
          value="Space"
          onPress={onPress}
        />
        <KeyboardButton label="." value="." onPress={onPress} />
      </View>
    </>
  );
});

export default EnglishLayout;
