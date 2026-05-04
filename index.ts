import { registerRootComponent } from 'expo';
import { AppRegistry } from 'react-native';
import App from './App';

// For regular App (Expo Go / Main Activity)
registerRootComponent(App);

// For IME (Direct Native Call)
AppRegistry.registerComponent('HanulKeyboard', () => App);
