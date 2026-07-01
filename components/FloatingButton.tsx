
import React, { useRef } from 'react';
import { StyleSheet, Animated, PanResponder, TouchableOpacity, Text } from 'react-native';

interface FloatingButtonProps {
  onPress: () => void;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({ onPress }) => {
  const pan = useRef(new Animated.ValueXY()).current;
  const moveDistance = useRef(0).current;

  const panResponder = useRef(
    PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: () => {
            moveDistance = 0;
            pan.setOffset({ x: pan.x._value, y: pan.y._value });
            pan.setValue({ x: 0, y: 0 });
        },
        onPanResponderMove: (evt, gestureState) => {
            moveDistance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
            return Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
        },
        onPanResponderRelease: () => {
            pan.flattenOffset();
            if (moveDistance < 10) { // Treat as a tap if moved less than 10px
                 onPress();
            }
        },
    })
).current;


  return (
    <Animated.View
      style={{
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        ...styles.container,
      }}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity style={styles.button} activeOpacity={0.8}>
        <Text style={styles.icon}>🍫</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%', 
    left: '80%',
    zIndex: 1000,
  },
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(90, 50, 20, 0.7)', // Brownish transparent background
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  icon: {
    fontSize: 30,
  },
});

export default FloatingButton;
