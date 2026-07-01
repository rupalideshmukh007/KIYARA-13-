
import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Alert, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation, Link, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { NOTE_FONT_SIZE_KEY, NOTE_ICON_SIZE_KEY } from '../components/VoiceSettings';

const NOTES_KEY = 'notes';
const INDEX_NOTE_ICON = '🥱';
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_ICON_SIZE = 24;

const iconOptions = ['😀', '😂', '😍', '🤔', '😴', '🤡', '💕', '✈️', '🍔', '🎉', '🥱'];

const CreateNoteScreen = () => {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const router = useRouter();
  const isEditing = id != null;

  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('');
  const [content, setContent] = useState<any[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isIconPickerVisible, setIconPickerVisible] = useState(false);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [iconSize, setIconSize] = useState(DEFAULT_ICON_SIZE);

  const styles = getDynamicStyles(fontSize, iconSize);

  const loadSettings = async () => {
    const savedFontSize = await AsyncStorage.getItem(NOTE_FONT_SIZE_KEY);
    const savedIconSize = await AsyncStorage.getItem(NOTE_ICON_SIZE_KEY);
    setFontSize(savedFontSize ? parseInt(savedFontSize, 10) : DEFAULT_FONT_SIZE);
    setIconSize(savedIconSize ? parseInt(savedIconSize, 10) : DEFAULT_ICON_SIZE);
  };

  useEffect(() => {
    loadSettings();
    const settingsSubscription = DeviceEventEmitter.addListener('noteSettingsChanged', loadSettings);
    return () => settingsSubscription.remove();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
        headerTransparent: true, headerTitle: '',
        headerRight: () => (
            <Link href="/notes" asChild>
                <TouchableOpacity style={styles.headerButton}><Text style={styles.headerButtonText}>😴</Text></TouchableOpacity>
            </Link>
        ),
    });
  }, [navigation, styles]);

  useEffect(() => { if (isEditing) loadNote(); }, [isEditing]);

  const loadNote = async () => {
    const notesString = await AsyncStorage.getItem(NOTES_KEY);
    if (notesString) {
      const notes = JSON.parse(notesString);
      const noteToEdit = notes.find((note: any) => note.id === id);
      if (noteToEdit) {
        setTitle(noteToEdit.title);
        setIcon(noteToEdit.icon || '');
        setContent(noteToEdit.content || []);
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 1 });
    if (!result.canceled) {
      setContent([...content, { type: 'image', value: result.assets[0].uri }]);
    }
  };

  const addTextMessage = () => {
    if (currentMessage.trim() === '') return;
    setContent([...content, { type: 'text', value: currentMessage }]);
    setCurrentMessage('');
  };

  const saveNote = async () => {
    if (title.trim() === '') {
      Alert.alert('Title is required', 'Please enter a title for your note.');
      return;
    }
    const notesString = await AsyncStorage.getItem(NOTES_KEY);
    let notes = notesString ? JSON.parse(notesString) : [];
    let noteNumber = -1;

    if (isEditing) {
      notes = notes.map((note: any) => {
        if (note.id === id) {
          noteNumber = note.noteNumber;
          return { ...note, title, icon, content };
        }
        return note;
      });
    } else {
      const maxNumber = notes.reduce((max: number, note: any) => Math.max(max, note.noteNumber || 0), 0);
      noteNumber = maxNumber + 1;
      const newNote = { id: Date.now().toString(), title, icon, content, noteNumber };
      notes.push(newNote);

      // Update the index note
      const indexNote = notes.find((n: any) => n.icon === INDEX_NOTE_ICON);
      if (indexNote) {
        const indexContent = `\n${noteNumber} - ${title}\n(येथे १० ओळींची माहिती लिहा...)\n`;
        if (!indexNote.content) indexNote.content = [];
        indexNote.content.push({ type: 'text', value: indexContent });
      }
    }

    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    router.back();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView style={styles.chatContainer}>
            {content.map((item, index) => (
                <View key={index} style={item.type === 'image' ? styles.imageMessage : styles.textMessage}>
                    {item.type === 'text' ? (
                        <Text style={styles.messageText}>{item.value}</Text>
                    ) : (
                        <Image source={{ uri: item.value }} style={styles.imageContent} resizeMode="contain" />
                    )}
                </View>
            ))}
        </ScrollView>

        {isIconPickerVisible && (
            <View style={styles.iconPickerContainer}>
                {iconOptions.map(opt => (
                    <TouchableOpacity key={opt} onPress={() => { setIcon(opt); setIconPickerVisible(false); }}>
                        <Text style={styles.iconOption}>{opt}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        )}

        <View style={styles.inputRow}>
            <TouchableOpacity onPress={() => setIconPickerVisible(!isIconPickerVisible)} style={styles.iconSelectButton}>
                <Text style={styles.iconSelectText}>{icon || '🖋️'}</Text>
            </TouchableOpacity>
            <TextInput
                style={styles.titleInput}
                placeholder="Enter Title..."
                placeholderTextColor="#aaa"
                value={title}
                onChangeText={setTitle}
            />
        </View>

        <View style={styles.inputRow}>
            <TextInput
                style={styles.textInput}
                placeholder="Type message or add image..."
                placeholderTextColor="#aaa"
                value={currentMessage}
                onChangeText={setCurrentMessage}
                onSubmitEditing={addTextMessage}
            />
            <TouchableOpacity onPress={pickImage} style={styles.actionButton}><Text style={{fontSize: 24}}>🖼️</Text></TouchableOpacity>
            <TouchableOpacity onPress={addTextMessage} style={styles.actionButton}><Text style={{fontSize: 24}}>➡️</Text></TouchableOpacity>
        </View>
         <TouchableOpacity onPress={saveNote} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save Note</Text>
        </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const getDynamicStyles = (fontSize: number, iconSize: number) => StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  headerButton: { marginRight: 15 },
  headerButtonText: { fontSize: 28 },
  chatContainer: { flex: 1, padding: 10, paddingTop: 100 },
  textMessage: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 15, padding: 10, marginBottom: 10, maxWidth: '80%' },
  imageMessage: { alignSelf: 'flex-start', marginBottom: 10, maxWidth: '80%' },
  messageText: { color: 'white', fontSize: fontSize },
  imageContent: { width: 200, height: 200, borderRadius: 15 },
  inputRow: { flexDirection: 'row', padding: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', backgroundColor: 'rgba(0,0,0,0.3)' },
  iconSelectButton: { padding: 10 },
  iconSelectText: { fontSize: iconSize },
  titleInput: { flex: 1, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, fontSize: 16 },
  textInput: { flex: 1, color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, marginRight: 10, fontSize: 16 },
  actionButton: { padding: 10 },
  iconPickerContainer: { flexDirection: 'row', flexWrap: 'wrap', padding: 10, backgroundColor: 'rgba(0,0,0,0.8)' },
  iconOption: { fontSize: 30, padding: 10 },
  saveButton: { backgroundColor: '#4CAF50', padding: 15, alignItems: 'center', margin: 10, borderRadius: 25 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default CreateNoteScreen;
