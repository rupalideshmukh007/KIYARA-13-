import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { getBrain, updateBrain, Brain } from './brain';

export default function TeachScreen() {
  const [brain, setBrain] = useState<Brain | null>(null);

  useEffect(() => {
    const load = async () => {
      const loadedBrain = await getBrain();
      setBrain(loadedBrain);
    };
    load();
  }, []);

  const handleSave = () => {
    if (brain) {
      updateBrain(brain);
      Alert.alert("Brain Saved!", "Kiyara's brain has been updated.");
    }
  };

  const handleUpdate = (key: string, field: string, value: any) => {
    setBrain(prevBrain => {
        if (!prevBrain) return null;
        const newBrain = { ...prevBrain };
        (newBrain[key] as any)[field] = value;
        return newBrain;
    });
  };

  if (!brain) {
    return <View style={styles.container}><Text>Loading brain...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Teach Kiyara</Text>
      {Object.entries(brain).map(([key, value]) => (
        <View key={key} style={styles.topicContainer}>
          <Text style={styles.topicTitle}>{key}</Text>
          <Text style={styles.label}>Keywords (comma separated):</Text>
          <TextInput
            style={styles.input}
            value={value.keywords.join(', ')}
            onChangeText={text => handleUpdate(key, 'keywords', text.split(',').map(k => k.trim()))}
          />
          <Text style={styles.label}>Replies (Marathi):</Text>
          <TextInput
            style={styles.input}
            value={value.replies.mr.join(', ')}
            onChangeText={text => handleUpdate(key, 'replies', { ...value.replies, mr: text.split(',').map(r => r.trim()) })}
            />
            <Text style={styles.label}>Replies (Hindi):</Text>
          <TextInput
            style={styles.input}
            value={value.replies.hi.join(', ')}
            onChangeText={text => handleUpdate(key, 'replies', { ...value.replies, hi: text.split(',').map(r => r.trim()) })}
            />
            <Text style={styles.label}>Replies (English):</Text>
          <TextInput
            style={styles.input}
            value={value.replies.en.join(', ')}
            onChangeText={text => handleUpdate(key, 'replies', { ...value.replies, en: text.split(',').map(r => r.trim()) })}
            />
        </View>
      ))}
      <Button title="Save Brain" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  topicContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 5,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginTop: 5,
  },
});
