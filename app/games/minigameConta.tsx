import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    Button,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const PASSER_WIDTH = 40;
const PASSER_SPACING = 15;
const PASSER_SPEED = 4000; // ms per passante

type PasserType = 'target' | 'other';

interface Passer {
  id: number;
  type: PasserType;
  animation: Animated.Value;
}

export default function MinigameConta() {
  const totalPassers = 20;
  const [passers, setPassers] = useState<Passer[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [userCount, setUserCount] = useState('');
  const targetCountRef = useRef(0);
  const passersPassed = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      startGame();
    } else {
      resetGame();
    }
  }, [isPlaying]);

  const startGame = () => {
    passersPassed.current = 0;
    targetCountRef.current = 0;
    setShowInput(false);
    setUserCount('');
    // genera passanti
    const newPassers: Passer[] = [];
    for (let i = 0; i < totalPassers; i++) {
      const type: PasserType = Math.random() < 0.3 ? 'target' : 'other';
      if (type === 'target') targetCountRef.current++;
      newPassers.push({
        id: i,
        type,
        animation: new Animated.Value(screenWidth + i * (PASSER_WIDTH + PASSER_SPACING)),
      });
    }
    setPassers(newPassers);

    // anima ogni passante in sequenza
    newPassers.forEach((passer, index) => {
      Animated.timing(passer.animation, {
        toValue: -PASSER_WIDTH,
        duration: PASSER_SPEED,
        delay: index * (PASSER_SPEED / 3),
        useNativeDriver: true,
      }).start(() => {
        passersPassed.current++;
        if (passersPassed.current === totalPassers) {
          setShowInput(true);
        }
      });
    });
  };

  const resetGame = () => {
    setPassers([]);
    setShowInput(false);
    setUserCount('');
    targetCountRef.current = 0;
    passersPassed.current = 0;
  };

  const checkResult = () => {
    const guess = parseInt(userCount, 10);
    if (isNaN(guess)) {
      Alert.alert('Errore', 'Inserisci un numero valido');
      return;
    }
    if (guess === targetCountRef.current) {
      Alert.alert('Bravo!', 'Hai contato correttamente!', [
        { text: 'OK', onPress: () => setIsPlaying(false) },
      ]);
    } else {
      Alert.alert(
        'Ops!',
        `Hai contato ${guess}, ma erano ${targetCountRef.current}.`,
        [{ text: 'Riprova', onPress: () => setIsPlaying(false) }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conta i passanti</Text>

      {isPlaying ? (
        <>
          <View style={styles.passersArea}>
            {passers.map((passer) => (
              <Animated.View
                key={passer.id}
                style={[
                  styles.passer,
                  passer.type === 'target' ? styles.targetPasser : styles.otherPasser,
                  {
                    transform: [{ translateX: passer.animation }],
                  },
                ]}
              >
                <Text style={styles.passerText}>
                  {passer.type === 'target' ? '🚶‍♂️' : '🚶‍♀️'}
                </Text>
              </Animated.View>
            ))}
          </View>

          {showInput ? (
            <>
              <Text style={styles.prompt}>
                Quanti passanti <Text style={{ fontWeight: 'bold' }}>speciali</Text> hai contato?
              </Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={userCount}
                onChangeText={setUserCount}
                placeholder="Inserisci un numero"
              />
              <Button title="Verifica" onPress={checkResult} />
            </>
          ) : (
            <Text style={styles.waitText}>Passanti in arrivo...</Text>
          )}
        </>
      ) : (
        <Button title="Inizia Gioco" onPress={() => setIsPlaying(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    textAlign: 'center',
    marginBottom: 20,
  },
  passersArea: {
    height: 80,
    overflow: 'hidden',
    marginBottom: 20,
  },
  passer: {
    position: 'absolute',
    width: PASSER_WIDTH,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  targetPasser: {
    backgroundColor: '#4caf50',
  },
  otherPasser: {
    backgroundColor: '#ddd',
  },
  passerText: {
    fontSize: 32,
  },
  prompt: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#888',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 8,
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
  },
  waitText: {
    textAlign: 'center',
    fontSize: 18,
    fontStyle: 'italic',
  },
});
