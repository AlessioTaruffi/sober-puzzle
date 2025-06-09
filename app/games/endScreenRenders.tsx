// endScreenRenderers.ts
import React from 'react';
import { Image, Text, View } from 'react-native';
export type GameSpecificData = Record<string, any>;

type Renderer = (data: GameSpecificData) => React.ReactElement;
const badgeImages = {
  Stabile: require('../../assets/images/Mentestabile.png'),
  Variabile: require('../../assets/images/Variabile.png'),
  Instabile: require('../../assets/images/Instabile.png'),
};


export const renderers: Record<string, Renderer> = {
  "minigameConta": (data) => (
   <View>
  <Text>🍺 Birre viste: {data.beers.user} / corrette: {data.beers.correct}</Text>
  <Text>💧 Acque viste: {data.water.user} / corrette: {data.water.correct}</Text>
  <Text>🍽️ Cibo visto: {data.food.user} / corrette: {data.food.correct}</Text>

  {
    (data.beers.user === data.beers.correct &&
     data.water.user === data.water.correct &&
     data.food.user === data.food.correct)
      ? <Text style={{ color: 'green', fontWeight: 'bold' }}>Tutto corretto! 🎉</Text>
      : <Text style={{ color: 'red', fontWeight: 'bold' }}>Qualcosa non torna... 😕</Text>
  }
</View>
  ),
  "minigame1": (data) => (
    <View>
      <Text>Tentativi: {data.attempts}</Text>
      <Text>Corrette: {data.correct}</Text>
      <Text>Errate: {data.wrong}</Text>
      <Text>AVG reaction time: {data.avgTime}s</Text>
    </View>
  ),
  "minigame2": (data) => (	
    
    <View>
      <Text>Tempo di equilibrio: {data.balanceTime}s</Text>
    </View>
  ),
  "minigamegolf": (data) => (
    <View>
      <Text>Tentativi: {data.tries}</Text>
      <Text>Outcome: {data.outcome}</Text>
    </View>
  ),
  "minigamememo": (data) => (
    <View>
      <Text>Round massimo: {data.maxRound}</Text>
    </View>
  ),
  "minigameTorre": (data) => (
    <View>
      <Text>Gioco dimmerda</Text>
    </View>
  ),
  "minigameLigth": (data) => (
    <View>
      <Text>AVG Reaction Time: {data.reactionTime}s</Text>
    </View>
  ),
  "holdsteady": (data) => (
    <View>
      <Text>Numero di round: {data.targetRounds}</Text>
      {data.results.map((res: {round: number; reactionTime: number; holdDuration: number; result: string }) => (
        <Text key={res.round}>
          Round {res.round}: RT {res.reactionTime} ms | Hold {res.holdDuration} ms | {res.result}
        </Text>
      ))}
    </View>
  ),
  "final": (results: Record<string, any>) => {
  let passedChecks = 0;
  let totalChecks = 0;

  const check = (condition: boolean) => {
    totalChecks++;
    if (condition) passedChecks++;
  };

  // 🏌️‍♂️ Golf: max 2 tries
  if (results.minigamegolf?.tries !== undefined) {
    check(results.minigamegolf.tries <= 2);
  }

  // 🍺 Conta: massimo 1 errore su 3 categorie
  if (results.minigameConta) {
    const errCount =
      (results.minigameConta.beers.user !== results.minigameConta.beers.correct ? 1 : 0) +
      (results.minigameConta.water.user !== results.minigameConta.water.correct ? 1 : 0) +
      (results.minigameConta.food.user !== results.minigameConta.food.correct ? 1 : 0);
    check(errCount <= 1);
  }

  // ⚡ Reaction Game: minigame1
  if (results.minigame1) {
    const correct = results.minigame1.correct || 0;
    const attempts = results.minigame1.attempts || 1;
    const avgTime = results.minigame1.avgTime || 99;
    const accuracy = correct / attempts;
    check(avgTime <= 1.0 && accuracy >= 0.7);
  }

  // 🧘 Equilibrio: minigame2
  if (results.minigame2?.balanceTime !== undefined) {
    check(results.minigame2.balanceTime > 5);
  }

  // 🧠 Memoria: minigamememo
  if (results.minigamememo?.maxRound !== undefined) {
    check(results.minigamememo.maxRound >= 4);
  }

  // ⚡ Riflessi: minigameLigth
  if (results.minigameLigth?.reactionTime !== undefined) {
    check(results.minigameLigth.reactionTime <= 0.6);
  }

  // 🎯 HoldSteady: almeno 70% successi
  if (results.holdsteady?.results) {
    const totalRounds = results.holdsteady.results.length;
    const successCount = results.holdsteady.results.filter(
      (r: any) => r.result?.toLowerCase() === 'success'
    ).length;
    check((successCount / totalRounds) >= 0.7);
  }

  const stabilityPercent = totalChecks ? (passedChecks / totalChecks) * 100 : 0;
  const stabilityLabel = stabilityPercent >= 80
    ? 'Stabile'
    : stabilityPercent >= 50
    ? 'Variabile'
    : 'Instabile';

  return (
    <View>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
        🧠 Riepilogo Finale
      </Text>
      <Text>🔍 Stabilità calcolata: {stabilityPercent.toFixed(1)}%</Text>
      <Text>📊 Classificazione: {stabilityLabel}</Text>
      <Text style={{ marginTop: 10 }}>Giochi valutati: {totalChecks}</Text>

    <Image
      source={badgeImages[stabilityLabel]}
      style={{ width: 150, height: 150, alignSelf: 'center', marginTop: 20 }}
      resizeMode="contain"
    />
    </View>
  );
}

};
