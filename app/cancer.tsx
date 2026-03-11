// app/cancer.tsx
import ScreenContainer from "@/components/ScreenContainer";
import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

// 👇 IMPORTANT: this must match your current cancer backend URL
// from your log: * Running on http://192.168.1.9:5002
const CANCER_URL = "http://192.168.1.9:5002";

export default function CancerScreen() {
  useEffect(() => {
    // On web/laptop, redirect this tab to the Cancer Care Platform
    if (typeof window !== "undefined") {
      window.location.href = CANCER_URL;
    }
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.center}>
        <Text style={styles.title}>Opening Cancer Care Platform…</Text>
        <Text style={styles.subtitle}>
          You&apos;ll be redirected to the Cancer support module.
          {"\n"}
          If it doesn&apos;t open automatically, copy and paste this link
          in your browser:
        </Text>
        <Text style={styles.link}>{CANCER_URL}</Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
