import { Gyroscope } from 'expo-sensors';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, Vibration, View } from "react-native";

export default function minigame2() {

  
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });

  //sottoscrizione del listener al giroscopio
  const [subscription, setSubscription] = useState<ReturnType<typeof Gyroscope.addListener> | null>(null);
  Gyroscope.setUpdateInterval(200); //aggiornamento ogni 200ms, quindi ogni 200ms nuovo render

  //crea una sottoscrizione al giroscopio
  //Ogni volta che arrivano nuovi dati aggiorna lo stato con setData
  const _subscribe = () => {
    setSubscription(
      Gyroscope.addListener(gyroscopeData => {
        setData(gyroscopeData);
      })
    );
  };
    
  //cancella la sottoscrizione al giroscopio
  //utile quando si esce dalla schermata
  //per evitare di continuare a ricevere dati
  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  //eseguita quando il componente viene montato
  //e quando viene smontato
  //quando viene smontato cancella la sottoscrizione
  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  const [timer, setTimer] = useState(20); //timer di 20 secondi

  //controlla che il giroscopio sia pressocché fermo lungo i 3 assi
  //se rimane entro 0.1 0.1 0.1 é considerato fermo
  const checkBalance = () => {

    if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1 && Math.abs(z) < 0.1) {
      return true;
    } 
    Vibration.vibrate(100); //vibra per 100ms
    return false;

  }

  const truncateTo3Decimals = (value: number) => {
    return Math.trunc(value * 1000) / 1000;
  };

  return(

    <View style={checkBalance() ? styles.green : styles.red}>

      <Text style={{ color: "white" }}>x: {truncateTo3Decimals(x)}</Text>
      <Text style={{ color: "white" }}>y: {truncateTo3Decimals(y)}</Text>
      <Text style={{ color: "white" }}>z: {truncateTo3Decimals(z)}</Text>

    </View>

  )
  
}

const styles = StyleSheet.create({
  red: { backgroundColor: "red" },
  green: { backgroundColor: "green" },
});
