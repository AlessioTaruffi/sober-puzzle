import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { gamesList } from "./gamesList";

import { useGameScore } from "./GameScoreContext";

import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  TouchableOpacity,
  Vibration
} from 'react-native';

const COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];


export default function minigame1() {

  const addResult = useGameScore();

  const screenWidth = Dimensions.get('window').width;
  const shakeAnim = useRef(new Animated.Value(0)).current; //animazione per shake

  //funzione che gestisce l'animazione di shake
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: -1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnim, {
        toValue: 0,
        duration: 100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  };


  
  const [timer, setTimer] = useState(20);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [reactionStart, setReactionStart] = useState<number | null>(null);
  const [_, setForceUpdate] = useState(0);
  const resultsRef = useRef<{ time: number; correct: boolean }[]>([]);
  const [showEndScreen, setShowEndScreen] = useState(false);


  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const colorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    const delay = Math.floor(Math.random() * 1000) + 500; // Ritardo tra 1 e 1.5 secondi tra i colori. A STECCA SEEE
    colorTimeoutRef.current = setTimeout(() => {
      const newColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      setActiveColor(newColor);
      setReactionStart(Date.now());
    }, delay);
  };

  const handlePress = (color: string) => {
  
    if (!activeColor || !reactionStart) return;
  
    const time = Date.now() - reactionStart;
    const correct = color === activeColor;


    if (!correct){
      triggerShake(); //attiva animazione di shake se la risposta è sbagliata
      Vibration.vibrate(500); 
    } else {
      Vibration.vibrate(50);
    }
  
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

    //aggiunge il risultato al contesto per passarlo alla schermata finale
    const result = {
      name: 'Minigame 1',
      attempts: allResults.length,
      correct,
      wrong,
      avgTime: Number(avgTime),
    }
    addResult.addResult('minigame1', result);

    // Puoi rimuovere l'Alert se vuoi solo la schermata finale
    Alert.alert(
      'Gioco terminato!',
      `🎯 Tentativi: ${allResults.length}\n✅ Corrette: ${correct}\n❌ Sbagliate: ${wrong}\n⏱ Tempo medio: ${avgTime} ms`
    );

    setActiveColor(null);
    setReactionStart(null);
    resultsRef.current = [];
    setForceUpdate((n) => n + 1);
    setShowEndScreen(true); // MOSTRA la schermata di fine gioco
  };

  
    const restartGame = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (colorTimeoutRef.current) clearTimeout(colorTimeoutRef.current);
  
      resultsRef.current = [];
      setTimer(20);
      setActiveColor(null);
      setReactionStart(null);
      setForceUpdate((n) => n + 1);
      setShowEndScreen(false);
      startTimer();
      scheduleNextColor();
    };

    const router = useRouter();
    const currentGame = "/games/minigame1";
    const currentIndex = gamesList.indexOf(currentGame);
    const nextGame = gamesList[currentIndex + 1] 

    if (showEndScreen) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>🎮 Gioco Terminato!</Text>

          <TouchableOpacity style={styles.button} onPress={restartGame}>
            <Text style={styles.restartText}>🔁 Rigioca</Text>
          </TouchableOpacity>

          {nextGame ? (
            <TouchableOpacity
              style={[styles.button, { marginTop: 20 }]}
              onPress={() => {
                setShowEndScreen(false);
                router.push(nextGame as any);
              }}
            >
              <Text style={styles.restartText}>➡️ Prossimo Gioco</Text>
            </TouchableOpacity>
          ) : (
            <Text style={{ color: "white", marginTop: 20 }}>
              Hai completato tutti i giochi!
            </Text>
          )}
        </View>
      );
  }

  
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.restartText}>🔄</Text>
        </TouchableOpacity>
  
        <Text style={styles.timer}>{timer}s</Text>
  
        <Animated.View
          style={[
            styles.colorBox,
            {
              backgroundColor: activeColor || '#999',
              borderWidth: activeColor ? 4 : 0,
              borderColor: 'white',
              transform: [
                {
                  translateX: shakeAnim.interpolate({
                    inputRange: [-1, 1],
                    outputRange: [-10, 10], // quanto "oscilla"
                  }),
                },
              ],
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

  title: { fontSize: 22, marginBottom: 10 },
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
