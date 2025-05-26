import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Vibration,
  Dimensions,
  Animated,
  Modal,
} from "react-native";

const CUBE_SIZE = 50;
const BUTTON_SIZE = 120;
const TOP_MARGIN = 100;
const BOTTOM_MARGIN = 60 + BUTTON_SIZE / 2;
const CUBE_VERTICAL_MARGIN = 2; // From StyleSheet.create cube marginVertical

export default function App() {
  const [stack, setStack] = useState<{ id: number; anim: Animated.Value }[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const intervalRef = useRef<number | null>(null);
  // hasPassedLowerLine is not used for the upper limit game over, but keeping it as per original code.
  const hasPassedLowerLine = useRef(false);

  const screenHeight = Dimensions.get("window").height;
  const visibleAreaHeight = screenHeight - TOP_MARGIN - BOTTOM_MARGIN;

  // Effective height of a single cube including its vertical margins
  const effectiveCubeHeight = CUBE_SIZE + (CUBE_VERTICAL_MARGIN * 2);

  // Proportions for red line placement (from the top of the stackContainer)
  const upperLineProportion = 0.15; // 15% from the top
  const lowerLineProportion = 0.5;  // 50% from the top

  // Y-coordinate of the red lines relative to the top of stackContainer
  const upperLineY = visibleAreaHeight * upperLineProportion;
  const lowerLineY = visibleAreaHeight * lowerLineProportion;

  // Calculate the maximum number of cubes that can fit below the upper red line
  // This is the threshold for game over.
  const gameOverThresholdCubes = Math.floor((visibleAreaHeight - upperLineY) / effectiveCubeHeight);

  // Function to trigger the game over state
  const triggerGameOver = () => {
    setGameOver(true);
    setShowModal(true);
    stopVibrationAndStack();
  };

  // Function to reset the game state
  const resetGame = () => {
    setStack([]); // Clear the stack
    setGameOver(false); // Reset game over state
    setShowModal(false); // Hide the modal
    hasPassedLowerLine.current = false; // Reset this flag as well
  };

  // Function to add a new cube to the stack with an animation
  const addCubeToStack = () => {
    if (gameOver) return; // Do nothing if game is over

    const newAnim = new Animated.Value(0); // Initial animation value
    const newCube = { id: Date.now(), anim: newAnim }; // Create a new cube object

    // Animate the new cube's appearance
    Animated.timing(newAnim, {
      toValue: 1, // Animate to full visibility/scale
      duration: 300, // Animation duration
      useNativeDriver: false, // Required for layout properties like height/width
    }).start();

    // Update the stack state by adding the new cube
    setStack((prev) => {
      const newStack = [...prev, newCube];
      return newStack;
    });
  };

  // Function to start vibration and continuous cube generation
  const startVibrationAndStack = () => {
    if (gameOver || intervalRef.current !== null) return; // Prevent multiple intervals or if game is over

    Vibration.vibrate(10000); // Start a long vibration
    // Set an interval to continuously add cubes
    intervalRef.current = setInterval(() => {
      addCubeToStack();
    }, 500); // Add a cube every 0.5 seconds
  };

  // Function to stop vibration and continuous cube generation
  const stopVibrationAndStack = () => {
    Vibration.cancel(); // Stop any ongoing vibration
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current); // Clear the interval for adding cubes
      intervalRef.current = null; // Reset the ref
    }
  };

  // Effect hook to randomly remove cubes from the stack
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const removeCubesRandomly = () => {
      const x = Math.random() * 3000; // Random delay up to 3 seconds for removal
      const y = Math.floor(Math.random() * 3); // Randomly remove 0, 1, or 2 cubes

      timeoutId = setTimeout(() => {
        setStack((prev) => {
          // Remove 'y' cubes from the end (top) of the stack, ensuring it doesn't go below 0
          const newStack = y === 0 ? prev : prev.slice(0, Math.max(0, prev.length - y));
          return newStack;
        });

        if (!gameOver) removeCubesRandomly(); // Continue removing if the game is not over
      }, x);
    };

    removeCubesRandomly(); // Initiate the random cube removal process

    // Cleanup function: clear the timeout when the component unmounts or gameOver state changes
    return () => {
      clearTimeout(timeoutId);
    };
  }, [gameOver]); // Rerun this effect if the gameOver state changes

  // Effect hook to check for the game over condition based on stack height
  useEffect(() => {
    // If the stack length reaches or exceeds the calculated threshold
    // and the game is not already over, trigger game over.
    if (stack.length >= gameOverThresholdCubes && !gameOver) {
      setGameOver(true);
      setShowModal(true);
      stopVibrationAndStack(); // Stop vibration and cube generation
    }
  }, [stack.length, gameOverThresholdCubes, gameOver]); // Dependencies for this effect

  // Calculate the maximum number of cubes that can be visibly rendered
  const maxVisibleCubes = Math.floor(visibleAreaHeight / effectiveCubeHeight);
  // Slice the stack to only show the cubes that fit within the visible area
  const visibleStack = stack.slice(-maxVisibleCubes);

  return (
    <View style={styles.container}>
      {/* Display the current number of cubes in the stack */}
      <Text style={styles.counterText}>Cubi: {stack.length}</Text>

      {/* Container for the cube stack */}
      <View
        style={[
          styles.stackContainer,
          {
            bottom: BOTTOM_MARGIN,
            top: TOP_MARGIN,
            maxHeight: visibleAreaHeight, // Limit the height of the stack container
          },
        ]}
      >
        {/* Upper red line */}
        <View
          style={[
            styles.redLine,
            { top: upperLineY }, // Position the line based on calculated Y-coordinate
          ]}
        />
        {/* Lower red line */}
        <View
          style={[
            styles.redLine,
            { top: lowerLineY }, // Position the line based on calculated Y-coordinate
          ]}
        />

        {/* Render visible cubes */}
        {visibleStack.map((cube) => (
          <Animated.View
            key={cube.id}
            style={[
              styles.cube,
              {
                opacity: cube.anim, // Animate opacity
                transform: [
                  {
                    scale: cube.anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.7, 1], // Animate scale from 0.7 to 1
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>

      {/* Main game button */}
      <Pressable
        onPressIn={startVibrationAndStack} // Start adding cubes and vibrating on press in
        onPressOut={stopVibrationAndStack} // Stop on press out
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed, // Apply pressed style
          gameOver && { opacity: 0.3 }, // Dim button if game over
        ]}
        disabled={gameOver} // Disable button if game over
      >
        <Text style={styles.buttonText}></Text>
      </Pressable>

      {/* Game Over Modal */}
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
    justifyContent: "flex-end", // Align content to the bottom
    paddingBottom: 60,
  },
  counterText: {
    position: "absolute",
    top: 40,
    fontSize: 24,
    color: "#00FFFF", // Cyan color
    fontWeight: "bold",
  },
  stackContainer: {
    position: "absolute",
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end", // Cubes stack from bottom upwards
    overflow: "hidden", // Hide parts of cubes that go beyond maxHeight
  },
  cube: {
    width: CUBE_SIZE,
    height: CUBE_SIZE,
    backgroundColor: "#00FFAA", // Greenish-blue color
    marginVertical: CUBE_VERTICAL_MARGIN, // Apply vertical margin
    borderRadius: 6,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2, // Make it a circle
    borderWidth: 4,
    borderColor: "#00FFFF", // Cyan border
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  buttonPressed: {
    backgroundColor: "rgba(0, 255, 255, 0.1)", // Slight cyan tint when pressed
  },
  buttonText: {
    color: "transparent", // Text is transparent, only the circle is visible
  },
  redLine: {
    position: "absolute",
    width: "100%",
    height: 3,
    backgroundColor: "red",
    zIndex: 1, // Ensure lines are above cubes
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)", // Semi-transparent black background
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#222", // Dark grey background
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    color: "#fff", // White text
    marginBottom: 20,
    fontWeight: "bold",
  },
  retryButton: {
    backgroundColor: "#00FFFF", // Cyan background
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#000", // Black text
    fontWeight: "bold",
    fontSize: 16,
  },
});
