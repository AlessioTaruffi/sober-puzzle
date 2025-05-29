import { useRouter } from "expo-router";
import { Gyroscope, GyroscopeMeasurement } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, Vibration, View } from "react-native";
import { gamesList } from "./gamesList";

export default function minigame2() {

  //stato per i valori del giroscopio
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  const router = useRouter();
  const currentGame = "/games/minigame2";
  const currentIndex = gamesList.indexOf(currentGame);
  const nextGame = gamesList[currentIndex + 1] 
  


  //sottoscrizione del listener al giroscopio
  const [subscription, setSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);
  Gyroscope.setUpdateInterval(200); //aggiornamento ogni 200ms, quindi ogni 200ms nuovo render

  //crea una sottoscrizione al giroscopio
  //Ogni volta che arrivano nuovi dati aggiorna lo stato con setData
  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener((gyroscopeData: GyroscopeMeasurement) => {
        setData(gyroscopeData);
      })
    );
  };
    
  //cancella la sottoscrizione al giroscopio
  //utile quando si esce dalla schermata
  //per evitare di continuare a ricevere dati
  const _unsubscribe = () => {
    subscription?.remove();
    setSubscription(null);
  };

  //eseguita quando il componente viene montato
  //e quando viene smontato
  //quando viene smontato cancella la sottoscrizione
  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const [timer, setTimer] = useState<number>(20); //timer di 20 secondi
  const [balanceTime, setBalanceTime] = useState<number>(0); //tempo totale in cui è stato stabile
  const [gameOver, setGameOver] = useState<boolean>(false); //se il gioco è finito

  //aggiorna il timer ogni 200ms, controlla se è stabile e aggiorna balanceTime
  useEffect(() => {
    let interval: number;

    if (!gameOver) {
      interval = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setGameOver(true);
            _unsubscribe();
            return 0;
          }
          return prev - 1;
        });

        if (checkBalance()) {
          setBalanceTime(prev => prev + 0.2); //aggiorna il tempo stabile
        }
      }, 200);
    }

    return () => clearInterval(interval);
  }, [gameOver, x, y, z]);

  //controlla che il giroscopio sia pressocché fermo lungo i 3 assi
  //se rimane entro 0.1 0.1 0.1 é considerato fermo
  const checkBalance = (): boolean => {
    if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(z) < 0.1) {
      return true;
    } 
    Vibration.vibrate(100); //vibra per 100ms
    return false;
  }

  const truncateTo3Decimals = (value: number): number => {
    return Math.trunc(value * 1000) / 1000;
  };

  return(
    <View style={[styles.container, checkBalance() ? styles.green : styles.red]}>

      <Text style={styles.text}>Timer: {timer}s</Text>
      <Text style={styles.text}>Equilibrio: {truncateTo3Decimals(balanceTime)}s</Text>

      <Text style={styles.text}>x: {truncateTo3Decimals(x)}</Text>
      <Text style={styles.text}>y: {truncateTo3Decimals(y)}</Text>
      <Text style={styles.text}>z: {truncateTo3Decimals(z)}</Text>

      {gameOver && (
        <View style={styles.results}>
          <Text style={styles.text}>Test completato!</Text>
          <Text style={styles.text}>Tempo stabile: {truncateTo3Decimals(balanceTime)} secondi</Text>
          <Button title="Prossimo minigioco" onPress={
            () => {router.push(nextGame as any)}
          } />
        </View>
      )}

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  red: { backgroundColor: "red" },
  green: { backgroundColor: "green" },
  text: {
    color: "white",
    fontSize: 18,
    margin: 4,
  },
  results: {
    marginTop: 20,
    alignItems: 'center',
  }
});
