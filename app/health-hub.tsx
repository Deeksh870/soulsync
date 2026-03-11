// app/health-hub.tsx
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

export default function HealthHubScreen() {
  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.heading}>Integrated Health Hub</Text>
          <Text style={styles.subheading}>
            Access mental wellness, ENT assistance, and cancer support from a
            single unified platform.
          </Text>
        </View>

        {/* Mental Health Card */}
        <View style={styles.card}>
          <View style={styles.cardIconBubble}>
            <Text style={styles.cardIcon}>🧠</Text>
          </View>
          <Text style={styles.cardTitle}>Mental Wellness (SoulSync)</Text>
          <Text style={styles.cardDescription}>
            Track your mood, journal your thoughts, access coping tools,
            and get support through the empathetic AI chatbot and SOS features.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/dashboard")}
          >
            <Text style={styles.primaryButtonText}>Go to SoulSync Dashboard</Text>
          </Pressable>
        </View>

        {/* ENT Card */}
        <View style={styles.card}>
          <View style={[styles.cardIconBubble, styles.entBubble]}>
            <Text style={styles.cardIcon}>🩺</Text>
          </View>
          <Text style={styles.cardTitle}>ENT Health Assistant</Text>
          <Text style={styles.cardDescription}>
            Manage ENT-related issues with symptom tracking, medication
            manager, health alerts, AI chat, and a hospital locator linked
            to the ENT web platform.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/ent")}
          >
            <Text style={styles.secondaryButtonText}>Open ENT Module</Text>
          </Pressable>
        </View>

        {/* Cancer Card */}
        <View style={styles.card}>
          <View style={[styles.cardIconBubble, styles.cancerBubble]}>
            <Text style={styles.cardIcon}>🎗</Text>
          </View>
          <Text style={styles.cardTitle}>Cancer Support Module</Text>
          <Text style={styles.cardDescription}>
            Access the cancer care platform for FAQs, awareness, chatbot-based
            guidance, and supportive tools designed for early information and
            better understanding.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/cancer")}
          >
            <Text style={styles.secondaryButtonText}>Open Cancer Support</Text>
          </Pressable>
        </View>

        {/* Summary / Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            This integrated hub showcases how mental health, ENT care, and
            cancer support can work together to enhance patient care through
            digital health innovation.
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: appSpacing.l,
    paddingBottom: appSpacing.xl,
  },
  headerContainer: {
    marginTop: appSpacing.l,
    marginBottom: appSpacing.l,
  },
  heading: {
    fontSize: 26,
    fontWeight: "800",
    color: appColors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subheading: {
    marginTop: 8,
    fontSize: 14,
    color: appColors.subtleText,
    textAlign: "center",
    lineHeight: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: appSpacing.l,
    paddingHorizontal: appSpacing.m,
    marginBottom: appSpacing.l,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.12)",
  },
  cardIconBubble: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139,92,246,0.08)",
    marginBottom: 10,
  },
  entBubble: {
    backgroundColor: "rgba(56,189,248,0.08)",
  },
  cancerBubble: {
    backgroundColor: "rgba(244,114,182,0.1)",
  },
  cardIcon: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 20,
    marginBottom: appSpacing.m,
  },

  primaryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  secondaryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "#8B5CF6",
    backgroundColor: "rgba(139,92,246,0.03)",
  },
  secondaryButtonText: {
    color: "#8B5CF6",
    fontSize: 14,
    fontWeight: "700",
  },

  footer: {
    marginTop: appSpacing.m,
  },
  footerText: {
    fontSize: 13,
    color: appColors.subtleText,
    textAlign: "center",
    lineHeight: 19,
  },
});
