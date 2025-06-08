import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";
import { useGameScore } from "./GameScoreContext";
import { gamesList } from "./gamesList";

const gameOverRef = useRef(false);
const CUBE_SIZE = 50;
const BUTTON_SIZE = 120;
const TOP_MARGIN = 100;
const BOTTOM_MARGIN = 60 + BUTTON_SIZE / 2;
const CUBE_VERTICAL_MARGIN = 2;
const GAME_DURATION = 30000; // 30 secondi

const fallSpeed = useRef(2000); // tempo iniziale per rimuovere un cubo (ms)
const lastFallTime = useRef(Date.now());

const router = useRouter();
const currentGame = "/games/minigameTorre";
const currentIndex = gamesList.indexOf(currentGame);
const nextGame = gamesList[currentIndex + 1];

export default function App() {
  const addResult = useGameScore();

  const [stack, setStack] = useState<{ id: number; anim: Animated.Value }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION / 1000);
  const [gameWon, setGameWon] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const safeZoneEntryTime = useRef<number | null>(null);


  const intervalRef = useRef<number | null>(null);
  const fallIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const maxStackLengthReached = useRef(0);
  const fallSpeed = useRef(2000); // tempo iniziale caduta (ms)

  const screenHeight = Dimensions.get("window").height;
  const visibleAreaHeight = screenHeight - TOP_MARGIN - BOTTOM_MARGIN;
  const effectiveCubeHeight = CUBE_SIZE + CUBE_VERTICAL_MARGIN * 2;

  const upperLineProportion = 0.15;
  const lowerLineProportion = 0.5;

  const upperLineY = visibleAreaHeight * upperLineProportion;
  const lowerLineY = visibleAreaHeight * lowerLineProportion;

  const upperLineGameOverThresholdCubes = Math.floor(
    (visibleAreaHeight - upperLineY) / effectiveCubeHeight
  );
  const lowerLineGameOverThresholdCubes = Math.floor(
    (visibleAreaHeight - lowerLineY) / effectiveCubeHeight
  );




  const resetGame = useCallback(() => {
    setStack([]);
    setGameOver(false);
    setShowModal(false);
    setScore(0);
    setTimeLeft(GAME_DURATION / 1000);
    setGameWon(false);
    maxStackLengthReached.current = 0;
    fallSpeed.current = 2000;
    gameOverRef.current = false; // IMPORTANTE!
    startFallLoop();
    startTimer();
    setGameStarted(false);
    safeZoneEntryTime.current = null;
  }, []);


  const scoreIntervalRef = useRef<number | null>(null);

  
  useEffect(() => {
    if (gameOver) return;

    if (scoreIntervalRef.current === null) {
      scoreIntervalRef.current = setInterval(() => {
        setStack((prevStack) => {
          const length = prevStack.length;
          if (
            length >= lowerLineGameOverThresholdCubes &&
            length <= upperLineGameOverThresholdCubes
          ) {
            setScore((prev) => prev + 1);
          }
          return prevStack;
        });
      }, 500); // ogni 0.5 secondi aggiunge punteggio
    }

    return () => {
      if (scoreIntervalRef.current !== null) {
        clearInterval(scoreIntervalRef.current);
        scoreIntervalRef.current = null;
      }
    };
  }, [gameOver, lowerLineGameOverThresholdCubes, upperLineGameOverThresholdCubes]);


  const addCubeToStack = useCallback(() => {
    if (gameOver) return;

    const newAnim = new Animated.Value(0);
    const newCube = { id: Date.now(), anim: newAnim };

    Animated.timing(newAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setStack((prev) => {
      const newStack = [...prev, newCube];
      if (newStack.length > maxStackLengthReached.current) {
        maxStackLengthReached.current = newStack.length;
      }
      return newStack;
    });
    Vibration.vibrate(50); // piccolo tap feedback
  }, [gameOver]);

  const startVibrationAndStack = useCallback(() => {
    if (gameOver || intervalRef.current !== null) return;
    Vibration.vibrate(10000);
    intervalRef.current = setInterval(() => {
      addCubeToStack();
    }, 500);
  }, [gameOver, addCubeToStack]);

  const stopAllIntervals = useCallback(() => {
    Vibration.cancel();
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (fallIntervalRef.current !== null) {
      clearInterval(fallIntervalRef.current);
      fallIntervalRef.current = null;
    }
    if (timerIntervalRef.current !== null) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }, []);

  const stopVibrationAndStack = useCallback(() => {
    Vibration.cancel();
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startFallLoop = useCallback(() => {
    if (fallIntervalRef.current !== null) return;

    fallIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastFallTime.current >= fallSpeed.current) {
        setStack((prev) => { //aggiunge randomità alla rimozione dei cubi
          if (Math.random() < 0.3 && prev.length >= 2) {
            return prev.slice(0, Math.max(0, prev.length - 2));
          }
          return prev.slice(0, Math.max(0, prev.length - 1));
        });

        lastFallTime.current = now;

        // Aumenta progressivamente la velocità di caduta
        fallSpeed.current = Math.max(150, fallSpeed.current * 0.94);
      }
    }, 100); // Tick frequente, ma la rimozione avviene solo quando il "fallSpeed" è passato
  }, []);

    const triggerGameOver = useCallback((won = false) => {
    if (gameOverRef.current) return; // evita doppi trigger
    gameOverRef.current = true;

    const result = {
      name: "minigame torre",
      score,
      outcome: won ? "victory" : "defeat",
    };

    addResult.addResult("minigameTorre", result);
    setGameOver(true);
    setShowModal(true);
    stopAllIntervals();
    Vibration.vibrate(500);
  }, [score, stopAllIntervals, addResult]);


  const startTimer = useCallback(() => {
    timerIntervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameWon(true);
          triggerGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [triggerGameOver]);

  useEffect(() => {
    // Start game on mount
    resetGame();
    return stopAllIntervals;
  }, []);

  useEffect(() => {
    const inSafeZone =
      stack.length >= lowerLineGameOverThresholdCubes &&
      stack.length <= upperLineGameOverThresholdCubes;

    if (inSafeZone) {
      if (safeZoneEntryTime.current === null) {
        // Prima volta che entri
        safeZoneEntryTime.current = Date.now();
      } else {
        const elapsed = Date.now() - safeZoneEntryTime.current;
        if (elapsed >= 500 && !gameStarted) {
          setGameStarted(true);
          startTimer();
          startFallLoop();
        }
      }
    } else {
      // Sei uscito → reset
      safeZoneEntryTime.current = null;
    }

    // Controllo game over (sempre attivo)
    if (stack.length > upperLineGameOverThresholdCubes && !gameOver) {
      triggerGameOver();
    } else if (
      maxStackLengthReached.current >= lowerLineGameOverThresholdCubes &&
      stack.length < lowerLineGameOverThresholdCubes &&
      !gameOver &&
      stack.length < 5
    ) {
      triggerGameOver();
    }
  }, [
    stack.length,
    gameOver,
    gameStarted,
    triggerGameOver,
    startTimer,
    startFallLoop,
    upperLineGameOverThresholdCubes,
    lowerLineGameOverThresholdCubes,
  ]);

  const maxVisibleCubes = Math.floor(visibleAreaHeight / effectiveCubeHeight);
  const visibleStack = stack.slice(-maxVisibleCubes);

  
  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Cubi: {stack.length}</Text>
      <Text style={styles.scoreText}>Punteggio: {score}</Text>
      <Text style={styles.timerText}>Tempo: {timeLeft}s</Text>

      <View
        style={[
          styles.stackContainer,
          {
            bottom: BOTTOM_MARGIN,
            top: TOP_MARGIN,
            maxHeight: visibleAreaHeight,
          },
        ]}
      >
        {/* Safe zone */}
        <View style={[styles.safeZone, { top: upperLineY, height: lowerLineY - upperLineY }]} />

        {/* Linee rosse */}
        <View style={[styles.redLine, { top: upperLineY }]} />
        <View style={[styles.redLine, { top: lowerLineY }]} />

        {visibleStack.map((cube) => (
          <Animated.View
            key={cube.id}
            style={[
              styles.cube,
              {
                opacity: cube.anim,
                transform: [
                  {
                    scale: cube.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      {/* Pulsante */}
      <Pressable
        onPressIn={startVibrationAndStack}
        onPressOut={stopVibrationAndStack}
        onPress={addCubeToStack}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          gameOver && { opacity: 0.3 },
        ]}
        disabled={gameOver}
      >
        <Text style={styles.buttonText}>Tieni premuto</Text>
      </Pressable>

      {/* Modal Game Over */}
      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{gameWon ? "Hai vinto!" : "Game Over"}</Text>
            <Text style={styles.modalSubtitle}>Punteggio: {score}</Text>
            <Pressable
              onPress={() => router.push(nextGame as any)}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Prossimo gioco</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 60,
  },
  counterText: {
    position: "absolute",
    top: 40,
    fontSize: 20,
    color: "#00FFFF",
    fontWeight: "bold",
  },
  scoreText: {
    position: "absolute",
    top: 70,
    fontSize: 20,
    color: "#00FFAA",
    fontWeight: "bold",
  },
  timerText: {
    position: "absolute",
    top: 100,
    fontSize: 20,
    color: "#FFD700",
    fontWeight: "bold",
  },
  stackContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  cube: {
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    backgroundColor: "#00FFAA",
    marginVertical: CUBE_VERTICAL_MARGIN,
    borderRadius: 6,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 4,
    borderColor: "#00FFFF",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonPressed: {
    backgroundColor: "rgba(0, 255, 255, 0.1)",
  },
  buttonText: {
    color: "#00FFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  redLine: {
    position: "absolute",
    width: "100%",
    height: 3,
    backgroundColor: "red",
    zIndex: 1,
  },
  safeZone: {
    position: "absolute",
    width: "100%",
    backgroundColor: "rgba(0,255,0,0.1)",
    zIndex: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#222",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 20,
    fontWeight: "bold",
  },
  modalSubtitle: {
    fontSize: 20,
    color: "#fff",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#00FFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
  },
});
