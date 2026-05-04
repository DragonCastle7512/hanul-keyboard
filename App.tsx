import React, { useState, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import HanulKeyboard from './src/components/HanulKeyboard';
import { KeyboardStateManager, KeyboardMode } from './src/logic/KeyboardStateManager';

export default function App(props: any) {
  // Check both props and possible nested props if wrapped by registerRootComponent
  const isIME = props?.isIME || (props?.exp && props?.exp?.initialProps && props?.exp?.initialProps?.isIME) || false;
  
  const [displayText, setDisplayText] = useState('');
  const [mode, setMode] = useState<KeyboardMode>('ko');

  const stateManager = useMemo(() => {
    return new KeyboardStateManager((text) => {
      setDisplayText(text);
    }, isIME);
  }, [isIME]);

  const handleKeyPress = (key: string) => {
    stateManager.handlePress(key);
  };

  const toggleMode = () => {
    const nextMode: KeyboardMode = mode === 'ko' ? 'en' : mode === 'en' ? 'num' : 'ko';
    setMode(nextMode);
    stateManager.setMode(nextMode);
  };

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
      <View style={isIME ? styles.imeKeyboardWrapper : null}>
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
