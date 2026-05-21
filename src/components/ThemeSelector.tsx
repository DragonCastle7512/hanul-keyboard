import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TouchableWithoutFeedback, Dimensions, Pressable } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { ThemeMode, Themes, ThemeColors } from '../types/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface ThemeSelectorProps {
  isVisible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const KeyboardPreview = ({ themeColors }: { themeColors: ThemeColors }) => {
  const renderKey = (label: string, flex = 1) => (
    <View style={[styles.previewKey, { backgroundColor: themeColors.buttonBackground, flex }]}>
      <Text style={[styles.previewKeyText, { color: themeColors.buttonText }]}>{label}</Text>
    </View>
  );

  return (
    <View style={[styles.previewContainer, { backgroundColor: themeColors.background }]}>
      <View style={[styles.previewFunctionBar, { backgroundColor: themeColors.functionBarBackground, borderBottomColor: themeColors.separator }]}>
        <View style={[styles.previewIcon, { backgroundColor: themeColors.iconColor }]} />
        <View style={[styles.previewIcon, { backgroundColor: themeColors.iconColor }]} />
        <View style={[styles.previewIcon, { backgroundColor: themeColors.iconColor }]} />
      </View>
      <View style={styles.previewRow}>
        {renderKey('ㅣ')}
        {renderKey('·')}
        {renderKey('ㅡ')}
        {renderKey('.,')}
      </View>
      <View style={styles.previewRow}>
        <View style={[styles.previewKey, { backgroundColor: themeColors.buttonBackground, flex: 1.5 }]}>
          <Text style={[styles.previewKeyText, { color: themeColors.specialButtonText, fontSize: 8 }]}>가A0</Text>
        </View>
        {renderKey('Space', 2)}
        {renderKey('↵')}
      </View>
    </View>
  );
};

const ThemeSelector = ({ isVisible, onClose }: ThemeSelectorProps) => {
  const { themeMode, setThemeMode, colors } = useTheme();

  if (!isVisible) return null;

  const handleSelectTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    onClose();
  };

  return (
    <View style={styles.absoluteContainer} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>
      
      <View 
        style={[styles.content, { backgroundColor: colors.background, borderColor: colors.separator }]}
      >
        <View style={[styles.header, { borderBottomColor: colors.separator }]}>
          <Text style={[styles.title, { color: colors.buttonText }]}>테마 선택</Text>
          <Pressable 
            onPress={onClose} 
            style={({ pressed }) => [
              styles.closeIconButton,
              { opacity: pressed ? 0.5 : 1 }
            ]}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <MaterialCommunityIcons name="close" size={26} color={colors.iconColor} />
          </Pressable>
        </View>

        <ScrollView 
          style={[styles.scrollView, { backgroundColor: 'transparent' }]} 
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          bounces={true}
          overScrollMode="always"
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {(Object.keys(Themes) as ThemeMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[
                styles.themeItem,
                { 
                  backgroundColor: Themes[mode].functionBarBackground,
                  borderColor: themeMode === mode ? colors.buttonText : 'transparent',
                }
              ]}
              delayPressIn={100}
              activeOpacity={0.8}
              onPress={() => handleSelectTheme(mode)}
            >
              <View style={styles.themeInfo}>
                <Text style={[styles.themeLabel, { color: Themes[mode].buttonText }]}>
                  {mode === 'black' ? '다크 블랙' : mode === 'pink' ? '러블리 핑크' : mode}
                </Text>
                {themeMode === mode && (
                  <Text style={[styles.selectedText, { color: colors.buttonText }]}>사용 중 ✓</Text>
                )}
              </View>
              
              <View pointerEvents="none">
                <KeyboardPreview themeColors={Themes[mode]} />
              </View>
            </TouchableOpacity>
          ))}
          <View style={{ height: 10 }} />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  absoluteContainer: {
    position: 'absolute',
    top: -SCREEN_HEIGHT,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 9999,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    width: '100%',
    height: 330,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  closeIconButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 5,
    paddingBottom: 5,
  },
  themeItem: {
    borderRadius: 18,
    marginBottom: 16,
    padding: 16,
    borderWidth: 2.5,
    overflow: 'hidden',
  },
  themeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  themeLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewContainer: {
    padding: 10,
    borderRadius: 12,
    width: '100%',
  },
  previewFunctionBar: {
    height: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    marginBottom: 6,
  },
  previewIcon: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  previewRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  previewKey: {
    height: 28,
    marginHorizontal: 3,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewKeyText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ThemeSelector;
