
import { NativeModules, DeviceEventEmitter } from 'react-native';

// We assume a native module `FloatingBubble` is created. 
// This JS code acts as an interface to that native functionality.
const { FloatingBubble } = NativeModules;

class FloatingBuddyService {
  isStarted = false;

  // Method to check and request permission, then start the service
  start() {
    if (!FloatingBubble) {
      console.error("FloatingBuddyService: Native module not found. Floating bubble feature is not available.");
      return;
    }

    if (this.isStarted) {
      console.log('Floating Buddy is already running.');
      return;
    }

    // 1. Check if we have the 'draw over other apps' permission
    FloatingBubble.checkPermission()
      .then(hasPermission => {
        if (hasPermission) {
          this.showBubble();
        } else {
          // 2. If not, request it from the user
          FloatingBubble.requestPermission()
            .then(wasGranted => {
              if (wasGranted) {
                this.showBubble();
              } else {
                console.warn('Floating Buddy: Permission to draw over other apps was not granted.');
              }
            })
            .catch(error => console.error("Error requesting permission:", error));
        }
      })
      .catch(error => console.error("Error checking permission:", error));
  }

  // Shows the bubble on the screen
  showBubble() {
    FloatingBubble.show();
    this.isStarted = true;
    console.log('Floating Buddy bubble is now visible.');
    
    // Listen for events when the user presses the bubble
    DeviceEventEmitter.addListener('floating-bubble-press', this.onBubblePress);
  }

  // Hides the bubble
  stop() {
    if (!this.isStarted || !FloatingBubble) return;
    FloatingBubble.hide();
    this.isStarted = false;
    DeviceEventEmitter.removeAllListeners('floating-bubble-press');
    console.log('Floating Buddy bubble has been hidden.');
  }

  // This function is called when the bubble is pressed
  onBubblePress = () => {
    console.log('Bubble pressed! Emitting event to start voice listening.');
    // Send an event to the main React Native component to start the listening process
    DeviceEventEmitter.emit('start-buddy-listening');
  };
}

// Export a single instance of the service so it's the same everywhere in the app
export default new FloatingBuddyService();
