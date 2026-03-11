// app/index.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import { router } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// 👇 use your current IPsconst 
const ENT_URL = "http://10.212.89.153:5001";    // NEW  
const CANCER_URL = "http://10.212.89.153:5002";    // NEW

export default function HealthHubLanding() {
  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Decorative background elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />

        {/* Logo */}
        <View style={styles.logoOuter}>
          <View style={styles.logoCircle}>
            <View style={styles.logoInnerGlow} />
            <View style={styles.logoInnerCircle} />
            <Text style={styles.logoText}>SS</Text>
          </View>
        </View>

        {/* Title */}
        <View style={styles.headerContainer}>
          <Text style={styles.appName}>
            Soul<Text style={styles.appNameAccent}>Sync</Text>
          </Text>
          <View style={styles.titleUnderline} />
          <Text style={styles.subheading}>
            Integrated Digital Health Hub combining Mental Wellness, ENT care,
            and Cancer support in a single platform.
          </Text>
        </View>

        {/* Mental Health Card */}
        <View style={styles.card}>
          <View style={styles.cardIconBubble}>
            <Text style={styles.cardIcon}>🧠</Text>
          </View>
          <Text style={styles.cardTitle}>Mental Wellness (SoulSync)</Text>
          <Text style={styles.cardDescription}>
            Access mood tracking, journaling, self-help tools, SOS support, and
            an empathetic AI chatbot for day-to-day mental well-being.
          </Text>

          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/login")}
          >
            <Text style={styles.primaryButtonText}>Go to SoulSync App</Text>
          </Pressable>
        </View>

        {/* ENT Card */}
        <View style={styles.card}>
          <View style={[styles.cardIconBubble, styles.entBubble]}>
            <Text style={styles.cardIcon}>🩺</Text>
          </View>
          <Text style={styles.cardTitle}>ENT Health Assistant</Text>
          <Text style={styles.cardDescription}>
            Open the ENT module to manage symptoms, view health alerts, track
            medication, chat with the assistant, and find nearby hospitals.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              if (Platform.OS === "web") {
                // Laptop: open ENT app in same tab
                window.location.href = ENT_URL;
              } else {
                // Mobile app: go to /ent screen (WebView)
                router.push("/ent");
              }
            }}
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
            Launch the cancer care platform for FAQs, awareness content,
            chatbot-based guidance, and supportive information for users and
            caregivers.
          </Text>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              if (Platform.OS === "web") {
                // Laptop: open Cancer app in same tab
                window.location.href = CANCER_URL;
              } else {
                router.push("/cancer");
              }
            }}
          >
            <Text style={styles.secondaryButtonText}>Open Cancer Support</Text>
          </Pressable>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Final Year Project – Enhancing Patient Care Through Digital Health
            Innovation (Mental Health + ENT + Cancer).
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

// ULTRA-PREMIUM HEALTH HUB LANDING STYLES
// Replace your entire StyleSheet.create with this:

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: appSpacing.l,
    paddingBottom: appSpacing.xl * 2,
    paddingTop: appSpacing.l * 1.5,
  },

  // ============ DECORATIVE BACKGROUND ============
  bgCircle1: {
    position: "absolute",
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: "rgba(139,92,246,0.09)",
    top: -140,
    right: -140,
    opacity: 0.7,
  },
  bgCircle2: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(236,72,153,0.07)",
    bottom: -80,
    left: -80,
    opacity: 0.6,
  },
  bgCircle3: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(56,189,248,0.06)",
    top: "45%",
    left: -70,
    opacity: 0.5,
  },

  // ============ LOGO STYLES ============
  logoOuter: {
    alignItems: "center",
    marginBottom: appSpacing.l * 1.5,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.5,
    shadowRadius: 35,
    elevation: 18,
  },
  logoCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    borderWidth: 6,
    borderColor: "rgba(255,255,255,0.95)",
    overflow: "hidden",
  },
  logoInnerGlow: {
    position: "absolute",
    width: 105,
    height: 105,
    borderRadius: 52.5,
    backgroundColor: "rgba(255,255,255,0.22)",
    top: 12,
    left: 12,
  },
  logoInnerCircle: {
    position: "absolute",
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: "rgba(255,255,255,0.18)",
    top: 27.5,
    left: 27.5,
  },
  logoText: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 4,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },

  // ============ HEADER STYLES ============
  headerContainer: {
    alignItems: "center",
    marginBottom: appSpacing.l * 2,
  },
  appName: {
    fontSize: 42,
    fontWeight: "900",
    color: appColors.text,
    textAlign: "center",
    letterSpacing: -1.5,
  },
  appNameAccent: {
    color: "#8B5CF6",
  },
  titleUnderline: {
    width: 110,
    height: 5,
    backgroundColor: "#8B5CF6",
    borderRadius: 2.5,
    marginTop: 10,
    marginBottom: 16,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  subheading: {
    fontSize: 16,
    color: appColors.subtleText,
    textAlign: "center",
    lineHeight: 25,
    paddingHorizontal: appSpacing.l,
    fontWeight: "500",
  },

  // ============ CARD STYLES ============
  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    paddingVertical: appSpacing.l * 1.8,
    paddingHorizontal: appSpacing.l * 1.5,
    marginBottom: appSpacing.l * 1.5,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.18,
    shadowRadius: 35,
    elevation: 15,
    borderWidth: 2.5,
    borderColor: "rgba(139,92,246,0.15)",
    overflow: "hidden",
  },
  cardIconBubble: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139,92,246,0.12)",
    marginBottom: 18,
    borderWidth: 3,
    borderColor: "rgba(139,92,246,0.25)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  entBubble: {
    backgroundColor: "rgba(56,189,248,0.12)",
    borderColor: "rgba(56,189,248,0.3)",
    shadowColor: "#38BDF8",
  },
  cancerBubble: {
    backgroundColor: "rgba(244,114,182,0.12)",
    borderColor: "rgba(244,114,182,0.3)",
    shadowColor: "#F472B6",
  },
  cardIcon: {
    fontSize: 36,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: appColors.text,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 15,
    color: appColors.subtleText,
    lineHeight: 24,
    marginBottom: appSpacing.l * 1.2,
    fontWeight: "500",
  },

  // ============ BUTTON STYLES ============
  primaryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 26,
    paddingVertical: 15,
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 2.5,
    borderColor: "rgba(139,92,246,0.5)",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.8,
  },
  secondaryButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 26,
    paddingVertical: 14,
    borderRadius: 999,
    borderWidth: 2.5,
    borderColor: "#8B5CF6",
    backgroundColor: "rgba(139,92,246,0.08)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  secondaryButtonText: {
    color: "#8B5CF6",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.8,
  },

  // ============ FOOTER STYLES ============
  footer: {
    marginTop: appSpacing.l * 1.5,
    paddingHorizontal: appSpacing.m,
  },
  footerText: {
    fontSize: 13,
    color: appColors.subtleText,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "600",
    opacity: 0.8,
  },
});