import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

export default function ColorReactionGame() {
  const screenWidth = Dimensions.get('window').width;

  const [timer, setTimer] = useState(20);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [reactionStart, setReactionStart] = useState<number | null>(null);
  const [_, setForceUpdate] = useState(0);
  const resultsRef = useRef<{ time: number; correct: boolean }[]>([]);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const colorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    startTimer();
    scheduleNextColor();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);
    };
  }, []);

  const startTimer = () => {
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          clearTimeout(colorTimeoutRef.current!);
          handleEndGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const scheduleNextColor = () => {
    const delay = Math.floor(Math.random() * 4000) + 1000; // 1–4 sec
    colorTimeoutRef.current = setTimeout(() => {
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setActiveColor(newColor);
      setReactionStart(Date.now());
    }, delay);
  };

    // Non funziona la vibrazione quando si preme il bottone :(
  const handlePress = (color: string) => {
    // Vibrazione compatibile
    if (Platform.OS === 'android') {
      Vibration.vibrate(100);
    } else {
      Vibration.vibrate(); // iOS vibra solo con questa chiamata base
    }
  
    if (!activeColor || !reactionStart) return;
  
    const time = Date.now() - reactionStart;
    const correct = color === activeColor;
  
    resultsRef.current.push({ time, correct });
    setActiveColor(null);
    setReactionStart(null);
  
    if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);
    colorTimeoutRef.current = setTimeout(scheduleNextColor, 500);
  };
  
  
  
  

  const handleEndGame = () => {
    if (activeColor && reactionStart) {
      resultsRef.current.push({
        time: Date.now() - reactionStart,
        correct: false,
      });
    }

    const allResults = resultsRef.current;
    const correct = allResults.filter((r) => r.correct).length;
    const wrong = allResults.filter((r) => !r.correct).length;
    const avgTime = allResults.length
      ? (allResults.reduce((acc, cur) => acc + cur.time, 0) / allResults.length).toFixed(0)
      : 0;

    Alert.alert(
      'Gioco terminato!',
      `🎯 Tentativi: ${allResults.length}\n✅ Corrette: ${correct}\n❌ Sbagliate: ${wrong}\n⏱ Tempo medio: ${avgTime} ms`
    );

    setActiveColor(null);
    setReactionStart(null);
    resultsRef.current = [];
    setForceUpdate((n) => n + 1);
  };

  const restartGame = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);

    resultsRef.current = [];
    setTimer(20);
    setActiveColor(null);
    setReactionStart(null);
    setForceUpdate((n) => n + 1);

    startTimer();
    scheduleNextColor();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
        <Text style={styles.restartText}>🔄</Text>
      </TouchableOpacity>

      <Text style={styles.timer}>{timer}s</Text>

      <View
        style={[
          styles.colorBox,
          {
            backgroundColor: activeColor || '#999',
            borderWidth: activeColor ? 4 : 0,
            borderColor: 'white',
          },
        ]}
      />

      <View style={styles.buttonContainer}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.button,
              { backgroundColor: color },
            ]}
            onPress={() => handlePress(color)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  timer: {
    fontSize: 48,
    color: 'white',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  colorBox: {
    width: '80%',
    height: 160,
    borderRadius: 12,
    marginBottom: 40,
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: '3%',
    marginTop: 20,
  },
  button: {
    height: 100,
    width: '48%',
    borderRadius: 20,
    marginBottom: 16,
  },
  restartButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: '#333',
    borderRadius: 8,
  },
  restartText: {
    fontSize: 24,
    color: 'white',
  },
});
