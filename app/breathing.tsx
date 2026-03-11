// app/breathing.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type PhaseKey = "inhale" | "hold" | "exhale";

const PHASES: { key: PhaseKey; label: string; duration: number }[] = [
  { key: "inhale", label: "Inhale slowly", duration: 4000 },
  { key: "hold", label: "Hold gently", duration: 4000 },
  { key: "exhale", label: "Exhale slowly", duration: 6000 },
];

export default function BreathingScreen() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPhase = PHASES[phaseIndex];

  // Handle animation per phase
  useEffect(() => {
    if (!isPlaying) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      return;
    }

    // animate circle based on phase
    let targetScale = 1;
    let targetOpacity = 0.3;
    if (currentPhase.key === "inhale" || currentPhase.key === "hold") {
      targetScale = 1.3;
      targetOpacity = 0.8;
    }
    if (currentPhase.key === "exhale") {
      targetScale = 0.9;
      targetOpacity = 0.2;
    }

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration: currentPhase.duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration: currentPhase.duration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();

    // move to next phase after duration
    timeoutRef.current = setTimeout(() => {
      setPhaseIndex((prev) => {
        const next = (prev + 1) % PHASES.length;
        if (next === 0) {
          setCycleCount((c) => c + 1); // completed one full cycle
        }
        return next;
      });
    }, currentPhase.duration);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, phaseIndex, currentPhase.duration, currentPhase.key, scaleAnim, opacityAnim]);

  const handleToggle = () => {
    if (isPlaying) {
      // stop
      setIsPlaying(false);
      setPhaseIndex(0);
      setCycleCount(0);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // start
      setIsPlaying(true);
      setPhaseIndex(0);
      setCycleCount(0);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: appSpacing.xl }}
      >
        {/* Decorative background elements */}
        <View style={styles.backgroundCircle1} />
        <View style={styles.backgroundCircle2} />
        <View style={styles.backgroundCircle3} />

        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.badgeContainer}>
            <View style={styles.badgeGlow} />
            <Text style={styles.badge}>🌬️ Guided breathing</Text>
          </View>
          <Text style={styles.title}>Breathing Exercise</Text>
          <View style={styles.titleIconContainer}>
            <View style={styles.breathIcon}>
              <Text style={styles.breathEmoji}>🫁</Text>
            </View>
          </View>
          <View style={styles.subtitleContainer}>
            <View style={styles.accentBar} />
            <Text style={styles.subtitle}>
              Follow the circle and the text cues: breathe in, hold, and breathe
              out slowly. This can help your body calm down.
            </Text>
          </View>
        </View>

        {/* Animated circle card */}
        <View style={styles.mainCard}>
          <View style={styles.mainCardGradient} />

          <View style={styles.statusContainer}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>
                {isPlaying ? "Active" : "Ready"}
              </Text>
            </View>
          </View>

          <Text style={styles.mainLabel}>Follow the rhythm</Text>
          <View style={styles.phaseContainer}>
            <Text style={styles.currentPhaseText}>{currentPhase.label}</Text>
            <View style={styles.phaseIndicator}>
              {PHASES.map((phase, idx) => (
                <View
                  key={phase.key}
                  style={[
                    styles.phaseIndicatorDot,
                    idx === phaseIndex && styles.phaseIndicatorDotActive,
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.cycleContainer}>
            <View style={styles.cycleIconCircle}>
              <Text style={styles.cycleIcon}>🔄</Text>
            </View>
            <Text style={styles.cycleText}>Cycle {cycleCount + 1} / 5</Text>
          </View>

          <View style={styles.circleWrapper}>
            {/* Outer glow rings */}
            <Animated.View
              style={[
                styles.glowRing1,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.1, 0.3],
                  }),
                },
              ]}
            />
            <Animated.View
              style={[
                styles.glowRing2,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.15, 0.4],
                  }),
                },
              ]}
            />

            {/* Main circle */}
            <Animated.View
              style={[
                styles.circle,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: opacityAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ]}
            >
              <View style={styles.circleInner}>
                <Text style={styles.circleText}>
                  {currentPhase.key === "inhale" && "Inhale"}
                  {currentPhase.key === "hold" && "Hold"}
                  {currentPhase.key === "exhale" && "Exhale"}
                </Text>
                <Text style={styles.circleSubtext}>
                  {currentPhase.duration / 1000}s
                </Text>
              </View>
            </Animated.View>
          </View>

          <Pressable
            style={[
              styles.toggleButton,
              isPlaying ? styles.stopButton : styles.startButton,
            ]}
            onPress={handleToggle}
          >
            <View style={styles.buttonGlow} />
            <View style={styles.buttonContent}>
              <View style={styles.buttonIconCircle}>
                <Text style={styles.buttonIcon}>
                  {isPlaying ? "⏸️" : "▶️"}
                </Text>
              </View>
              <Text style={styles.toggleButtonText}>
                {isPlaying ? "Pause exercise" : "Start breathing"}
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Static instructions card */}
        <View style={styles.infoCard}>
          <View style={styles.infoTopGradient} />
          <View style={styles.infoHeader}>
            <View style={styles.infoIconCircle}>
              <Text style={styles.infoIconEmoji}>💡</Text>
            </View>
            <Text style={styles.infoTitle}>How it works</Text>
          </View>
          <View style={styles.infoContent}>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.infoText}>
                Inhale gently through your nose for 4 seconds.
              </Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.infoText}>
                Hold your breath softly for 4 seconds, without forcing.
              </Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.infoText}>
                Exhale slowly through your mouth for 6 seconds.
              </Text>
            </View>
            <View style={styles.infoStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.infoText}>
                Try at least 5 cycles, and stop any time you feel dizzy.
              </Text>
            </View>
          </View>
          <View style={styles.infoDecor} />
        </View>

        <View style={styles.notesCard}>
          <View style={styles.notesIconCircle}>
            <Text style={styles.notesIcon}>✨</Text>
          </View>
          <Text style={styles.notes}>
            This exercise can reduce heart rate and calm your nervous system.
            It's okay if your mind wanders—just gently bring your focus back to
            your breath.
          </Text>
        </View>
      </ScrollView>
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
    backgroundColor: "rgba(56, 189, 248, 0.06)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 300,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
  backgroundCircle3: {
    position: "absolute",
    bottom: 150,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(16, 185, 129, 0.04)",
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
    backgroundColor: "rgba(56, 189, 248, 0.3)",
    opacity: 0.5,
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
    backgroundColor: "rgba(56, 189, 248, 0.15)",
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
  breathIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.2)",
  },
  breathEmoji: {
    fontSize: 32,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accentBar: {
    width: 4,
    minHeight: "100%",
    backgroundColor: "#38BDF8",
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 21,
  },

  mainCard: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    padding: appSpacing.xl,
    marginTop: appSpacing.m,
    marginBottom: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.2)",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 10,
    alignItems: "center",
    overflow: "hidden",
  },
  mainCardGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#38BDF8",
  },
  statusContainer: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#059669",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mainLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: appColors.subtleText,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  phaseContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  currentPhaseText: {
    fontSize: 24,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  phaseIndicator: {
    flexDirection: "row",
    gap: 6,
  },
  phaseIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(148, 163, 184, 0.3)",
  },
  phaseIndicatorDotActive: {
    backgroundColor: "#38BDF8",
    width: 24,
  },
  cycleContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(56, 189, 248, 0.08)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: appSpacing.l,
  },
  cycleIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  cycleIcon: {
    fontSize: 12,
  },
  cycleText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0284C7",
  },
  circleWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appSpacing.l,
    height: 240,
    width: 240,
  },
  glowRing1: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(56, 189, 248, 0.15)",
  },
  glowRing2: {
    position: "absolute",
    width: 190,
    height: 190,
    borderRadius: 95,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
  },
  circle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#38BDF8",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#38BDF8",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  circleInner: {
    alignItems: "center",
  },
  circleText: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  circleSubtext: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255, 255, 255, 0.8)",
  },
  toggleButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    position: "relative",
    overflow: "hidden",
  },
  startButton: {
    backgroundColor: "#10B981",
    shadowColor: "#10B981",
  },
  stopButton: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
  },
  buttonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
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
    fontSize: 14,
  },
  toggleButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  infoCard: {
    position: "relative",
    backgroundColor: "#F0F9FF",
    borderRadius: 20,
    padding: appSpacing.l,
    borderWidth: 2,
    borderColor: "rgba(56, 189, 248, 0.25)",
    marginBottom: appSpacing.m,
    overflow: "hidden",
  },
  infoTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#38BDF8",
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  infoIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(56, 189, 248, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoIconEmoji: {
    fontSize: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0C4A6E",
  },
  infoContent: {
    gap: 14,
  },
  infoStep: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#38BDF8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#334155",
    lineHeight: 20,
  },
  infoDecor: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(56, 189, 248, 0.1)",
  },

  notesCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    borderRadius: 16,
    padding: appSpacing.m,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  notesIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  notesIcon: {
    fontSize: 16,
  },
  notes: {
    flex: 1,
    color: "#78716C",
    fontSize: 13,
    lineHeight: 19,
  },
});
