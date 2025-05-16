import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function minigame2() {

    const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minigioco 2</Text>
      <Text>Reazione rapida: premi il bottone!</Text>
      <Button title="Torna al menu" onPress={() => router.navigate("/games")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, marginBottom: 10 },
});
