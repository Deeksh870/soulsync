// components/ScreenContainer.tsx
import { appColors, appSpacing } from "@/constants/theme";
import React, { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenContainerProps = {
  children: ReactNode;
};

export default function ScreenContainer({ children }: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>SoulSync</Text>
      </View>

      {/* Screen content */}
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  header: {
    paddingVertical: appSpacing.s,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
    backgroundColor: appColors.card,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: appColors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: appSpacing.m,
    paddingTop: appSpacing.m,
  },
});
