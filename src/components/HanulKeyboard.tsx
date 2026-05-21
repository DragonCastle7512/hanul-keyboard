import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

interface HanulKeyboardProps {
  onPress: (key: string) => void;
  mode: string;
  onModeChange: () => void;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
}

const BUTTON_MARGIN = 2;
const BUTTON_HEIGHT = 48;

const HanulKeyboard = React.memo(({ onPress, mode, onModeChange, onToggleTheme, onOpenSettings }: HanulKeyboardProps) => {
  const [isShifted, setIsShifted] = useState(false);
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

  const renderButton = (label: React.ReactNode, value: string, flex = 1, style?: any, key?: string) => (
    <TouchableOpacity
      key={key}
      style={[
        styles.button, 
        { flex, backgroundColor: colors.buttonBackground }, 
        style
      ]}
      onPress={() => {
        if (value === 'Shift') {
          setIsShifted(!isShifted);
        } else if (value !== 'Backspace') {
          onPress(value);
        }
      }}
      onPressIn={() => {
        if (value === 'Backspace') {
          startRepeat(value);
        }
      }}
      onPressOut={() => {
        if (value === 'Backspace') {
          stopRepeat();
        }
      }}
      activeOpacity={0.7}
    >
      {typeof label === 'string' ? (
        <Text style={[styles.buttonText, { color: colors.buttonText }, mode === 'en' && { fontSize: 22 }]}>{label}</Text>
      ) : (
        label
      )}
    </TouchableOpacity>
  );

  const renderFunctionBar = () => (
    <View style={[styles.functionBar, { backgroundColor: colors.functionBarBackground, borderBottomColor: colors.separator }]}>
      <TouchableOpacity onPress={onToggleTheme}>
        <MaterialCommunityIcons name="palette-outline" size={24} color={colors.iconColor} style={styles.functionIcon} />
      </TouchableOpacity>
      <MaterialCommunityIcons name="emoticon-outline" size={24} color={colors.iconColor} style={styles.functionIcon} />
      <MaterialCommunityIcons name="clipboard-outline" size={24} color={colors.iconColor} style={styles.functionIcon} />
      <TouchableOpacity onPress={onOpenSettings}>
        <MaterialCommunityIcons name="cog-outline" size={24} color={colors.iconColor} style={styles.functionIcon} />
      </TouchableOpacity>
    </View>
  );

  const renderBottomRow = () => (
    <View style={styles.row}>
      <TouchableOpacity 
        style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]} 
        onPress={onModeChange}
      >
        <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>가A0</Text>
      </TouchableOpacity>
      {renderButton(<MaterialCommunityIcons name="keyboard-space" size={24} color={colors.buttonText} />, 'Space', 1)}
      {renderButton(<MaterialCommunityIcons name="arrow-up-bold-outline" size={22} color={colors.buttonText} />, 'Shift', 1)}
      {renderButton(<MaterialCommunityIcons name="keyboard-return" size={24} color={colors.buttonText} />, 'Enter', 1)}
      {renderButton(<MaterialCommunityIcons name="backspace-outline" size={24} color={colors.buttonText} />, 'Backspace', 1)}
    </View>
  );

  const renderKoreanLayout = () => (
    <>
      <View style={styles.row}>
        {renderButton('ㅣ', 'ㅣ')}
        {renderButton('·', '·')}
        {renderButton('ㅡ', 'ㅡ')}
        {renderButton('. ,', '.,')}
      </View>
      <View style={styles.row}>
        {renderButton('ㄱ ㅋ', 'ㄱㅋ')}
        {renderButton('ㄴ ㄹ', 'ㄴㄹ')}
        {renderButton('ㄷ ㅌ', 'ㄷㅌ')}
        {renderButton(': ;', ':;')}
      </View>
      <View style={styles.row}>
        {renderButton('ㅂ ㅍ', 'ㅂㅍ')}
        {renderButton('ㅅ ㅎ', 'ㅅㅎ')}
        {renderButton('ㅈ ㅊ', 'ㅈㅊ')}
        {renderButton('? !', '?!')}
      </View>
      <View style={styles.row}>
        <View style={[styles.splitButtonContainer, { flex: 1, backgroundColor: colors.buttonBackground }]}>
          <TouchableOpacity style={styles.splitButton} onPress={() => onPress('Left')}>
            <MaterialCommunityIcons name="keyboard-tab-reverse" size={22} color={colors.buttonText} />
          </TouchableOpacity>
          <View style={[styles.separator, { backgroundColor: colors.separator }]} />
          <TouchableOpacity style={styles.splitButton} onPress={() => onPress('Right')}>
            <MaterialCommunityIcons name="keyboard-tab" size={22} color={colors.buttonText} />
          </TouchableOpacity>
        </View>
        {renderButton('ㅇ ㅁ', 'ㅇㅁ')}
        {renderButton('^ ~', '^~')}
        {renderButton('@ /', '@/')}
      </View>
      <View style={styles.row}>
        <TouchableOpacity 
          style={[styles.button, { flex: 1, backgroundColor: colors.buttonBackground }]} 
          onPress={onModeChange}
        >
          <Text style={[styles.specialButtonText, { color: colors.specialButtonText }]}>가A0</Text>
        </TouchableOpacity>
        {renderButton(<MaterialCommunityIcons name="keyboard-space" size={24} color={colors.buttonText} />, 'Space', 1)}
        {renderButton(<MaterialCommunityIcons name="star" size={22} color={colors.buttonText} />, '★', 1)}
        {renderButton(<MaterialCommunityIcons name="keyboard-return" size={24} color={colors.buttonText} />, 'Enter', 1)}
        {renderButton(<MaterialCommunityIcons name="backspace-outline" size={24} color={colors.buttonText} />, 'Backspace', 1)}
      </View>
    </>
  );

  const renderEnglishLayout = () => {
    const row1 = ['Left', 'Right', '★', '?', '@', '~', ':'];
    const row2 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
    const row3 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
    const row4 = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

    const renderKey = (key: string, idx: number, row: string) => {
      if (key === 'Left') return renderButton(<MaterialCommunityIcons name="keyboard-tab-reverse" size={18} color={colors.buttonText} />, 'Left', 1, undefined, `${row}-${idx}`);
      if (key === 'Right') return renderButton(<MaterialCommunityIcons name="keyboard-tab" size={18} color={colors.buttonText} />, 'Right', 1, undefined, `${row}-${idx}`);
      const displayKey = isShifted ? key.toUpperCase() : key;
      return renderButton(displayKey, displayKey, 1, undefined, `${row}-${key}`);
    };

    return (
      <>
        <View style={styles.row}>{row1.map((k, i) => renderKey(k, i, 'en-r1'))}</View>
        <View style={styles.row}>{row2.map((k, i) => renderKey(k, i, 'en-r2'))}</View>
        <View style={styles.row}>{row3.map((k, i) => renderKey(k, i, 'en-r3'))}</View>
        <View style={styles.row}>{row4.map((k, i) => renderKey(k, i, 'en-r4'))}</View>
        {renderBottomRow()}
      </>
    );
  };

  const renderNumericLayout = () => {
    const row1 = ['Left', 'Right', '★', '👉', '👈'];
    const row2 = ['0', '1', '2', '3', '+'];
    const row3 = ['.', '4', '5', '6', '-'];
    const row4 = [',', '7', '8', '9', '/'];

    const renderKey = (key: string, idx: number, row: string) => {
      if (key === 'Left') return renderButton(<MaterialCommunityIcons name="keyboard-tab-reverse" size={20} color={colors.buttonText} />, 'Left', 1, undefined, `${row}-${idx}`);
      if (key === 'Right') return renderButton(<MaterialCommunityIcons name="keyboard-tab" size={20} color={colors.buttonText} />, 'Right', 1, undefined, `${row}-${idx}`);
      if (key === '👉') return renderButton(<MaterialCommunityIcons name="hand-pointing-right" size={20} color={colors.buttonText} />, '👉', 1, undefined, `${row}-${idx}`);
      if (key === '👈') return renderButton(<MaterialCommunityIcons name="hand-pointing-left" size={20} color={colors.buttonText} />, '👈', 1, undefined, `${row}-${idx}`);
      return renderButton(key, key, 1, undefined, `${row}-${key}`);
    };

    return (
      <>
        <View style={styles.row}>{row1.map((k, i) => renderKey(k, i, 'num-r1'))}</View>
        <View style={styles.row}>{row2.map((k, i) => renderKey(k, i, 'num-r2'))}</View>
        <View style={styles.row}>{row3.map((k, i) => renderKey(k, i, 'num-r3'))}</View>
        <View style={styles.row}>{row4.map((k, i) => renderKey(k, i, 'num-r4'))}</View>
        {renderBottomRow()}
      </>
    );
  };

  return (
    <View 
      style={[styles.container, { backgroundColor: colors.background }]}
      onStartShouldSetResponder={() => true}
      onResponderTerminationRequest={() => false}
    >
      {renderFunctionBar()}
      {mode === 'ko' ? renderKoreanLayout() : mode === 'en' ? renderEnglishLayout() : renderNumericLayout()}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    padding: BUTTON_MARGIN,
    paddingBottom: 20,
  },
  functionBar: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    marginBottom: BUTTON_MARGIN,
  },
  functionIcon: {
    marginRight: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: BUTTON_MARGIN,
  },
  button: {
    height: BUTTON_HEIGHT,
    marginHorizontal: BUTTON_MARGIN,
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
  splitButtonContainer: {
    flexDirection: 'row',
    height: BUTTON_HEIGHT,
    marginHorizontal: BUTTON_MARGIN,
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

export default HanulKeyboard;
