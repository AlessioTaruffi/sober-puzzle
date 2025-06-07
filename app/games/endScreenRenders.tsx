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
      <Text>Tempo di reazione medio: {data.averageReactionTime} ms</Text>
      <Text>Colore attivo: {data.activeColor}</Text>
      <Text>Colore corretto: {data.correctColor}</Text>
      <Text>Colore sbagliato: {data.wrongColor}</Text>
      <Text>Numero di click: {data.clickCount}</Text>
    </View>
  ),
};
