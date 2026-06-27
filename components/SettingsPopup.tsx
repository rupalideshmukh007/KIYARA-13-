
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';

interface SettingsPopupProps {
  visible: boolean;
  onClose: () => void;
  settingName: string;
  settingIntent: string;
}

const SettingsPopup: React.FC<SettingsPopupProps> = ({ visible, onClose, settingName, settingIntent }) => {

  const handleOpenSettings = () => {
    if (Platform.OS === 'android') {
        Linking.sendIntent(settingIntent).catch(() => {
            Linking.openSettings(); // Fallback
        });
    } else {
      Linking.openURL('app-settings:'); // For iOS
    }
    onClose();
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
            <Text style={styles.butterfly}>🦋</Text>
            <Text style={styles.modalText}>तुम्ही मला '{settingName}' सेटिंग्ज उघडायला सांगितले आहे.</Text>

            <TouchableOpacity style={styles.chocolateButton} onPress={handleOpenSettings}>
                <Text style={styles.buttonText}>🍫</Text>
            </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent background
  },
  modalView: {
    margin: 20,
    width: '80%',
    backgroundColor: '#87CEEB', // Sky blue background
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  butterfly: {
    position: 'absolute',
    top: -20,
    right: -15,
    fontSize: 40,
    transform: [{ rotate: '20deg' }],
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '500',
    color: '#002233'
  },
  chocolateButton: {
    backgroundColor: '#D2691E', // Chocolate color
    borderRadius: 15,
    padding: 10,
    elevation: 2,
    width: 80,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonText: {
    fontSize: 30,
  },
});

export default SettingsPopup;
