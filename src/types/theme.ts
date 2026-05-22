export type ThemeMode = 'black' | 'darkblue';

export interface ThemeColors {
  background: string;
  buttonBackground: string;
  buttonText: string;
  specialButtonText: string;
  functionBarBackground: string;
  iconColor: string;
  separator: string;
}

export const Themes: Record<ThemeMode, ThemeColors> = {
  black: {
    background: '#1a1a1a',
    buttonBackground: '#333',
    buttonText: 'white',
    specialButtonText: '#ddd',
    functionBarBackground: '#222',
    iconColor: '#888',
    separator: '#555',
  },
  darkblue: {
    background: '#263238',
    buttonBackground: '#37474F',
    buttonText: '#FFFFFF',
    specialButtonText: '#FFFFFF',
    functionBarBackground: '#212D33',
    iconColor: '#80CBC4',
    separator: '#1B262C',
  },
};
