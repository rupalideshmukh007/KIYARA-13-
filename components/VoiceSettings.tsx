
import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

export const VOICE_PITCH_KEY = 'voice_pitch';
export const VOICE_RATE_KEY = 'voice_rate';
export const VOICE_LANG_KEY = 'voice_lang';
export const NOTE_FONT_SIZE_KEY = 'note_font_size';
export const NOTE_ICON_SIZE_KEY = 'note_icon_size';

const DEFAULT_PITCH = 1.4;
const DEFAULT_RATE = 0.9;
const DEFAULT_LANG = 'mr-IN';
const DEFAULT_FONT_SIZE = 16;
const DEFAULT_ICON_SIZE = 24;

interface VoiceSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ visible, onClose }) => {
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [lang, setLang] = useState(DEFAULT_LANG);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);
  const [iconSize, setIconSize] = useState(DEFAULT_ICON_SIZE);

  useEffect(() => {
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const loadSettings = async () => {
    const savedPitch = await AsyncStorage.getItem(VOICE_PITCH_KEY);
    const savedRate = await AsyncStorage.getItem(VOICE_RATE_KEY);
    const savedLang = await AsyncStorage.getItem(VOICE_LANG_KEY);
    const savedFontSize = await AsyncStorage.getItem(NOTE_FONT_SIZE_KEY);
    const savedIconSize = await AsyncStorage.getItem(NOTE_ICON_SIZE_KEY);

    setPitch(savedPitch ? parseFloat(savedPitch) : DEFAULT_PITCH);
    setRate(savedRate ? parseFloat(savedRate) : DEFAULT_RATE);
    setLang(savedLang || DEFAULT_LANG);
    setFontSize(savedFontSize ? parseInt(savedFontSize, 10) : DEFAULT_FONT_SIZE);
    setIconSize(savedIconSize ? parseInt(savedIconSize, 10) : DEFAULT_ICON_SIZE);
  };

  const handleSettingChange = async (type: 'pitch' | 'rate' | 'lang' | 'font' | 'icon', value: number | string) => {
    let finalValue: string;
    let key: string;
    let stateSetter: React.Dispatch<React.SetStateAction<any>>;

    switch (type) {
      case 'pitch':
        finalValue = Math.max(0.5, Math.min(2.0, value as number)).toString();
        key = VOICE_PITCH_KEY;
        stateSetter = setPitch;
        break;
      case 'rate':
        finalValue = Math.max(0.5, Math.min(2.0, value as number)).toString();
        key = VOICE_RATE_KEY;
        stateSetter = setRate;
        break;
      case 'lang':
        finalValue = value as string;
        key = VOICE_LANG_KEY;
        stateSetter = setLang;
        break;
      case 'font':
        finalValue = Math.max(10, Math.min(30, value as number)).toString();
        key = NOTE_FONT_SIZE_KEY;
        stateSetter = setFontSize;
        break;
      case 'icon':
        finalValue = Math.max(16, Math.min(40, value as number)).toString();
        key = NOTE_ICON_SIZE_KEY;
        stateSetter = setIconSize;
        break;
    }

    stateSetter(type === 'lang' ? finalValue : parseFloat(finalValue));
    await AsyncStorage.setItem(key, finalValue);

    if (type === 'font' || type === 'icon') {
        DeviceEventEmitter.emit('noteSettingsChanged');
    } else {
        DeviceEventEmitter.emit('voiceSettingsChanged');
    }
  };

  const testVoice = () => {
    let testText = "नमस्कार, हा माझा आवाज आहे.";
    if (lang === 'hi-IN') testText = "नमस्ते, यह मेरी आवाज़ है।";
    if (lang === 'en-IN') testText = "Hello, this is my voice.";
    Speech.speak(testText, { language: lang, pitch, rate });
  };

  const resetToDefaults = () => {
      handleSettingChange('pitch', DEFAULT_PITCH);
      handleSettingChange('rate', DEFAULT_RATE);
      handleSettingChange('lang', DEFAULT_LANG);
      handleSettingChange('font', DEFAULT_FONT_SIZE);
      handleSettingChange('icon', DEFAULT_ICON_SIZE);
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
            <Text style={styles.modalTitle}>सेटिंग्ज</Text>

            {/* Voice Settings */}
            <Text style={styles.sectionTitle}>आवाज (Voice)</Text>
            <Text style={styles.settingLabel}>भाषा (Language)</Text>
            <View style={styles.langContainer}>
                {['mr-IN', 'hi-IN', 'en-IN'].map(l => (
                    <TouchableOpacity
                        key={l}
                        style={[styles.langButton, lang === l && styles.langButtonSelected]}
                        onPress={() => handleSettingChange('lang', l)}
                    >
                        <Text style={[styles.langButtonText, lang === l && styles.langButtonTextSelected]}>
                            {l === 'mr-IN' ? 'मराठी' : l === 'hi-IN' ? 'हिंदी' : 'English'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            <Text style={styles.settingLabel}>आवाजाचा प्रकार: {pitch.toFixed(1)}</Text>
            <View style={styles.controlRow}>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('pitch', pitch - 0.1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
                <Text style={styles.valueText}>मऊ ╾───╼ कडक</Text>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('pitch', pitch + 0.1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
            </View>
            <Text style={styles.settingLabel}>बोलण्याचा वेग: {rate.toFixed(1)}</Text>
            <View style={styles.controlRow}>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('rate', rate - 0.1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
                <Text style={styles.valueText}>हळू ╾───╼ जलद</Text>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('rate', rate + 0.1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
            </View>

            <View style={styles.divider} />

            {/* Note Settings */}
            <Text style={styles.sectionTitle}>नोट्स (Notes)</Text>
             <Text style={styles.settingLabel}>अक्षरांचा आकार: {fontSize}</Text>
            <View style={styles.controlRow}>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('font', fontSize - 1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
                <Text style={styles.valueText}>लहान ╾───╼ मोठे</Text>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('font', fontSize + 1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
            </View>
             <Text style={styles.settingLabel}>आयकॉनचा आकार: {iconSize}</Text>
            <View style={styles.controlRow}>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('icon', iconSize - 1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
                <Text style={styles.valueText}>लहान ╾───╼ मोठे</Text>
                <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('icon', iconSize + 1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
            </View>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.testButton} onPress={testVoice}><Text style={styles.testButtonText}>आवाज तपासा</Text></TouchableOpacity>
            <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}><Text style={styles.resetButtonText}>मूळ सेटिंग्जवर परत जा</Text></TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>बंद करा</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#007AFF', alignSelf: 'flex-start', marginTop: 10, marginBottom: 10 },
    settingLabel: { fontSize: 16, color: '#444', marginTop: 10, marginBottom: 5, fontWeight: '500' },
    langContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 10 },
    langButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20, backgroundColor: '#f0f0f0'},
    langButtonSelected: { backgroundColor: '#007AFF' },
    langButtonText: { color: '#333', fontSize: 14 },
    langButtonTextSelected: { color: 'white', fontWeight: 'bold' },
    controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10, backgroundColor: '#f7f7f7', padding: 8, borderRadius: 10 },
    button: { backgroundColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 8 },
    buttonText: { fontSize: 18, fontWeight: 'bold', color: '#555' },
    valueText: { fontSize: 14, color: '#666', flex: 1, textAlign: 'center', fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 20 },
    testButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 30, marginBottom: 15 },
    testButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    resetButton: { marginBottom: 15 },
    resetButtonText: { color: '#007AFF', fontSize: 15 },
    closeButton: { marginTop: 5 },
    closeButtonText: { color: '#d9534f', fontSize: 16, fontWeight: 'bold' },
});

export default VoiceSettings;
