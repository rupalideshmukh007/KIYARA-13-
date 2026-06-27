
import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';

interface VoiceSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export const VOICE_PITCH_KEY = 'voice_pitch';
export const VOICE_RATE_KEY = 'voice_rate';

// Default to a higher pitch for a female-like voice as requested
const DEFAULT_PITCH = 1.4;
const DEFAULT_RATE = 0.9;

const VoiceSettings: React.FC<VoiceSettingsProps> = ({ visible, onClose }) => {
  const [pitch, setPitch] = useState(DEFAULT_PITCH);
  const [rate, setRate] = useState(DEFAULT_RATE);

  useEffect(() => {
    if (visible) {
      const loadSettings = async () => {
        const savedPitch = await AsyncStorage.getItem(VOICE_PITCH_KEY);
        const savedRate = await AsyncStorage.getItem(VOICE_RATE_KEY);
        setPitch(savedPitch ? parseFloat(savedPitch) : DEFAULT_PITCH);
        setRate(savedRate ? parseFloat(savedRate) : DEFAULT_RATE);
      };
      loadSettings();
    }
  }, [visible]);

  const handleSettingChange = async (type: 'pitch' | 'rate', value: number) => {
    let finalValue;
    if (type === 'pitch') {
      finalValue = Math.max(0.5, Math.min(2.0, value)); // Clamp value
      setPitch(finalValue);
      await AsyncStorage.setItem(VOICE_PITCH_KEY, finalValue.toString());
    } else {
      finalValue = Math.max(0.5, Math.min(2.0, value)); // Clamp value
      setRate(finalValue);
      await AsyncStorage.setItem(VOICE_RATE_KEY, finalValue.toString());
    }
    DeviceEventEmitter.emit('voiceSettingsChanged');
  };

  const testVoice = () => {
    Speech.speak("नमस्कार, मी बडी आहे. हा माझा आवाज आहे.", {
      language: "mr-IN",
      pitch: pitch,
      rate: rate,
    });
  };

  const resetToDefaults = () => {
      handleSettingChange('pitch', DEFAULT_PITCH);
      handleSettingChange('rate', DEFAULT_RATE);
  }

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>व्हॉइस सेटिंग्ज</Text>
          <Text style={styles.descriptionText}>'बडी'चा आवाज आणि बोलण्याचा वेग तुमच्या आवडीनुसार बदला.</Text>

          <Text style={styles.settingLabel}>आवाजाची पट्टी (Pitch): {pitch.toFixed(1)}</Text>
          <View style={styles.controlRow}>
            <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('pitch', pitch - 0.1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
            <Text style={styles.valueText}>जाड आवाज --- मुलीचा आवाज</Text>
            <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('pitch', pitch + 0.1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
          </View>

          <Text style={styles.settingLabel}>बोलण्याचा वेग (Rate): {rate.toFixed(1)}</Text>
          <View style={styles.controlRow}>
             <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('rate', rate - 0.1)}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
             <Text style={styles.valueText}>हळू बोला --- भरभर बोला</Text>
             <TouchableOpacity style={styles.button} onPress={() => handleSettingChange('rate', rate + 0.1)}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.testButton} onPress={testVoice}><Text style={styles.testButtonText}>आवाज तपासा (Test)</Text></TouchableOpacity>
          <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}><Text style={styles.resetButtonText}>डीफॉल्ट सेटिंग (मुलीचा आवाज)</Text></TouchableOpacity>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}><Text style={styles.closeButtonText}>बंद करा</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, color: '#333' },
    descriptionText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 },
    settingLabel: { fontSize: 18, color: '#444', marginTop: 15, marginBottom: 5 },
    controlRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
    button: { backgroundColor: '#f0f0f0', borderRadius: 8, paddingHorizontal: 15, paddingVertical: 10 },
    buttonText: { fontSize: 20, fontWeight: 'bold', color: '#555' },
    valueText: { fontSize: 12, color: '#888', flex: 1, textAlign: 'center' },
    divider: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 20 },
    testButton: { backgroundColor: '#4CAF50', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 20, marginBottom: 10 },
    testButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    resetButton: { marginBottom: 20 },
    resetButtonText: { color: '#007AFF', fontSize: 15 },
    closeButton: { marginTop: 10 },
    closeButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default VoiceSettings;
