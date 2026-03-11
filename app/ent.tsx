// app/ent.tsx
import ScreenContainer from "@/components/ScreenContainer";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { WebView } from "react-native-webview";

const ENT_URL = "http://192.168.1.9:5001";

export default function ENTScreen() {
  // 👉 CASE 1: Running on laptop (web)
  if (Platform.OS === "web") {
    useEffect(() => {
      // Redirect the browser directly to ENT site
      window.location.href = ENT_URL;
    }, []);

    return (
      <ScreenContainer>
        <View style={styles.center}>
          <Text style={styles.title}>Opening ENT module…</Text>
          <Text style={styles.subtitle}>
            You’ll be redirected to the ENT web app in a moment.
            {"\n"}
            If nothing happens, open this link manually:
          </Text>
          <Text style={styles.link}>{ENT_URL}</Text>
        </View>
      </ScreenContainer>
    );
  }

  // 👉 CASE 2: Running on phone (Android / iOS) – use WebView
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <WebView
          source={{ uri: ENT_URL }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loader}>
              <ActivityIndicator size="large" />
            </View>
          )}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});