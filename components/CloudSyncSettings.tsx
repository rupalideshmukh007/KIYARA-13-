
import React from 'react';
import { View, Modal, StyleSheet, Text, TouchableOpacity, SafeAreaView } from 'react-native';

interface CloudSyncSettingsProps {
  visible: boolean;
  onClose: () => void;
}

const CloudSyncSettings: React.FC<CloudSyncSettingsProps> = ({ visible, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>क्लाउड सिंक सेटिंग्ज</Text>
          
          <Text style={styles.modalText}>
            तुमची थीम आणि सेटिंग्स दुसऱ्या डिव्हाइसवर सिंक करण्यासाठी तुमच्या गूगल अकाउंटने लॉगिन करा.
          </Text>

          <TouchableOpacity style={styles.button} onPress={() => console.log('Login with Google pressed')}>
            <Text style={styles.buttonText}>🔒 Google ने लॉगिन करा</Text>
          </TouchableOpacity>

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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
    backgroundColor: '#4285F4', // Google Blue
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold
',    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
  },
});

export default CloudSyncSettings;
