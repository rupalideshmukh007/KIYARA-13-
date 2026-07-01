
import React from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ThemeSettingsProps {
  visible: boolean;
  onClose: () => void;
  onSetTheme: (themeUri: string | null) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ visible, onClose, onSetTheme }) => {

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('गॅलरी ॲक्सेस करण्यासाठी परवानगी आवश्यक आहे!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      onSetTheme(result.assets[0].uri);
      onClose();
    }
  };

  const setDefault = () => {
      onSetTheme(null); // null signifies the default theme
      onClose();
  }

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.centeredView} activeOpacity={1} onPressOut={onClose}>
        <View style={styles.modalView} onStartShouldSetResponder={() => true}>
          <Text style={styles.modalTitle}>थीम बदला</Text>

          <TouchableOpacity style={styles.optionButton} onPress={setDefault}>
            <Text style={styles.optionButtonText}>डीफॉल्ट थीम</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionButton} onPress={pickImage}>
            <Text style={styles.optionButtonText}>गॅलरीमधून निवडा</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>बंद करा</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
    centeredView: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    optionButton: { backgroundColor: '#f2f2f2', borderRadius: 10, paddingVertical: 15, paddingHorizontal: 20, width: '100%', alignItems: 'center', marginBottom: 12 },
    optionButtonText: { fontSize: 16, color: '#007AFF', fontWeight: '600' },
    closeButton: { marginTop: 20, },
    closeButtonText: { color: '#d9534f', fontSize: 17, fontWeight: '500' },
});

export default ThemeSettings;
