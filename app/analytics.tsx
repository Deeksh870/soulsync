// app/analytics.tsx
import BackButton from "@/components/BackButton";
import LoadingScreen from "@/components/LoadingScreen";
import ScreenContainer from "@/components/ScreenContainer";
import { useAuth } from "./contexts/AuthContext";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

import { appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LineChart } from "react-native-chart-kit";

type MoodEntry = {
  id: string;
  mood: "Happy" | "Okay" | "Tired" | "Sad" | "Angry";
  date: string;
};

const moodToScore: Record<MoodEntry["mood"], number> = {
  Happy: 5,
  Okay: 4,
  Tired: 3,
  Sad: 2,
  Angry: 1,
};

export default function AnalyticsScreen() {
  useProtectedRoute(); // Route protection

  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [scores, setScores] = useState<number[]>([]);
  const [commonMood, setCommonMood] = useState("");
  const [averageMood, setAverageMood] = useState(0);
  const [recommendation, setRecommendation] = useState("");
  const [trendText, setTrendText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const email = user?.email || "guest";

  const STORAGE_KEY = `@mood_entries_${email}`;

  // Animations
  const statsAnim = useRef(new Animated.Value(0)).current;
  const recoAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadMoodData();
  }, []);

  useEffect(() => {
    if (scores.length === 0) return;

    statsAnim.setValue(0);
    recoAnim.setValue(0);

    Animated.stagger(150, [
      Animated.timing(statsAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(recoAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, [scores]);

  const loadMoodData = async () => {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEY);

      if (json) {
        const parsed: MoodEntry[] = JSON.parse(json);
        setMoods(parsed);

        const scoreList = parsed.map((m) => moodToScore[m.mood] || 0);
        setScores(scoreList);

        computeStats(parsed, scoreList);
      }
    } catch (error) {
      console.log("Error loading analytics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const computeStats = (entries: MoodEntry[], scoreList: number[]) => {
    if (entries.length === 0) return;

    // Most common mood
    const counts: Record<string, number> = {};
    entries.forEach((e) => {
      counts[e.mood] = (counts[e.mood] || 0) + 1;
    });

    const mostCommon = Object.keys(counts).sort(
      (a, b) => (counts[b] || 0) - (counts[a] || 0)
    )[0];

    setCommonMood(mostCommon);

    // Average
    const avg = scoreList.reduce((a, b) => a + b, 0) / scoreList.length;
    const roundedAvg = Number(avg.toFixed(1));
    setAverageMood(roundedAvg);

    // Trend
    if (scoreList.length >= 2) {
      const first = scoreList[0];
      const last = scoreList[scoreList.length - 1];
      const diff = last - first;

      if (diff >= 1) {
        setTrendText("Your overall mood trend is going up ✅");
      } else if (diff <= -1) {
        setTrendText("Your mood seems lower recently ⬇️");
      } else {
        setTrendText("Your mood has been stable ⚖️");
      }
    } else {
      setTrendText("Add more mood logs to view a trend.");
    }

    // Smart recommendations
    let rec = "";

    if (mostCommon === "Sad") {
      rec =
        "You seem low recently. Try the Grounding Technique or journaling ✍️.";
    } else if (mostCommon === "Angry") {
      rec =
        "You've logged anger often. Breathing exercises 🌬️ might help calm your body.";
    } else if (mostCommon === "Tired") {
      rec =
        "You seem mentally tired. A short mindfulness session could help 🧘.";
    } else if (mostCommon === "Okay") {
      rec =
        "You're doing alright. Gratitude logging might help lift your mood 🌈.";
    } else if (mostCommon === "Happy") {
      rec =
        "Great! Keep supporting your positive days with journaling and gratitude 😊.";
    }

    if (roundedAvg < 3) {
      rec =
        "Your average mood seems low. Try grounding, breathing, or talk to someone you trust.";
    }

    if (roundedAvg >= 4) {
      rec =
        "Your average mood is good 🎉. Keep the positivity with mindfulness or gratitude!";
    }

    setRecommendation(rec);
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your analytics..." />;
  }

  const chartWidth = Dimensions.get("window").width - appSpacing.l * 2;

  // Animated cards
  const statsStyle = {
    opacity: statsAnim,
    transform: [
      {
        translateY: statsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  const recoStyle = {
    opacity: recoAnim,
    transform: [
      {
        translateY: recoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [18, 0],
        }),
      },
    ],
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <BackButton />

        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeGlow} />
            <Text style={styles.badge}>✨ INSIGHTS</Text>
          </View>
          <Text style={styles.title}>Mood Analytics</Text>
          <Text style={styles.subtitle}>
            Understand your emotional patterns through data-driven insights 📊
          </Text>
        </View>

        {/* Empty State */}
        {scores.length === 0 ? (
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyIcon}>📈</Text>
            </View>
            <Text style={styles.emptyTitle}>No Mood Data Yet</Text>
            <Text style={styles.emptyText}>
              Start logging your daily moods to unlock personalized insights and track your emotional journey
            </Text>
            <View style={styles.emptyAccent} />
          </View>
        ) : (
          <>
            {/* Chart */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Mood Timeline</Text>
                  <Text style={styles.sectionSubtitle}>
                    Higher score indicates better emotional state
                  </Text>
                </View>
                <View style={styles.chartBadge}>
                  <Text style={styles.chartBadgeText}>📈</Text>
                </View>
              </View>

              <View style={styles.chartContainer}>
                <LineChart
                  data={{
                    labels: scores.map((_, i) => `${i + 1}`),
                    datasets: [{ data: scores }],
                  }}
                  width={chartWidth - 32}
                  height={220}
                  yAxisInterval={1}
                  fromZero
                  segments={4}
                  bezier
                  chartConfig={{
                    backgroundColor: "transparent",
                    backgroundGradientFrom: "#FAFAFA",
                    backgroundGradientTo: "#F0F0FF",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(124, 58, 237, ${opacity})`,
                    labelColor: () => "#6B7280",
                    propsForDots: {
                      r: "5",
                      strokeWidth: "3",
                      stroke: "#7C3AED",
                      fill: "#FFFFFF",
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "5 5",
                      stroke: "#E5E7EB",
                      strokeWidth: 1,
                    },
                  }}
                  style={styles.chart}
                />
              </View>

              <View style={styles.trendContainer}>
                <View style={styles.trendIndicator} />
                <Text style={styles.chartNote}>{trendText}</Text>
              </View>
            </View>

            {/* Summary */}
            <Animated.View style={[styles.statsCard, statsStyle]}>
              <View style={styles.statsHeader}>
                <Text style={styles.sectionTitle}>Quick Summary</Text>
                <View style={styles.statsDecoration} />
              </View>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>⭐</Text>
                  </View>
                  <Text style={styles.statLabel}>Most Common</Text>
                  <Text style={styles.statValue}>{commonMood}</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>📊</Text>
                  </View>
                  <Text style={styles.statLabel}>Average Score</Text>
                  <Text style={styles.statValue}>{averageMood} / 5</Text>
                </View>

                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>📝</Text>
                  </View>
                  <Text style={styles.statLabel}>Total Logs</Text>
                  <Text style={styles.statValue}>{scores.length}</Text>
                </View>
              </View>
            </Animated.View>

            {/* Recommendation */}
            {recommendation ? (
              <Animated.View style={[styles.recoCard, recoStyle]}>
                <View style={styles.recoHeader}>
                  <View style={styles.recoIconWrapper}>
                    <Text style={styles.recoIcon}>💡</Text>
                  </View>
                  <View style={styles.recoHeaderText}>
                    <Text style={styles.recoTitle}>Personalized Suggestion</Text>
                    <Text style={styles.recoSubtitle}>Based on your mood patterns</Text>
                  </View>
                </View>
                
                <View style={styles.recoDivider} />
                
                <Text style={styles.recoText}>{recommendation}</Text>
                
                <View style={styles.recoFooter}>
                  <View style={styles.recoFooterIcon}>
                    <Text style={styles.recoFooterIconText}>ℹ️</Text>
                  </View>
                  <Text style={styles.recoNote}>
                    These suggestions are for support only. If your mood stays low for many days, consider talking to someone you trust.
                  </Text>
                </View>
              </Animated.View>
            ) : null}
          </>
        )}

        <View style={{ height: 50 }} />
      </ScrollView>
    </ScreenContainer>
  );
}

// -------------------------
// STYLES - ENHANCED VERSION
// -------------------------
const styles = StyleSheet.create({
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
    backgroundColor: "#7C3AED",
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
    color: "#7C3AED",
    backgroundColor: "#F5F3FF",
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

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.xl,
    marginTop: appSpacing.m,
    alignItems: "center",
    shadowColor: "#7C3AED",
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
    backgroundColor: "#F5F3FF",
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
  },
  emptyAccent: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#7C3AED",
    opacity: 0.04,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: appSpacing.m,
  },
  chartBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
  },
  chartBadgeText: {
    fontSize: 20,
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
    padding: 16,
    marginVertical: appSpacing.s,
  },
  chart: {
    borderRadius: 12,
  },
  trendContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: appSpacing.m,
    borderRadius: 12,
    marginTop: appSpacing.s,
  },
  trendIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#7C3AED",
    marginRight: appSpacing.s,
  },
  chartNote: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "600",
    flex: 1,
  },

  statsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginBottom: appSpacing.m,
    shadowColor: "#7C3AED",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#F5F3FF",
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
    backgroundColor: "#7C3AED",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: appSpacing.s,
  },
  statItem: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
    backgroundColor: "#F5F3FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: appSpacing.s,
  },
  statIcon: {
    fontSize: 24,
  },
  statLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    textAlign: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7C3AED",
    textAlign: "center",
  },

  recoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.m,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#FEF3C7",
  },
  recoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  recoIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.m,
  },
  recoIcon: {
    fontSize: 28,
  },
  recoHeaderText: {
    flex: 1,
  },
  recoTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  recoSubtitle: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "500",
  },
  recoDivider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginBottom: appSpacing.m,
  },
  recoText: {
    fontSize: 15,
    color: "#374151",
    lineHeight: 24,
    marginBottom: appSpacing.m,
    fontWeight: "500",
  },
  recoFooter: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    padding: appSpacing.m,
    borderRadius: 12,
    alignItems: "flex-start",
  },
  recoFooterIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: appSpacing.s,
    marginTop: 2,
  },
  recoFooterIconText: {
    fontSize: 12,
  },
  recoNote: {
    flex: 1,
    fontSize: 12,
    color: "#92400E",
    lineHeight: 18,
    fontWeight: "500",
  },
});