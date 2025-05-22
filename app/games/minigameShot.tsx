import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Animated, Button, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const CROSSHAIR_SIZE = 50;
const TARGET_RADIUS = 5;
const HIT_TOLERANCE = 20;

const SCALE_FACTOR_X = width * 3; 
const SCALE_FACTOR_Y = height * 3; 

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [position, setPosition] = useState(
    new Animated.ValueXY({ x: width / 2 - CROSSHAIR_SIZE / 2, y: height / 2 - CROSSHAIR_SIZE / 2 })
  );
  const [targetReached, setTargetReached] = useState(false);
  const [targetPosition, setTargetPosition] = useState(getRandomTargetPosition());

  useEffect(() => {
    Accelerometer.setUpdateInterval(16);

    const subscription = Accelerometer.addListener(({ x, y }) => {
      const deltaX = x;
      const deltaY = y;

      const rawX = width / 2 + deltaX * SCALE_FACTOR_X;
      const rawY = height / 2 + deltaY * SCALE_FACTOR_Y;

      const newX = clamp(rawX - CROSSHAIR_SIZE / 2, 0, width - CROSSHAIR_SIZE);
      const newY = clamp(rawY - CROSSHAIR_SIZE / 2, 0, height - CROSSHAIR_SIZE);

      Animated.timing(position, {
        toValue: { x: newX, y: newY },
        useNativeDriver: false,
        duration: 100,
      }).start();

      const centerX = newX + CROSSHAIR_SIZE / 2;
      const centerY = newY + CROSSHAIR_SIZE / 2;

      const dx = centerX - (targetPosition.x + TARGET_RADIUS);
      const dy = centerY - (targetPosition.y + TARGET_RADIUS);
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (!targetReached && distance < HIT_TOLERANCE) {
        setTargetReached(true);
      }
    });


    return () => subscription && subscription.remove();
  }, [targetPosition, targetReached]);

  useEffect(() => {
    if (targetReached) {
      const timeout = setTimeout(() => {
        setTargetReached(false);
        setTargetPosition(getRandomTargetPosition());
      }, 500);

      return () => clearTimeout(timeout);
    }
  }, [targetReached]);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} />

      {/* Target rosso */}
      {!targetReached && (
        <View
          style={[
            styles.fixedPoint,
            {
              top: targetPosition.y,
              left: targetPosition.x,
            },
          ]}
        />
      )}

      {/* Mirino */}
      <Animated.View
        style={[
          styles.crosshair,
          position.getLayout(),
          { borderColor: targetReached ? 'lime' : 'white' },
        ]}
      />
    </View>
  );
}

function getRandomTargetPosition() {
  const margin = CROSSHAIR_SIZE / 2 + TARGET_RADIUS + HIT_TOLERANCE;
  const x = clamp(Math.random() * width, margin, width - margin);
  const y = clamp(Math.random() * height, margin, height - margin);
  return { x, y };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  fixedPoint: {
    position: 'absolute',
    width: TARGET_RADIUS * 2,
    height: TARGET_RADIUS * 2,
    borderRadius: TARGET_RADIUS,
    backgroundColor: 'red',
    zIndex: 5,
  },
  crosshair: {
    position: 'absolute',
    width: CROSSHAIR_SIZE,
    height: CROSSHAIR_SIZE,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: CROSSHAIR_SIZE / 2,
    zIndex: 10,
  },
});
