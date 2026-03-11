// app/journal.tsx
import AppButton from "@/components/AppButton";
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";

type JournalEntry = {
  id: string;
  text: string;
  date: string;
};

export default function JournalScreen() {
  useProtectedRoute();
  const [text, setText] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const { user } = useAuth();
  const email = user?.email || "guest";

  const STORAGE_KEY = `@journal_entries_${email}`;

  // Load saved entries on first render
  useEffect(() => {
    const loadEntries = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          const saved: JournalEntry[] = JSON.parse(json);
          setEntries(saved);
        }
      } catch (error) {
        console.log("Error loading journal entries", error);
      }
    };

    loadEntries();
  }, []);

  // Save entries to storage
  const saveEntries = async (newEntries: JournalEntry[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (error) {
      console.log("Error saving journal entries", error);
    }
  };

  const handleAddEntry = () => {
    if (!text.trim()) {
      return;
    }

    const now = new Date();
    const dateLabel = `${now.getDate()}/${
      now.getMonth() + 1
    }/${now.getFullYear()} ${now.getHours()}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    const newEntry: JournalEntry = {
      id: now.getTime().toString(),
      text: text.trim(),
      date: dateLabel,
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveEntries(updated);
    setText("");
  };

  const renderEntry = ({ item }: { item: JournalEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryDateContainer}>
        <View style={styles.dateIconCircle}>
          <Text style={styles.dateIcon}>📅</Text>
        </View>
        <Text style={styles.entryDate}>{item.date}</Text>
      </View>
      <Text style={styles.entryText}>{item.text}</Text>
      <View style={styles.entryBottomAccent} />
    </View>
  );

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Decorative background elements */}
        <View style={styles.backgroundDecor1} />
        <View style={styles.backgroundDecor2} />
        
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeGlow} />
            <Text style={styles.badge}>🔒 Private space</Text>
          </View>
          <Text style={styles.title}>✍️ My Journal</Text>
          <View style={styles.subtitleContainer}>
            <View style={styles.accentLine} />
            <Text style={styles.subtitle}>
              A safe place to write your thoughts, feelings or small reflections
              from your day.
            </Text>
          </View>
        </View>

        {/* Write card */}
        <View style={styles.writeCard}>
          <View style={styles.writeCardGradient} />
          <View style={styles.writeHeader}>
            <View style={styles.writeIconCircle}>
              <Text style={styles.writeIcon}>✨</Text>
            </View>
            <View>
              <Text style={styles.writeTitle}>New entry</Text>
              <Text style={styles.writeSubtitle}>
                You don't have to write a lot. Even two lines are enough.
              </Text>
            </View>
          </View>

          <View style={styles.inputWrapper}>
            <View style={styles.inputGlow} />
            <TextInput
              style={styles.input}
              placeholder="Type your thoughts here..."
              placeholderTextColor="#A78BFA"
              multiline
              value={text}
              onChangeText={setText}
              textAlignVertical="top"
            />
          </View>

          <AppButton title="Save entry" onPress={handleAddEntry} />
        </View>

        {/* History header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconCircle}>
            <Text style={styles.sectionIcon}>📚</Text>
          </View>
          <Text style={styles.sectionTitle}>Previous entries</Text>
          {entries.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{entries.length}</Text>
            </View>
          )}
        </View>

        {entries.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📝</Text>
            </View>
            <Text style={styles.emptyTitle}>No journal entries yet</Text>
            <Text style={styles.emptyText}>
              When you save your first entry, it will appear here so you can
              look back on how far you've come.
            </Text>
            <View style={styles.emptyDecor} />
          </View>
        ) : (
          <FlatList
            data={entries}
            keyExtractor={(item) => item.id}
            renderItem={renderEntry}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // Decorative background elements
  backgroundDecor1: {
    position: "absolute",
    top: -100,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(167, 139, 250, 0.08)",
    opacity: 0.6,
  },
  backgroundDecor2: {
    position: "absolute",
    top: 150,
    left: -80,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(139, 92, 246, 0.06)",
    opacity: 0.5,
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
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    opacity: 0.4,
    transform: [{ scale: 1.1 }],
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "700",
    color: "#7C3AED",
    backgroundColor: "rgba(139,92,246,0.15)",
    overflow: "hidden",
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  accentLine: {
    width: 3,
    height: "100%",
    backgroundColor: "#A78BFA",
    borderRadius: 2,
    marginRight: 10,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 20,
  },

  writeCard: {
    position: "relative",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.2)",
    marginBottom: appSpacing.l,
    shadowColor: "#8B5CF6",
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
    backgroundColor: "#8B5CF6",
  },
  writeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  writeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  writeIcon: {
    fontSize: 24,
  },
  writeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: appColors.text,
    marginBottom: 2,
  },
  writeSubtitle: {
    fontSize: 13,
    color: appColors.subtleText,
  },

  inputWrapper: {
    position: "relative",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.2)",
    backgroundColor: "#FAFAF9",
    marginBottom: appSpacing.m,
    overflow: "hidden",
  },
  inputGlow: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#A78BFA",
    opacity: 0.5,
  },
  input: {
    paddingHorizontal: appSpacing.m,
    paddingVertical: appSpacing.m,
    minHeight: 120,
    fontSize: 15,
    color: appColors.text,
    lineHeight: 22,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  sectionIcon: {
    fontSize: 16,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: appColors.text,
  },
  countBadge: {
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  emptyCard: {
    position: "relative",
    borderRadius: 20,
    backgroundColor: "#FEFCE8",
    padding: appSpacing.xl,
    borderWidth: 2,
    borderColor: "rgba(234, 179, 8, 0.3)",
    alignItems: "center",
    overflow: "hidden",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(234, 179, 8, 0.15)",
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
    backgroundColor: "rgba(234, 179, 8, 0.08)",
  },

  listContent: {
    paddingBottom: appSpacing.l * 2,
  },
  entryCard: {
    position: "relative",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    padding: appSpacing.l,
    borderWidth: 1.5,
    borderColor: "rgba(139, 92, 246, 0.15)",
    marginBottom: appSpacing.m,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  entryDateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  dateIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  dateIcon: {
    fontSize: 14,
  },
  entryDate: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  entryText: {
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
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },
});