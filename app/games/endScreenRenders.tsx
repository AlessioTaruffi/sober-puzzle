// endScreenRenderers.ts
import React from 'react';
import { Text, View } from 'react-native';


export type GameSpecificData = Record<string, any>;

type Renderer = (data: GameSpecificData) => React.ReactElement;



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
};
