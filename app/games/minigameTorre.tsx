import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Vibration,
  Dimensions,
  Animated,
} from "react-native";

const CUBE_SIZE = 50;
const BUTTON_SIZE = 120;
const TOP_MARGIN = 100; // spazio per la scritta
const BOTTOM_MARGIN = 60 + BUTTON_SIZE / 2; // centro bottone

export default function App() {
  const [stack, setStack] = useState<{ id: number; anim: Animated.Value }[]>([]);
  const intervalRef = useRef<number | null>(null);

  const screenHeight = Dimensions.get("window").height;
  const visibleAreaHeight = screenHeight - TOP_MARGIN - BOTTOM_MARGIN;
  const maxVisibleCubes = Math.floor(visibleAreaHeight / (CUBE_SIZE + 4));

  const addCubeToStack = () => {
    const newAnim = new Animated.Value(0);
    const newCube = { id: Date.now(), anim: newAnim };

    Animated.timing(newAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    setStack((prev) => [...prev, newCube]);
  };

    const startVibrationAndStack = () => {
        if (intervalRef.current !== null) return; // evita doppio avvio

        Vibration.vibrate(10000);
        intervalRef.current = setInterval(() => {
            addCubeToStack();
        }, 500);
    };


    const stopVibrationAndStack = () => {
        Vibration.cancel();
        if (intervalRef.current !== null) {
            clearInterval(intervalRef.current);
            intervalRef.current = null; // ← reset
        }
    };


  // Solo gli ultimi N cubi visibili
  const visibleStack = stack.slice(-maxVisibleCubes);

  return (
    <View style={styles.container}>
      <Text style={styles.counterText}>Cubi: {stack.length}</Text>

  <View
    style={[
      styles.stackContainer,
      {
        bottom: BOTTOM_MARGIN,
        top: TOP_MARGIN, // ← AGGIUNTO
        maxHeight: visibleAreaHeight,
      },
    ]}
  >

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
        ]}
      >
        <Text style={styles.buttonText}></Text>
      </Pressable>
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
    justifyContent: "flex-end", // i cubi crescono verso l’alto
    overflow: "hidden",
  },
  cube: {
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    backgroundColor: "#00FFAA",
    marginVertical: 2,
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
    color: "transparent",
  },
});