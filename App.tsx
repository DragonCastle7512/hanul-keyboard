import React, { useState, useMemo, useCallback } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HanulKeyboard from './src/components/HanulKeyboard';
import { KeyboardStateManager, KeyboardMode } from './src/logic/KeyboardStateManager';

export default function App(props: any) {
  // Check both props and possible nested props if wrapped by registerRootComponent
  const isIME = props?.isIME || (props?.exp && props?.exp?.initialProps && props?.exp?.initialProps?.isIME) || false;
  const bottomInset = Number(
    props?.bottomInset ??
    props?.exp?.initialProps?.bottomInset ??
    0
  );
  
  const [displayText, setDisplayText] = useState('');
  const [mode, setMode] = useState<KeyboardMode>('ko');

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

  return (
    <View style={[styles.container, isIME && styles.imeContainer]}>
      {!isIME ? (
        <View style={styles.displayArea}>
          <Text style={styles.displayText} numberOfLines={10}>
            {displayText}
            <Text style={styles.cursor}>|</Text>
          </Text>
        </View>
      ) : null}
      <View
        style={
          isIME
            ? [
                styles.imeKeyboardWrapper,
                { height: 350 + bottomInset, paddingBottom: bottomInset },
              ]
            : null
        }
      >
        <HanulKeyboard 
          onPress={handleKeyPress} 
          mode={mode}
          onModeChange={toggleMode}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imeContainer: {
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
  },
  imeKeyboardWrapper: {
    height: 300,
    justifyContent: 'flex-end',
    backgroundColor: '#1a1a1a',
  },
  displayArea: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
    backgroundColor: '#111',
  },
  displayText: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 32,
  },
  cursor: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
});
