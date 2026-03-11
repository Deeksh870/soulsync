// app/find-support.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import * as Location from "expo-location";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FindSupportScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenMaps = async () => {
    try {
      setError(null);
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission was denied. Please enable it in Settings.");
        setLoading(false);
        return;
      }

      // just to ensure GPS actually works
      await Location.getCurrentPositionAsync({});

      const url = "https://www.google.com/maps/search/psychiatrist+near+me";
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        setError("Could not open Google Maps on this device.");
        setLoading(false);
        return;
      }

      await Linking.openURL(url);
      setLoading(false);
    } catch (err: any) {
      console.log("Error while opening maps:", err);
      setError("Something went wrong while opening Google Maps.");
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Decorative background elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />

        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeGlow} />
            <Text style={styles.badge}>💙 Support & care</Text>
          </View>
          <Text style={styles.title}>Find Nearby Support</Text>
          <View style={styles.titleIconContainer}>
            <View style={styles.titleIconCircle}>
              <Text style={styles.titleIcon}>🏥</Text>
            </View>
          </View>
          <View style={styles.subtitleContainer}>
            <View style={styles.accentBar} />
            <Text style={styles.subtitle}>
              When things feel heavy, it's okay to ask for help. SoulSync can guide
              you to nearby hospitals and mental health professionals so you don't
              have to search alone.
            </Text>
          </View>
        </View>

        {/* Highlight card (enhanced gradient version) */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightGradientOverlay} />
          <View style={styles.highlightContent}>
            <View style={styles.highlightIconCircle}>
              <Text style={styles.highlightIcon}>✨</Text>
            </View>
            <View style={styles.highlightTextWrap}>
              <Text style={styles.highlightTitle}>Reach out when you're ready</Text>
              <Text style={styles.highlightSubtitle}>
                We'll quickly open Google Maps so you can see psychiatrists and
                hospitals near you, with ratings and reviews.
              </Text>
            </View>
            <View style={styles.highlightPill}>
              <View style={styles.pillDot} />
              <Text style={styles.highlightPillText}>Get support</Text>
            </View>
          </View>
        </View>

        {/* Info grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoChip}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>⭐</Text>
            </View>
            <Text style={styles.infoChipTitle}>Real reviews</Text>
            <Text style={styles.infoChipText}>
              Read what others have shared about their experience before you visit.
            </Text>
            <View style={styles.infoAccent} />
          </View>
          <View style={styles.infoChip}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIcon}>🕐</Text>
            </View>
            <Text style={styles.infoChipTitle}>Distance & timing</Text>
            <Text style={styles.infoChipText}>
              See how far each place is, check opening hours, and plan calmly.
            </Text>
            <View style={styles.infoAccent} />
          </View>
        </View>

        {/* How it works section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}>
              <Text style={styles.sectionIconText}>💡</Text>
            </View>
            <Text style={styles.sectionTitle}>How SoulSync helps you</Text>
          </View>
          <View style={styles.pointsContainer}>
            <View style={styles.pointRow}>
              <View style={styles.pointDot} />
              <Text style={styles.sectionPoint}>
                Opens Google Maps with "psychiatrist / hospital near me" already
                searched.
              </Text>
            </View>
            <View style={styles.pointRow}>
              <View style={styles.pointDot} />
              <Text style={styles.sectionPoint}>
                Lets you compare options based on reviews, distance and ratings.
              </Text>
            </View>
            <View style={styles.pointRow}>
              <View style={styles.pointDot} />
              <Text style={styles.sectionPoint}>
                You decide when to call, visit or save a place for later.
              </Text>
            </View>
          </View>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        {/* Main button */}
        <TouchableOpacity
          style={[styles.mainButton, loading && styles.mainButtonDisabled]}
          onPress={handleOpenMaps}
          disabled={loading}
        >
          <View style={styles.buttonGlow} />
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.buttonIconCircle}>
                <Text style={styles.buttonIcon}>📍</Text>
              </View>
              <Text style={styles.mainButtonText}>Find support near me</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Not ready yet / quick tools */}
        <View style={styles.secondarySection}>
          <View style={styles.secondarySectionGlow} />
          <View style={styles.secondaryHeader}>
            <View style={styles.secondaryIconCircle}>
              <Text style={styles.secondaryIconText}>🌸</Text>
            </View>
            <View>
              <Text style={styles.secondaryTitle}>Not ready to visit yet?</Text>
              <Text style={styles.secondaryText}>
                That's completely okay. You can still use a quick tool to calm down
                before deciding anything.
              </Text>
            </View>
          </View>

          <View style={styles.secondaryRow}>
            <TouchableOpacity
              style={styles.secondaryChip}
              onPress={() => router.push("/breathing")}
            >
              <View style={styles.secondaryChipGradient} />
              <View style={styles.secondaryChipIconCircle}>
                <Text style={styles.secondaryChipIcon}>🫁</Text>
              </View>
              <Text style={styles.secondaryChipTitle}>Breathing</Text>
              <Text style={styles.secondaryChipText}>Slow guided breaths.</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryChip}
              onPress={() => router.push("/grounding")}
            >
              <View style={styles.secondaryChipGradient} />
              <View style={styles.secondaryChipIconCircle}>
                <Text style={styles.secondaryChipIcon}>🧘</Text>
              </View>
              <Text style={styles.secondaryChipTitle}>Grounding</Text>
              <Text style={styles.secondaryChipText}>5–4–3–2–1 exercise.</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <View style={styles.noteIconCircle}>
            <Text style={styles.noteIcon}>ℹ️</Text>
          </View>
          <Text style={styles.note}>
            Results will open in the Google Maps app or your browser, depending on
            your device.
          </Text>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: appSpacing.l * 2,
  },

  // Decorative background
  backgroundCircle1: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(139, 92, 246, 0.06)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 200,
    left: -70,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(129, 140, 248, 0.05)",
  },
  backgroundCircle3: {
    position: "absolute",
    bottom: 100,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(167, 139, 250, 0.04)",
  },

  headerWrapper: {
    marginBottom: appSpacing.l,
    zIndex: 1,
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
    backgroundColor: "rgba(129, 140, 248, 0.3)",
    opacity: 0.4,
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    color: "#4F46E5",
    backgroundColor: "rgba(129,140,248,0.2)",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  titleIconContainer: {
    marginBottom: 12,
  },
  titleIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  titleIcon: {
    fontSize: 28,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accentBar: {
    width: 4,
    minHeight: "100%",
    backgroundColor: "#818CF8",
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 21,
  },

  highlightCard: {
    position: "relative",
    backgroundColor: "#8B5CF6",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.m,
    marginBottom: appSpacing.l,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 12,
    overflow: "hidden",
  },
  highlightGradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(167, 139, 250, 0.2)",
  },
  highlightContent: {
    position: "relative",
    zIndex: 1,
  },
  highlightIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  highlightIcon: {
    fontSize: 24,
  },
  highlightTextWrap: {
    marginBottom: 16,
  },
  highlightTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  highlightSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.95)",
    lineHeight: 21,
  },
  highlightPill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
    marginRight: 8,
  },
  highlightPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  infoGrid: {
    flexDirection: "row",
    gap: appSpacing.m,
    marginBottom: appSpacing.l,
  },
  infoChip: {
    position: "relative",
    flex: 1,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.15)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoChipTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: appColors.text,
    marginBottom: 6,
  },
  infoChipText: {
    fontSize: 13,
    color: appColors.subtleText,
    lineHeight: 19,
  },
  infoAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
  },

  section: {
    backgroundColor: "#FEFCE8",
    borderRadius: 20,
    padding: appSpacing.l,
    marginBottom: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(234, 179, 8, 0.25)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionIconText: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: appColors.text,
  },
  pointsContainer: {
    gap: 10,
  },
  pointRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EAB308",
    marginTop: 7,
    marginRight: 10,
  },
  sectionPoint: {
    flex: 1,
    fontSize: 14,
    color: appColors.text,
    lineHeight: 20,
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: appSpacing.m,
    marginBottom: appSpacing.m,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  error: {
    flex: 1,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },

  mainButton: {
    position: "relative",
    flexDirection: "row",
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    overflow: "hidden",
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(167, 139, 250, 0.3)",
  },
  mainButtonDisabled: {
    opacity: 0.7,
  },
  buttonIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  buttonIcon: {
    fontSize: 16,
  },
  mainButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  secondarySection: {
    position: "relative",
    marginTop: appSpacing.l,
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.25)",
    overflow: "hidden",
  },
  secondarySectionGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#38BDF8",
  },
  secondaryHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: appSpacing.m,
  },
  secondaryIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  secondaryIconText: {
    fontSize: 22,
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: appColors.text,
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 13,
    color: appColors.subtleText,
    lineHeight: 19,
  },
  secondaryRow: {
    flexDirection: "row",
    gap: appSpacing.m,
  },
  secondaryChip: {
    position: "relative",
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.3)",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  secondaryChipGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#38BDF8",
  },
  secondaryChipIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  secondaryChipIcon: {
    fontSize: 18,
  },
  secondaryChipTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: appColors.text,
    marginBottom: 3,
  },
  secondaryChipText: {
    fontSize: 12,
    color: appColors.subtleText,
  },

  noteContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: appSpacing.l,
    backgroundColor: "rgba(148, 163, 184, 0.08)",
    borderRadius: 12,
    padding: 12,
  },
  noteIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(148, 163, 184, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  noteIcon: {
    fontSize: 14,
  },
  note: {
    flex: 1,
    fontSize: 12,
    color: appColors.subtleText,
    lineHeight: 17,
  },
});