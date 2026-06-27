
import React, { useState, useEffect } from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CODING_HQ_KEY = 'coding_hq_notes';

export interface CodeNote {
  id: string;
  title: string;
  content: string;
}

interface AddNoteModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, content: string) => void;
}

const AddNoteModal: React.FC<AddNoteModalProps> = ({ visible, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSave = () => {
        if (title && content) {
            onSave(title, content);
            setTitle('');
            setContent('');
        } else {
            Alert.alert("त्रुटी", "कृपया शीर्षक आणि कोड/माहिती दोन्ही भरा.");
        }
    };

    return (
        <Modal visible={visible} onRequestClose={onClose} animationType="slide" transparent={true}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.addModalContainer}>
                <View style={styles.addModalContent}>
                    <Text style={styles.addNoteTitle}>नवीन कोड/माहिती जोडा</Text>
                    <TextInput style={styles.input} placeholder="शीर्षक (Title)" placeholderTextColor="#888" value={title} onChangeText={setTitle} />
                    <TextInput style={[styles.input, styles.textarea]} placeholder="कोड किंवा माहिती..." placeholderTextColor="#888" value={content} onChangeText={setContent} multiline />
                    <View style={styles.addModalButtons}>
                        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}><Text style={styles.buttonText}>सेव्ह करा</Text></TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onClose}><Text style={styles.buttonText}>रद्द करा</Text></TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

interface CodingHQProps {
  visible: boolean;
  onClose: () => void;
  // We will add more props later to interact with Kiyara
}

const CodingHQ: React.FC<CodingHQProps> = ({ visible, onClose }) => {
  const [notes, setNotes] = useState<CodeNote[]>([]);
  const [isAddModalVisible, setAddModalVisible] = useState(false);
  
  const loadNotes = async () => {
    try {
      const storedNotes = await AsyncStorage.getItem(CODING_HQ_KEY);
      if (storedNotes) setNotes(JSON.parse(storedNotes));
    } catch (e) { console.error("Failed to load code notes.", e); }
  };

  useEffect(() => {
    if(visible) loadNotes();
  }, [visible]);

  const saveNotes = async (newNotes: CodeNote[]) => {
    try {
      setNotes(newNotes);
      await AsyncStorage.setItem(CODING_HQ_KEY, JSON.stringify(newNotes));
    } catch (e) { console.error("Failed to save code notes.", e); }
  }

  const handleAddNote = (title: string, content: string) => {
    const newNote: CodeNote = { id: Date.now().toString(), title, content };
    saveNotes([...notes, newNote]);
    setAddModalVisible(false);
  };
  
  const handleDeleteNote = (id: string) => {
      Alert.alert('खात्री करा', 'तुम्हाला ही माहिती कायमची काढून टाकायची आहे का?', [
          { text: 'नाही', style: 'cancel' },
          { text: 'हो', onPress: () => saveNotes(notes.filter(note => note.id !== id)), style: 'destructive' },
      ]);
  }

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerTitle}>🤡 सीक्रेट हेडक्वार्टर</Text>
            <TouchableOpacity style={styles.closeIcon} onPress={onClose}><Text style={{fontSize: 24, color: '#fff'}}>❌</Text></TouchableOpacity>
        </View>
        
        <FlatList
          data={notes}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.noteItem}>
                <Text style={styles.noteTitle}>{item.title}</Text>
                <TouchableOpacity onPress={() => handleDeleteNote(item.id)}><Text style={styles.deleteButton}>🗑️</Text></TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<View style={{alignItems: 'center', marginTop: 50}}><Text style={styles.emptyText}>तुमचे सर्व गुप्त कोड आणि माहिती इथे दिसेल.</Text></View>}
        />

        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
            <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>

        <AddNoteModal visible={isAddModalVisible} onClose={() => setAddModalVisible(false)} onSave={handleAddNote} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1a1a1d' },
    header: { paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#2d2d3a', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#c3e88d' },
    closeIcon: { padding: 5 },
    noteItem: { backgroundColor: '#252528', padding: 20, marginVertical: 8, marginHorizontal: 16, borderRadius: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    noteTitle: { fontSize: 18, color: '#82aaff' },
    deleteButton: { fontSize: 24, color: '#ff5370' },
    addButton: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#c3e88d', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    addButtonText: { fontSize: 30, color: '#1a1a1d' },
    emptyText: { fontSize: 16, color: '#666' },
    addModalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
    addModalContent: { width: '90%', backgroundColor: '#2d2d3a', borderRadius: 15, padding: 20 },
    addNoteTitle: { fontSize: 20, fontWeight: 'bold', color: '#c3e88d', marginBottom: 20, textAlign: 'center' },
    input: { backgroundColor: '#1a1a1d', borderRadius: 10, padding: 15, fontSize: 16, color: '#fff', marginBottom: 15, borderColor: '#82aaff', borderWidth: 1 },
    textarea: { minHeight: 150, textAlignVertical: 'top' },
    addModalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    button: { borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, elevation: 2, flex: 1, alignItems: 'center' },
    buttonText: { color: '#1a1a1d', fontWeight: 'bold', fontSize: 16 },
    saveButton: { backgroundColor: '#c3e88d', marginRight: 10 },
    cancelButton: { backgroundColor: '#ff5370' },
});

export default CodingHQ;
