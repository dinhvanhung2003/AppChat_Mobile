export const theme={
    bgWhite:opacity=>`rgba(255,255,255,${opacity})`
}
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
