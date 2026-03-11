// app/dashboard.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function Dashboard() {
  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top header */}
        <View style={styles.headerContainer}>
          <View style={styles.appBadgeContainer}>
            <Text style={styles.appBadge}>✨ SoulSync</Text>
          </View>
          <Text style={styles.title}>Welcome 👋</Text>
          <Text style={styles.subtitle}>
            This is your main dashboard for your mental well-being assistant.
          </Text>
        </View>

        {/* Highlight card for daily check-in / mood */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightIconContainer}>
            <Text style={styles.highlightIcon}>💜</Text>
          </View>
          
          <View style={styles.highlightBadge}>
            <Text style={styles.highlightBadgeText}>Daily Check-in</Text>
          </View>
          <Text style={styles.highlightTitle}>How are you feeling today?</Text>
          <Text style={styles.highlightSubtitle}>
            Log your mood and keep track of your emotional journey.
          </Text>

          <Pressable
            style={styles.highlightButton}
            onPress={() => router.push("/mood-tracker")}
          >
            <Text style={styles.highlightButtonText}>Start check-in →</Text>
          </Pressable>
        </View>

        {/* Quick Stats Section */}
        <View style={styles.quickStatsContainer}>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatEmoji}>📊</Text>
            <Text style={styles.quickStatLabel}>Your Progress</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatEmoji}>🎯</Text>
            <Text style={styles.quickStatLabel}>Daily Goals</Text>
          </View>
          <View style={styles.quickStatCard}>
            <Text style={styles.quickStatEmoji}>🔥</Text>
            <Text style={styles.quickStatLabel}>Streak Days</Text>
          </View>
        </View>

        {/* Section label */}
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>Your tools</Text>
        </View>

        {/* Feature Cards Grid */}
        <View style={styles.cardsGrid}>
          {/* Mood Tracker card */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.cardIcon}>😉</Text>
            </View>
            <Text style={styles.cardTitle}>Mood Tracker</Text>
            <Text style={styles.cardSubtitle}>Log how you feel each day.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => router.push("/mood-tracker")}
            >
              <Text style={styles.cardButtonText}>Track Mood →</Text>
            </Pressable>
          </View>

          {/* Chatbot card */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#1F2937' }]}>
              <Text style={styles.cardIcon}>🤖</Text>
            </View>
            <Text style={styles.cardTitle}>AI Assistant</Text>
            <Text style={styles.cardSubtitle}>Talk to your support assistant.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#1F2937' }]}
              onPress={() => router.push("/chatbot")}
            >
              <Text style={styles.cardButtonText}>Chat Now →</Text>
            </Pressable>
          </View>

          {/* Journal card */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#10B981' }]}>
              <Text style={styles.cardIcon}>✍️</Text>
            </View>
            <Text style={styles.cardTitle}>Journal</Text>
            <Text style={styles.cardSubtitle}>Write and save your thoughts.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#10B981' }]}
              onPress={() => router.push("/journal")}
            >
              <Text style={styles.cardButtonText}>Start Writing →</Text>
            </Pressable>
          </View>

          {/* Safety Settings / Emergency Contact */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.cardIcon}>🛡️</Text>
            </View>
            <Text style={styles.cardTitle}>Safety Settings</Text>
            <Text style={styles.cardSubtitle}>Add or update your emergency contact.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#F59E0B' }]}
              onPress={() => router.push("/emergency-contact")}
            >
              <Text style={styles.cardButtonText}>Manage Safety →</Text>
            </Pressable>
          </View>

          {/* Self-Help Tools card */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#8B5CF6' }]}>
              <Text style={styles.cardIcon}>🧘‍♀️</Text>
            </View>
            <Text style={styles.cardTitle}>Self-Help Tools</Text>
            <Text style={styles.cardSubtitle}>Breathing, grounding, mindfulness & CBT.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#8B5CF6' }]}
              onPress={() => router.push("/self-help")}
            >
              <Text style={styles.cardButtonText}>Explore Tools →</Text>
            </Pressable>
          </View>

          {/* Analytics card */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#6B7280' }]}>
              <Text style={styles.cardIcon}>📈</Text>
            </View>
            <Text style={styles.cardTitle}>Analytics</Text>
            <Text style={styles.cardSubtitle}>View your mood trends and progress.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#6B7280' }]}
              onPress={() => router.push("/analytics")}
            >
              <Text style={styles.cardButtonText}>View Reports →</Text>
            </Pressable>
          </View>

          {/* Weekly Check-In Report */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#3B82F6' }]}>
              <Text style={styles.cardIcon}>📊</Text>
            </View>
            <Text style={styles.cardTitle}>Weekly Report</Text>
            <Text style={styles.cardSubtitle}>View your 1–5 daily check-in trend.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#3B82F6' }]}
              onPress={() => router.push("/weekly-report")}
            >
              <Text style={styles.cardButtonText}>View Report →</Text>
            </Pressable>
          </View>

          {/* Find Nearby Support */}
          <View style={styles.featureCard}>
            <View style={[styles.iconContainer, { backgroundColor: '#EC4899' }]}>
              <Text style={styles.cardIcon}>🏥</Text>
            </View>
            <Text style={styles.cardTitle}>Find Support</Text>
            <Text style={styles.cardSubtitle}>Locate hospitals & mental health professionals near you.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#EC4899' }]}
              onPress={() => router.push("/find-support")}
            >
              <Text style={styles.cardButtonText}>Find Nearby →</Text>
            </Pressable>
          </View>

          {/* SOS / Emergency */}
          <View style={[styles.featureCard, styles.sosCard]}>
            <View style={[styles.iconContainer, { backgroundColor: '#EF4444' }]}>
              <Text style={styles.cardIcon}>🆘</Text>
            </View>
            <Text style={styles.cardTitle}>SOS / Emergency</Text>
            <Text style={styles.cardSubtitle}>Instant grounding and calming techniques.</Text>
            <Pressable
              style={[styles.cardButton, { backgroundColor: '#EF4444' }]}
              onPress={() => router.push("/sos")}
            >
              <Text style={styles.cardButtonText}>Get Help Now →</Text>
            </Pressable>
          </View>
        </View>

        {/* Rewards Button */}
        <View style={styles.rewardsButtonWrapper}>
          <Pressable
            style={styles.rewardsButton}
            onPress={() => router.push("/rewards")}
          >
            <Text style={styles.rewardsIcon}>🎁</Text>
            <Text style={styles.rewardsText}>View Rewards</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: appSpacing.l * 3,
  },

  headerContainer: {
    marginBottom: appSpacing.l * 1.5,
    marginTop: appSpacing.m,
  },
  appBadgeContainer: {
    alignSelf: "flex-start",
    marginBottom: appSpacing.l,
  },
  appBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: "600",
    color: "#8B5CF6",
    backgroundColor: "rgba(139,92,246,0.1)",
    overflow: "hidden",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: appColors.text,
    marginBottom: appSpacing.m,
  },
  subtitle: {
    fontSize: 15,
    color: appColors.subtleText,
    lineHeight: 22,
  },

  highlightCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l * 1.5,
    marginBottom: appSpacing.l * 1.2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  highlightIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  highlightIcon: {
    fontSize: 32,
  },
  highlightBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  highlightBadgeText: {
    color: "#8B5CF6",
    fontSize: 12,
    fontWeight: "600",
  },
  highlightTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  highlightSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  highlightButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#8B5CF6",
  },
  highlightButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  // Quick Stats Section
  quickStatsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: appSpacing.l * 1.5,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: appSpacing.m,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  quickStatEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: appColors.text,
    textAlign: "center",
  },

  sectionTitleContainer: {
    marginBottom: appSpacing.l,
    marginTop: appSpacing.s,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: appColors.text,
  },

  // Feature Cards Grid
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    justifyContent: "space-between",
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    width: "48%",
    minHeight: 240,
  },
  sosCard: {
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 20,
  },
  cardButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  cardButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  // Rewards Button
  rewardsButtonWrapper: {
    marginTop: appSpacing.l,
    marginBottom: appSpacing.l,
  },
  rewardsButton: {
    backgroundColor: "#F59E0B",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  rewardsIcon: {
    fontSize: 24,
  },
  rewardsText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});