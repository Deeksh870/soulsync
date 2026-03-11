// app/rewards.tsx
// @ts-nocheck

import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
// 🔹 IMPORTANT: make sure this path matches how you import useAuth elsewhere
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "./contexts/AuthContext";

type DailyCheckin = {
  date?: string;
  createdAt?: string;
};

export default function RewardsScreen() {
  const { user } = useAuth();
  const email = user?.email ?? "guest";

  const [totalCheckins, setTotalCheckins] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selfHelpSessions, setSelfHelpSessions] = useState(0);
  const [moodEntriesCount, setMoodEntriesCount] = useState(0);
  const [gratitudeEntriesCount, setGratitudeEntriesCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const [levelProgress, setLevelProgress] = useState(0);

  const screenAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(screenAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
      easing: Easing.out(Easing.quad),
    }).start();
  }, []);

  useEffect(() => {
    loadStats();
  }, [email]);

  const loadStats = async () => {
    try {
      const dailyKey = `@daily_checkins_${email}`;
      const selfHelpKey = `@self_help_sessions_${email}`;
      const moodKey = `@mood_entries_${email}`;
      const gratitudeKey = `@gratitude_entries_${email}`;

      const [dailyRaw, selfHelpRaw, moodRaw, gratitudeRaw] =
        await Promise.all([
          AsyncStorage.getItem(dailyKey),
          AsyncStorage.getItem(selfHelpKey),
          AsyncStorage.getItem(moodKey),
          AsyncStorage.getItem(gratitudeKey),
        ]);

      const dailyCheckins: DailyCheckin[] = dailyRaw ? JSON.parse(dailyRaw) : [];
      const selfHelpCount = selfHelpRaw ? Number(selfHelpRaw) || 0 : 0;
      const moods = moodRaw ? JSON.parse(moodRaw) : [];
      const gratitude = gratitudeRaw ? JSON.parse(gratitudeRaw) : [];

      const totalCheckinsCount = dailyCheckins.length;
      setTotalCheckins(totalCheckinsCount);
      setSelfHelpSessions(selfHelpCount);
      setMoodEntriesCount(moods.length);
      setGratitudeEntriesCount(gratitude.length);

      const dates = dailyCheckins
        .map((c) => c.date || c.createdAt)
        .filter(Boolean)
        .map((d) => new Date(d as string));

      const { current, best } = calculateStreaks(dates);
      setCurrentStreak(current);
      setBestStreak(best);

      // XP / level logic (same as before, just written clearly)
      const totalPoints =
        totalCheckinsCount * 10 +
        selfHelpCount * 8 +
        moods.length * 5 +
        gratitude.length * 6;

      const currentLevel = Math.floor(totalPoints / 60) + 1;
      const progressWithinLevel = (totalPoints % 60) / 60;

      setPoints(totalPoints);
      setLevel(currentLevel);
      setLevelProgress(progressWithinLevel);
    } catch (e) {
      console.log("Error loading rewards stats", e);
    }
  };

  const levelProgressWidth = `${Math.round(levelProgress * 100)}%`;

  const badges = buildBadges({
    totalCheckins,
    selfHelpSessions,
    bestStreak,
    gratitudeEntriesCount,
  });
  const unlockedCount = badges.filter((b) => b.unlocked).length;

  // daily challenge: 5 self-help sessions (just for demo)
  const challengeGoal = 5;
  const challengeProgress = Math.min(selfHelpSessions, challengeGoal);
  const challengePercent = `${Math.round(
    (challengeProgress / challengeGoal) * 100
  )}%`;
  const challengeCompleted = challengeProgress >= challengeGoal;

  return (
    <ScreenContainer>
      <Animated.View
        style={[
          styles.root,
          {
            opacity: screenAnim,
            transform: [
              {
                translateY: screenAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* HEADER */}
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>Rewards & Progress</Text>
              <Text style={styles.headerSubtitle}>
                Here’s how consistently you’ve been caring for yourself 💜
              </Text>
            </View>
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeEmoji}>🏆</Text>
            </View>
          </View>

          {/* LEVEL SUMMARY */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>SoulSync level</Text>
            <View style={styles.levelRow}>
              <Text style={styles.levelValue}>Lv {level}</Text>
              <Text style={styles.levelPoints}>{points} XP</Text>
            </View>

            <View style={styles.progressOuter}>
              <View
                style={[
                  styles.progressInner,
                  { width: levelProgressWidth },
                ]}
              />
            </View>
            <Text style={styles.progressInfo}>
              {Math.round(levelProgress * 100)}% to next level
            </Text>

            <View style={styles.levelChipsRow}>
              <View style={styles.levelChip}>
                <Text style={styles.levelChipLabel}>Current streak</Text>
                <Text style={styles.levelChipValue}>
                  {currentStreak} day{currentStreak === 1 ? "" : "s"}
                </Text>
              </View>
              <View style={styles.levelChip}>
                <Text style={styles.levelChipLabel}>Best streak</Text>
                <Text style={styles.levelChipValue}>
                  {bestStreak} day{bestStreak === 1 ? "" : "s"}
                </Text>
              </View>
            </View>
          </View>

          {/* HIGHLIGHTS */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Highlights</Text>
            <View style={styles.statsGrid}>
              <StatBox emoji="📅" label="Check-ins" value={totalCheckins} />
              <StatBox emoji="🧘‍♀️" label="Self-help" value={selfHelpSessions} />
              <StatBox emoji="📊" label="Mood logs" value={moodEntriesCount} />
              <StatBox emoji="💖" label="Gratitude" value={gratitudeEntriesCount} />
            </View>
          </View>

          {/* ACHIEVEMENTS */}
          <View style={styles.card}>
            <View style={styles.achHeaderRow}>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.achCount}>
                {unlockedCount}/{badges.length} unlocked
              </Text>
            </View>

            {badges.map((badge) => (
              <View key={badge.id} style={styles.badgeRow}>
                <View style={styles.badgeIconCircle}>
                  <Text style={styles.badgeEmoji}>{badge.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.badgeTitle}>{badge.title}</Text>
                  <Text style={styles.badgeSubtitle}>{badge.short}</Text>
                  <View style={styles.badgeProgressOuter}>
                    <View
                      style={[
                        styles.badgeProgressInner,
                        { width: `${Math.round(badge.progress * 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.badgeProgressText}>
                    {badge.progressText}
                  </Text>
                </View>
                <View
                  style={[
                    styles.badgeStatusPill,
                    badge.unlocked && styles.badgeStatusPillUnlocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeStatusText,
                      badge.unlocked && styles.badgeStatusTextUnlocked,
                    ]}
                  >
                    {badge.unlocked ? "Unlocked" : "Locked"}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* DAILY CHALLENGE */}
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Daily challenge</Text>
            <Text style={styles.challengeText}>
              Complete 5 self-help sessions today to earn a bonus 500 XP.
            </Text>

            <View style={styles.challengeRow}>
              <View style={styles.challengeBarOuter}>
                <View
                  style={[
                    styles.challengeBarInner,
                    { width: challengePercent },
                  ]}
                />
              </View>
              <Text style={styles.challengeCount}>
                {challengeProgress}/{challengeGoal}
              </Text>
            </View>

            <Text style={styles.challengeHint}>
              {challengeCompleted
                ? "You’ve finished today’s challenge 🎉"
                : "Try a breathing, grounding, mindfulness or gratitude tool to move this bar."}
            </Text>
          </View>

          <View style={{ height: appSpacing.xl }} />
        </ScrollView>
      </Animated.View>
    </ScreenContainer>
  );
}

/* ---------- helpers (logic) ---------- */

function calculateStreaks(dates: Date[]) {
  if (!dates || dates.length === 0) return { current: 0, best: 0 };

  const uniqueDays = Array.from(
    new Set(
      dates.map((d) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
      )
    )
  ).sort((a, b) => a - b);

  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).getTime();

  let bestStreak = 1;
  let streak = 1;

  for (let i = 1; i < uniqueDays.length; i++) {
    const prev = uniqueDays[i - 1];
    const curr = uniqueDays[i];
    const diffDays = (curr - prev) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      streak += 1;
      if (streak > bestStreak) bestStreak = streak;
    } else {
      streak = 1;
    }
  }

  let currentStreak = 0;
  let cursor = todayOnly;

  while (uniqueDays.includes(cursor)) {
    currentStreak += 1;
    cursor -= 1000 * 60 * 60 * 24;
  }

  return { current: currentStreak, best: bestStreak };
}

function buildBadges({
  totalCheckins,
  selfHelpSessions,
  bestStreak,
  gratitudeEntriesCount,
}: any) {
  return [
    {
      id: "first_checkin",
      icon: "🌈",
      title: "First Step",
      short: "Complete your first check-in.",
      unlocked: totalCheckins >= 1,
      progress: Math.min(totalCheckins / 1, 1),
      progressText: `${totalCheckins}/1 check-ins`,
    },
    {
      id: "checkin_7",
      icon: "📅",
      title: "Weekly Warrior",
      short: "Check in on 7 different days.",
      unlocked: totalCheckins >= 7,
      progress: Math.min(totalCheckins / 7, 1),
      progressText: `${totalCheckins}/7 check-ins`,
    },
    {
      id: "streak_3",
      icon: "⚡️",
      title: "Streak Starter",
      short: "3-day streak achieved.",
      unlocked: bestStreak >= 3,
      progress: Math.min(bestStreak / 3, 1),
      progressText: `Best streak: ${bestStreak}/3 days`,
    },
    {
      id: "selfhelp_5",
      icon: "🧘‍♀️",
      title: "Self-Care Starter",
      short: "Use 5 self-help tools.",
      unlocked: selfHelpSessions >= 5,
      progress: Math.min(selfHelpSessions / 5, 1),
      progressText: `${selfHelpSessions}/5 tools`,
    },
    {
      id: "gratitude_5",
      icon: "💖",
      title: "Gratitude Glow",
      short: "Write 5 gratitude notes.",
      unlocked: gratitudeEntriesCount >= 5,
      progress: Math.min(gratitudeEntriesCount / 5, 1),
      progressText: `${gratitudeEntriesCount}/5 notes`,
    },
  ];
}

/* ---------- small stat box ---------- */

function StatBox({ emoji, label, value }: any) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ---------- styles: light purple SoulSync look ---------- */

// ENHANCED STYLES for app/rewards.tsx
// Replace the entire StyleSheet.create section with this:

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: appSpacing.l,
    paddingVertical: appSpacing.l,
    paddingBottom: appSpacing.l * 3,
  },

  /* === HEADER === */
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: appSpacing.l * 1.5,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: appColors.textPrimary || "#1F2937",
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: appColors.textSecondary || "#6B7280",
    lineHeight: 22,
    fontWeight: "500",
  },
  headerBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEF3C7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#FCD34D",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  headerBadgeEmoji: {
    fontSize: 40,
  },

  /* === SHARED CARD === */
  card: {
    width: "100%",
    borderRadius: 32,
    backgroundColor: "#FFFFFF",
    padding: appSpacing.l * 1.5,
    marginBottom: appSpacing.l * 1.2,
    shadowColor: "#8B5CF6",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 16 },
    shadowRadius: 30,
    elevation: 12,
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.1)",
  },

  /* === LEVEL SECTION === */
  cardLabel: {
    fontSize: 12,
    color: appColors.textSecondary || "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "800",
    marginBottom: 8,
  },
  levelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: appSpacing.m,
  },
  levelValue: {
    fontSize: 48,
    fontWeight: "900",
    color: "#8B5CF6",
    letterSpacing: -2,
  },
  levelPoints: {
    fontSize: 16,
    color: appColors.textSecondary || "#6B7280",
    fontWeight: "700",
    backgroundColor: "rgba(139,92,246,0.1)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: "hidden",
  },
  
  progressOuter: {
    height: 14,
    borderRadius: 999,
    backgroundColor: "#E9D5FF",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.2)",
  },
  progressInner: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  progressInfo: {
    marginTop: 10,
    fontSize: 14,
    color: appColors.textSecondary || "#6B7280",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  
  levelChipsRow: {
    marginTop: appSpacing.l,
    flexDirection: "row",
    gap: 12,
  },
  levelChip: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "rgba(139,92,246,0.08)",
    paddingVertical: appSpacing.m,
    paddingHorizontal: appSpacing.m,
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.15)",
    alignItems: "center",
  },
  levelChipLabel: {
    fontSize: 11,
    color: appColors.textSecondary || "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  levelChipValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#8B5CF6",
    letterSpacing: -0.5,
  },

  /* === SECTIONS === */
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: appColors.textPrimary || "#1F2937",
    letterSpacing: -0.5,
    marginBottom: appSpacing.m,
  },

  /* === STATS GRID === */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statBox: {
    flexBasis: "48%",
    borderRadius: 24,
    backgroundColor: "rgba(139,92,246,0.06)",
    paddingVertical: appSpacing.l,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.12)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "900",
    color: "#8B5CF6",
    letterSpacing: -1,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: appColors.textSecondary || "#6B7280",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  /* === ACHIEVEMENTS === */
  achHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: appSpacing.l,
  },
  achCount: {
    fontSize: 14,
    fontWeight: "800",
    color: "#8B5CF6",
    backgroundColor: "rgba(139,92,246,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.2)",
  },
  
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.l,
    padding: appSpacing.m,
    backgroundColor: "rgba(139,92,246,0.04)",
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(139,92,246,0.1)",
    gap: 14,
  },
  badgeIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2.5,
    borderColor: "rgba(139,92,246,0.25)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: appColors.textPrimary || "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  badgeSubtitle: {
    fontSize: 13,
    color: appColors.textSecondary || "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
    lineHeight: 18,
  },
  
  badgeProgressOuter: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#E9D5FF",
    overflow: "hidden",
    marginBottom: 6,
  },
  badgeProgressInner: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
  },
  badgeProgressText: {
    fontSize: 11,
    color: appColors.textSecondary || "#6B7280",
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  
  badgeStatusPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(148,163,184,0.3)",
  },
  badgeStatusPillUnlocked: {
    backgroundColor: "#22C55E",
    borderColor: "#16A34A",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  badgeStatusText: {
    fontSize: 11,
    fontWeight: "800",
    color: appColors.textSecondary || "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  badgeStatusTextUnlocked: {
    color: "#FFFFFF",
  },

  /* === DAILY CHALLENGE === */
  challengeText: {
    fontSize: 15,
    color: appColors.textSecondary || "#6B7280",
    lineHeight: 22,
    fontWeight: "500",
  },
  challengeRow: {
    marginTop: appSpacing.l,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  challengeBarOuter: {
    flex: 1,
    height: 12,
    borderRadius: 999,
    backgroundColor: "#E9D5FF",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.2)",
  },
  challengeBarInner: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#22C55E",
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
  },
  challengeCount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#22C55E",
    backgroundColor: "rgba(34,197,94,0.12)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(34,197,94,0.3)",
  },
  challengeHint: {
    marginTop: appSpacing.m,
    fontSize: 13,
    color: appColors.textSecondary || "#6B7280",
    lineHeight: 20,
    fontWeight: "600",
  },
});