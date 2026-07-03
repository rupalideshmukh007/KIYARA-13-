import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { getBrain, updateBrain, Brain, getKnowledge, updateKnowledge, KnowledgeBase, KiyaraKnowledge } from './brain';

export default function TeachScreen() {
  const [brain, setBrain] = useState<Brain | null>(null);
  const [knowledge, setKnowledge] = useState<KnowledgeBase | null>(null);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState({ title: '', icon: '', content: '' });

  useEffect(() => {
    const load = async () => {
      setBrain(await getBrain());
      setKnowledge(await getKnowledge());
    };
    load();
  }, []);

  const handleSaveBrain = () => {
    if (brain) {
      updateBrain(brain);
      Alert.alert("Brain Saved!", "Kiyara's conversation brain has been updated.");
    }
  };

  const handleSaveKnowledge = () => {
    if (knowledge) {
      updateKnowledge(knowledge);
      Alert.alert("Knowledge Saved!", "Kiyara's knowledge base has been updated.");
    }
  };
  
  const handleAddKnowledge = () => {
    if (!newKnowledgeItem.title || !newKnowledgeItem.content) {
        Alert.alert("Missing Info", "Please provide a title and content.");
        return;
    }
    setKnowledge(prev => {
        if (!prev) return null;
        return { ...prev, [newKnowledgeItem.title]: { ...newKnowledgeItem } };
    });
    setNewKnowledgeItem({ title: '', icon: '', content: '' });
  }

  if (!brain || !knowledge) {
    return <View style={styles.container}><Text>Loading brain...</Text></View>;
  }

  return (
    <ScrollView style={styles.container}>
        {/* Knowledge Base Section */}
        <View style={styles.sectionContainer}>
            <Text style={styles.title}>Knowledge Base</Text>
            {Object.entries(knowledge).map(([key, value]) => (
                <View key={key} style={styles.topicContainer}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={styles.topicTitle}>{value.icon} {key}</Text>
                        <Pressable onPress={() => Alert.alert(value.title, value.content)}>
                            <Text style={{fontSize: 24}}>▶️</Text>
                        </Pressable>
                    </View>
                </View>
            ))}
            <View style={styles.topicContainer}>
                <Text style={styles.topicTitle}>Add New Knowledge</Text>
                <TextInput style={styles.input} placeholder="Title" value={newKnowledgeItem.title} onChangeText={t => setNewKnowledgeItem(v => ({...v, title: t}))} />
                <TextInput style={styles.input} placeholder="Icon (e.g., 🕉️)" value={newKnowledgeItem.icon} onChangeText={t => setNewKnowledgeItem(v => ({...v, icon: t}))} />
                <TextInput style={[styles.input, {height: 100}]} placeholder="Content" multiline value={newKnowledgeItem.content} onChangeText={t => setNewKnowledgeItem(v => ({...v, content: t}))} />
                <Button title="Add to List" onPress={handleAddKnowledge} />
            </View>
            <Button title="Save Knowledge" onPress={handleSaveKnowledge} />
        </View>

        {/* Brain (Conversations) Section */}
        <View style={styles.sectionContainer}>
            <Text style={styles.title}>Conversations</Text>
            {Object.entries(brain).map(([key, value]) => (
                <View key={key} style={styles.topicContainer}>
                <Text style={styles.topicTitle}>{key}</Text>
                <Text style={styles.label}>Keywords (comma separated):</Text>
                <TextInput
                    style={styles.input}
                    value={value.keywords.join(', ')}
                    onChangeText={text => setBrain(b => ({...b!, [key]: {...b![key], keywords: text.split(',').map(k => k.trim())}}))}
                />
                <Text style={styles.label}>Replies (Marathi):</Text>
                <TextInput
                    style={styles.input}
                    value={value.replies.mr.join(', ')}
                    onChangeText={text => setBrain(b => ({...b!, [key]: {...b![key], replies: { ...b![key].replies, mr: text.split(',').map(r => r.trim()) }}}))}
                    />
                    <Text style={styles.label}>Replies (Hindi):</Text>
                <TextInput
                    style={styles.input}
                    value={value.replies.hi.join(', ')}
                    onChangeText={text => setBrain(b => ({...b!, [key]: {...b![key], replies: { ...b![key].replies, hi: text.split(',').map(r => r.trim()) }}}))}
                    />
                    <Text style={styles.label}>Replies (English):</Text>
                <TextInput
                    style={styles.input}
                    value={value.replies.en.join(', ')}
                    onChangeText={text => setBrain(b => ({...b!, [key]: {...b![key], replies: { ...b![key].replies, en: text.split(',').map(r => r.trim()) }}}))}
                    />
                </View>
            ))}
            <Button title="Save Conversations" onPress={handleSaveBrain} />
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  sectionContainer: {
      marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  topicContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: '#fff',
  },
});
