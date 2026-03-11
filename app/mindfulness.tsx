// app/mindfulness.tsx
import Ripple from "@/components/Ripple";
import ScreenContainer from "@/components/ScreenContainer";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

type Thought = {
  id: string;
  text: string;
  anim: Animated.Value;
  float: Animated.Value;
  glow: Animated.Value;
  left: number;
  top: number;
};

type Particle = {
  id: number;
  x: number;
  y: number;
  opacity: Animated.Value;
  translateX: Animated.Value;
  translateY: Animated.Value;
};

export default function MindfulnessScreen() {
  const [thoughts, setThoughts] = useState<Thought[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [finished, setFinished] = useState(false);

  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>(
    []
  );
  const [particles, setParticles] = useState<Particle[]>([]);

  const words = ["Stress", "Worry", "Fear", "Overthinking", "Doubt"];

  // Sparkles & ambient points
  const [sparkles] = useState(
    () =>
      new Array(14).fill(0).map((_, i) => ({
        id: i,
        left: Math.random() * width,
        top: Math.random() * height,
        size: Math.random() * 4 + 2,
        opacity: new Animated.Value(Math.random()),
      }))
  );

  useEffect(() => {
    sparkles.forEach((s) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(s.opacity, {
            toValue: 0.2,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(s.opacity, {
            toValue: 1,
            duration: 1600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    });
  }, [sparkles]);

  // Create bubbles one time
  useEffect(() => {
    const newThoughts: Thought[] = words.map((w, i) => {
      const left = 40 + Math.random() * (width - 160);
      const top = 160 + Math.random() * (height - 520);

      const float = new Animated.Value(0);
      const glow = new Animated.Value(1);

      // up-down float
      Animated.loop(
        Animated.sequence([
          Animated.timing(float, {
            toValue: -10,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(float, {
            toValue: 10,
            duration: 2000,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // subtle scale pulse
      Animated.loop(
        Animated.sequence([
          Animated.timing(glow, {
            toValue: 1.1,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(glow, {
            toValue: 1,
            duration: 1800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return {
        id: `${i}-${w}`,
        text: w,
        anim: new Animated.Value(1),
        float,
        glow,
        left,
        top,
      };
    });

    setThoughts(newThoughts);
    setLoaded(true);
  }, []);

  // When user taps a bubble
  const dissolveThought = (id: string, x: number, y: number) => {
    Vibration.vibrate(30);

    // ripple
    setRipples((prev) => [...prev, { id: Math.random(), x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.slice(1));
    }, 700);

    // particles burst
    const createdParticles: Particle[] = new Array(8).fill(0).map(() => {
      const dirX = Math.random() * 40 - 20;
      const dirY = Math.random() * 40 - 20;

      const translateX = new Animated.Value(0);
      const translateY = new Animated.Value(0);
      const opacity = new Animated.Value(1);

      Animated.parallel([
        Animated.timing(translateX, {
          toValue: dirX,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: dirY,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 550,
          useNativeDriver: true,
        }),
      ]).start();

      return {
        id: Math.random(),
        x,
        y,
        opacity,
        translateX,
        translateY,
      };
    });

    setParticles((prev) => [...prev, ...createdParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.slice(createdParticles.length));
    }, 600);

    // shrink & remove bubble
    setThoughts((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          Animated.timing(t.anim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }).start(() => {
            setThoughts((current) => current.filter((x) => x.id !== id));
          });
        }
        return t;
      })
    );
  };

  // When all cleared
  useEffect(() => {
    if (loaded && thoughts.length === 0 && !finished) {
      setFinished(true);
      Vibration.vibrate(80);
    }
  }, [thoughts, loaded, finished]);

  const thoughtsRemaining = thoughts.length;

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={styles.root}>
          {/* Enhanced Background layers */}
          <View style={styles.bgLayer} />
          <View style={styles.bgGradient1} />
          <View style={styles.bgGradient2} />
          <View style={styles.bgCircleBig} />
          <View style={styles.bgCircleMedium} />
          <View style={styles.bgCircleSmall} />
          <View style={styles.bgAccentCircle1} />
          <View style={styles.bgAccentCircle2} />

          {/* Enhanced Sparkles */}
          {sparkles.map((s) => (
            <Animated.View
              key={s.id}
              pointerEvents="none"
              style={[
                styles.sparkle,
                {
                  left: s.left,
                  top: s.top,
                  width: s.size,
                  height: s.size,
                  opacity: s.opacity,
                },
              ]}
            />
          ))}

          {/* Enhanced Mist */}
          <View style={styles.mistBottom} />
          <View style={styles.mistTop} />

          {/* Header Section */}
          <View style={styles.headerContainer}>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeGlow} />
              <Text style={styles.badge}>🧘 Mindfulness</Text>
            </View>

            <View style={styles.titleContainer}>
              <View style={styles.titleIconCircle}>
                <Text style={styles.titleIcon}>🌬️</Text>
              </View>
              <Text style={styles.title}>Floating Thoughts</Text>
            </View>

            <View style={styles.instructionCard}>
              <View style={styles.instructionIconCircle}>
                <Text style={styles.instructionIcon}>👆</Text>
              </View>
              <View style={styles.instructionTextContainer}>
                <Text style={styles.subtitle}>Tap a bubble to dissolve it.</Text>
                <Text style={styles.subtitleHint}>
                  Let go of thoughts that don't serve you
                </Text>
              </View>
            </View>

            {/* Counter Badge */}
            {!finished && loaded && (
              <View style={styles.counterBadge}>
                <View style={styles.counterIconCircle}>
                  <Text style={styles.counterIcon}>💭</Text>
                </View>
                <Text style={styles.counterText}>
                  {thoughtsRemaining} thought
                  {thoughtsRemaining !== 1 ? "s" : ""} remaining
                </Text>
              </View>
            )}
          </View>

          {!loaded ? (
            <View style={styles.loadingContainer}>
              <View style={styles.loadingIconCircle}>
                <Text style={styles.loadingIcon}>⏳</Text>
              </View>
              <Text style={styles.loadingText}>Preparing mindfulness...</Text>
            </View>
          ) : !finished ? (
            <View style={styles.bubbleArea}>
              {thoughts.map((t) => (
                <Animated.View
                  key={t.id}
                  style={[
                    styles.bubbleContainer,
                    {
                      left: t.left,
                      top: t.top,
                      opacity: t.anim,
                      transform: [{ translateY: t.float }, { scale: t.glow }],
                    },
                  ]}
                >
                  <View style={styles.bubbleGlow} />
                  <Pressable
                    style={styles.bubble}
                    onPress={(e) =>
                      dissolveThought(
                        t.id,
                        e.nativeEvent.pageX,
                        e.nativeEvent.pageY
                      )
                    }
                  >
                    <View style={styles.bubbleInner}>
                      <Text style={styles.bubbleText}>{t.text}</Text>
                      <View style={styles.bubbleShine} />
                    </View>
                  </Pressable>
                </Animated.View>
              ))}

              {/* ripples */}
              {ripples.map((r) => (
                <Ripple key={r.id} x={r.x} y={r.y} />
              ))}

              {/* Enhanced particles */}
              {particles.map((p) => (
                <Animated.View
                  key={p.id}
                  pointerEvents="none"
                  style={[
                    styles.particle,
                    {
                      left: p.x,
                      top: p.y,
                      opacity: p.opacity,
                      transform: [
                        { translateX: p.translateX },
                        { translateY: p.translateY },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.doneArea}>
              <View style={styles.doneIconContainer}>
                <View style={styles.doneIconCircleLarge}>
                  <View style={styles.doneIconGlow} />
                  <Text style={styles.doneIconLarge}>✨</Text>
                </View>
              </View>

              <Text style={styles.doneTitle}>Your mind feels lighter</Text>
              <Text style={styles.doneSubtitle}>
                You cleared all floating thoughts.
              </Text>

              <View style={styles.doneStatsCard}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>5</Text>
                  <Text style={styles.statLabel}>Thoughts</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>✓</Text>
                  <Text style={styles.statLabel}>Released</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>∞</Text>
                  <Text style={styles.statLabel}>Peace</Text>
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.doneButton,
                  pressed && { transform: [{ scale: 0.97 }] },
                ]}
                onPress={() => router.push("/self-help")}
              >
                <View style={styles.doneButtonGlow} />
                <View style={styles.doneButtonIconCircle}>
                  <Text style={styles.doneButtonIcon}>🏠</Text>
                </View>
                <Text style={styles.doneButtonText}>Return to Tools</Text>
              </Pressable>

              <Text style={styles.doneHint}>
                Practice this daily to build mental clarity
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    paddingTop: 60,
  },

  // Enhanced Background
  bgLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#FAF5FF",
  },
  bgGradient1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: "rgba(233, 213, 255, 0.5)",
  },
  bgGradient2: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    backgroundColor: "rgba(196, 181, 253, 0.3)",
  },
  bgCircleBig: {
    position: "absolute",
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: 9999,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    top: -width * 0.9,
    right: -width * 0.4,
  },
  bgCircleMedium: {
    position: "absolute",
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: 9999,
    backgroundColor: "rgba(167, 139, 250, 0.12)",
    top: -width * 0.3,
    left: -width * 0.5,
  },
  bgCircleSmall: {
    position: "absolute",
    width: width,
    height: width,
    borderRadius: 9999,
    backgroundColor: "rgba(196, 181, 253, 0.18)",
    bottom: -width * 0.6,
    left: -width * 0.2,
  },
  bgAccentCircle1: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
    top: height * 0.3,
    right: 20,
  },
  bgAccentCircle2: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(167, 139, 250, 0.1)",
    bottom: height * 0.25,
    left: 30,
  },

  // Enhanced Sparkles
  sparkle: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Enhanced Mist
  mistBottom: {
    position: "absolute",
    width,
    height: 220,
    bottom: 0,
    backgroundColor: "rgba(139, 92, 246, 0.08)",
  },
  mistTop: {
    position: "absolute",
    width,
    height: 180,
    top: 0,
    backgroundColor: "rgba(233, 213, 255, 0.3)",
  },

  // Header Section
  headerContainer: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
    zIndex: 10,
  },
  badgeContainer: {
    position: "relative",
    marginBottom: 16,
  },
  badgeGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 999,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    opacity: 0.6,
    transform: [{ scale: 1.2 }],
  },
  badge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: "800",
    color: "#6B21A8",
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  titleIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  titleIcon: {
    fontSize: 26,
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#4C1D95",
    letterSpacing: -0.5,
  },
  instructionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.2)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    marginBottom: 16,
  },
  instructionIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  instructionIcon: {
    fontSize: 22,
  },
  instructionTextContainer: {
    flex: 1,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4C1D95",
    marginBottom: 2,
  },
  subtitleHint: {
    fontSize: 13,
    color: "#9333EA",
  },
  counterBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.25)",
  },
  counterIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  counterIcon: {
    fontSize: 14,
  },
  counterText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#6B21A8",
  },

  // Loading
  loadingContainer: {
    marginTop: 80,
    alignItems: "center",
  },
  loadingIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loadingIcon: {
    fontSize: 40,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B21A8",
  },

  // Bubble Area
  bubbleArea: {
    flex: 1,
    width: "100%",
  },
  bubbleContainer: {
    position: "absolute",
    width: 130,
    height: 130,
  },
  bubbleGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
    transform: [{ scale: 1.15 }],
  },
  bubble: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(196, 181, 253, 0.5)",
    borderWidth: 3,
    borderColor: "rgba(139, 92, 246, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
  },
  bubbleInner: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  bubbleText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#4C1D95",
    textAlign: "center",
  },
  bubbleShine: {
    position: "absolute",
    top: -25,
    left: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
  },

  // Particles
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#C4B5FD",
    shadowColor: "#C4B5FD",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },

  // Completion Screen
  doneArea: {
    marginTop: 60,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  doneIconContainer: {
    marginBottom: 24,
  },
  doneIconCircleLarge: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  doneIconGlow: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    transform: [{ scale: 1.2 }],
  },
  doneIconLarge: {
    fontSize: 60,
  },
  doneTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: "#4C1D95",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  doneSubtitle: {
    fontSize: 16,
    color: "#7C3AED",
    marginBottom: 28,
    textAlign: "center",
    fontWeight: "600",
  },
  doneStatsCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "rgba(139, 92, 246, 0.2)",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: "#7C3AED",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#9333EA",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 2,
    height: 50,
    backgroundColor: "rgba(139, 92, 246, 0.2)",
  },
  doneButton: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8B5CF6",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    marginBottom: 16,
    overflow: "hidden",
  },
  doneButtonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  doneButtonIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  doneButtonIcon: {
    fontSize: 16,
  },
  doneButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  doneHint: {
    fontSize: 13,
    color: "#9333EA",
    textAlign: "center",
    fontWeight: "600",
  },
});
