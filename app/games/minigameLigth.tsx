import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Alert,
} from 'react-native';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [timer, setTimer] = useState(20);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!permission?.granted) return;

    startTimer();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [permission]);

  const startTimer = () => {
    setTimer(20); // reset timer
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
  };

  const handleEndTimer = () => {
    Alert.alert('⏰ Tempo scaduto!', 'Il conto alla rovescia è terminato.');
    setTorchEnabled(false);
  };

  const toggleTorch = () => {
    setTorchEnabled(prev => !prev);
  };

  const restartTimer = () => {
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
      {/* Fotocamera nascosta */}
      <CameraView
        style={{ width: 0, height: 0, opacity: 0 }}
        facing={facing}
        enableTorch={torchEnabled}
      />

      {/* Timer visibile */}
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{timer}s</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={toggleTorch}>
          <Text style={styles.text}>{torchEnabled ? 'Turn Flash Off' : 'Turn Flash On'}</Text>
        </TouchableOpacity>

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
