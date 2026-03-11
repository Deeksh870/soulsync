// app/self-help.tsx
import AppCard from "@/components/AppCard";
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

export default function ProfileScreen() {
  useProtectedRoute();
  return (
    <ScreenContainer>
      <View style={styles.screenBackground}>
        {/* Decorative background elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />
        <View style={styles.backgroundCircle4} />
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.headerWrapper}>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeGlow} />
              <Text style={styles.badge}>🧰 Calming toolbox</Text>
            </View>
            <Text style={styles.title}>Self-Help Tools</Text>
            <View style={styles.titleIconContainer}>
              <View style={styles.meditationIcon}>
                <Text style={styles.meditationEmoji}>🧘‍♀️</Text>
              </View>
            </View>
            <View style={styles.subtitleContainer}>
              <View style={styles.accentBar} />
              <Text style={styles.subtitle}>
                Simple guided tools to help you breathe, ground, reflect and
                gently shift your thoughts when things feel heavy.
              </Text>
            </View>
          </View>

          {/* Body tools */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTopGradient} />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Text style={styles.sectionIcon}>💆‍♀️</Text>
              </View>
              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionLabel}>Calm your body</Text>
                <Text style={styles.sectionDescription}>
                  Use these when you feel anxious or overwhelmed physically.
                </Text>
              </View>
            </View>

            <View style={styles.cardsContainer}>
              <AppCard
                title="Breathing Exercise 🌬️"
                subtitle="Slow, guided breaths to reduce anxiety."
                onPress={() => router.push("/breathing")}
              />

              <AppCard
                title="Grounding (5-4-3-2-1) 🌍"
                subtitle="Use your senses to return to the present."
                onPress={() => router.push("/grounding")}
              />

              <AppCard
                title="Mindfulness Meditation 🧘"
                subtitle="Short guided practice to pause and observe."
                onPress={() => router.push("/mindfulness")}
              />
            </View>
            
            <View style={styles.sectionDecor} />
          </View>

          {/* Mind tools */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionTopGradient2} />
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle2}>
                <Text style={styles.sectionIcon}>🧠</Text>
              </View>
              <View style={styles.sectionTextContainer}>
                <Text style={styles.sectionLabel}>Calm your mind</Text>
                <Text style={styles.sectionDescription}>
                  Use these tools to work with thoughts and shift focus.
                </Text>
              </View>
            </View>

            <View style={styles.cardsContainer}>
              <AppCard
                title="CBT Worksheet 📝"
                subtitle="Challenge unhelpful thoughts using CBT steps."
                onPress={() => router.push("/cbt")}
              />

              <AppCard
                title="Gratitude Journal 🌈"
                subtitle="Write 3 small good things about today."
                onPress={() => router.push("/gratitude")}
              />
            </View>
            
            <View style={styles.sectionDecor2} />
          </View>

          {/* Quick stats card */}
          <View style={styles.statsCard}>
            <View style={styles.statsGradient} />
            <View style={styles.statsHeader}>
              <View style={styles.statsIconCircle}>
                <Text style={styles.statsIcon}>✨</Text>
              </View>
              <Text style={styles.statsTitle}>Your wellness journey</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Tools</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>Categories</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>∞</Text>
                <Text style={styles.statLabel}>Practice</Text>
              </View>
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    position: "relative",
  },

  // Decorative background elements
  backgroundCircle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(56, 189, 248, 0.06)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 300,
    left: -70,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
  backgroundCircle3: {
    position: "absolute",
    bottom: 200,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(249, 115, 22, 0.04)",
  },
  backgroundCircle4: {
    position: "absolute",
    top: 600,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(16, 185, 129, 0.05)",
  },

  scrollContent: {
    paddingBottom: appSpacing.l * 2,
    zIndex: 1,
  },

  headerWrapper: {
    marginBottom: appSpacing.xl,
  },
  badgeContainer: {
    position: "relative",
    alignSelf: "flex-start",
    marginBottom: appSpacing.s,
  },
  badgeGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "rgba(56, 189, 248, 0.3)",
    opacity: 0.5,
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: appColors.text,
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  titleIconContainer: {
    marginBottom: 12,
  },
  meditationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  meditationEmoji: {
    fontSize: 32,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accentBar: {
    width: 4,
    minHeight: "100%",
    backgroundColor: "#8B5CF6",
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 21,
  },

  sectionCard: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.2)",
    marginBottom: appSpacing.l,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    overflow: "hidden",
  },
  sectionTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#38BDF8",
  },
  sectionTopGradient2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#F97316",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: appSpacing.m,
  },
  sectionIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  sectionIconCircle2: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  sectionIcon: {
    fontSize: 28,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionLabel: {
    fontSize: 20,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 13,
    color: appColors.subtleText,
    lineHeight: 19,
  },
  cardsContainer: {
    gap: appSpacing.s,
  },
  sectionDecor: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(56, 189, 248, 0.08)",
  },
  sectionDecor2: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(249, 115, 22, 0.08)",
  },

  statsCard: {
    position: "relative",
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.25)",
    marginBottom: appSpacing.m,
    overflow: "hidden",
  },
  statsGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#38BDF8",
  },
  statsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  statsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  statsIcon: {
    fontSize: 22,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0C4A6E",
  },
  statsGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: appSpacing.m,
    borderWidth: 1,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0284C7",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
  },
});