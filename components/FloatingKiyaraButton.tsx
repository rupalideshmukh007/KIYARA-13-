
import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, Pressable, Animated } from 'react-native';
import Voice from 'react-native-voice';
import * as Speech from 'expo-speech';
import { getKiyaraReply } from '@/app/brain';

const APP_ICON = require('@/assets/icone.png');

export default function FloatingKiyaraButton() {
  const [isListening, setIsListening] = useState(false);
  const anim = useState(new Animated.Value(0))[0];

  const onSpeechStart = (e: any) => {
    console.log('Listening started...', e);
    setIsListening(true);
  };

  const onSpeechEnd = (e: any) => {
    console.log('Listening ended.', e);
    setIsListening(false);
  };

  const onSpeechError = (e: any) => {
    console.error('Speech Error: ', e);
    setIsListening(false);
    Speech.speak("माफ करा, मला समजले नाही. परत प्रयत्न कराल का?", { language: 'mr-IN' });
  };

  const onSpeechResults = (e: any) => {
    if (e.value && e.value.length > 0) {
      console.log('Recognized: ', e.value[0]);
      const reply = getKiyaraReply(e.value[0]);
      const lang = reply.includes("नमस्ते") || reply.includes("दोस्त") ? 'hi-IN' : 'mr-IN';
      Speech.speak(reply, { language: lang });
    }
  };

  useEffect(() => {
    Voice.onSpeechStart = onSpeechStart;
    Voice.onSpeechEnd = onSpeechEnd;
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  useEffect(() => {
    Animated.spring(anim, {
      toValue: isListening ? 1 : 0,
      friction: 5,
      useNativeDriver: true,
    }).start();
  }, [isListening]);

  const handlePress = async () => {
    try {
      if (isListening) {
        await Voice.stop();
      } else {
        await Voice.start('mr-IN'); // Start listening in Marathi
      }
    } catch (e) {
      console.error('Voice action failed: ', e);
    }
  };

  const animatedStyle = {
    transform: [
      {
        scale: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.2],
        }),
      },
    ],
    opacity: anim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 1],
      }),
  };

  return (
    <Pressable onPress={handlePress} style={styles.container}>
        <Animated.View style={[styles.button, animatedStyle]}>
            <Image source={APP_ICON} style={styles.icon} />
        </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    right: 30,
  },
  button: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#a78bfa',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  icon: {
    width: '90%',
    height: '90%',
    borderRadius: 30,
  },
});
