
import React from 'react';
import { Modal, View, StyleSheet, Text, ActivityIndicator } from 'react-native';

interface TypingAnimationProps {
  visible: boolean;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ visible }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.container}>
        <View style={styles.animationBox}>
          {/* User can add their Video/Animation component here */}
          <Text style={styles.placeholderText}>तुमचे ॲनिमेशन/व्हिडिओ येथे टाका</Text>
          <View style={styles.typingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.typingText}>कियारा टाईप करत आहे...</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  animationBox: {
    width: '100%',
    height: 280, // Approximate keyboard height
    backgroundColor: 'rgba(0,0,0,0.6)', // Transparent dark background
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 40,
  },
  typingContainer: {
    position: 'absolute',
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  typingText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  }
});

export default TypingAnimation;
