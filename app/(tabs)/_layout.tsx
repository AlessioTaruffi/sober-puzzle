import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";
export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: "#fff",
          tabBarInactiveTintColor: "#fff",
          tabBarStyle: {
            backgroundColor: "#25292e",
            borderTopWidth: 0,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarIconStyle: {
            marginBottom: -3,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "TestHaptic",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "play-circle" : "play-circle-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="testgyro"
          options={{
            title: "Test Gyro",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "add-circle" : "add-circle-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

    </>
  );
}
