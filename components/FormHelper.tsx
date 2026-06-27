
import React, { useState } from 'react';
import { View, Modal, TextInput, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';

interface FormHelperProps {
  visible: boolean;
  onClose: () => void;
  onSave: (text: string) => void;
}

const FormHelper: React.FC<FormHelperProps> = ({ visible, onClose, onSave }) => {
  const [text, setText] = useState('');

  const handleSave = () => {
    onSave(text);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>💡 गाईड मोड 💡</Text>
          <Text style={styles.subtitle}>तुम्हाला हवी असलेली माहिती (उदा. फॉर्म भरण्याच्या पायऱ्या) इथे पेस्ट करा. मी ही माहिती लक्षात ठेवेन आणि तुम्ही विचारेल तेव्हा तुम्हाला मदत करेन.</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={15}
            maxLength={10000}
            placeholder="इथे माहिती पेस्ट करा..."
            placeholderTextColor="#999"
            value={text}
            onChangeText={setText}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
              <Text style={styles.buttonText}>माहिती सेव्ह करा</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
              <Text style={styles.buttonText}>बंद करा</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#2c2c2e',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  textInput: {
    width: '100%',
    height: 300,
    backgroundColor: '#3a3a3c',
    borderRadius: 10,
    padding: 15,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#fff',
    borderWidth: 1,
    borderColor: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    elevation: 2,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  closeButton: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default FormHelper;
