
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface ThemeSettingsProps {
  visible: boolean;
  onClose: () => void;
  onThemeChange: (theme: 'light' | 'dark' | 'custom') => void;
  onCustomImageSelect: (uri: string) => void;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({ visible, onClose, onThemeChange, onCustomImageSelect }) => {

  const handlePickImage = async () => {
    // Ask for permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [9, 16],
      quality: 1,
    });

    if (!result.canceled) {
        onCustomImageSelect(result.assets[0].uri);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.title}>🎨 स्टायलिश सेटिंग्ज 🎨</Text>

          <TouchableOpacity style={styles.button} onPress={() => onThemeChange('dark')}>
            <Text style={styles.buttonText}>⬛ डार्क मोड</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => onThemeChange('light')}>
            <Text style={styles.buttonText}>⬜ लाईट मोड</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handlePickImage}>
            <Text style={styles.buttonText}>🖼️ गॅलरीतून फोटो</Text>
          </TouchableOpacity>
          
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
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    backgroundColor: '#1e1e2f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  button: {
    width: '90%',
    backgroundColor: '#a78bfa',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  animationPlaceholder: {
      width: '90%',
      height: 100,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#a78bfa',
      borderStyle: 'dashed',
      marginTop: 15,
      marginBottom: 15,
  },
  placeholderText: {
      color: '#fff',
      fontSize: 12,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: '#ff6347',
    borderRadius: 10,
    padding: 12,
    width: '90%',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default ThemeSettings;
