import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef, useState } from 'react';
import { Animated, Button, Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

// APPOGGIO PER IL CODICE MEZZO FUNZIONANTE

// IL MIRINO NON RIESCE AD ANDARE SOTTO AL CENTRO INIZIALE 
// VORREI PIU' UNA COSA COME VR CHE COM'E' ORA
const GAME_AREA_HEIGHT = height * 0.9;
const CROSSHAIR_SIZE = 50;
const TARGET_RADIUS = 5;
const HIT_TOLERANCE = 20;
const BOTTOM_MARGIN = 20;

const SCALE_FACTOR_X = width * 3;
const SCALE_FACTOR_Y = GAME_AREA_HEIGHT * 3;

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [position, setPosition] = useState(
    new Animated.ValueXY({ x: width / 2 - CROSSHAIR_SIZE / 2, y: GAME_AREA_HEIGHT / 2 - CROSSHAIR_SIZE / 2 })
  );
  const [targetReached, setTargetReached] = useState(false);
  const [targetPosition, setTargetPosition] = useState(getRandomTargetPosition());

  const initialTilt = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

  useEffect(() => {
    Accelerometer.setUpdateInterval(16);

const subscription = Accelerometer.addListener(({ x, y }) => {
  if (initialTilt.current.x === null || initialTilt.current.y === null) {
    initialTilt.current = { x, y };
  }

  const offsetX = x - (initialTilt.current.x ?? 0);
  const offsetY = y - (initialTilt.current.y ?? 0);

  const rawX = width / 2 + offsetX * SCALE_FACTOR_X - CROSSHAIR_SIZE / 2;
  const rawY = GAME_AREA_HEIGHT / 2 + offsetY * SCALE_FACTOR_Y - CROSSHAIR_SIZE / 2;

  const newX = clamp(rawX, 0, width - CROSSHAIR_SIZE);
  const newY = clamp(rawY, 0, GAME_AREA_HEIGHT - CROSSHAIR_SIZE); // <-- aggiornato qui

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

      <View style={styles.gameArea}>
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

        <Animated.View
          style={[
            styles.crosshair,
            position.getLayout(),
            { borderColor: targetReached ? 'lime' : 'white' },
          ]}
        />
      </View>
    </View>
  );
}

function getRandomTargetPosition() {
  const margin = CROSSHAIR_SIZE / 2 + TARGET_RADIUS + HIT_TOLERANCE;
  const bottomMargin = BOTTOM_MARGIN;
  const x = clamp(Math.random() * width, margin, width - margin);
  const y = clamp(Math.random() * GAME_AREA_HEIGHT, margin, GAME_AREA_HEIGHT - margin - bottomMargin);
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
  gameArea: {
    position: 'absolute',
    top: 0,
    width: width,
    height: GAME_AREA_HEIGHT,
    zIndex: 10,
    bottom:
    0,
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
