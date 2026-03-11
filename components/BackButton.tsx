// components/BackButton.tsx
import { goBackSafe } from "@/utils/navigation";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text } from "react-native";

export default function BackButton() {
  return (
    <Pressable
      onPress={goBackSafe}
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: 0.7, transform: [{ scale: 0.96 }] },
      ]}
    >
      <ArrowLeft size={22} color="#444" />
      <Text style={styles.text}>Back</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: "#444",
    fontWeight: "600",
  },
});
