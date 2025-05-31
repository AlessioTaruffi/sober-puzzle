import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Accelerometer } from 'expo-sensors';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  Vibration,
  View
} from 'react-native';
import { gamesList } from './gamesList';

export default function App() {

  const router = useRouter();
  const currentGame = "/games/minigameLight";
  const currentIndex = gamesList.indexOf(currentGame);
  const nextGame = gamesList[currentIndex + 1] 

  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [timer, setTimer] = useState(20);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const torchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const torchStartTime = useRef<number | null>(null);
  const reactionTimes = useRef<number[]>([]);
  const [subscription, setSubscription] = useState<any>(null);

  const torchEnabledRef = useRef(false); // NEW

  useEffect(() => {
    torchEnabledRef.current = torchEnabled;
  }, [torchEnabled]);

  // Timer principale
  useEffect(() => {
    if (!permission?.granted) return;
    startTimer();
    setupShakeDetection();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (torchTimeout.current) clearTimeout(torchTimeout.current);
      subscription?.remove();
    };
  }, [permission]);

  const startTimer = () => {
    setTimer(20);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          handleEndTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    triggerTorchRandomly();
  };

  const triggerTorchRandomly = () => {
    const delay = Math.random() * 5000;
    torchTimeout.current = setTimeout(() => {
      torchStartTime.current = Date.now();
      Vibration.vibrate(100);
      setTorchEnabled(true);
    }, delay);
  };

  const setupShakeDetection = () => {
    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(accelerometerData => {
      const { x, y, z } = accelerometerData;
      const total = Math.abs(x) + Math.abs(y) + Math.abs(z);
      if (total > 2 && torchEnabledRef.current) {
        handleShakeDetected();
      }
    });
    setSubscription(sub);
  };

  const handleShakeDetected = () => {
    setTorchEnabled(false);
    torchEnabledRef.current = false;

    if (torchStartTime.current) {
      const reaction = Date.now() - torchStartTime.current;
      reactionTimes.current.push(reaction);
      torchStartTime.current = null;
      triggerTorchRandomly();
    }
  };

  const handleEndTimer = () => {
  if (torchTimeout.current) {
    clearTimeout(torchTimeout.current); // ✅ Cancella eventuale attivazione futura
    torchTimeout.current = null;
  }

  setTorchEnabled(false);
  torchEnabledRef.current = false;

  subscription?.remove();

  const media = reactionTimes.current.length
    ? (reactionTimes.current.reduce((a, b) => a + b) / reactionTimes.current.length).toFixed(0)
    : 'N/A';

  Alert.alert(
    '⏰ Tempo scaduto!',
    `Media tempi di reazione: ${media === 'N/A' ? media : media + ' ms'}`,
    [
      {
        text: 'Prossimo gioco',
        onPress: () => router.push(nextGame as any),
        style: 'default',
      },
    ]
  );
  };


  const toggleTorch = () => {
    setTorchEnabled(prev => {
      const newValue = !prev;
      torchEnabledRef.current = newValue;
      return newValue;
    });
  };

  const restartTimer = () => {
    reactionTimes.current = [];
    startTimer();
  };

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
      <CameraView
        style={{ width: 0, height: 0, opacity: 0 }}
        facing={facing}
        enableTorch={torchEnabled}
      />
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{timer}s</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  timerContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  timer: {
    fontSize: 55,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 10,
    width: '70%',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
});
