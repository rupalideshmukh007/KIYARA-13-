
import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

export const VOICE_PITCH_KEY = 'voice_pitch';
export const VOICE_RATE_KEY = 'voice_rate';
export const VOICE_LANG_KEY = 'voice_lang';

const DEFAULT_PITCH = 1.4;
const DEFAULT_RATE = 0.9;
const DEFAULT_LANG = 'mr-IN';

interface VoiceSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ visible, onClose }) => {
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [lang, setLang] = useState(DEFAULT_LANG);

  useEffect(() => {
    if (visible) {
      const loadSettings = async () => {
        const savedPitch = await AsyncStorage.getItem(VOICE_PITCH_KEY);
        const savedRate = await AsyncStorage.getItem(VOICE_RATE_KEY);
        const savedLang = await AsyncStorage.getItem(VOICE_LANG_KEY);
        setPitch(savedPitch ? parseFloat(savedPitch) : DEFAULT_PITCH);
        setRate(savedRate ? parseFloat(savedRate) : DEFAULT_RATE);
        setLang(savedLang || DEFAULT_LANG);
      };
      loadSettings();
    }
  }, [visible]);

  const handleSettingChange = async (type: 'pitch' | 'rate' | 'lang', value: number | string) => {
    if (type === 'pitch') {
      const finalValue = Math.max(0.5, Math.min(2.0, value as number));
      setPitch(finalValue);
      await AsyncStorage.setItem(VOICE_PITCH_KEY, finalValue.toString());
    } else if (type === 'rate') {
      const finalValue = Math.max(0.5, Math.min(2.0, value as number));
      setRate(finalValue);
      await AsyncStorage.setItem(VOICE_RATE_KEY, finalValue.toString());
    } else if (type === 'lang') {
        const finalValue = value as string;
        setLang(finalValue);
        await AsyncStorage.setItem(VOICE_LANG_KEY, finalValue);
    }
    DeviceEventEmitter.emit('voiceSettingsChanged');
  };

  const testVoice = () => {
    let testText = "नमस्कार, हा माझा आवाज आहे.";
    if (lang === 'hi-IN') testText = "नमस्ते, यह मेरी आवाज़ है।";
    if (lang === 'en-IN') testText = "Hello, this is my voice.";

    Speech.speak(testText, {
      language: lang,
      pitch: pitch,
      rate: rate,
    });
  };

  const resetToDefaults = () => {
      handleSettingChange('pitch', DEFAULT_PITCH);
      handleSettingChange('rate', DEFAULT_RATE);
      handleSettingChange('lang', DEFAULT_LANG);
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>सेटिंग्ज</Text>

          <Text style={styles.settingLabel}>भाषा (Language)</Text>
          <View style={styles.langContainer}>
             <TouchableOpacity
                style={[styles.langButton, lang === 'mr-IN' && styles.langButtonSelected]}
                onPress={() => handleSettingChange('lang', 'mr-IN')}
             >
                <Text style={[styles.langButtonText, lang === 'mr-IN' && styles.langButtonTextSelected]}>मराठी</Text>
             </TouchableOpacity>
             <TouchableOpacity
                style={[styles.langButton, lang === 'hi-IN' && styles.langButtonSelected]}
                onPress={() => handleSettingChange('lang', 'hi-IN')}
             >
                <Text style={[styles.langButtonText, lang === 'hi-IN' && styles.langButtonTextSelected]}>हिंदी</Text>
             </TouchableOpacity>
             <TouchableOpacity
                style={[styles.langButton, lang === 'en-IN' && styles.langButtonSelected]}
                onPress={() => handleSettingChange('lang', 'en-IN')}
             >
                <Text style={[styles.langButtonText, lang === 'en-IN' && styles.langButtonTextSelected]}>English</Text>
             </TouchableOpacity>
          </View>

          <Text style={styles.settingLabel}>आवाजाचा प्रकार: {pitch.toFixed(1)}</Text>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('pitch', pitch - 0.1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
            <Text style={styles.valueText}>मऊ आवाज ╾───╼ कडक आवाज</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('pitch', pitch + 0.1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
          </View>

          <Text style={styles.settingLabel}>बोलण्याचा वेग: {rate.toFixed(1)}</Text>
          <View style={styles.controlRow}>
             <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('rate', rate - 0.1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
             <Text style={styles.valueText}>हळू ╾───╼ जलद</Text>
             <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('rate', rate + 0.1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
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
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    settingLabel: { fontSize: 18, color: '#444', marginTop: 15, marginBottom: 8, fontWeight: '500' },
    langContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 15 },
    langButton: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#f0f0f0'},
    langButtonSelected: { backgroundColor: '#007AFF' },
    langButtonText: { color: '#333', fontSize: 16 },
    langButtonTextSelected: { color: 'white', fontWeight: 'bold' },
    controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10, backgroundColor: '#f7f7f7', padding: 10, borderRadius: 10 },
    button: { backgroundColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10 },
    buttonText: { fontSize: 20, fontWeight: 'bold', color: '#555' },
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
