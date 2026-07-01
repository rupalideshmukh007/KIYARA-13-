
import { registerRootComponent, AppRegistry } from 'expo';
import App from './App';
import kiyaraHeadlessTask from './app/kiyaraHeadlessTask';

// Register the main application component
registerRootComponent(App);

// Register the headless task
AppRegistry.registerHeadlessTask('KiyaraHeadlessTask', () => kiyaraHeadlessTask);
