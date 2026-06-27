
import React, { useState, useEffect } from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingBuddyService from '../services/FloatingBuddyService';

interface FloatingBuddySettingsProps {
  visible: boolean;
  onClose: () => void;
}

const FLOATING_BUDDY_ENABLED_KEY = 'floating_buddy_enabled';

const FloatingBuddySettings: React.FC<FloatingBuddySettingsProps> = ({ visible, onClose }) => {
  const [isEnabled, setIsEnabled] = useState(false);

  // Load the saved setting when the component mounts
  useEffect(() => {
    const loadState = async () => {
      const savedState = await AsyncStorage.getItem(FLOATING_BUDDY_ENABLED_KEY);
      const active = savedState === 'true';
      setIsEnabled(active);
    };
    if (visible) {
      loadState();
    }
  }, [visible]);

  const toggleSwitch = async (value: boolean) => {
    setIsEnabled(value);
    await AsyncStorage.setItem(FLOATING_BUDDY_ENABLED_KEY, JSON.stringify(value));

    if (value) {
      // If enabled, start the service
      FloatingBuddyService.start();
    } else {
      // If disabled, stop the service
      FloatingBuddyService.stop();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>फ्लोटिंग बडी सेटिंग्ज</Text>
          
          <View style={styles.settingRow}>
            <Text style={styles.settingText}>फ्लोटिंग बडी चालू करा</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
          </View>
          
          <Text style={styles.descriptionText}>
            हे चालू केल्यावर, 'बडी'चा एक छोटा आयकॉन (®) तुमच्या स्क्रीनवर नेहमी दिसेल. तुम्ही कोणत्याही ॲपवरून त्याला चालू करू शकाल.
          </Text>

          <View style={styles.divider} />

          <Text style={styles.subTitle}>ॲनिमेशन/व्हिडिओ</Text>
          <Text style={styles.descriptionText}>
            भविष्यात तुम्ही येथून 'फ्लोटिंग बडी'साठी तुमचे आवडते ॲनिमेशन किंवा छोटा व्हिडिओ निवडू शकाल.
          </Text>
          <View style={styles.animationPlaceholder}>
            <Text style={styles.placeholderText}>तुमचे ॲनिमेशन येथे दिसेल</Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>बंद करा</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 25, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5, width: '90%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 10 },
  settingText: { fontSize: 18, color: '#444' },
  descriptionText: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20, width: '100%' },
  divider: { height: 1, backgroundColor: '#eee', width: '100%', marginVertical: 20 },
  subTitle: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 10 },
  animationPlaceholder: { width: '100%', height: 100, backgroundColor: '#f0f0f0', borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 2, borderColor: '#ddd', borderStyle: 'dashed' },
  placeholderText: { color: '#aaa', fontSize: 14 },
  closeButton: { marginTop: 10 },
  closeButtonText: { color: '#333', fontSize: 16, fontWeight: 'bold' },
});

export default FloatingBuddySettings;
