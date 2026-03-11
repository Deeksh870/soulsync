// components/AppCard.tsx
import { appColors, appSpacing } from "@/constants/theme";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type AppCardProps = {
  title: string;
  subtitle?: string;
  onPress?: () => void;
};

export default function AppCard({ title, subtitle, onPress }: AppCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.9 },
      ]}
      onPress={onPress}
    >
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    paddingVertical: appSpacing.m,
    paddingHorizontal: appSpacing.m,
    marginBottom: appSpacing.s,
    // soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  textWrapper: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: appColors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: appColors.subtleText,
  },
  chevron: {
    fontSize: 24,
    color: appColors.subtleText,
  },
});
