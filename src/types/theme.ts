export type ThemeMode = 'black' | 'pink';

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
  pink: {
    background: '#fff0f5',
    buttonBackground: '#ffc0cb',
    buttonText: '#d02090',
    specialButtonText: '#d02090',
    functionBarBackground: '#ffe4e1',
    iconColor: '#d02090',
    separator: '#ffd1dc',
  },
};
