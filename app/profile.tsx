// app/profile.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";

import {
  Linking,
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

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const [totalCheckins, setTotalCheckins] = useState(0);
  const [averageMood, setAverageMood] = useState<string>("0.0");
  const [commonMood, setCommonMood] = useState("N/A");
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  const email = user?.email || "guest";

  // ✅ per-user mood key (matches Mood Tracker)
  const MOOD_STORAGE_KEY = `@mood_entries_${email}`;

  useEffect(() => {
    async function loadStats() {
      try {
        const json = await AsyncStorage.getItem(MOOD_STORAGE_KEY);
        if (!json) {
          setTotalCheckins(0);
          setAverageMood("0.0");
          setCommonMood("N/A");
          setEntries([]);
          return;
        }

        const parsed: MoodEntry[] = JSON.parse(json);
        setEntries(parsed);

        // Total logs
        setTotalCheckins(parsed.length);

        const moodToScore: any = {
          Happy: 5,
          Okay: 4,
          Tired: 3,
          Sad: 2,
          Angry: 1,
        };

        const scores = parsed.map((e) => moodToScore[e.mood] || 0);

        // Average mood
        if (scores.length > 0) {
          const avg =
            scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
          setAverageMood(avg.toFixed(1));
        } else {
          setAverageMood("0.0");
        }

        // Most common mood
        const count: Record<string, number> = {};
        for (let e of parsed) {
          count[e.mood] = (count[e.mood] || 0) + 1;
        }
        const sorted = Object.entries(count).sort((a, b) => b[1] - a[1]);
        setCommonMood(sorted[0]?.[0] || "N/A");
      } catch (err) {
        console.log("Error loading stats", err);
      }
    }

    loadStats();
  }, [MOOD_STORAGE_KEY]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  // ✅ Build mail body text from this user's moods
    const buildMoodSummaryText = () => {
    const friendlyName =
      user?.name || user?.email?.split("@")[0] || "SoulSync User";

    // Use the stats we already calculated in state
    const total = totalCheckins;
    const common = commonMood;
    const avgDisplay =
      total > 0 && averageMood !== "0.0" ? `${averageMood} / 5` : "N/A";

    let weeklyInsight: string;

    if (total === 0) {
      weeklyInsight =
        "You don't have any mood logs yet. Try checking in daily to start building your insights.";
    } else if (total < 5) {
      weeklyInsight =
        "You don't have enough mood logs this week. Try checking in daily to unlock weekly insights.";
    } else {
      // you can tweak this logic however you like
      const avgNum = parseFloat(averageMood);
      if (avgNum >= 4) {
        weeklyInsight =
          "Your recent logs show mostly positive moods. Keep nurturing the habits that support you ✨";
      } else if (avgNum <= 2) {
        weeklyInsight =
          "Your recent mood logs look a bit low. Be gentle with yourself and consider using SoulSync's self-help tools or talking to someone you trust 💛";
      } else {
        weeklyInsight =
          "You're experiencing a mix of moods this week. Keep checking in to understand your patterns better.";
      }
    }

    return (
      `Hi ${friendlyName},\n\n` +
      `Here is your recent mood summary from SoulSync:\n\n` +
      `• Total check-ins: ${total}\n` +
      `• Most common mood: ${common}\n` +
      `• Average mood score: ${avgDisplay}\n\n` +
      `Weekly insight:\n` +
      `${weeklyInsight}\n\n` +
      `— Sent from SoulSync`
    );
  };


  const handleEmailSummary = () => {
    const subject = encodeURIComponent("My SoulSync Mood Summary");
    const body = encodeURIComponent(buildMoodSummaryText());
    const to = email; // send to user's own email
    const mailto = `mailto:${to}?subject=${subject}&body=${body}`;

    Linking.openURL(mailto).catch((err) =>
      console.log("Error opening email app:", err)
    );
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Background decorative circles */}
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
        <View style={styles.bgCircle3} />

        <View style={styles.headerWrapper}>
          <View style={styles.appBadgeContainer}>
            <Text style={styles.appBadge}>👤 Profile</Text>
          </View>
          
          {/* Profile Avatar Circle */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarCircle}>
              <View style={styles.avatarGlow} />
              <Text style={styles.avatarText}>
                {(user?.name || "U").charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>
            Hi, {user?.name || "SoulSync User"} 👋
          </Text>
          <Text style={styles.subtitle}>
            Here's your personalized SoulSync dashboard.
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📋</Text>
            <Text style={styles.cardTitle}>Account details</Text>
          </View>
          <View style={styles.cardDivider} />

          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>👤</Text>
              <Text style={styles.label}>Name</Text>
            </View>
            <Text style={styles.value}>{user?.name || "User"}</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={styles.labelIcon}>📧</Text>
              <Text style={styles.label}>Email</Text>
            </View>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📊</Text>
            <Text style={styles.cardTitle}>Your SoulSync stats</Text>
          </View>
          <View style={styles.cardDivider} />

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statEmoji}>✅</Text>
              </View>
              <Text style={styles.statNumber}>{totalCheckins}</Text>
              <Text style={styles.statLabel}>Total check-ins</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statEmoji}>😊</Text>
              </View>
              <Text style={styles.statNumber}>{commonMood}</Text>
              <Text style={styles.statLabel}>Most common mood</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statEmoji}>⭐</Text>
              </View>
              <Text style={styles.statNumber}>{averageMood}</Text>
              <Text style={styles.statLabel}>Average mood score</Text>
            </View>

            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Text style={styles.statEmoji}>🔮</Text>
              </View>
              <Text style={styles.statNumber}>Soon</Text>
              <Text style={styles.statLabel}>Weekly insights</Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsWrapper}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/dashboard")}
          >
            <View style={styles.buttonGradient} />
            <View style={styles.buttonShine} />
            <Text style={styles.primaryButtonText}>🏠 Go to dashboard</Text>
          </Pressable>

          {/* ✉️ New: Email my mood summary */}
          <Pressable
            style={styles.secondaryButton}
            onPress={handleEmailSummary}
          >
            <View style={styles.secondaryButtonGlow} />
            <Text style={styles.secondaryButtonText}>
              📧 Email my mood summary
            </Text>
          </Pressable>

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Log out</Text>
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

  // Background decorative circles
  bgCircle1: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(139,92,246,0.06)",
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(56,189,248,0.05)",
    top: 300,
    left: -80,
  },
  bgCircle3: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(236,72,153,0.04)",
    bottom: 200,
    right: -50,
  },

  headerWrapper: {
    marginBottom: appSpacing.l * 1.5,
    marginTop: appSpacing.m,
    alignItems: "center",
  },
  appBadgeContainer: {
    marginBottom: appSpacing.l,
  },
  appBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: "700",
    color: "#38BDF8",
    backgroundColor: "rgba(56,189,248,0.12)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.25)",
    letterSpacing: 0.5,
  },

  avatarContainer: {
    marginBottom: appSpacing.l,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 12,
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#8B5CF6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 5,
    borderColor: "rgba(255,255,255,0.95)",
    overflow: "hidden",
  },
  avatarGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    top: 10,
    left: 10,
  },
  avatarText: {
    fontSize: 42,
    fontWeight: "900",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  title: {
    fontSize: 32,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    color: appColors.subtleText,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
    paddingHorizontal: appSpacing.l,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: appSpacing.l * 1.5,
    marginBottom: appSpacing.l * 1.2,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 10,
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.1)",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: appColors.text,
    letterSpacing: -0.3,
  },
  cardDivider: {
    height: 2,
    backgroundColor: "rgba(139,92,246,0.1)",
    marginBottom: appSpacing.l,
    borderRadius: 1,
  },

  row: {
    marginBottom: appSpacing.l,
    paddingBottom: appSpacing.m,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(148,163,184,0.1)",
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  label: {
    fontSize: 13,
    color: appColors.subtleText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  value: {
    fontSize: 17,
    fontWeight: "700",
    color: appColors.text,
    letterSpacing: 0.2,
  },

  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: appSpacing.m,
  },
  statItem: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "rgba(139,92,246,0.08)",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.15)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.2)",
  },
  statEmoji: {
    fontSize: 24,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#8B5CF6",
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 12,
    color: appColors.subtleText,
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 16,
  },

  actionsWrapper: {
    marginTop: appSpacing.m,
    gap: appSpacing.m,
    marginBottom: appSpacing.l,
  },
  primaryButton: {
    backgroundColor: "#8B5CF6",
    paddingVertical: 17,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.8)",
  },
  buttonGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(236,72,153,0.15)",
  },
  buttonShine: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "60%",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.8,
    textShadowColor: "rgba(0,0,0,0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  secondaryButton: {
    borderWidth: 2.5,
    borderColor: "#8B5CF6",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(139,92,246,0.06)",
    overflow: "hidden",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  secondaryButtonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(139,92,246,0.05)",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#8B5CF6",
    letterSpacing: 0.5,
  },
  logoutButton: {
    borderWidth: 2,
    borderColor: "rgba(239,68,68,0.4)",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(239,68,68,0.05)",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#EF4444",
    letterSpacing: 0.5,
  },
});