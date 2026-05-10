import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { initializeIAP } from "@/services/iap";
import {
  requestNotificationPermission,
  setupNotificationTapHandler,
} from "@/utils/notifications";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="loan" options={{ presentation: "modal" }} />
      <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="friends" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="premium" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="settings" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="report" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="blacklist" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="calculator" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="character" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="faq" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="karma-history" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="agreement" options={{ animation: "slide_from_right" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Keep a ref to the notification tap-handler cleanup function
  const cleanupTapHandler = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Initialize RevenueCat IAP abstraction (no-op in test mode until keys are set)
    initializeIAP();

    // Request push notification permission on first launch
    requestNotificationPermission();

    // Subscribe to notification taps so the app navigates to the right loan
    cleanupTapHandler.current = setupNotificationTapHandler();

    return () => {
      cleanupTapHandler.current?.();
    };
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
