import { Slot } from 'expo-router';
import { GameScoreProvider } from './games/GameScoreContext';


/*
Vecchio layout per implementare i tab
Al momento rimossi, implementabili in seguito se necessario 

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}
*/

export default function RootLayout() {
  return (
    <GameScoreProvider>
      <Slot />
    </GameScoreProvider>
  );
}

