import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Profile' }}
      />

      <Stack.Screen
        name="goals"
        options={{ title: 'Health Goals' }}
      />

      <Stack.Screen
        name="dashboard"
        options={{ title: 'Health Dashboard' }}
      />
    </Stack>
  );
}