import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, NativeModules, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import HanulKeyboard from './src/components/HanulKeyboard';
import { KeyboardStateManager, KeyboardMode } from './src/logic/KeyboardStateManager';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

const { IMEModule } = NativeModules;

function AppContent(props: any) {
  const isIME = props?.isIME || (props?.exp && props?.exp?.initialProps && props?.exp?.initialProps?.isIME) || false;
  const bottomInset = Number(props?.bottomInset ?? props?.exp?.initialProps?.bottomInset ?? 0);
  
  const [displayText, setDisplayText] = useState('');
  const [mode, setMode] = useState<KeyboardMode>('ko');
  const { themeMode, setThemeMode, colors } = useTheme();

  const stateManager = useMemo(() => {
    return new KeyboardStateManager((text) => {
      if (!isIME) {
        setDisplayText(text);
      }
    }, isIME);
  }, [isIME]);

  const handleKeyPress = useCallback((key: string) => {
    stateManager.handlePress(key);
  }, [stateManager]);

  const toggleMode = useCallback(() => {
    setMode((prevMode) => {
      const nextMode: KeyboardMode = prevMode === 'ko' ? 'en' : prevMode === 'en' ? 'num' : 'ko';
      stateManager.setMode(nextMode);
      return nextMode;
    });
  }, [stateManager]);

  const toggleTheme = useCallback(() => {
    setThemeMode(themeMode === 'black' ? 'pink' : 'black');
  }, [themeMode, setThemeMode]);

  const openKeyboardSettings = useCallback(() => {
    if (IMEModule && typeof IMEModule.openKeyboardSettings === 'function') {
      IMEModule.openKeyboardSettings();
    }
  }, []);

  const keyboardWrapperStyle = [
    styles.keyboardWrapper,
    { 
      backgroundColor: colors.background,
      paddingBottom: isIME ? Math.max(bottomInset, 10) : 40, 
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: isIME ? 'transparent' : colors.background }]}>
      <StatusBar barStyle={themeMode === 'black' ? 'light-content' : 'dark-content'} />
      
      {!isIME ? (
        <SafeAreaView style={styles.appArea}>
          <View style={[styles.displayArea, { backgroundColor: themeMode === 'black' ? '#111' : '#fff' }]}>
            <View style={styles.appHeader}>
              <Text style={[styles.headerTitle, { color: colors.buttonText }]}>Hanul Keyboard</Text>
              <TouchableOpacity 
                onPress={toggleTheme} 
                style={[styles.themeToggle, { backgroundColor: colors.buttonBackground }]}
              >
                <Text style={{ color: colors.buttonText }}>Theme: {themeMode}</Text>
              </TouchableOpacity>
            </View>
            <Text style={[styles.displayText, { color: themeMode === 'black' ? '#fff' : '#000' }]} numberOfLines={10}>
              {displayText}
              <Text style={styles.cursor}>|</Text>
            </Text>
          </View>
        </SafeAreaView>
      ) : null}

      <View style={keyboardWrapperStyle}>
        <HanulKeyboard 
          onPress={handleKeyPress} 
          mode={mode}
          onModeChange={toggleMode}
          onToggleTheme={toggleTheme}
          onOpenSettings={openKeyboardSettings}
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
