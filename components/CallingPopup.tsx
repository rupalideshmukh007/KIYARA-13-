
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
} from 'react-native';

interface CallingPopupProps {
  visible: boolean;
  contactName: string | null;
}

const { width, height } = Dimensions.get('window');

const CallingPopup: React.FC<CallingPopupProps> = ({ visible, contactName }) => {

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
    >
      <View style={styles.centeredView}>
        <Text style={styles.contactText}>मी {contactName} यांना कॉल करत आहे...</Text>
        
        <View style={styles.animationPlaceholder}>
            <Text style={styles.placeholderText}>येथे तुमचे 'कॉलिंग' ॲनिमेशन दिसेल</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darker, semi-transparent background
    padding: 20,
  },
  animationPlaceholder: {
      width: width * 0.8,
      height: height * 0.5,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: '#a78bfa',
      borderStyle: 'dashed',
  },
  placeholderText: {
      color: '#fff',
      fontSize: 16,
  },
  contactText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
      marginBottom: 30,
      textAlign: 'center',
  },
});

export default CallingPopup;
