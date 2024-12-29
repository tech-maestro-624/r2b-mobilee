import "../tamagui-web.css";
import { useEffect } from "react";
import { StatusBar, useColorScheme } from "react-native";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { Provider } from "./Provider";
import { useTheme } from "tamagui";
import { OrderProvider } from "./context/orderContext";
import { AuthProvider } from "./context/AuthContext";
import { LocationProvider } from "./context/locationContext";

// Catch any errors thrown by the Layout component.
export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)", // Start on (tabs)
};

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [interLoaded, interError] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  useEffect(() => {
    if (interLoaded || interError) {
      // Hide the splash screen after fonts are ready
      SplashScreen.hideAsync();
    }
  }, [interLoaded, interError]);

  if (!interLoaded && !interError) {
    return null;
  }

  return (
    <Providers>
      <LocationProvider>
        <AuthProvider>
          <OrderProvider>
            <RootLayoutNav />
          </OrderProvider>
        </AuthProvider>
      </LocationProvider>
    </Providers>
  );
}

const Providers = ({ children }: { children: React.ReactNode }) => {
  return <Provider>{children}</Provider>;
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const theme = useTheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack
        screenOptions={{
          // This applies to all screens
          headerShown: true,
          animation: "slide_from_right",
          gestureEnabled: true,
          gestureDirection: "horizontal",
          contentStyle: {
            backgroundColor: theme.background.val,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: "Tamagui + Expo",
          }}
        />
      </Stack>
    </ThemeProvider>
  );
}
