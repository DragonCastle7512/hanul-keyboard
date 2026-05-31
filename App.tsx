import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, NativeModules, TouchableOpacity, SafeAreaView, StatusBar, DeviceEventEmitter } from 'react-native';
import HanulKeyboard from './src/components/HanulKeyboard';
import { KeyboardStateManager, KeyboardMode } from './src/logic/KeyboardStateManager';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const { IMEModule } = NativeModules;

function AppContent(props: any) {
  const isIME = props?.isIME || (props?.exp && props?.exp?.initialProps && props?.exp?.initialProps?.isIME) || false;
  const bottomInset = Number(props?.bottomInset ?? props?.exp?.initialProps?.bottomInset ?? 0);
  
  const [displayText, setDisplayText] = useState('');
  const [cursorIndex, setCursorIndex] = useState(0);
  const [mode, setMode] = useState<KeyboardMode>('ko');
  const [shiftState, setShiftState] = useState(0);
  const { themeMode, setThemeMode, colors } = useTheme();

  const stateManager = useMemo(() => {
    return new KeyboardStateManager((text, sState, cIndex) => {
      if (!isIME) {
        setDisplayText(text);
        setCursorIndex(cIndex);
      }
      setShiftState(sState);
    }, isIME);
  }, [isIME]);

  useEffect(() => {
    if (isIME) {
      const subSelection = DeviceEventEmitter.addListener('onSelectionChange', () => {
        stateManager.onSelectionChange();
      });
      const subFinish = DeviceEventEmitter.addListener('onFinishComposing', () => {
        stateManager.onFinishComposing();
      });
      const subReset = DeviceEventEmitter.addListener('onResetState', () => {
        stateManager.reset();
      });
      return () => {
        subSelection.remove();
        subFinish.remove();
        subReset.remove();
      };
    }
  }, [isIME, stateManager]);

  const handleKeyPress = useCallback((key: string) => {
    stateManager.handlePress(key);
  }, [stateManager]);

  const toggleMode = useCallback(() => {
    setMode((prevMode) => {
      let nextMode: KeyboardMode;
      if (prevMode === 'ko') nextMode = 'en';
      else if (prevMode === 'en') nextMode = 'sym1';
      else nextMode = 'ko';
      
      stateManager.setMode(nextMode);
      return nextMode;
    });
  }, [stateManager]);

  const handleSetMode = useCallback((newMode: KeyboardMode) => {
    setMode(newMode);
    stateManager.setMode(newMode);
  }, [stateManager]);

  const openKeyboardSettings = useCallback(() => {
    if (IMEModule && typeof IMEModule.openKeyboardSettings === 'function') {
      IMEModule.openKeyboardSettings();
    }
  }, []);

  const keyboardWrapperStyle = useMemo(() => [
    styles.keyboardWrapper,
    { 
      backgroundColor: colors.background,
      paddingBottom: isIME ? Math.max(bottomInset, 10) : 40, 
    }
  ], [colors.background, isIME, bottomInset]);

  return (
    <View style={[styles.container, { backgroundColor: isIME ? 'transparent' : colors.background }]}>
      <StatusBar barStyle={themeMode === 'black' ? 'light-content' : 'dark-content'} />
      
      {!isIME ? (
        <SafeAreaView style={styles.appArea}>
          <View style={[styles.displayArea, { backgroundColor: themeMode === 'black' ? '#111' : '#fff' }]}>
            <Text style={[styles.displayText, { color: themeMode === 'black' ? '#fff' : '#000' }]} numberOfLines={10}>
              {displayText.slice(0, cursorIndex)}
              <Text style={styles.cursor}>|</Text>
              {displayText.slice(cursorIndex)}
            </Text>
          </View>
        </SafeAreaView>
      ) : null}

      <View style={keyboardWrapperStyle}>
        <HanulKeyboard 
          onPress={handleKeyPress} 
          mode={mode}
          onModeChange={toggleMode}
          onSetMode={handleSetMode}
          onOpenSettings={openKeyboardSettings}
          shiftState={shiftState}
        />
      </View>
    </View>
  );
}

export default function App(props: any) {
  return (
    <ThemeProvider>
      <AppContent {...props} />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  appArea: {
    flex: 1,
  },
  displayArea: {
    flex: 1,
    padding: 20,
  },
  keyboardWrapper: {
    width: '100%',
  },
  appHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 8,
  },
  displayText: {
    fontSize: 24,
    lineHeight: 32,
  },
  cursor: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
