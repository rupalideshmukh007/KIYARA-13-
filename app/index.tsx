import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={styles.title}>Kiyara AI</Text>
      <View style={styles.buttonContainer}>
        <Link href="/teach" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>💬</Text>
            <Text style={styles.buttonLabel}>Teach Kiyara</Text>
          </Pressable>
        </Link>
        <Link href="/chat" asChild>
          <Pressable style={styles.button}>
            <Text style={styles.buttonText}>🤡</Text>
            <Text style={styles.buttonLabel}>Chat with Kiyara</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0c29',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    color: 'white',
    fontFamily: 'Inter_700Bold',
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    alignItems: 'center',
    backgroundColor: 'rgba(167, 139, 250, 0.25)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.5)',
  },
  buttonText: {
    fontSize: 50,
  },
  buttonLabel: {
    color: 'white',
    marginTop: 10,
    fontFamily: 'Inter_400Regular',
  },
});
