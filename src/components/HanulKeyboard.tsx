import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

interface HanulKeyboardProps {
  onPress: (key: string) => void;
  mode: string;
  onModeChange: () => void;
}

const { width } = Dimensions.get('window');
const BUTTON_MARGIN = 4;
const BUTTON_WIDTH = (width - BUTTON_MARGIN * 10) / 4;
const BUTTON_HEIGHT = 60;

const HanulKeyboard: React.FC<HanulKeyboardProps> = ({ onPress, mode, onModeChange }) => {
  const renderButton = (label: string, value: string, flex = 1, icon?: any) => (
    <TouchableOpacity
      style={[styles.button, { flex }]}
      onPress={() => onPress(value)}
      activeOpacity={0.7}
    >
      {icon ? (
        icon
      ) : (
        <Text style={styles.buttonText}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Row 1 */}
      <View style={styles.row}>
        {renderButton('ㅣ', 'ㅣ')}
        {renderButton('·', '·')}
        {renderButton('ㅡ', 'ㅡ')}
        {renderButton('.,', '.,')}
      </View>

      {/* Row 2 */}
      <View style={styles.row}>
        {renderButton('ㄱ ㅋ', 'ㄱㅋ')}
        {renderButton('ㄴ ㄹ', 'ㄴㄹ')}
        {renderButton('ㄷ ㅌ', 'ㄷㅌ')}
        {renderButton(':: ;', '::;')}
      </View>

      {/* Row 3 */}
      <View style={styles.row}>
        {renderButton('ㅂ ㅍ', 'ㅂㅍ')}
        {renderButton('ㅅ ㅎ', 'ㅅㅎ')}
        {renderButton('ㅈ ㅊ', 'ㅈㅊ')}
        {renderButton('? !', '?!')}
      </View>

      {/* Row 4 */}
      <View style={styles.row}>
        <View style={[styles.splitButtonContainer, { flex: 1 }]}>
          <TouchableOpacity style={styles.splitButton} onPress={() => onPress('Left')}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity style={styles.splitButton} onPress={() => onPress('Right')}>
            <Ionicons name="arrow-forward" size={24} color="white" />
          </TouchableOpacity>
        </View>
        {renderButton('ㅇ ㅁ', 'ㅇㅁ')}
        {renderButton('^ ~', '^~')}
        {renderButton('@ /', '@/')}
      </View>

      {/* Row 5 */}
      <View style={styles.row}>
        <TouchableOpacity style={[styles.button, styles.specialButton]} onPress={onModeChange}>
          <Text style={styles.specialButtonText}>{mode === 'ko' ? '가A0' : mode === 'en' ? 'ABC' : '123'}</Text>
        </TouchableOpacity>
        {renderButton('_', 'Space', 1.5, <MaterialCommunityIcons name="keyboard-space" size={24} color="white" />)}
        {renderButton('★', '★')}
        {renderButton('↵', 'Enter', 1, <MaterialCommunityIcons name="keyboard-return" size={24} color="white" />)}
        {renderButton('⌫', 'Backspace', 1, <MaterialCommunityIcons name="keyboard-backspace" size={24} color="white" />)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    padding: BUTTON_MARGIN,
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: BUTTON_MARGIN,
  },
  button: {
    backgroundColor: '#333',
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
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
  },
  specialButton: {
    backgroundColor: '#444',
  },
  specialButtonText: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: 'bold',
  },
  splitButtonContainer: {
    flexDirection: 'row',
    backgroundColor: '#333',
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
    backgroundColor: '#555',
    marginVertical: 10,
  },
});

export default HanulKeyboard;
