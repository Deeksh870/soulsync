// app/gratitude.tsx
import AppButton from "@/components/AppButton";
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useAuth } from "./contexts/AuthContext";

type GratitudeEntry = {
  id: string;
  items: string[]; // 3 good things
  date: string;
};

export default function GratitudeScreen() {
  const [item1, setItem1] = useState("");
  const [item2, setItem2] = useState("");
  const [item3, setItem3] = useState("");
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const { user } = useAuth();
  const email = user?.email || "guest";

  const STORAGE_KEY = `@gratitude_entries_${email}`;

  // ✨ Celebration animation value
  const celebration = useRef(new Animated.Value(0)).current;

  // Load saved gratitude entries on first render
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const saved: GratitudeEntry[] = JSON.parse(json);
          setEntries(saved);
        }
      } catch (error) {
        console.log("Error loading gratitude entries", error);
      }
    };

    loadEntries();
  }, []);

  const saveEntries = async (newEntries: GratitudeEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (error) {
      console.log("Error saving gratitude entries", error);
    }
  };

  const triggerCelebration = () => {
    celebration.setValue(0);
    Animated.sequence([
      Animated.timing(celebration, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(celebration, {
        toValue: 0,
        delay: 900,
        duration: 260,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSave = () => {
    const trimmed1 = item1.trim();
    const trimmed2 = item2.trim();
    const trimmed3 = item3.trim();

    // At least one non-empty item required
    if (!trimmed1 && !trimmed2 && !trimmed3) {
      return;
    }

    const now = new Date();
    const dateLabel = `${now.getDate()}/${
      now.getMonth() + 1
    }/${now.getFullYear()} ${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newEntry: GratitudeEntry = {
      id: now.getTime().toString(),
      items: [trimmed1, trimmed2, trimmed3].filter(Boolean),
      date: dateLabel,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);

    // clear inputs
    setItem1("");
    setItem2("");
    setItem3("");

    // 🎉 play tiny celebration animation
    triggerCelebration();
  };

  const celebrationScale = celebration.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.08],
  });
  const celebrationOpacity = celebration.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Decorative background elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />
        
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.headerWrapper}>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeGlow} />
              <Text style={styles.badge}>✨ Small positives</Text>
            </View>
            <Text style={styles.title}>Gratitude Journal</Text>
            <View style={styles.titleIconContainer}>
              <View style={styles.rainbowIcon}>
                <Text style={styles.rainbowEmoji}>🌈</Text>
              </View>
            </View>
            <View style={styles.subtitleContainer}>
              <View style={styles.accentBar} />
              <Text style={styles.subtitle}>
                Write a few good things about your day. Over time, this gently
                trains your mind to notice small positives more easily.
              </Text>
            </View>
          </View>

          {/* Write card */}
          <View style={styles.writeCard}>
            <View style={styles.writeCardGradient} />
            <View style={styles.writeHeader}>
              <View style={styles.writeIconCircle}>
                <Text style={styles.writeIcon}>💛</Text>
              </View>
              <View>
                <Text style={styles.writeTitle}>Today I'm grateful for…</Text>
                <Text style={styles.writeSubtitle}>
                  They don't have to be big things. Even "I had a tasty snack" or
                  "I laughed with a friend" is enough.
                </Text>
              </View>
            </View>

            <View style={styles.inputsContainer}>
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>1</Text>
                  </View>
                  <Text style={styles.label}>Good thing #1</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Something that went well today..."
                    placeholderTextColor="#FBBF24"
                    value={item1}
                    onChangeText={setItem1}
                  />
                  <View style={styles.inputFocusLine} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>2</Text>
                  </View>
                  <Text style={styles.label}>Good thing #2 <Text style={styles.optionalText}>(optional)</Text></Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Another small positive moment..."
                    placeholderTextColor="#FBBF24"
                    value={item2}
                    onChangeText={setItem2}
                  />
                  <View style={styles.inputFocusLine} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <View style={styles.numberCircle}>
                    <Text style={styles.numberText}>3</Text>
                  </View>
                  <Text style={styles.label}>Good thing #3 <Text style={styles.optionalText}>(optional)</Text></Text>
                </View>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="Anything else you feel thankful for..."
                    placeholderTextColor="#FBBF24"
                    value={item3}
                    onChangeText={setItem3}
                  />
                  <View style={styles.inputFocusLine} />
                </View>
              </View>
            </View>

            {/* Tiny animated "saved" feedback */}
            <Animated.View
              style={[
                styles.celebration,
                {
                  opacity: celebrationOpacity,
                  transform: [{ scale: celebrationScale }],
                },
              ]}
              pointerEvents="none"
            >
              <View style={styles.celebrationGlow} />
              <View style={styles.celebrationContent}>
                <View style={styles.celebrationIconCircle}>
                  <Text style={styles.celebrationEmoji}>✨</Text>
                </View>
                <Text style={styles.celebrationText}>
                  Gratitude saved. Nice job noticing the good things. 💛
                </Text>
              </View>
            </Animated.View>

            <AppButton title="Save gratitude entry" onPress={handleSave} />
          </View>

          {/* History */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconCircle}>
              <Text style={styles.sectionIcon}>📚</Text>
            </View>
            <Text style={styles.sectionTitle}>Previous gratitude entries</Text>
            {entries.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{entries.length}</Text>
              </View>
            )}
          </View>

          {entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyIcon}>🌱</Text>
              </View>
              <Text style={styles.emptyTitle}>No gratitude entries yet</Text>
              <Text style={styles.emptyText}>
                At the end of each day, try writing 1–3 good things. Even on
                tough days, there is usually something very small you can still
                appreciate.
              </Text>
              <View style={styles.emptyDecor} />
            </View>
          ) : (
            <View style={styles.listContent}>
              {entries.map((entry) => (
                <View key={entry.id} style={styles.entryCard}>
                  <View style={styles.entryHeader}>
                    <View style={styles.entryDateContainer}>
                      <View style={styles.dateIconCircle}>
                        <Text style={styles.dateIcon}>📅</Text>
                      </View>
                      <Text style={styles.entryDate}>{entry.date}</Text>
                    </View>
                  </View>
                  <View style={styles.entryItemsContainer}>
                    {entry.items.map((text, idx) => (
                      <View key={idx} style={styles.entryItemRow}>
                        <View style={styles.entryBullet} />
                        <Text style={styles.entryItem}>{text}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.entryBottomAccent} />
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Decorative background
  backgroundCircle1: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(250, 204, 21, 0.06)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 350,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(251, 191, 36, 0.05)",
  },
  backgroundCircle3: {
    position: "absolute",
    bottom: 200,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(252, 211, 77, 0.04)",
  },

  scrollContent: {
    paddingBottom: appSpacing.l * 2,
    zIndex: 1,
  },

  headerWrapper: {
    marginBottom: appSpacing.l,
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
    backgroundColor: "rgba(250, 204, 21, 0.3)",
    opacity: 0.5,
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "700",
    color: "#D97706",
    backgroundColor: "rgba(250, 204, 21, 0.25)",
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
  rainbowIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.2)",
  },
  rainbowEmoji: {
    fontSize: 32,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accentBar: {
    width: 4,
    minHeight: "100%",
    backgroundColor: "#FBBF24",
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 21,
  },

  writeCard: {
    position: "relative",
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.25)",
    marginTop: appSpacing.m,
    marginBottom: appSpacing.l,
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  writeCardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#FBBF24",
  },
  writeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: appSpacing.l,
  },
  writeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  writeIcon: {
    fontSize: 24,
  },
  writeTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  writeSubtitle: {
    fontSize: 13,
    color: appColors.subtleText,
    lineHeight: 19,
  },

  inputsContainer: {
    gap: appSpacing.l,
    marginBottom: appSpacing.l,
  },
  inputGroup: {
    gap: 8,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  numberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  numberText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#D97706",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: appColors.text,
  },
  optionalText: {
    fontSize: 12,
    fontWeight: "600",
    color: appColors.subtleText,
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    borderWidth: 2,
    borderRadius: 14,
    borderColor: "rgba(250, 204, 21, 0.25)",
    backgroundColor: "#FFFBEB",
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: appColors.text,
    lineHeight: 20,
  },
  inputFocusLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#FBBF24",
    opacity: 0.5,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },

  celebration: {
    position: "relative",
    marginTop: appSpacing.m,
    marginBottom: appSpacing.m,
    borderRadius: 16,
    overflow: "hidden",
  },
  celebrationGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(250, 204, 21, 0.15)",
  },
  celebrationContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#FEF9C3",
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.3)",
  },
  celebrationIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(250, 204, 21, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  celebrationEmoji: {
    fontSize: 16,
  },
  celebrationText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#92400E",
    flex: 1,
    lineHeight: 18,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
  },
  countBadge: {
    backgroundColor: "#FBBF24",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  emptyCard: {
    position: "relative",
    borderRadius: 20,
    backgroundColor: "#FFFBEB",
    padding: appSpacing.xl,
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.3)",
    alignItems: "center",
    overflow: "hidden",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(250, 204, 21, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: appColors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: appColors.subtleText,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyDecor: {
    position: "absolute",
    bottom: -20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(250, 204, 21, 0.08)",
  },

  listContent: {
    gap: appSpacing.m,
    paddingBottom: appSpacing.l,
  },
  entryCard: {
    position: "relative",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(250, 204, 21, 0.2)",
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    overflow: "hidden",
  },
  entryHeader: {
    marginBottom: appSpacing.m,
  },
  entryDateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(250, 204, 21, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dateIcon: {
    fontSize: 14,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: "700",
    color: "#D97706",
  },
  entryItemsContainer: {
    gap: 8,
  },
  entryItemRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  entryBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FBBF24",
    marginTop: 7,
    marginRight: 10,
  },
  entryItem: {
    flex: 1,
    fontSize: 15,
    color: appColors.text,
    lineHeight: 22,
  },
  entryBottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "rgba(250, 204, 21, 0.25)",
  },
});