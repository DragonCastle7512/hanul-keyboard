import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import KeyboardButton, { styles } from './KeyboardButton';
import { KeyboardMode } from '../../logic/KeyboardStateManager';

interface KoreanLayoutProps {
  onPress: (key: string) => void;
  onSetMode: (mode: KeyboardMode) => void;
  onBackspacePressIn: () => void;
  onBackspacePressOut: () => void;
}

const KoreanLayout: React.FC<KoreanLayoutProps> = ({
  onPress,
  onSetMode,
  onBackspacePressIn,
  onBackspacePressOut,
}) => {
  const { colors } = useTheme();

  return (
    <>
      <View style={styles.row}>
        <KeyboardButton label="ㅣ" value="ㅣ" onPress={onPress} />
        <KeyboardButton label="·" value="·" onPress={onPress} />
        <KeyboardButton label="ㅡ" value="ㅡ" onPress={onPress} />
        <KeyboardButton
          label={<MaterialCommunityIcons name="backspace-outline" size={24} color={colors.buttonText} />}
          value="Backspace"
          onPress={onPress}
          onPressIn={onBackspacePressIn}
          onPressOut={onBackspacePressOut}
        />
      </View>
      <View style={styles.row}>
        <KeyboardButton label="ㄱ ㅋ" value="ㄱㅋ" onPress={onPress} />
        <KeyboardButton label="ㄴ ㄹ" value="ㄴㄹ" onPress={onPress} />
        <KeyboardButton label="ㄷ ㅌ" value="ㄷㅌ" onPress={onPress} />
        <View style={[styles.splitButtonContainer, { flex: 1, backgroundColor: colors.buttonBackground }]}>
          <TouchableOpacity style={styles.splitButton} onPress={() => onPress('Left')}>
            <MaterialCommunityIcons name="keyboard-tab-reverse" size={22} color={colors.buttonText} />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <TouchableOpacity style={styles.splitButton} onPress={() => onPress('Right')}>
            <MaterialCommunityIcons name="keyboard-tab" size={22} color={colors.buttonText} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.row}>
        <KeyboardButton label="ㅂ ㅍ" value="ㅂㅍ" onPress={onPress} />
        <KeyboardButton label="ㅅ ㅎ" value="ㅅㅎ" onPress={onPress} />
        <KeyboardButton label="ㅈ ㅊ" value="ㅈㅊ" onPress={onPress} />
        <KeyboardButton label="? !" value="?!" onPress={onPress} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('num')}
        >
          <Text style={[styles.buttonText, { color: colors.buttonText }]}>123</Text>
        </TouchableOpacity>
        <KeyboardButton label="ㅇ ㅁ" value="ㅇㅁ" onPress={onPress} />
        <KeyboardButton label="^ ~" value="^~" onPress={onPress} />
        <KeyboardButton label="@ /" value="@/" onPress={onPress} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('sym1')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>기호</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]}
          onPress={() => onSetMode('en')}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>abc</Text>
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
        <KeyboardButton label=". ," value=".," onPress={onPress} />
      </View>
    </>
  );
};

export default KoreanLayout;
