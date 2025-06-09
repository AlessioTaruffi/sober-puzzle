// EndScreen.tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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

  const data = gameName === "final" ? results : results[gameName];
  const Renderer = renderers[gameName];
  console.log('data:', data);
  const PressText = nextGameRoute === "final" ? "Fine del gioco" : "Prossimo gioco";

  return (
  <GameScoreProvider>
    <View style={styles.container}>
      <Text style={styles.headerText}>
        Gioco completato: {gameName}
      </Text>

      <View style={styles.contentBox}>
        {data
          ? Renderer
            ? Renderer(data)
            : defaultRenderer(data)
          : <Text style={styles.noDataText}>Nessun dato disponibile.</Text>}
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (nextGameRoute === "final") {
            router.push({ pathname: "./EndGame", params: { gameName: "final" } });
          } else if (gameName === "final") {
            router.push('/');
          } else {
            router.push(nextGameRoute as any);
          }
        }}
      >
        <Text style={styles.buttonText}>{PressText}</Text>
      </TouchableOpacity>
    </View>
  </GameScoreProvider>
);

};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
    padding: 24,
  },
  headerText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 20,
  },
  contentBox: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 30,
  },
  noDataText: {
    fontSize: 16,
    color: '#8e8e93',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
