// endScreenRenderers.ts
import React from 'react';
import { Text, View } from 'react-native';

export type GameSpecificData = Record<string, any>;

type Renderer = (data: GameSpecificData) => React.ReactElement;

export const renderers: Record<string, Renderer> = {
  "minigame-conta": (data) => (
    <View>
      <Text>🍺 Birre viste: {data.beers.user} / corrette: {data.beers.correct}</Text>
      <Text>💧 Acque viste: {data.water.user} / corrette: {data.water.correct}</Text>
      <Text>🍽️ Cibo visto: {data.food.user} / corrette: {data.food.correct}</Text>
    </View>
  ),
};
