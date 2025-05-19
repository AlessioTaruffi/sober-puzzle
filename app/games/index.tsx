//lista dei minigiochi
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function GamesHome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scegli un minigioco:</Text>

      <Link href="/games/minigame1" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco 1</Text>
        </Pressable>
      </Link>

      <Link href="/games/minigame2" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco 2</Text>
        </Pressable>
      </Link>

      <Link href="/games/minigamegolf" asChild>
        <Pressable style={styles.button}>
          <Text style={styles.buttonText}>Minigioco golf</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  button: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
  },
  buttonText: { color: "white", fontSize: 18 },
});
