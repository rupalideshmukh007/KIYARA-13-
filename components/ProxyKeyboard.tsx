
import React from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

interface ProxyKeyboardProps {
  visible: boolean;
  content: string;
  onDone: () => void; // Callback to close the modal and speak
}

const ProxyKeyboard: React.FC<ProxyKeyboardProps> = ({ visible, content, onDone }) => {

  const handleCopyAndClose = async () => {
    if (content) {
      await Clipboard.setStringAsync(content);
    }
    onDone();
  };

  return (
    <Modal visible={visible} onRequestClose={onDone} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>कियाराने तयार केलेला मेसेज</Text>
          <Text style={styles.description}>
            खालील मेसेज तुमच्यासाठी तयार आहे. 'कॉपी करा' बटण दाबल्यावर, हा मेसेज कॉपी होईल आणि तुम्ही कोणत्याही ॲपमध्ये पेस्ट करू शकाल.
          </Text>
          <TextInput
            style={styles.textInput}
            value={content}
            editable={false} // User should not edit this
            multiline
          />
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyAndClose}>
            <Text style={styles.buttonText}>कॉपी करा आणि तयार व्हा</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    modalContent: {
        width: '90%',
        backgroundColor: '#2d2d3a',
        borderRadius: 15,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#82aaff'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#c3e88d',
        marginBottom: 10,
    },
    description: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 20,
    },
    textInput: {
        width: '100%',
        backgroundColor: '#1a1a1d',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        color: '#fff',
        marginBottom: 20,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    copyButton: {
        backgroundColor: '#c3e88d',
        padding: 15,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#1a1a1d',
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default ProxyKeyboard;
