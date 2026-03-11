// app/mood-tracker.tsx
import AppButton from "@/components/AppButton";
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "./contexts/AuthContext";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

import {
  Animated,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type MoodOption = "Happy" | "Okay" | "Sad" | "Angry" | "Tired";

type MoodEntry = {
  id: string;
  mood: MoodOption;
  date: string;
};

const MOOD_OPTIONS: MoodOption[] = ["Happy", "Okay", "Sad", "Angry", "Tired"];

const MOOD_EMOJI: Record<MoodOption, string> = {
  Happy: "😊",
  Okay: "🙂",
  Sad: "😢",
  Angry: "😡",
  Tired: "🥱",
};

export default function MoodTrackerScreen() {
  // must be logged in
  useProtectedRoute();

  // 🔐 get user from AuthContext
  const { user } = useAuth();
  const email = user?.email || "guest";

  // 🔑 per-user key
  const STORAGE_KEY = `@mood_entries_${email}`;

  console.log("MoodTracker email:", email);
  console.log("MoodTracker STORAGE_KEY:", STORAGE_KEY);

  const [selectedMood, setSelectedMood] = useState<MoodOption | null>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  // animations
  const moodScales = useRef<Record<MoodOption, Animated.Value>>({
    Happy: new Animated.Value(1),
    Okay: new Animated.Value(1),
    Sad: new Animated.Value(1),
    Angry: new Animated.Value(1),
    Tired: new Animated.Value(1),
  }).current;

  // load per-user entries whenever STORAGE_KEY changes
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          setEntries(JSON.parse(json));
        } else {
          setEntries([]);
        }
      } catch (error) {
        console.log("Error loading mood entries", error);
      }
    };

    loadEntries();
  }, [STORAGE_KEY]);

  const saveEntries = async (newEntries: MoodEntry[]) => {
    try {
      setEntries(newEntries);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (error) {
      console.log("Error saving mood entries", error);
    }
  };

  const handleSaveMood = () => {
    if (!selectedMood) return;

    const now = new Date();
    const newEntry: MoodEntry = {
      id: now.getTime().toString(),
      mood: selectedMood,
      date: `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`,
    };

    const updated = [newEntry, ...entries];
    saveEntries(updated);
  };

  const handleSelectMood = (mood: MoodOption) => {
    setSelectedMood(mood);

    Animated.sequence([
      Animated.timing(moodScales[mood], {
        toValue: 1.08,
        duration: 110,
        useNativeDriver: true,
      }),
      Animated.spring(moodScales[mood], {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const renderMoodButton = (mood: MoodOption) => {
    const isSelected = selectedMood === mood;
    const scale = moodScales[mood];

    return (
      <Animated.View
        key={mood}
        style={{
          transform: [{ scale }],
          marginRight: appSpacing.s,
          marginBottom: appSpacing.m,
        }}
      >
        <Pressable
          style={[styles.moodButton, isSelected && styles.moodButtonSelected]}
          onPress={() => handleSelectMood(mood)}
        >
          <View style={styles.moodEmojiContainer}>
            <Text style={styles.moodEmoji}>{MOOD_EMOJI[mood]}</Text>
          </View>
          <Text
            style={[
              styles.moodButtonText,
              isSelected && styles.moodButtonTextSelected,
            ]}
          >
            {mood}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const renderEntry = ({ item, index }: { item: MoodEntry; index: number }) => (
    <View style={styles.entryRow}>
      <View style={styles.entryIndexContainer}>
        <Text style={styles.entryIndex}>{index + 1}</Text>
      </View>
      <View style={styles.entryMoodContainer}>
        <Text style={styles.entryMoodEmoji}>{MOOD_EMOJI[item.mood]}</Text>
        <Text style={styles.entryMood}>{item.mood}</Text>
      </View>
      <View style={styles.entryDateContainer}>
        <Text style={styles.entryDate}>📅 {item.date}</Text>
      </View>
    </View>
  );

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 160 }}
      >
        {/* Background decorative elements */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />

        <View style={styles.headerWrapper}>
          <View style={styles.badgeContainer}>
            <Text style={styles.badge}>📊 Daily mood</Text>
          </View>
          <Text style={styles.title}>Mood Tracker</Text>
          <Text style={styles.subtitle}>
            Tap how you feel today and keep a simple history of your moods.
          </Text>
          {/* optional debug: show which email this screen is using */}
          <Text style={styles.debugText}>DEBUG email: {email}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardGradientTop} />
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💭</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>How are you feeling today?</Text>
              <Text style={styles.cardSubtitle}>
                Choose one option that matches your overall mood.
              </Text>
            </View>
          </View>

          <View style={styles.moodRow}>{MOOD_OPTIONS.map(renderMoodButton)}</View>

          <AppButton title="Save today's mood" onPress={handleSaveMood} />
        </View>

        <View style={styles.sectionTitleContainer}>
          <View style={styles.sectionIconContainer}>
            <Text style={styles.sectionIcon}>📝</Text>
          </View>
          <Text style={styles.sectionTitle}>Previous entries</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{entries.length}</Text>
          </View>
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📭</Text>
            </View>
            <Text style={styles.noEntriesTitle}>No entries yet</Text>
            <Text style={styles.noEntriesText}>
              Once you start saving your mood, your recent days will show up
              here.
            </Text>
          </View>
        ) : (
          <View style={styles.entriesCard}>
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={renderEntry}
              style={styles.entriesList}
              contentContainerStyle={styles.entriesContent}
              showsVerticalScrollIndicator={false}
              scrollEnabled={true}        // now this card scrolls
              nestedScrollEnabled={true}  // helps on Android with nested scroll
            />
        </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Background decorative circles
  bgCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(56,189,248,0.06)",
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139,92,246,0.05)",
    bottom: 200,
    left: -80,
  },

  headerWrapper: {
    marginBottom: appSpacing.l * 1.5,
    marginTop: appSpacing.s,
  },
  badgeContainer: {
    alignSelf: "flex-start",
    marginBottom: appSpacing.m,
  },
  badge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "700",
    color: "#38BDF8",
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: appColors.text,
    marginBottom: 8,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: appColors.subtleText,
    lineHeight: 22,
    fontWeight: "500",
  },
  debugText: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 8,
    fontWeight: "600",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: appSpacing.l * 1.5,
    marginBottom: appSpacing.l * 1.5,
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.15)",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 12,
    overflow: "hidden",
  },
  cardGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#38BDF8",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: appSpacing.l,
    gap: 12,
  },
  cardIcon: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 20,
    fontWeight: "500",
  },

  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: appSpacing.l,
    gap: 8,
  },
  moodButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: "rgba(148,163,184,0.3)",
    backgroundColor: "#F8FAFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  moodButtonSelected: {
    backgroundColor: "#38BDF8",
    borderColor: "#0EA5E9",
    shadowColor: "#38BDF8",
    shadowOpacity: 0.3,
    elevation: 8,
  },
  moodEmojiContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    alignItems: "center",
    justifyContent: "center",
  },
  moodEmoji: {
    fontSize: 20,
  },
  moodButtonText: {
    fontSize: 15,
    color: appColors.text,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  moodButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.l,
    gap: 12,
  },
  sectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(56,189,248,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.2)",
  },
  sectionIcon: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
    flex: 1,
    letterSpacing: -0.3,
  },
  sectionBadge: {
    backgroundColor: "#38BDF8",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: "center",
  },
  sectionBadgeText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: appSpacing.l * 2,
    borderWidth: 2,
    borderColor: "rgba(148,163,184,0.15)",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(56,189,248,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.2)",
  },
  emptyIcon: {
    fontSize: 40,
  },
  noEntriesTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  noEntriesText: {
    fontSize: 14,
    color: appColors.subtleText,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "500",
  },

  entriesCard: {
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: appSpacing.l,
    paddingVertical: appSpacing.m,
    borderWidth: 2,
    borderColor: "rgba(56,189,248,0.15)",
    maxHeight: 320,
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 25,
    elevation: 8,
  },
  entriesList: {},
  entriesContent: {
    paddingVertical: appSpacing.s,
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: "rgba(56,189,248,0.04)",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(56,189,248,0.1)",
    gap: 12,
  },
  entryIndexContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#38BDF8",
    alignItems: "center",
    justifyContent: "center",
  },
  entryIndex: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "800",
  },
  entryMoodContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  entryMoodEmoji: {
    fontSize: 24,
  },
  entryMood: {
    fontSize: 16,
    color: appColors.text,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  entryDateContainer: {
    backgroundColor: "rgba(56,189,248,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.2)",
  },
  entryDate: {
    fontSize: 12,
    color: appColors.text,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
