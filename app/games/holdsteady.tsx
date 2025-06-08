import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    Pressable,
    StyleSheet,
    Text,
    Vibration,
    View,
} from "react-native";
import { useGameScore } from './GameScoreContext'; // Assicurati che il percorso sia corretto


export default function holdSteady() {
    const router = useRouter();
    const addResult = useGameScore();
    const [gamePhase, setGamePhase] = useState("waiting"); // "waiting" | "ready" | "holding" | "release" | "done"
    const [promptShown, setPromptShown] = useState(false);
    const [reactionTime, setReactionTime] = useState<number | null>(null);
    const [holdDuration, setHoldDuration] = useState<number | null>(null);

    const [currentRound, setCurrentRound] = useState(0);
    const [targetRounds, setTargetRounds] = useState(0);

    const [results, setResults] = useState<
        { reactionTime: number; holdDuration: number; result: string }[]
    >([]);

    const promptTimeoutRef = useRef<number | null>(null);
    const holdTimerRef = useRef<number | null>(null);
    const holdStartTime = useRef<number | null>(null);
    const promptShownTime = useRef<number | null>(null);

    const targetHoldTime = 3000; // 3 sec target
    const tolerance = 500; // ± 0.5 sec

    const startNewRound = useCallback(() => {
        setGamePhase("waiting");
        setPromptShown(false);
        setReactionTime(null);
        setHoldDuration(null);
        holdStartTime.current = null;
        promptShownTime.current = null;

        if (holdTimerRef.current !== null) {
        clearTimeout(holdTimerRef.current);
        }

        const randomDelay = 2000 + Math.random() * 3000; // 2-5 sec
        promptTimeoutRef.current = setTimeout(() => {
        Vibration.vibrate(300);
        setPromptShown(true);
        setGamePhase("ready");
        promptShownTime.current = Date.now();
        }, randomDelay);
    }, []);

    const startGame = useCallback(() => {
        const rounds = Math.floor(Math.random() * 3) + 4; // 4-6 rounds
        setTargetRounds(rounds);
        setCurrentRound(0);
        setResults([]);
        startNewRound();
    }, [startNewRound]);

    useEffect(() => {
        startGame();

        return () => {
        if (promptTimeoutRef.current !== null) {
            clearTimeout(promptTimeoutRef.current);
        }
        if (holdTimerRef.current !== null) {
            clearTimeout(holdTimerRef.current);
        }
        };
    }, [startGame]);

    const handlePressIn = () => {
        if (gamePhase === "ready") {
        const rt = Date.now() - (promptShownTime.current || 0);
        setReactionTime(rt);
        holdStartTime.current = Date.now();
        setGamePhase("holding");

        holdTimerRef.current = setTimeout(() => {
            Vibration.vibrate(300);
            setGamePhase("release");
        }, targetHoldTime);
        }
    };

    const handlePressOut = () => {
        if (
        (gamePhase === "holding" || gamePhase === "release") &&
        holdStartTime.current !== null
        ) {
        const duration = Date.now() - holdStartTime.current;
        setHoldDuration(duration);

        let roundResult = "";
        if (gamePhase === "release") {
            if (
            duration >= targetHoldTime - tolerance &&
            duration <= targetHoldTime + tolerance
            ) {
            roundResult = "OK ✅";
            } else if (duration < targetHoldTime - tolerance) {
            roundResult = "Too short ❌";
            } else {
            roundResult = "Too long ❌";
            }
        } else {
            roundResult = "Released too early ❌";
        }

        setResults((prev) => [
            ...prev,
            {
            reactionTime: reactionTime || 0,
            holdDuration: duration,
            result: roundResult,
            },
        ]);

        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);

        if (nextRound >= targetRounds) {
            setGamePhase("done");
            const result = {
                name: "Hold Steady",
                rounds: targetRounds,
                results: results.map((res, index) => ({
                    round: index + 1,
                    reactionTime: res.reactionTime,
                    holdDuration: res.holdDuration,
                    result: res.result,
                })),
            };
            addResult.addResult("holdsteady", result);
            router.push({ pathname: '/games/EndGame', params: { gameName: 'holdsteady' } });

        } else {
            startNewRound();
        }
        } else if (gamePhase === "ready") {
        setReactionTime(0);
        setHoldDuration(0);
        setResults((prev) => [
            ...prev,
            {
            reactionTime: 0,
            holdDuration: 0,
            result: "Too quick ❌",
            },
        ]);

        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);

        if (nextRound >= targetRounds) {
            setGamePhase("done");
        } else {
            startNewRound();
        }
        }
    };

    const getBackgroundColor = () => {
        switch (gamePhase) {
        case "waiting":
            return "#FFD700"; // giallo
        case "ready":
            return "#00FF00"; // verde
        case "holding":
            return "#FFD700"; // giallo
        case "release":
            return "#00FF00"; // verde
        case "done":
            return "#111"; // neutro finale
        default:
            return "#000";
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: getBackgroundColor() }]}>
        <Text style={styles.title}>SoberPuzzle - Hold Steady</Text>
        <Text style={styles.subtitle}>
            Round {Math.min(currentRound + 1, targetRounds)} / {targetRounds}
        </Text>

        {gamePhase === "waiting" && (
            <Text style={styles.instructions}>Preparati...</Text>
        )}
        {gamePhase === "ready" && (
            <Text style={styles.instructions}>PREMI ORA!</Text>
        )}
        {gamePhase === "holding" && (
            <Text style={styles.instructions}>Tienilo premuto...</Text>
        )}
        {gamePhase === "release" && (
            <Text style={styles.instructions}>Rilascia ORA!</Text>
        )}
        {/*gamePhase === "done" && (
            <>
            <Text style={styles.instructions}>Risultati finali:</Text>
            {results.map((res, index) => (
                <Text key={index} style={styles.resultText}>
                Round {index + 1}: RT {res.reactionTime} ms | Hold{" "}
                {res.holdDuration} ms | {res.result}
                </Text>
            ))}
            <Pressable onPress={startGame} style={styles.retryButton}>
                <Text style={styles.retryButtonText}>Riprova</Text>
            </Pressable>
            </>
        )*/}

        
        {gamePhase !== "done" && (
            <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={({ pressed }) => [
                styles.button,
                pressed && styles.buttonPressed,
            ]}
            disabled={!promptShown}
            >
            <Text style={styles.buttonText}>Premi qui</Text>
            </Pressable>
        )}
        </View>
    );
}

const BUTTON_SIZE = 150;

const styles = StyleSheet.create({
container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
},
title: {
    fontSize: 26,
    color: "#111",
    fontWeight: "bold",
    marginBottom: 10,
},
subtitle: {
    fontSize: 18,
    color: "#111",
    marginBottom: 20,
},
instructions: {
    fontSize: 20,
    color: "#111",
    marginBottom: 20,
    fontWeight: "bold",
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
    marginTop: 20,
},
buttonPressed: {
    backgroundColor: "rgba(0, 255, 255, 0.2)",
},
buttonText: {
    color: "#00FFFF",
    fontWeight: "bold",
    fontSize: 18,
},
resultText: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 5,
},
retryButton: {
    backgroundColor: "#00FFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
},
retryButtonText: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 16,
},
});
