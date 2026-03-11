// app/weekly-report.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useAuth } from "./contexts/AuthContext";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

type DailyCheckIn = {
  date: string; // "YYYY-MM-DD"
  score: number; // 1–5
};

const MAX_SCORE = 5;
const CHART_HEIGHT = 180;

export default function WeeklyReportScreen() {
  useProtectedRoute();

  // ✅ useAuth INSIDE component only
  const { user } = useAuth();
  const email = user?.email || "guest";
  const DAILY_STORAGE_KEY = `@daily_checkins_${email}`;

  const [data, setData] = useState<DailyCheckIn[]>([]);
  const [animatedValues, setAnimatedValues] = useState<Animated.Value[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const json = await AsyncStorage.getItem(DAILY_STORAGE_KEY);
        if (!json) {
          setData([]);
          return;
        }

        const all: DailyCheckIn[] = JSON.parse(json);

        // Sort by date ascending and take last 7 entries
        const sorted = [...all].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        const lastSeven = sorted.slice(-7);

        setData(lastSeven);
      } catch (err) {
        console.log("Error loading weekly data", err);
      }
    };

    loadData();
  }, [DAILY_STORAGE_KEY]);

  // Animate bars when data changes
  useEffect(() => {
    if (!data.length) return;

    const values = data.map(() => new Animated.Value(0));
    setAnimatedValues(values);

    const animations = values.map((v, index) =>
      Animated.timing(v, {
        toValue: 1,
        duration: 600,
        delay: index * 120,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      })
    );

    Animated.stagger(80, animations).start();
  }, [data]);

  const average =
    data.length > 0
      ? data.reduce((sum, d) => sum + d.score, 0) / data.length
      : 0;

  const bestDay =
    data.length > 0
      ? data.reduce((prev, curr) => (curr.score > prev.score ? curr : prev))
      : null;

  const worstDay =
    data.length > 0
      ? data.reduce((prev, curr) => (curr.score < prev.score ? curr : prev))
      : null;

  const formatDateLabel = (iso: string) => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = d.getDate();
    const month = d.toLocaleString("default", { month: "short" });
    return `${day} ${month}`;
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeGlow} />
            <Text style={styles.badge}>📅 WEEKLY OVERVIEW</Text>
          </View>
          <Text style={styles.title}>Check-In Report</Text>
          <Text style={styles.subtitle}>
            Track your emotional journey through daily 1-5 mood check-ins and discover patterns in your week
          </Text>
        </View>

        {/* If no data */}
        {!data.length ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📊</Text>
            </View>
            <Text style={styles.emptyTitle}>No Check-Ins Yet</Text>
            <Text style={styles.emptyText}>
              Start answering the daily 1-5 mood question in your chatbot conversations. Your personalized weekly chart will appear here automatically.
            </Text>
            <View style={styles.emptyDecoration}>
              <View style={styles.emptyDot} />
              <View style={[styles.emptyDot, { opacity: 0.6 }]} />
              <View style={[styles.emptyDot, { opacity: 0.3 }]} />
            </View>
            <View style={styles.emptyAccent} />
          </View>
        ) : (
          <>
            {/* Chart card */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View style={styles.chartTitleContainer}>
                  <View style={styles.chartIconBadge}>
                    <Text style={styles.chartIconText}>📊</Text>
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Your 7-Day Journey</Text>
                    <Text style={styles.sectionSubtitle}>
                      Higher bars indicate better emotional states (5 = excellent)
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.chartContainer}>
                <View style={styles.chartWrapper}>
                  {/* Y-axis labels */}
                  <View style={styles.yAxis}>
                    {[5, 4, 3, 2, 1].map((label) => (
                      <View key={label} style={styles.yAxisItem}>
                        <Text style={styles.yAxisLabel}>{label}</Text>
                        <View style={styles.yAxisDot} />
                      </View>
                    ))}
                  </View>

                  {/* Bars */}
                  <View style={styles.barsWrapper}>
                    {data.map((entry, index) => {
                      const progress =
                        animatedValues[index] || new Animated.Value(1);

                      const barHeight = progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [4, (entry.score / MAX_SCORE) * CHART_HEIGHT],
                      });

                      // Color based on score
                      const getBarColor = (score: number) => {
                        if (score >= 4.5) return "#10B981"; // Green
                        if (score >= 3.5) return "#3B82F6"; // Blue
                        if (score >= 2.5) return "#F59E0B"; // Amber
                        return "#EF4444"; // Red
                      };

                      return (
                        <View key={entry.date + index} style={styles.barItem}>
                          <View style={styles.barContainer}>
                            <Animated.View
                              style={[
                                styles.bar,
                                {
                                  height: barHeight,
                                  backgroundColor: getBarColor(entry.score),
                                },
                              ]}
                            >
                              <View style={styles.barGlow} />
                            </Animated.View>
                            <View style={styles.barScoreBadge}>
                              <Text style={styles.barScoreText}>{entry.score}</Text>
                            </View>
                          </View>
                          <Text style={styles.barLabel}>
                            {formatDateLabel(entry.date)}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </View>
            </View>

            {/* Stats card */}
            <View style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <Text style={styles.sectionTitle}>Weekly Summary</Text>
                <View style={styles.statsDecoration} />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statEmoji}>📈</Text>
                  </View>
                  <Text style={styles.statLabel}>Average Score</Text>
                  <Text style={styles.statValue}>
                    {average.toFixed(1)}
                  </Text>
                  <Text style={styles.statUnit}>out of 5</Text>
                </View>

                <View style={styles.statBox}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statEmoji}>📅</Text>
                  </View>
                  <Text style={styles.statLabel}>Days Logged</Text>
                  <Text style={styles.statValue}>{data.length}</Text>
                  <Text style={styles.statUnit}>check-ins</Text>
                </View>
              </View>

              {bestDay && (
                <View style={styles.highlightCard}>
                  <View style={styles.highlightIconWrapper}>
                    <Text style={styles.highlightIcon}>🌟</Text>
                  </View>
                  <View style={styles.highlightContent}>
                    <Text style={styles.highlightLabel}>Brightest Moment</Text>
                    <Text style={styles.highlightText}>
                      {formatDateLabel(bestDay.date)}
                    </Text>
                    <View style={styles.highlightScoreBadge}>
                      <Text style={styles.highlightScore}>{bestDay.score}/5</Text>
                    </View>
                  </View>
                </View>
              )}

              {worstDay && (
                <View style={[styles.highlightCard, styles.heavyCard]}>
                  <View style={styles.highlightIconWrapper}>
                    <Text style={styles.highlightIcon}>💙</Text>
                  </View>
                  <View style={styles.highlightContent}>
                    <Text style={styles.highlightLabel}>Challenging Moment</Text>
                    <Text style={styles.highlightText}>
                      {formatDateLabel(worstDay.date)}
                    </Text>
                    <View style={[styles.highlightScoreBadge, styles.heavyScoreBadge]}>
                      <Text style={styles.highlightScore}>{worstDay.score}/5</Text>
                    </View>
                  </View>
                </View>
              )}

              <View style={styles.noteCard}>
                <View style={styles.noteIconContainer}>
                  <Text style={styles.noteIcon}>💭</Text>
                </View>
                <Text style={styles.smallNote}>
                  Remember: There's no "perfect" week. Emotional ups and downs are a natural part of being human. What truly matters is noticing patterns and taking small, compassionate steps to care for yourself.
                </Text>
              </View>
            </View>
          </>
        )}

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
    backgroundColor: "#3B82F6",
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
    color: "#3B82F6",
    backgroundColor: "#EFF6FF",
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

  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.m,
    marginBottom: appSpacing.m,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  chartHeader: {
    marginBottom: appSpacing.l,
  },
  chartTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  chartIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.m,
  },
  chartIconText: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
    letterSpacing: 0.2,
  },

  chartContainer: {
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: appSpacing.m,
  },
  chartWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  yAxis: {
    justifyContent: "space-between",
    height: CHART_HEIGHT,
    marginRight: 16,
  },
  yAxisItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    minWidth: 12,
  },
  yAxisDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    marginLeft: 6,
  },
  barsWrapper: {
    flexDirection: "row",
    flex: 1,
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  barItem: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
  },
  barContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  bar: {
    width: 24,
    borderRadius: 12,
    marginBottom: 4,
    position: "relative",
    overflow: "hidden",
  },
  barGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "30%",
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
  },
  barScoreBadge: {
    position: "absolute",
    top: -8,
    backgroundColor: "#1F2937",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  barScoreText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  barLabel: {
    fontSize: 11,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "600",
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#EFF6FF",
  },
  statsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: appSpacing.l,
  },
  statsDecoration: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#3B82F6",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: appSpacing.l,
    gap: appSpacing.m,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    padding: appSpacing.m,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: appSpacing.s,
  },
  statEmoji: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
    textAlign: "center",
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#3B82F6",
    textAlign: "center",
    lineHeight: 32,
  },
  statUnit: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 2,
  },

  highlightCard: {
    flexDirection: "row",
    backgroundColor: "#FEF3C7",
    borderRadius: 16,
    padding: appSpacing.m,
    marginBottom: appSpacing.m,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  heavyCard: {
    backgroundColor: "#DBEAFE",
    borderColor: "#BFDBFE",
  },
  highlightIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.m,
  },
  highlightIcon: {
    fontSize: 24,
  },
  highlightContent: {
    flex: 1,
    justifyContent: "center",
  },
  highlightLabel: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  highlightText: {
    fontSize: 16,
    color: "#78350F",
    fontWeight: "700",
    marginBottom: 6,
  },
  highlightScoreBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FBBF24",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  heavyScoreBadge: {
    backgroundColor: "#3B82F6",
  },
  highlightScore: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  noteCard: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: appSpacing.m,
    marginTop: appSpacing.s,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  noteIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.s,
    marginTop: 2,
  },
  noteIcon: {
    fontSize: 16,
  },
  smallNote: {
    flex: 1,
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 18,
    fontWeight: "500",
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.xl,
    marginTop: appSpacing.m,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    position: "relative",
    overflow: "hidden",
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  emptyIcon: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: appSpacing.s,
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: appSpacing.m,
    marginBottom: appSpacing.m,
  },
  emptyDecoration: {
    flexDirection: "row",
    gap: 8,
    marginTop: appSpacing.s,
  },
  emptyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
  },
  emptyAccent: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#3B82F6",
    opacity: 0.04,
  },
});