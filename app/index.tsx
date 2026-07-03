
import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable, StyleSheet, Text, ImageBackground, Alert } from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_KEY = '@kya_app_background';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [backgroundUri, setBackgroundUri] = useState<string | null>(null);

  const loadBackground = useCallback(async () => {
    const savedUri = await AsyncStorage.getItem(BACKGROUND_KEY);
    if (savedUri) {
      setBackgroundUri(savedUri);
    }
  }, []);

  // Load background when the screen comes into focus
  useFocusEffect(loadBackground);

  const pickBackground = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need gallery permissions to change the background.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      await AsyncStorage.setItem(BACKGROUND_KEY, uri);
      setBackgroundUri(uri);
    }
  };

  const imageSource = backgroundUri ? { uri: backgroundUri } : undefined;
  const defaultBackgroundColor = '#0f0c29';

  return (
    <ImageBackground 
        source={imageSource} 
        style={styles.container}
        resizeMode="cover"
    >
      <View style={[styles.overlay, { backgroundColor: imageSource ? 'rgba(0,0,0,0.2)' : defaultBackgroundColor }]}>
        <View style={[styles.buttonContainer, { top: insets.top + 20, right: 20 }]}>

          <Link href="/chat" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>🤡</Text>
            </Pressable>
          </Link>

          <Link href="/teach" asChild>
            <Pressable style={styles.button}>
              <Text style={styles.buttonText}>🎓</Text>
            </Pressable>
          </Link>

          <Pressable style={styles.button} onPress={pickBackground}>
            <Text style={styles.buttonText}>👗</Text>
          </Pressable>

        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
      flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    gap: 18,
    alignItems: 'center',
  },
  button: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  buttonText: {
    fontSize: 28,
  },
});
