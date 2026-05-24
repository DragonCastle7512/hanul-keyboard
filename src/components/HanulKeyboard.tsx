import React, { useState, useRef, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ThemeSelector from './ThemeSelector';
import { KeyboardMode } from '../logic/KeyboardStateManager';

import KoreanLayout from './layouts/KoreanLayout';
import EnglishLayout from './layouts/EnglishLayout';
import NumericLayout from './layouts/NumericLayout';
import SymbolLayout from './layouts/SymbolLayout';
import { BUTTON_MARGIN_VER } from './layouts/KeyboardButton';

interface HanulKeyboardProps {
  onPress: (key: string) => void;
  mode: KeyboardMode;
  onModeChange: () => void;
  onSetMode: (mode: KeyboardMode) => void;
  onOpenSettings: () => void;
  shiftState: number;
}

const HanulKeyboard = React.memo(({ onPress, mode, onSetMode, onOpenSettings, shiftState }: HanulKeyboardProps) => {
  const [isThemeModalVisible, setIsThemeModalVisible] = useState(false);
  const { colors } = useTheme();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startRepeat = (value: string) => {
    stopRepeat();
    onPress(value);
    timerRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onPress(value);
      }, 50);
    }, 500);
  };

  const stopRepeat = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const onBackspacePressIn = () => startRepeat('Backspace');
  const onBackspacePressOut = () => stopRepeat();

  const renderFunctionBar = () => (
    <View style={[styles.functionBar, { backgroundColor: colors.functionBarBackground, borderBottomColor: colors.separator }]}>
      <TouchableOpacity onPress={() => setIsThemeModalVisible(true)}>
        <MaterialCommunityIcons name="palette-outline" size={24} color={colors.iconColor} style={styles.functionIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onOpenSettings}>
        <MaterialCommunityIcons name="cog-outline" size={24} color={colors.iconColor} style={styles.functionIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderLayout = () => {
    const layoutProps = {
      onPress,
      onSetMode,
      onBackspacePressIn,
      onBackspacePressOut,
    };

    switch (mode) {
      case 'ko':
        return <KoreanLayout {...layoutProps} />;
      case 'en':
        return <EnglishLayout {...layoutProps} shiftState={shiftState} />;
      case 'num':
        return <NumericLayout {...layoutProps} />;
      case 'sym1':
      case 'sym2':
        return <SymbolLayout {...layoutProps} mode={mode} />;
      default:
        return <KoreanLayout {...layoutProps} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {renderFunctionBar()}
      {renderLayout()}
      <ThemeSelector 
        isVisible={isThemeModalVisible} 
        onClose={() => setIsThemeModalVisible(false)} 
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: BUTTON_MARGIN_VER,
    paddingBottom: 20,
  },
  functionBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    marginBottom: BUTTON_MARGIN_VER,
  },
  functionIcon: {
    marginRight: 20,
  },
});

export default HanulKeyboard;
