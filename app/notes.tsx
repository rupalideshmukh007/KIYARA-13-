
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Link } from 'expo-router';
import { NOTE_FONT_SIZE_KEY, NOTE_ICON_SIZE_KEY } from '../components/VoiceSettings';

const NOTES_KEY = 'notes';
const DEFAULT_FONT_SIZE = 18;
const DEFAULT_ICON_SIZE = 24;

const NotesScreen = () => {
  const [notes, setNotes] = useState([]);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [iconSize, setIconSize] = useState(DEFAULT_ICON_SIZE);
  const navigation = useNavigation();

  const loadSettings = async () => {
    const savedFontSize = await AsyncStorage.getItem(NOTE_FONT_SIZE_KEY);
    const savedIconSize = await AsyncStorage.getItem(NOTE_ICON_SIZE_KEY);
    setFontSize(savedFontSize ? parseInt(savedFontSize, 10) : DEFAULT_FONT_SIZE);
    setIconSize(savedIconSize ? parseInt(savedIconSize, 10) : DEFAULT_ICON_SIZE);
  };

  const loadNotes = async () => {
    const notesString = await AsyncStorage.getItem(NOTES_KEY);
    if (notesString) {
      setNotes(JSON.parse(notesString));
    }
  };

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadNotes();
      loadSettings();
    });
    const settingsSubscription = DeviceEventEmitter.addListener('noteSettingsChanged', loadSettings);

    return () => {
      unsubscribeFocus();
      settingsSubscription.remove();
    };
  }, [navigation]);

  const deleteNote = async (id) => {
      Alert.alert(
        "Delete Note",
        "Are you sure you want to delete this note?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: async () => {
                const newNotes = notes.filter((note) => note.id !== id);
                setNotes(newNotes);
                await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(newNotes));
            }
          }
        ]
      );
  };

  return (
    <View style={styles.container}>
        <View style={styles.header}>
            <Text style={styles.headerText}>😴 My Notes</Text>
            <Link href="/create-note" asChild>
                <TouchableOpacity style={styles.createButton}>
                    <Text style={styles.createButtonText}>💕</Text>
                </TouchableOpacity>
            </Link>
        </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteContainer}>
            <View style={styles.noteHeader}>
                <Text style={{ fontSize: iconSize, marginRight: 10 }}>{item.icon || '🖋️'}</Text>
                <Text style={[styles.noteTitle, { fontSize: fontSize }]}>{item.title}</Text>
            </View>
            <View style={styles.noteActions}>
                <Link href={{ pathname: '/create-note', params: { id: item.id } }} asChild>
                    <TouchableOpacity style={styles.actionButton}>
                        <Text style={styles.actionButtonText}>Edit</Text>
                    </TouchableOpacity>
                </Link>
                <TouchableOpacity onPress={() => deleteNote(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                    <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, paddingTop: 60, backgroundColor: '#1c1c1e' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    headerText: { fontSize: 32, fontWeight: 'bold', color: 'white' },
    createButton: { backgroundColor: 'rgba(255,255,255,0.2)', padding: 10, borderRadius: 50 },
    createButtonText: { fontSize: 24, color: 'white' },
    noteContainer: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 10, marginBottom: 15 },
    noteHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    noteTitle: { fontWeight: 'bold', color: 'white' },
    noteActions: { flexDirection: 'row', justifyContent: 'flex-end' },
    actionButton: { paddingHorizontal: 15, paddingVertical: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.2)', marginLeft: 10 },
    actionButtonText: { color: 'white' },
    deleteButton: { backgroundColor: '#f44336' },
    deleteButtonText: { color: 'white' }
});

export default NotesScreen;
