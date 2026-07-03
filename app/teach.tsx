
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import { getKiyaraData, updateKiyaraData, KiyaraData, BrainData } from './brain';

export default function TeachScreen() {
  const [kiyaraData, setKiyaraData] = useState<KiyaraData | null>(null);
  const [newKnowledgeItem, setNewKnowledgeItem] = useState({ title: '', icon: '', content: '' });
  const [newConversationItem, setNewConversationItem] = useState({
    intent: '',
    keywords: '',
    repliesMr: '',
    repliesHi: '',
    repliesEn: '',
  });

  useEffect(() => {
    const load = async () => {
      const data = await getKiyaraData();
      setKiyaraData(data);
    };
    load();
  }, []);

  const handleSaveData = () => {
    if (kiyaraData) {
      updateKiyaraData(kiyaraData);
      Alert.alert("Data Saved!", "Kiyara's brain and knowledge has been updated.");
    }
  };

  const handleAddKnowledge = () => {
    if (!newKnowledgeItem.title || !newKnowledgeItem.content) {
      Alert.alert("Missing Info", "Please provide a title and content for new knowledge.");
      return;
    }
    setKiyaraData(prev => {
      if (!prev) return null;
      const newKnowledge = { ...prev.knowledge, [newKnowledgeItem.title]: { ...newKnowledgeItem } };
      return { ...prev, knowledge: newKnowledge };
    });
    setNewKnowledgeItem({ title: '', icon: '', content: '' });
  };
    
  const handleAddConversation = () => {
    const { intent, keywords, repliesMr, repliesHi, repliesEn } = newConversationItem;
    if (!intent || !keywords || !repliesMr) {
      Alert.alert("Missing Info", "Please provide Intent, Keywords, and at least Marathi replies.");
      return;
    }
    setKiyaraData(prev => {
        if (!prev) return null;
        const newBrain: BrainData = {
            keywords: keywords.split(',').map(k => k.trim()),
            replies: {
                mr: repliesMr.split(',').map(r => r.trim()),
                hi: repliesHi.split(',').map(r => r.trim()),
                en: repliesEn.split(',').map(r => r.trim()),
            }
        };
        const newBrainData = { ...prev.brain, [intent]: newBrain };
        return { ...prev, brain: newBrainData };
    });
    setNewConversationItem({ intent: '', keywords: '', repliesMr: '', repliesHi: '', repliesEn: '' });
  };

  if (!kiyaraData) {
    return <View style={styles.container}><Text style={styles.loadingText}>Loading Kiyara's Brain...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
        {/* Brain (Conversations) Section */}
        <View style={styles.sectionContainer}>
            <Text style={styles.title}>Teach Conversations</Text>
            
            <View style={styles.topicContainer}>
                <Text style={styles.topicTitle}>Add New Conversation</Text>
                <TextInput style={styles.input} placeholder="Intent Name (e.g., veda_prashna)" value={newConversationItem.intent} onChangeText={t => setNewConversationItem(v => ({...v, intent: t}))} />
                <TextInput style={styles.input} placeholder="Keywords (comma separated)" value={newConversationItem.keywords} onChangeText={t => setNewConversationItem(v => ({...v, keywords: t}))} />
                <TextInput style={styles.input} placeholder="Replies - Marathi (comma separated)" value={newConversationItem.repliesMr} onChangeText={t => setNewConversationItem(v => ({...v, repliesMr: t}))} />
                <TextInput style={styles.input} placeholder="Replies - Hindi (comma separated)" value={newConversationItem.repliesHi} onChangeText={t => setNewConversationItem(v => ({...v, repliesHi: t}))} />
                <TextInput style={styles.input} placeholder="Replies - English (comma separated)" value={newConversationItem.repliesEn} onChangeText={t => setNewConversationItem(v => ({...v, repliesEn: t}))} />
                <Button title="Add to Brain" onPress={handleAddConversation} />
            </View>

            <Text style={styles.subTitle}>Existing Conversations</Text>
            {Object.entries(kiyaraData.brain).map(([key, value]) => (
                <View key={key} style={styles.topicContainer}>
                    <Text style={styles.topicTitle}>{key}</Text>
                    {/* Simplified display, you can expand this to be editable if needed */}
                    <Text style={styles.label}>Keywords: {value.keywords.join(', ')}</Text>
                    <Text style={styles.label}>Replies (MR): {value.replies.mr.join(', ')}</Text>
                </View>
            ))}
        </View>

        {/* Knowledge Base Section */}
        <View style={styles.sectionContainer}>
            <Text style={styles.title}>Teach Knowledge</Text>
            <View style={styles.topicContainer}>
                <Text style={styles.topicTitle}>Add New Knowledge</Text>
                <TextInput style={styles.input} placeholder="Title" value={newKnowledgeItem.title} onChangeText={t => setNewKnowledgeItem(v => ({...v, title: t}))} />
                <TextInput style={styles.input} placeholder="Icon (e.g., 🕉️)" value={newKnowledgeItem.icon} onChangeText={t => setNewKnowledgeItem(v => ({...v, icon: t}))} />
                <TextInput style={[styles.input, {height: 100}]} placeholder="Content" multiline value={newKnowledgeItem.content} onChangeText={t => setNewKnowledgeItem(v => ({...v, content: t}))} />
                <Button title="Add to Knowledge" onPress={handleAddKnowledge} />
            </View>

             <Text style={styles.subTitle}>Existing Knowledge</Text>
            {Object.entries(kiyaraData.knowledge).map(([key, value]) => (
                <View key={key} style={styles.topicContainer}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={styles.topicTitle}>{value.icon} {key}</Text>
                        <Pressable onPress={() => Alert.alert(value.title, value.content)}>
                            <Text style={{fontSize: 24}}>▶️</Text>
                        </Pressable>
                    </View>
                </View>
            ))}
        </View>
        
        <View style={styles.saveButtonContainer}>
            <Button title="Save All Changes to Kiyara" onPress={handleSaveData} />
        </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#0f0c29',
  },
  loadingText: {
      color: 'white',
      textAlign: 'center',
      marginTop: 50,
      fontSize: 18,
  },
  sectionContainer: {
      marginBottom: 20,
      padding: 10,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#a78bfa', // Light purple
  },
  subTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginTop: 15,
      marginBottom: 10,
      color: '#ddd',
  },
  topicContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 8,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#ccc'
  },
  input: {
    borderWidth: 1,
    borderColor: '#a78bfa',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
    backgroundColor: 'rgba(0,0,0,0.2)',
    color: 'white',
    marginBottom: 10,
  },
  saveButtonContainer: {
      margin: 20,
      padding: 10,
  }
});
