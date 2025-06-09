// endScreenRenderers.ts
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
export type GameSpecificData = Record<string, any>;

type Renderer = (data: GameSpecificData) => React.ReactElement;
const badgeImages = {
  Stabile: require('../../assets/images/Mentestabile.png'),
  Variabile: require('../../assets/images/Variabile.png'),
  Instabile: require('../../assets/images/Instabile.png'),
};


export const renderers: Record<string, Renderer> = {
  "minigameConta": (data) => (
  <View style={styles.container}>
    <Text style={styles.title}>🍽️ Conta Oggetti</Text>
    <View style={styles.metricRow}>
      <Text style={styles.label}>Birre viste:</Text>
      <Text style={styles.value}>{data.beers.user} / {data.beers.correct}</Text>
    </View>
    <View style={styles.metricRow}>
      <Text style={styles.label}>Acque viste:</Text>
      <Text style={styles.value}>{data.water.user} / {data.water.correct}</Text>
    </View>
    <View style={styles.metricRow}>
      <Text style={styles.label}>Cibi visti:</Text>
      <Text style={styles.value}>{data.food.user} / {data.food.correct}</Text>
    </View>
    <Text style={[styles.feedback, {
      color: (data.beers.user === data.beers.correct &&
              data.water.user === data.water.correct &&
              data.food.user === data.food.correct) ? 'green' : 'red'
    }]}>
      {(data.beers.user === data.beers.correct &&
        data.water.user === data.water.correct &&
        data.food.user === data.food.correct)
        ? 'Tutto corretto! 🎉'
        : 'Qualcosa non torna... 😕'}
    </Text>
  </View>
),

"minigame1": (data) => (
  <View style={styles.container}>
    <Text style={styles.title}>⚡ Reazione</Text>
    <View style={styles.metricRow}><Text style={styles.label}>Tentativi:</Text><Text style={styles.value}>{data.attempts}</Text></View>
    <View style={styles.metricRow}><Text style={styles.label}>Corrette:</Text><Text style={styles.value}>{data.correct}</Text></View>
    <View style={styles.metricRow}><Text style={styles.label}>Errate:</Text><Text style={styles.value}>{data.wrong}</Text></View>
    <View style={styles.metricRow}><Text style={styles.label}>Tempo medio:</Text><Text style={styles.value}>{data.avgTime}s</Text></View>
  </View>
),

"minigame2": (data) => (
  <View style={styles.container}>
    <Text style={styles.title}>🧘 Equilibrio</Text>
    <View style={styles.metricRow}><Text style={styles.label}>Tempo equilibrio:</Text><Text style={styles.value}>{data.balanceTime}s</Text></View>
  </View>
),

"minigamegolf": (data) => (
  <View style={styles.container}>
    <Text style={styles.title}>🏌️ Mini Golf</Text>
    <View style={styles.metricRow}><Text style={styles.label}>Tentativi:</Text><Text style={styles.value}>{data.tries}</Text></View>
    <View style={styles.metricRow}><Text style={styles.label}>Esito:</Text><Text style={styles.value}>{data.outcome}</Text></View>
  </View>
),

"minigamememo": (data) => (
  <View style={styles.container}>
    <Text style={styles.title}>🧠 Memoria</Text>
    <View style={styles.metricRow}><Text style={styles.label}>Round massimo:</Text><Text style={styles.value}>{data.maxRound}</Text></View>
  </View>
),

"minigameTorre": () => (
  <View style={styles.container}>
    <Text style={styles.title}>🧱 Torre</Text>
    <Text style={styles.feedback}>Gioco in fase sperimentale</Text>
  </View>
),

"minigameLigth": (data) => (
  <View style={styles.container}>
    <Text style={styles.title}>⚡ Riflessi</Text>
    <View style={styles.metricRow}><Text style={styles.label}>Tempo medio:</Text><Text style={styles.value}>{data.reactionTime}s</Text></View>
  </View>
),

"holdsteady": (data) => (
  <View style={styles.container}>
    <Text style={styles.title}>🎯 Hold Steady</Text>
    <View style={styles.metricRow}><Text style={styles.label}>Round previsti:</Text><Text style={styles.value}>{data.targetRounds}</Text></View>
    {data.results.map((res: any) => (
      <View key={res.round} style={styles.metricRow}>
        <Text style={styles.label}>Round {res.round}:</Text>
        <Text style={styles.value}>RT {res.reactionTime} ms | Hold {res.holdDuration} ms | {res.result}</Text>
      </View>
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

  const badgePhrase = {
    Stabile: '🧊 Mente lucida e stabile!',
    Variabile: '🌀 Alcuni segnali di variabilità',
    Instabile: '🔥 Instabilità significativa',
  }[stabilityLabel];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧠 Riepilogo Finale</Text>
      
      <View style={styles.metricRow}>
        <Text style={styles.label}>🔍 Stabilità calcolata:</Text>
        <Text style={styles.value}>{stabilityPercent.toFixed(1)}%</Text>
      </View>

      <View style={styles.metricRow}>
        <Text style={styles.label}>📊 Classificazione:</Text>
        <Text style={styles.value}>{stabilityLabel}</Text>
      </View>

      <Text style={styles.subtext}>Giochi valutati: {totalChecks}</Text>

      <Image
        source={badgeImages[stabilityLabel]}
        style={styles.badge}
        resizeMode="contain"
      />

      <Text style={styles.badgeText}>{badgePhrase}</Text>
    </View>
  );
}
};
export const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginVertical: 12,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2c2c2e',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e6e6',
  },
  label: {
    fontSize: 16,
    color: '#6b6b6b',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#1c1c1e',
    fontWeight: '600',
  },
  feedback: {
    fontSize: 16,
    marginTop: 14,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  badge: {
    width: 160,
    height: 160,
    marginTop: 24,
    alignSelf: 'center',
  },
  badgeText: {
    marginTop: 12,
    fontSize: 16,
    fontStyle: 'italic',
    color: '#444',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  highlight: {
    color: '#007AFF', // iOS Material Blue
    fontWeight: 'bold',
  },
  subtext: {
    marginTop: 12,
    fontSize: 14,
    color: '#888',
  },
});

