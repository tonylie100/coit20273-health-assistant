import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="chatbot"
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="mental-health"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}