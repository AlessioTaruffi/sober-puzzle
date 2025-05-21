import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');
const TOTAL_PASSERS = 10;

const GAME_AREA_WIDTH = width * 0.9;
const GAME_AREA_HEIGHT = height * 0.8;

const images = {
  beer: require('../../assets/images/beer.png'),
  water: require('../../assets/images/water.png'),
};

type Passer = {
  id: number;
  type: 'beer' | 'water';
  x: Animated.Value;
  y: Animated.Value;
};

export default function MinigameConta() {

  const [passers, setPassers] = useState<Passer[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [correctBeerCount, setCorrectBeerCount] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [gameAreaLayout, setGameAreaLayout] = useState({ x: 0, y: 0 });  
  const [isReady, setIsReady] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const resetGame = () => {
    setIsReady(false);
    setPassers([]);
    setUserInput('');
    setCorrectBeerCount(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOver) return;

    const newPassers: Passer[] = Array.from({ length: TOTAL_PASSERS }, (_, i) => {
      const type = Math.random() < 0.4 ? 'beer' : 'water';
      const x = new Animated.Value(Math.random() * (GAME_AREA_WIDTH - 40));
      const y = new Animated.Value(Math.random() * (GAME_AREA_HEIGHT - 40));
      animateMovement(x, y);
      return { id: i, type, x, y };
    });

    setPassers(newPassers);
    setCorrectBeerCount(newPassers.filter(p => p.type === 'beer').length);
    setIsReady(true);

    const timer = setTimeout(() => {
      setGameOver(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, [gameOver]);

  const animateMovement = (x: Animated.Value, y: Animated.Value) => {
    const move = () => {
      Animated.parallel([
        Animated.timing(x, {
          toValue: Math.random() * (GAME_AREA_WIDTH - 40),
          duration: 1000 + Math.random() * 2000,
          useNativeDriver: false,
        }),
        Animated.timing(y, {
          toValue: Math.random() * (GAME_AREA_HEIGHT - 40),
          duration: 1000 + Math.random() * 2000,
          useNativeDriver: false,
        }),
      ]).start(() => move());
    };
    move();
  };

  const handleSubmit = () => {
    const userGuess = parseInt(userInput, 10);
    if (isNaN(userGuess)) {
      Alert.alert('Error', 'Please insert a valid number.');
      return;
    }

    const isCorrect = userGuess === correctBeerCount;

    Alert.alert(
      isCorrect ? 'Correct!' : 'Wrong',
      isCorrect
        ? 'You maybe deserve one 🎉'
        : 'Better stop drinking Mate!',
      [
        {
          text: 'OK',
          onPress: () => {
            setNavigating(true);
            resetGame();
            
            // Ritornare alla schermata precedente
            setTimeout(() => {
              router.back(); // Questo fa tornare indietro
            }, 500);
          },
        },
      ]
    );
  };

  if (!isReady || gameOver || navigating) {
    return (
      <View style={styles.container}>
        {gameOver ? (
          <>
            <Text style={styles.title}>How many beers have you seen?</Text>
            <TextInput
              style={styles.input}
              value={userInput}
              onChangeText={setUserInput}
              keyboardType="numeric"
              placeholder="Insert a number"
            />
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Check</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/bar.jpg')}
        style={styles.gameArea}
        imageStyle={{ borderRadius: 12 }}
        onLayout={(event) => {
          const { x, y } = event.nativeEvent.layout;
          setGameAreaLayout({ x, y });
        }}
      >
        {passers.map(passer => (
          <Animated.Image
            key={passer.id}
            source={images[passer.type]}
            style={[
              styles.passer,
              {
                left: passer.x,
                top: passer.y,
              },
            ]}
          />
        ))}
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  gameArea: {
    width: GAME_AREA_WIDTH,
    height: GAME_AREA_HEIGHT,
    backgroundColor: '#ffffffaa',
    borderColor: '#007AFF',
    borderWidth: 2,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  passer: {
    position: 'absolute',
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    padding: 10,
    borderRadius: 8,
    width: '60%',
    textAlign: 'center',
    fontSize: 18,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});
