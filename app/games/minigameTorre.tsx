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

const CUBE_SIZE = 50;
const BUTTON_SIZE = 120;
const TOP_MARGIN = 100;
const BOTTOM_MARGIN = 60 + BUTTON_SIZE / 2;
const CUBE_VERTICAL_MARGIN = 2;

export default function App() {
  const [stack, setStack] = useState<{ id: number; anim: Animated.Value }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const maxStackLengthReached = useRef(0);

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

  const triggerGameOver = useCallback(() => {
    setGameOver(true);
    setShowModal(true);
    stopVibrationAndStack();
  }, []);

  const resetGame = useCallback(() => {
    setStack([]);
    setGameOver(false);
    setShowModal(false);
    maxStackLengthReached.current = 0;
  }, []);

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
  }, [gameOver]);

  const startVibrationAndStack = useCallback(() => {
    if (gameOver || intervalRef.current !== null) return;
    Vibration.vibrate(10000);
    intervalRef.current = setInterval(() => {
      addCubeToStack();
    }, 500);
  }, [gameOver, addCubeToStack]);

  const stopVibrationAndStack = useCallback(() => {
    Vibration.cancel();
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const removeCubesRandomly = () => {
      if (gameOver) return;
      const delay = Math.random() * 3000;
      const removeCount = Math.floor(Math.random() * 3);
      timeoutId = setTimeout(() => {
        setStack((prev) => {
          return removeCount === 0 ? prev : prev.slice(0, Math.max(0, prev.length - removeCount));
        });
        if (!gameOver) removeCubesRandomly();
      }, delay);
    };
    removeCubesRandomly();
    return () => clearTimeout(timeoutId);
  }, [gameOver]);

  useEffect(() => {
    if (stack.length >= upperLineGameOverThresholdCubes && !gameOver) {
      triggerGameOver();
      return;
    }

    if (
      maxStackLengthReached.current >= lowerLineGameOverThresholdCubes &&
      stack.length < lowerLineGameOverThresholdCubes &&
      !gameOver &&
      stack.length < 5
    ) {
      triggerGameOver();
    }
  }, [stack.length, gameOver, triggerGameOver, upperLineGameOverThresholdCubes, lowerLineGameOverThresholdCubes]);

  const maxVisibleCubes = Math.floor(visibleAreaHeight / effectiveCubeHeight);
  const visibleStack = stack.slice(-maxVisibleCubes);

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Cubi: {stack.length}</Text>

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
      <Text></Text>
    </Pressable>


      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Over</Text>
            <Pressable onPress={resetGame} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Riprova</Text>
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
    fontSize: 24,
    color: "#00FFFF",
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
  redLine: {
    position: "absolute",
    width: "100%",
    height: 3,
    backgroundColor: "red",
    zIndex: 1,
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
