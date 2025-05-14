import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";


/*
    This is the main layout for the app. It uses the Tabs component from expo-router to create a tabbed navigation interface.
    The screenOptions prop is used to customize the appearance of the tab bar, including colors and styles.
    The two tabs are defined using the Tabs.Screen component, with each tab having its own name and icon.
    The icons are conditionally rendered based on whether the tab is focused or not.
    */
export default function TabLayout() {
  return(
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
        <Tabs.Screen name="index" options={{ 
            title: "Play",
            tabBarIcon: ({color, focused}) => (
                <Ionicons name={focused ? "play-circle" : "play-circle-outline"} size={24} color={color} />
            ),
            }} />
        <Tabs.Screen name="About" options={{ 
            title: "About",
            tabBarIcon: ({color, focused}) => (
                <Ionicons name={focused ? "add-circle" : "add-circle-outline"} size={24} color={color} />
            ),
            }} />
    </Tabs>
  );
}