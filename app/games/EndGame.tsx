// EndScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { GameScoreProvider, useGameScore } from './GameScoreContext'; // path corretto al tuo context
import { renderers } from './endScreenRenders'; // path corretto
import { gamesList } from './gamesList';

type Props = {
  gameName: string;
  nextGameRoute: string;
};

const defaultRenderer = (data: any) => (
  <View>
    {Object.entries(data).map(([key, value]) => (
      <Text key={key}>{key}: {JSON.stringify(value)}</Text>
    ))}
  </View>
);  

export default function EndScreen(){
  const params = useLocalSearchParams();
  const gameName = typeof params.gameName === 'string' ? params.gameName : '';

  const nextGameRoute = gamesList[gamesList.indexOf(`/games/${gameName}`) + 1] || '/'; // Default to home if no next game


  const { results } = useGameScore();
  const router = useRouter();

  const data = results[gameName];
  const Renderer = renderers[gameName];
  console.log('data:', data);

  return (
    <GameScoreProvider>
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 10 }}>
        Gioco completato: {gameName}
      </Text>

      <View style={{ marginBottom: 20 }}>
        {data
          ? Renderer
            ? Renderer(data)
            : defaultRenderer(data)
          : <Text>Nessun dato disponibile.</Text>}
      </View>

      <TouchableOpacity
        style={{
          backgroundColor: "#007bff",
          padding: 10,
          borderRadius: 8,
        }}
        onPress={() => router.push(nextGameRoute as any)}
      >
        <Text style={{ color: "white", textAlign: "center" }}>Prossimo gioco</Text>
      </TouchableOpacity>
    </View>
    </GameScoreProvider>
  );
};
