// app/sos.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useAuth } from "./contexts/AuthContext";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

type EmergencyContact = {
  name?: string;
  phoneNumber?: string;
  phone?: string;
  relation?: string;
};

const LEGACY_EMERGENCY_CONTACT_KEY = "@emergency_contact_simple";
const getEmergencyContactKeyForEmail = (email?: string | null) =>
  `@emergency_contact_${email || "guest"}`;

export default function SOSScreen() {
  useProtectedRoute();
  const { user } = useAuth();
  const email = user?.email || "guest";

  const [isRunning, setIsRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const [emergencyContact, setEmergencyContact] =
    useState<EmergencyContact | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState(true);

  // ---------- Calm-mode animation ----------

  useEffect(() => {
    if (!isRunning) {
      pulseAnim.setValue(0);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 1200,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, [isRunning, pulseAnim]);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) {
      setIsRunning(false);
      return;
    }

    const id = setTimeout(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearTimeout(id);
  }, [isRunning, secondsLeft]);

  function startCalmMode() {
    setSecondsLeft(30);
    setIsRunning(true);
  }

  function stopCalmMode() {
    setIsRunning(false);
  }

  // ---------- Emergency contact (per user) ----------

  useEffect(() => {
    const loadContact = async () => {
      try {
        // Try per-user key first
        const perUserKey = getEmergencyContactKeyForEmail(user?.email);
        let stored = await AsyncStorage.getItem(perUserKey);

        // Fallback to legacy global key if nothing
        if (!stored) {
          stored = await AsyncStorage.getItem(LEGACY_EMERGENCY_CONTACT_KEY);
        }

        if (stored) {
          const parsed: EmergencyContact = JSON.parse(stored);
          setEmergencyContact(parsed);
        }
      } catch (err) {
        console.log("Error loading emergency contact:", err);
      } finally {
        setIsLoadingContact(false);
      }
    };

    loadContact();
  }, [user?.email]);

  const handleCallEmergencyContact = async () => {
    if (!emergencyContact) {
      Alert.alert(
        "No emergency contact",
        "You haven't added an emergency contact yet. You can add one in the Safety Settings screen."
      );
      router.push("/emergency-contact");
      return;
    }

    const phoneRaw = emergencyContact.phoneNumber || emergencyContact.phone;
    const name = emergencyContact.name || "your trusted person";

    if (!phoneRaw) {
      Alert.alert(
        "Missing phone number",
        "Your emergency contact doesn't seem to have a phone number saved. Please update it in Safety Settings."
      );
      router.push("/emergency-contact");
      return;
    }

    const telUrl = `tel:${phoneRaw}`;

    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      if (!canOpen) {
        Alert.alert(
          "Unable to start call",
          `Please try calling ${name} manually at ${phoneRaw}.`
        );
        return;
      }
      await Linking.openURL(telUrl);
    } catch (err) {
      console.log("Error opening phone dialer:", err);
      Alert.alert(
        "Error",
        `Something went wrong trying to start the call. Please contact ${name} manually at ${phoneRaw}.`
      );
    }
  };

  const guidance = (() => {
    if (!isRunning) return "Press start to begin a short calm session.";
    const phase = secondsLeft % 6;
    if (phase >= 4) return "Inhale slowly through your nose…";
    if (phase >= 2) return "Hold gently…";
    return "Exhale slowly through your mouth…";
  })();

  const pulseStyle = {
    transform: [
      {
        scale: pulseAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.12],
        }),
      },
    ],
    opacity: pulseAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 0.5],
    }),
  };

  const displayPhone =
    emergencyContact?.phoneNumber || emergencyContact?.phone || "";

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerWrapper}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeGlow} />
            <Text style={styles.badge}>🆘 EMERGENCY SUPPORT</Text>
          </View>
          <Text style={styles.title}>You're Safe Here</Text>
          <Text style={styles.subtitle}>
            Take a moment to breathe. This is your personal safe space for grounding and immediate support when you need it most.
          </Text>
        </View>

        {/* 🔐 Emergency contact card */}
        <View style={styles.emergencyCard}>
          <View style={styles.emergencyHeader}>
            <View style={styles.emergencyIconContainer}>
              <Text style={styles.emergencyIcon}>📞</Text>
            </View>
            <View style={styles.emergencyHeaderText}>
              <Text style={styles.emergencyCardTitle}>Emergency Contact</Text>
              <Text style={styles.emergencyCardSubtitle}>
                Your trusted person for high-risk situations
              </Text>
            </View>
          </View>

          <View style={styles.emergencyDivider} />

          {isLoadingContact ? (
            <View style={styles.emergencyLoadingContainer}>
              <Text style={styles.emergencyLoadingText}>Loading contact...</Text>
            </View>
          ) : emergencyContact ? (
            <View style={styles.emergencyDetails}>
              <View style={styles.emergencyDetailRow}>
                <View style={styles.emergencyDetailIcon}>
                  <Text style={styles.emergencyDetailIconText}>👤</Text>
                </View>
                <View style={styles.emergencyDetailContent}>
                  <Text style={styles.emergencyDetailLabel}>Name</Text>
                  <Text style={styles.emergencyName}>
                    {emergencyContact.name || "Saved contact"}
                  </Text>
                </View>
              </View>

              {displayPhone ? (
                <View style={styles.emergencyDetailRow}>
                  <View style={styles.emergencyDetailIcon}>
                    <Text style={styles.emergencyDetailIconText}>📱</Text>
                  </View>
                  <View style={styles.emergencyDetailContent}>
                    <Text style={styles.emergencyDetailLabel}>Phone</Text>
                    <Text style={styles.emergencyPhone}>{displayPhone}</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.emergencyDetailRow}>
                  <View style={styles.emergencyDetailIcon}>
                    <Text style={styles.emergencyDetailIconText}>⚠️</Text>
                  </View>
                  <View style={styles.emergencyDetailContent}>
                    <Text style={styles.emergencyMissingField}>
                      Phone number not set
                    </Text>
                  </View>
                </View>
              )}

              {emergencyContact.relation ? (
                <View style={styles.emergencyDetailRow}>
                  <View style={styles.emergencyDetailIcon}>
                    <Text style={styles.emergencyDetailIconText}>❤️</Text>
                  </View>
                  <View style={styles.emergencyDetailContent}>
                    <Text style={styles.emergencyDetailLabel}>Relation</Text>
                    <Text style={styles.emergencyRelation}>
                      {emergencyContact.relation}
                    </Text>
                  </View>
                </View>
              ) : null}
            </View>
          ) : (
            <View style={styles.emergencyEmptyContainer}>
              <View style={styles.emergencyEmptyIcon}>
                <Text style={styles.emergencyEmptyIconText}>📋</Text>
              </View>
              <Text style={styles.emergencyEmptyText}>
                No emergency contact added yet
              </Text>
            </View>
          )}

          <View style={styles.emergencyButtonsRow}>
            <Pressable
              style={[
                styles.emergencyPrimaryButton,
                (!emergencyContact || !displayPhone) &&
                  styles.emergencyPrimaryButtonDisabled,
              ]}
              onPress={handleCallEmergencyContact}
              disabled={!emergencyContact || !displayPhone}
            >
              <View style={styles.emergencyButtonContent}>
                <Text style={styles.emergencyButtonIcon}>📞</Text>
                <Text style={styles.emergencyPrimaryButtonText}>
                  {displayPhone ? "Call Now" : "Add Contact"}
                </Text>
              </View>
            </Pressable>

            <Pressable
              style={styles.emergencySecondaryButton}
              onPress={() => router.push("/emergency-contact")}
            >
              <View style={styles.emergencyButtonContent}>
                <Text style={styles.emergencySecondaryButtonIcon}>⚙️</Text>
                <Text style={styles.emergencySecondaryButtonText}>
                  Manage
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* Calm circle card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconBadge}>
              <Text style={styles.cardIconText}>🧘</Text>
            </View>
            <View>
              <Text style={styles.cardTitle}>30-Second Calm Mode</Text>
              <Text style={styles.cardSubtitle}>
                Focus on the circle and breathe with the guidance
              </Text>
            </View>
          </View>

          <View style={styles.circleWrapper}>
            <Animated.View style={[styles.pulseCircle, pulseStyle]} />
            <Animated.View style={[styles.pulseCircleOuter, pulseStyle]} />
            <View style={styles.mainCircle}>
              <Text style={styles.timerText}>
                {secondsLeft.toString().padStart(2, "0")}
              </Text>
              <Text style={styles.timerLabel}>seconds</Text>
              <View style={styles.circleInnerRing} />
            </View>
          </View>

          <View style={styles.guidanceContainer}>
            <View style={styles.guidanceDot} />
            <Text style={styles.guidanceText}>{guidance}</Text>
          </View>

          {!isRunning ? (
            <Pressable style={styles.primaryButton} onPress={startCalmMode}>
              <View style={styles.buttonGlow} />
              <Text style={styles.primaryButtonText}>🌊 Start Calm Mode</Text>
            </Pressable>
          ) : (
            <Pressable style={styles.secondaryButton} onPress={stopCalmMode}>
              <Text style={styles.secondaryButtonText}>⏹️ Stop Early</Text>
            </Pressable>
          )}
        </View>

        {/* Quick tools */}
        <View style={styles.toolsCard}>
          <View style={styles.toolsHeader}>
            <Text style={styles.toolsTitle}>Quick Support Tools</Text>
            <View style={styles.toolsDecoration} />
          </View>
          <Text style={styles.toolsSubtitle}>
            Additional techniques to help you feel grounded and calm
          </Text>

          <View style={styles.toolsRow}>
            <Pressable
              style={styles.toolChip}
              onPress={() => router.push("/breathing")}
            >
              <View style={styles.toolIconContainer}>
                <Text style={styles.toolEmoji}>🌬️</Text>
              </View>
              <Text style={styles.toolTitle}>Breathing</Text>
              <Text style={styles.toolText}>Guided inhale & exhale exercises</Text>
            </Pressable>

            <Pressable
              style={styles.toolChip}
              onPress={() => router.push("/grounding")}
            >
              <View style={styles.toolIconContainer}>
                <Text style={styles.toolEmoji}>🖐️</Text>
              </View>
              <Text style={styles.toolTitle}>Grounding</Text>
              <Text style={styles.toolText}>5-4-3-2-1 sensory technique</Text>
            </Pressable>
          </View>

          <View style={styles.toolsRow}>
            <Pressable
              style={styles.toolChip}
              onPress={() => router.push("/mindfulness")}
            >
              <View style={styles.toolIconContainer}>
                <Text style={styles.toolEmoji}>🧠</Text>
              </View>
              <Text style={styles.toolTitle}>Mindfulness</Text>
              <Text style={styles.toolText}>Interactive thought meditation</Text>
            </Pressable>

            <Pressable
              style={styles.toolChip}
              onPress={() => router.push("/cbt")}
            >
              <View style={styles.toolIconContainer}>
                <Text style={styles.toolEmoji}>💭</Text>
              </View>
              <Text style={styles.toolTitle}>CBT Reframe</Text>
              <Text style={styles.toolText}>Transform negative thoughts</Text>
            </Pressable>
          </View>
        </View>

        {/* Find professional support */}
        <View style={styles.supportBox}>
          <View style={styles.supportIconContainer}>
            <Text style={styles.supportIconText}>🏥</Text>
          </View>
          <View style={styles.supportContent}>
            <Text style={styles.supportTitle}>Need Professional Help?</Text>
            <Text style={styles.supportText}>
              Connect with nearby hospitals, therapists, and mental health professionals in your area.
            </Text>

            <Pressable
              style={styles.supportButton}
              onPress={() => router.push("/find-support")}
            >
              <View style={styles.supportButtonGlow} />
              <Text style={styles.supportButtonText}>
                🗺️ Find Support Near Me
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Safety note */}
        <View style={styles.noteBox}>
          <View style={styles.noteHeader}>
            <View style={styles.noteIconContainer}>
              <Text style={styles.noteIconText}>⚠️</Text>
            </View>
            <Text style={styles.noteTitle}>Important Safety Reminder</Text>
          </View>
          <View style={styles.noteDivider} />
          <Text style={styles.noteText}>
            SoulSync is a self-help companion and cannot replace professional medical care. If you're experiencing a crisis or feel unsafe, please reach out to a trusted person, call a local helpline, or contact emergency services immediately.
          </Text>
        </View>

        <View style={{ height: 50 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: appSpacing.l * 2,
  },

  headerWrapper: {
    marginBottom: appSpacing.l,
    paddingTop: appSpacing.s,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    position: "relative",
    marginBottom: appSpacing.m,
  },
  badgeGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#EF4444",
    borderRadius: 999,
    opacity: 0.15,
    transform: [{ scale: 1.1 }],
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "700",
    color: "#DC2626",
    backgroundColor: "#FEE2E2",
    letterSpacing: 0.5,
    overflow: "hidden",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1F2937",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    lineHeight: 22,
    letterSpacing: 0.2,
  },

  // 🔐 Emergency contact card
  emergencyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.m,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  emergencyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.m,
  },
  emergencyIcon: {
    fontSize: 28,
  },
  emergencyHeaderText: {
    flex: 1,
  },
  emergencyCardTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  emergencyCardSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  emergencyDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: appSpacing.m,
  },
  emergencyLoadingContainer: {
    padding: appSpacing.m,
    alignItems: "center",
  },
  emergencyLoadingText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  emergencyDetails: {
    marginBottom: appSpacing.m,
  },
  emergencyDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: appSpacing.m,
    borderRadius: 12,
    marginBottom: appSpacing.s,
  },
  emergencyDetailIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.m,
  },
  emergencyDetailIconText: {
    fontSize: 18,
  },
  emergencyDetailContent: {
    flex: 1,
  },
  emergencyDetailLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  emergencyName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
  },
  emergencyPhone: {
    fontSize: 15,
    fontWeight: "600",
    color: "#4B5563",
  },
  emergencyRelation: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  emergencyMissingField: {
    fontSize: 13,
    color: "#DC2626",
    fontWeight: "600",
    fontStyle: "italic",
  },
  emergencyEmptyContainer: {
    alignItems: "center",
    padding: appSpacing.l,
  },
  emergencyEmptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: appSpacing.s,
  },
  emergencyEmptyIconText: {
    fontSize: 32,
  },
  emergencyEmptyText: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
  },
  emergencyButtonsRow: {
    flexDirection: "row",
    gap: appSpacing.s,
    marginTop: appSpacing.s,
  },
  emergencyPrimaryButton: {
    flex: 1.2,
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emergencyPrimaryButtonDisabled: {
    backgroundColor: "#FCA5A5",
    shadowOpacity: 0.1,
  },
  emergencyButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  emergencyButtonIcon: {
    fontSize: 16,
  },
  emergencyPrimaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  emergencySecondaryButton: {
    flex: 0.8,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  emergencySecondaryButtonIcon: {
    fontSize: 14,
  },
  emergencySecondaryButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.l,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#EEF2FF",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.l,
  },
  cardIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.m,
  },
  cardIconText: {
    fontSize: 28,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    letterSpacing: 0.2,
  },

  circleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: appSpacing.l,
    height: 220,
  },
  pulseCircleOuter: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(238, 242, 255, 0.3)",
    borderWidth: 1,
    borderColor: "rgba(165, 180, 252, 0.3)",
  },
  pulseCircle: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(238, 242, 255, 0.6)",
    borderWidth: 2,
    borderColor: "rgba(165, 180, 252, 0.5)",
  },
  mainCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#818CF8",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    position: "relative",
  },
  circleInnerRing: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1,
    borderColor: "rgba(165, 180, 252, 0.3)",
  },
  timerText: {
    fontSize: 48,
    fontWeight: "800",
    color: "#6366F1",
    marginBottom: 4,
  },
  timerLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  circleLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 4,
  },

  guidanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
    padding: appSpacing.m,
    borderRadius: 12,
    marginBottom: appSpacing.m,
  },
  guidanceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6366F1",
    marginRight: appSpacing.s,
  },
  guidanceText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    textAlign: "center",
  },

  primaryButton: {
    marginTop: appSpacing.s,
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    position: "relative",
    overflow: "hidden",
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  secondaryButton: {
    marginTop: appSpacing.s,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FAFAFA",
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },

  toolsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.l,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  toolsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: appSpacing.s,
  },
  toolsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  toolsDecoration: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#10B981",
  },
  toolsSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: appSpacing.m,
    letterSpacing: 0.2,
  },
  toolsRow: {
    flexDirection: "row",
    gap: appSpacing.s,
    marginBottom: appSpacing.s,
  },
  toolChip: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: appSpacing.s,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  toolEmoji: {
    fontSize: 24,
  },
  toolTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    textAlign: "center",
  },
  toolText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 16,
  },

  supportBox: {
    marginTop: appSpacing.l,
    padding: appSpacing.l,
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    borderWidth: 2,
    borderColor: "#A7F3D0",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  supportIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: appSpacing.m,
    borderWidth: 2,
    borderColor: "#6EE7B7",
  },
  supportIconText: {
    fontSize: 32,
  },
  supportContent: {
    alignItems: "flex-start",
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#065F46",
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  supportText: {
    fontSize: 14,
    color: "#047857",
    lineHeight: 20,
    marginBottom: appSpacing.m,
  },
  supportButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    overflow: "hidden",
  },
  supportButtonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  noteBox: {
    marginTop: appSpacing.l,
    padding: appSpacing.l,
    borderRadius: 20,
    backgroundColor: "#FEF3C7",
    borderWidth: 2,
    borderColor: "#FDE68A",
  },
  noteHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.s,
  },
  noteIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.s,
  },
  noteIconText: {
    fontSize: 18,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#92400E",
    letterSpacing: -0.2,
  },
  noteDivider: {
    height: 1,
    backgroundColor: "#FDE68A",
    marginBottom: appSpacing.s,
  },
  noteText: {
    fontSize: 13,
    color: "#78350F",
    lineHeight: 20,
    fontWeight: "500",
  },
});