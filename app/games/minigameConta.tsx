import Slider from '@react-native-community/slider';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';



import {
  Animated,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useGameScore } from './GameScoreContext'; // Assicurati che il percorso sia corretto
import { gamesList } from './gamesList';

const { width, height } = Dimensions.get('window');


const currentGameIndex = gamesList.indexOf('/games/minigameConta');
const nextGameRoute = gamesList[currentGameIndex + 1];
const GAME_AREA_WIDTH = width * 0.9;
const GAME_AREA_HEIGHT = height * 0.8;

const images = {
  beer: require('../../assets/images/beer.png'),
  water: require('../../assets/images/water.png'),
  food: require('../../assets/images/food.png'),
};

type Passer = {
  id: number;
  type: 'beer' | 'water' | 'food';
  x: Animated.Value;
  y: Animated.Value;
};

type MinigameContaProps = {
  duration?: number;
  numPassers?: number;
  onNext?: () => void;
};

export default function MinigameConta({
  duration = 2500,
  numPassers = 10,
}: MinigameContaProps) {

  const [passers, setPassers] = useState<Passer[]>([]);
  const [gameOver, setGameOver] = useState(false);
  const [correctBeerCount, setCorrectBeerCount] = useState(0);
  const [correctWaterCount, setCorrectWaterCount] = useState(0);
  const [correctFoodCount, setCorrectFoodCount] = useState(0);
  const [userBeerInput, setUserBeerInput] = useState(0);
  const [userWaterInput, setUserWaterInput] = useState(0); 
  const [userFoodInput, setUserFoodInput] = useState(0); 
  const [userInput, setUserInput] = useState('');
  const [gameAreaLayout, setGameAreaLayout] = useState({ x: 0, y: 0 });  
  const [isReady, setIsReady] = useState(false);
  const [navigating, setNavigating] = useState(false);

  const resetGame = () => {
    setIsReady(false);
    setPassers([]);
    setUserInput('');
    setCorrectBeerCount(0);
    setCorrectWaterCount(0);
    setGameOver(false);
  };

  useEffect(() => {
    if (gameOver) return;

    const newPassers: Passer[] = Array.from({ length: numPassers }, (_, i) => {
      const prob = Math.random();
      const type: 'beer' | 'water' | 'food' = prob < 0.4 ? 'beer' : prob < 0.8 ? 'water' : 'food';
      const x = new Animated.Value(Math.random() * (GAME_AREA_WIDTH - 40));
      const y = new Animated.Value(Math.random() * (GAME_AREA_HEIGHT - 40));
      animateMovement(x, y);
      return { id: i, type, x, y };
    });

    setPassers(newPassers);
    setCorrectBeerCount(newPassers.filter(p => p.type === 'beer').length);
    setCorrectWaterCount(newPassers.filter(p => p.type === 'water').length);
    setCorrectFoodCount(newPassers.filter(p => p.type === 'food').length);

    setIsReady(true);

    const timer = setTimeout(() => {
      setGameOver(true);
    },  duration);

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
const {addResult} = useGameScore();
const handleSubmit = () => {
  addResult('minigameConta', {
    beers: {
      user: userBeerInput,
      correct: correctBeerCount,
    },
    water: {
      user: userWaterInput,
      correct: correctWaterCount,
    },
    food: {
      user: userFoodInput,
      correct: correctFoodCount,
    },
  });
  console.log('eccomi qua');
  router.push({pathname: './EndGame', params: { gameName: 'minigameConta', }});
  
};



  if (!isReady || navigating) {
  return <Text>Loading...</Text>;
}

if (gameOver) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quanta roba hai visto?</Text>

      <Text style={{ fontSize: 18, marginTop: 20 }}>Birre: {userBeerInput}</Text>
      <View style={styles.sliderRow}>
        <Text>0</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={numPassers}
          step={1}
          value={userBeerInput}
          onValueChange={setUserBeerInput}
        />
        <Text>{numPassers}</Text>
      </View>

      <Text style={{ fontSize: 18, marginTop: 20 }}>Acqua: {userWaterInput}</Text>
      <View style={styles.sliderRow}>
        <Text>0</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={numPassers}
          step={1}
          value={userWaterInput}
          onValueChange={setUserWaterInput}
        />
        <Text>{numPassers}</Text>
      </View>

      <Text style={{ fontSize: 18, marginTop: 20 }}>Cibo: {userFoodInput}</Text>
      <View style={styles.sliderRow}>
        <Text>0</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={numPassers}
          step={1}
          value={userFoodInput}
          onValueChange={setUserFoodInput}
        />
        <Text>{numPassers}</Text>
        
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Verifica</Text>
      </TouchableOpacity>
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
  tapArea: {
  width: '100%',
  height: 200,
  backgroundColor: '#eef',
  borderRadius: 12,
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#888',
},
tapText: {
  fontSize: 28,
  fontWeight: 'bold',
},
sliderRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  paddingHorizontal: 10,
  marginVertical: 10,
},
slider: {
  flex: 1,
  marginHorizontal: 10,
},


});
