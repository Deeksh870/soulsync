// app/emergency-contact.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import { useAuth } from "./contexts/AuthContext";

// Legacy global key (for older data)
const LEGACY_STORAGE_KEY = "@emergency_contact_simple";
// New per-user key helper
const getPerUserKey = (email?: string | null) =>
  `@emergency_contact_${email || "guest"}`;

export default function EmergencyContactScreen() {
  const { user } = useAuth();
  const email = user?.email || "guest";
  const PER_USER_KEY = getPerUserKey(email);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [relationship, setRelationship] = useState("");
  const [status, setStatus] = useState<null | string>(null);

  // Load saved contact when screen opens
  useEffect(() => {
    const loadContact = async () => {
      try {
        // Try per-user contact first
        let stored = await AsyncStorage.getItem(PER_USER_KEY);

        // Fallback to old global key if nothing
        if (!stored) {
          stored = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
        }

        if (stored) {
          const parsed = JSON.parse(stored);
          setName(parsed.name || "");
          setPhone(parsed.phoneNumber || parsed.phone || "");
          setRelationship(parsed.relationship || parsed.relation || "");
          setStatus("Loaded saved contact.");
        } else {
          setStatus("No contact saved yet.");
        }
      } catch (error) {
        console.error("Error loading contact", error);
        setStatus("Error loading saved contact.");
      }
    };

    loadContact();
  }, [PER_USER_KEY]);

  const handleSave = async () => {
    if (!name.trim() || !phone.trim()) {
      setStatus("Please enter at least a name and phone number.");
      return;
    }

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedRelationship = relationship.trim();

    const contact = {
      name: trimmedName,
      phoneNumber: trimmedPhone,
      phone: trimmedPhone, // extra alias so all screens can read it
      relationship: trimmedRelationship,
      relation: trimmedRelationship, // alias for SOS screen
      lastUpdated: new Date().toISOString(),
    };

    try {
      // Save for this specific user
      await AsyncStorage.setItem(PER_USER_KEY, JSON.stringify(contact));
      // Also update legacy key so older code / fallback still works
      await AsyncStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(contact));

      setStatus("Saved emergency contact successfully ✅");
    } catch (error) {
      console.error("Error saving contact", error);
      setStatus("Failed to save contact ❌");
    }
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.select({ ios: "padding", android: undefined })}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative background elements */}
          <View style={styles.backgroundCircle1} />
          <View style={styles.backgroundCircle2} />
          <View style={styles.backgroundCircle3} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeGlow} />
              <Text style={styles.badge}>🛡️ Safety</Text>
            </View>
            <Text style={styles.title}>Emergency Contact</Text>
            <View style={styles.titleIconContainer}>
              <View style={styles.shieldIcon}>
                <Text style={styles.shieldEmoji}>🆘</Text>
              </View>
            </View>
            <View style={styles.subtitleContainer}>
              <View style={styles.accentBar} />
              <Text style={styles.subtitle}>
                Add a trusted person we can help you contact if your messages look
                very risky or like you might be in danger.
              </Text>
            </View>
          </View>

          {/* Main card */}
          <View style={styles.card}>
            <View style={styles.cardTopAccent} />
            <View style={styles.cardHeader}>
              <View style={styles.cardIconCircle}>
                <Text style={styles.cardIcon}>👤</Text>
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Trusted person details</Text>
                <Text style={styles.cardSubtitle}>
                  This will only be used to help you quickly reach someone you trust
                  during tough moments.
                </Text>
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelContainer}>
                <View style={styles.labelIconCircle}>
                  <Text style={styles.labelIcon}>✏️</Text>
                </View>
                <Text style={styles.label}>Name</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mom, Roommate, Best friend"
                  placeholderTextColor="#A78BFA"
                  value={name}
                  onChangeText={setName}
                />
                <View style={styles.inputFocusLine} />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelContainer}>
                <View style={styles.labelIconCircle}>
                  <Text style={styles.labelIcon}>📱</Text>
                </View>
                <Text style={styles.label}>Phone number</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. +91 98765 43210"
                  placeholderTextColor="#A78BFA"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <View style={styles.inputFocusLine} />
              </View>
            </View>

            <View style={styles.field}>
              <View style={styles.labelContainer}>
                <View style={styles.labelIconCircle}>
                  <Text style={styles.labelIcon}>💙</Text>
                </View>
                <Text style={styles.label}>Relationship (optional)</Text>
              </View>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Mother, Cousin, Close friend"
                  placeholderTextColor="#A78BFA"
                  value={relationship}
                  onChangeText={setRelationship}
                />
                <View style={styles.inputFocusLine} />
              </View>
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <View style={styles.buttonGlow} />
              <View style={styles.buttonContent}>
                <View style={styles.buttonIconCircle}>
                  <Text style={styles.buttonIcon}>💾</Text>
                </View>
                <Text style={styles.saveButtonText}>Save emergency contact</Text>
              </View>
            </TouchableOpacity>

            {status && (
              <View
                style={[
                  styles.statusContainer,
                  status.includes("✅") && styles.statusSuccess,
                  status.includes("❌") && styles.statusError,
                  !status.includes("✅") &&
                    !status.includes("❌") &&
                    styles.statusInfo,
                ]}
              >
                <Text style={styles.statusIcon}>
                  {status.includes("✅")
                    ? "✅"
                    : status.includes("❌")
                    ? "❌"
                    : "ℹ️"}
                </Text>
                <Text
                  style={[
                    styles.statusText,
                    status.includes("✅") && { color: "#16A34A" },
                    status.includes("❌") && { color: "#DC2626" },
                  ]}
                >
                  {status}
                </Text>
              </View>
            )}
          </View>

          {/* Info card */}
          <View style={styles.infoCard}>
            <View style={styles.infoTopGradient} />
            <View style={styles.infoHeader}>
              <View style={styles.infoIconCircle}>
                <Text style={styles.infoIconEmoji}>⚠️</Text>
              </View>
              <Text style={styles.infoTitle}>Important</Text>
            </View>
            <View style={styles.infoContent}>
              <View style={styles.infoPoint}>
                <View style={styles.infoBullet} />
                <Text style={styles.infoText}>
                  SoulSync is not a crisis or emergency service. If you are in
                  immediate danger, please contact your local emergency number or a
                  trusted person directly.
                </Text>
              </View>
              <View style={styles.infoPoint}>
                <View style={styles.infoBullet} />
                <Text style={styles.infoText}>
                  This feature only helps you quickly reach someone you trust if
                  your messages sound very risky. We never automatically call or
                  message anyone without your action.
                </Text>
              </View>
            </View>
            <View style={styles.infoDecor} />
          </View>

          {/* Emergency numbers card */}
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyHeader}>
              <View style={styles.emergencyIconCircle}>
                <Text style={styles.emergencyIcon}>🚨</Text>
              </View>
              <View>
                <Text style={styles.emergencyTitle}>Crisis helplines</Text>
                <Text style={styles.emergencySubtitle}>
                  Available 24/7 for immediate support
                </Text>
              </View>
            </View>
            <View style={styles.helplineRow}>
              <View style={styles.helplineChip}>
                <Text style={styles.helplineLabel}>India</Text>
                <Text style={styles.helplineNumber}>9152987821</Text>
              </View>
              <View style={styles.helplineChip}>
                <Text style={styles.helplineLabel}>Emergency</Text>
                <Text style={styles.helplineNumber}>112</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: appSpacing.l,
    paddingBottom: appSpacing.xl * 2,
  },

  // Decorative background
  backgroundCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(79, 70, 229, 0.06)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 250,
    left: -70,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
  backgroundCircle3: {
    position: "absolute",
    bottom: 200,
    right: -50,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(167, 139, 250, 0.04)",
  },

  header: {
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
    backgroundColor: "rgba(79, 70, 229, 0.3)",
    opacity: 0.5,
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(79, 70, 229, 0.12)",
    color: "#4F46E5",
    fontSize: 13,
    fontWeight: "700",
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
  shieldIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.2)",
  },
  shieldEmoji: {
    fontSize: 32,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accentBar: {
    width: 4,
    minHeight: "100%",
    backgroundColor: "#EF4444",
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 21,
  },

  card: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.2)",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 8,
    marginBottom: appSpacing.l,
    overflow: "hidden",
  },
  cardTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#8B5CF6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: appSpacing.l,
  },
  cardIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardIcon: {
    fontSize: 28,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: appColors.subtleText,
    lineHeight: 19,
  },

  field: {
    marginBottom: appSpacing.l,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  labelIcon: {
    fontSize: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: appColors.text,
  },
  inputWrapper: {
    position: "relative",
    overflow: "hidden",
  },
  input: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.2)",
    paddingHorizontal: appSpacing.m,
    paddingVertical: 14,
    fontSize: 15,
    color: appColors.text,
    backgroundColor: "#FAFAF9",
  },
  inputFocusLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#A78BFA",
    opacity: 0.6,
  },

  saveButton: {
    position: "relative",
    marginTop: appSpacing.m,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 12 },
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
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: appSpacing.m,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  statusError: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FCA5A5",
  },
  statusInfo: {
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  statusIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: appColors.text,
  },

  infoCard: {
    position: "relative",
    backgroundColor: "#FEF3C7",
    borderRadius: 20,
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(234, 179, 8, 0.3)",
    marginBottom: appSpacing.l,
    overflow: "hidden",
  },
  infoTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#EAB308",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(234, 179, 8, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoIconEmoji: {
    fontSize: 20,
  },
  infoTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#854D0E",
  },
  infoContent: {
    gap: 12,
  },
  infoPoint: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#EAB308",
    marginTop: 7,
    marginRight: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#78716C",
    lineHeight: 20,
  },
  infoDecor: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(234, 179, 8, 0.1)",
  },

  emergencyCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 20,
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.3)",
  },
  emergencyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  emergencyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  emergencyIcon: {
    fontSize: 24,
  },
  emergencyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#991B1B",
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: "#7C2D12",
  },
  helplineRow: {
    flexDirection: "row",
    gap: appSpacing.m,
  },
  helplineChip: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    borderWidth: 2,
    borderColor: "rgba(239, 68, 68, 0.2)",
    alignItems: "center",
  },
  helplineLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#991B1B",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  helplineNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#DC2626",
  },
});