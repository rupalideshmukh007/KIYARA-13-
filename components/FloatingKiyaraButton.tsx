
import React from 'react';
import { Image, TouchableOpacity, PanResponder, Animated } from 'react-native';
import { useRouter } from 'expo-router';

const FloatingKiyaraButton = () => {
  const router = useRouter();
  const pan = React.useRef(new Animated.ValueXY()).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: pan.x._value,
          y: pan.y._value,
        });
      },
      onPanResponderMove: Animated.event(
        [
          null,
          { dx: pan.x, dy: pan.y },
        ],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  const handlePress = () => {
    router.push('/chat'); // Navigate to chat screen
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateX: pan.x }, { translateY: pan.y }],
        position: 'absolute',
        bottom: 50,
        right: 20,
        zIndex: 1000,
      }}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity onPress={handlePress}>
        <Image
          source={require('../assets/icone.png')}
          style={{ width: 60, height: 60, borderRadius: 30 }}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default FloatingKiyaraButton;
