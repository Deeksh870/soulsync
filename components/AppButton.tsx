// components/AppButton.tsx
import { appColors, appRadius, appSpacing } from "@/constants/theme";
import React from "react";
import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from "react-native";

type AppButtonProps = {
  title: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

export default function AppButton({ title, onPress, style }: AppButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text style={styles.label}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: appSpacing.l,
    paddingVertical: appSpacing.m,
    borderRadius: appRadius.m,
    backgroundColor: appColors.primary,
    marginVertical: appSpacing.s,
    alignSelf: "stretch",
  },
  pressed: {
    opacity: 0.8,
  },
  label: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
});
