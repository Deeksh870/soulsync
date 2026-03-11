// app/grounding.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

type GroundingStep = {
  title: string;
  instruction: string;
  examples: string[];
};

const STEPS: GroundingStep[] = [
  {
    title: "5 things you can SEE 👀",
    instruction:
      "Slowly look around you and name five things you can see. Say them out loud or in your mind.",
    examples: [
      "The color of the wall",
      "A plant or object near you",
      "The pattern on your clothes",
      "A shadow or light reflection",
      "Something small you usually ignore",
    ],
  },
  {
    title: "4 things you can TOUCH 🤲",
    instruction:
      "Notice four things you can feel with your sense of touch. You can gently touch them if possible.",
    examples: [
      "The texture of your clothes",
      "The surface you are sitting on",
      "Your hands resting on your lap",
      "The temperature of the air",
    ],
  },
  {
    title: "3 things you can HEAR 👂",
    instruction:
      "Listen carefully. Try to find three different sounds, from close and far away.",
    examples: [
      "A fan, AC or outside noise",
      "Voices, vehicles or birds",
      "Your own breathing",
    ],
  },
  {
    title: "2 things you can SMELL 👃",
    instruction:
      "Gently notice two smells around you. If you can't find any, think of two smells you like.",
    examples: [
      "Soap, perfume, or food",
      "Fresh air or room smell",
      "Or imagine rain, coffee, or flowers",
    ],
  },
  {
    title: "1 thing you can TASTE 👅",
    instruction:
      "Notice one thing you can taste right now. If difficult, just notice your mouth or imagine a favorite taste.",
    examples: [
      "Sip of water or tea",
      "Taste in your mouth",
      "Or imagine your favorite snack",
    ],
  },
];

export default function GroundingScreen() {
  useProtectedRoute();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  const stepAnim = useRef(new Animated.Value(0)).current;

  // Run animation on step change
  useEffect(() => {
    stepAnim.setValue(0);
    Animated.timing(stepAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [currentIndex, stepAnim]);

  const currentStep = STEPS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === STEPS.length - 1;

  const animatedStepStyle = {
    opacity: stepAnim,
    transform: [
      {
        translateY: stepAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  function handleNext() {
    if (isLast) {
      setFinished(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handleBack() {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
      setFinished(false);
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setFinished(false);
  }

  function handleDone() {
    // You can change this to go back to self-help or dashboard
    router.push("/self-help" as any);
  }

  const progressText = `Step ${currentIndex + 1} of ${STEPS.length}`;
  const progressPercentage = ((currentIndex + 1) / STEPS.length) * 100;

  return (
    <ScreenContainer>
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
            <Text style={styles.badge}>🌍 Grounding Tool</Text>
          </View>
          <Text style={styles.title}>5-4-3-2-1 Grounding</Text>
          <View style={styles.titleIconContainer}>
            <View style={styles.groundingIcon}>
              <Text style={styles.groundingEmoji}>🧘‍♂️</Text>
            </View>
          </View>
          <View style={styles.subtitleContainer}>
            <View style={styles.accentBar} />
            <Text style={styles.subtitle}>
              Use your senses to gently bring your mind back to the present moment.
            </Text>
          </View>
        </View>

        {/* Progress Section */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressIconCircle}>
              <Text style={styles.progressIcon}>📊</Text>
            </View>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>{progressText}</Text>
              <Text style={styles.progressSubtext}>
                {finished ? "Complete! 🎉" : "Keep going, you're doing great"}
              </Text>
            </View>
          </View>
          
          {/* Progress bar */}
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                ]}
              />
            </View>
          </View>

          {/* Progress dots */}
          <View style={styles.progressDots}>
            {STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.dotActive,
                  index < currentIndex && styles.dotCompleted,
                ]}
              >
                {index < currentIndex && (
                  <Text style={styles.dotCheck}>✓</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Step Card */}
        {!finished ? (
          <Animated.View style={[styles.card, animatedStepStyle]}>
            <View style={styles.cardTopGradient} />
            
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>{currentIndex + 1}</Text>
              </View>
              <Text style={styles.stepTitle}>{currentStep.title}</Text>
            </View>
            
            <Text style={styles.stepInstruction}>{currentStep.instruction}</Text>

            <View style={styles.examplesBox}>
              <View style={styles.examplesHeader}>
                <View style={styles.examplesIconCircle}>
                  <Text style={styles.examplesIconText}>💡</Text>
                </View>
                <Text style={styles.examplesTitle}>Need ideas?</Text>
              </View>
              {currentStep.examples.map((example, idx) => (
                <View key={idx} style={styles.exampleRow}>
                  <View style={styles.exampleBullet} />
                  <Text style={styles.exampleItem}>{example}</Text>
                </View>
              ))}
            </View>

            <View style={styles.hintContainer}>
              <View style={styles.hintIconCircle}>
                <Text style={styles.hintIcon}>✨</Text>
              </View>
              <Text style={styles.hintText}>
                Take it slow. You don't need to be perfect — just notice what you
                can.
              </Text>
            </View>
            
            <View style={styles.cardDecor} />
          </Animated.View>
        ) : (
          <Animated.View style={[styles.card, styles.completionCard, animatedStepStyle]}>
            <View style={styles.cardTopGradient} />
            
            <View style={styles.completionIconContainer}>
              <View style={styles.completionIcon}>
                <Text style={styles.completionEmoji}>🎉</Text>
              </View>
            </View>

            <Text style={styles.stepTitle}>You've completed 5-4-3-2-1!</Text>
            <Text style={styles.stepInstruction}>
              Notice how your body and mind feel now compared to when you
              started. Even a small shift is progress.
            </Text>

            <View style={styles.examplesBox}>
              <View style={styles.examplesHeader}>
                <View style={styles.examplesIconCircle}>
                  <Text style={styles.examplesIconText}>🌟</Text>
                </View>
                <Text style={styles.examplesTitle}>You can now:</Text>
              </View>
              <View style={styles.exampleRow}>
                <View style={styles.exampleBullet} />
                <Text style={styles.exampleItem}>Take a slow deep breath</Text>
              </View>
              <View style={styles.exampleRow}>
                <View style={styles.exampleBullet} />
                <Text style={styles.exampleItem}>
                  Use another tool (breathing, CBT, journaling)
                </Text>
              </View>
              <View style={styles.exampleRow}>
                <View style={styles.exampleBullet} />
                <Text style={styles.exampleItem}>
                  Or simply rest for a few moments
                </Text>
              </View>
            </View>

            <View style={styles.hintContainer}>
              <View style={styles.hintIconCircle}>
                <Text style={styles.hintIcon}>💚</Text>
              </View>
              <Text style={styles.hintText}>
                You can repeat this grounding tool anytime you feel overwhelmed,
                anxious, or disconnected.
              </Text>
            </View>
            
            <View style={styles.cardDecor} />
          </Animated.View>
        )}

        {/* Buttons row */}
        <View style={styles.buttonsRow}>
          <Pressable
            disabled={isFirst && !finished}
            onPress={finished ? handleRestart : handleBack}
            style={({ pressed }) => [
              styles.secondaryButton,
              (isFirst && !finished) && styles.disabledButton,
              pressed && !isFirst && { opacity: 0.8 },
            ]}
          >
            <View style={styles.buttonIconCircle}>
              <Text style={styles.buttonIcon}>
                {finished ? "🔄" : "◀️"}
              </Text>
            </View>
            <Text style={styles.secondaryButtonText}>
              {finished ? "Restart" : "Back"}
            </Text>
          </Pressable>

          <Pressable
            onPress={finished ? handleDone : handleNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && { transform: [{ scale: 0.97 }] },
            ]}
          >
            <View style={styles.primaryButtonGlow} />
            <View style={styles.buttonIconCircle}>
              <Text style={styles.buttonIconWhite}>
                {finished ? "✓" : isLast ? "🏁" : "▶️"}
              </Text>
            </View>
            <Text style={styles.primaryButtonText}>
              {finished ? "Done" : isLast ? "Finish" : "Next"}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: 32 }} />
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
    backgroundColor: "rgba(16, 185, 129, 0.06)",
  },
  backgroundCircle2: {
    position: "absolute",
    top: 350,
    left: -80,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
  backgroundCircle3: {
    position: "absolute",
    bottom: 200,
    right: -60,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(56, 189, 248, 0.04)",
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
    backgroundColor: "rgba(16, 185, 129, 0.3)",
    opacity: 0.5,
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "700",
    color: "#059669",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
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
  groundingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  groundingEmoji: {
    fontSize: 32,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accentBar: {
    width: 4,
    minHeight: "100%",
    backgroundColor: "#10B981",
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 21,
  },

  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: appSpacing.l,
    marginBottom: appSpacing.m,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.2)",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 6,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  progressIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  progressIcon: {
    fontSize: 20,
  },
  progressTextContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 2,
  },
  progressSubtext: {
    fontSize: 12,
    color: appColors.subtleText,
  },
  progressBarContainer: {
    marginBottom: appSpacing.m,
  },
  progressBarBg: {
    height: 10,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderRadius: 999,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#10B981",
    borderRadius: 999,
  },
  progressDots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(148,163,184,0.2)",
    borderWidth: 2,
    borderColor: "rgba(148,163,184,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  dotActive: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  dotCompleted: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  dotCheck: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },

  card: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.s,
    marginBottom: appSpacing.m,
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.2)",
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    overflow: "hidden",
  },
  completionCard: {
    borderColor: "rgba(139, 92, 246, 0.2)",
    shadowColor: "#8B5CF6",
  },
  cardTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#10B981",
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  stepNumberCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#10B981",
  },
  completionIconContainer: {
    alignItems: "center",
    marginBottom: appSpacing.m,
  },
  completionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "rgba(139, 92, 246, 0.3)",
  },
  completionEmoji: {
    fontSize: 40,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  stepInstruction: {
    fontSize: 15,
    color: appColors.text,
    marginBottom: appSpacing.l,
    lineHeight: 22,
  },

  examplesBox: {
    backgroundColor: "#F0FDF4",
    borderRadius: 18,
    padding: appSpacing.m,
    marginBottom: appSpacing.m,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.2)",
  },
  examplesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  examplesIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  examplesIconText: {
    fontSize: 14,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#065F46",
  },
  exampleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  exampleBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
    marginTop: 7,
    marginRight: 10,
  },
  exampleItem: {
    flex: 1,
    fontSize: 13,
    color: "#374151",
    lineHeight: 19,
  },

  hintContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(249, 115, 22, 0.08)",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.2)",
  },
  hintIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(249, 115, 22, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  hintIcon: {
    fontSize: 14,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    color: "#78716C",
    lineHeight: 19,
  },
  cardDecor: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(16, 185, 129, 0.06)",
  },

  buttonsRow: {
    flexDirection: "row",
    gap: appSpacing.m,
    marginTop: appSpacing.s,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "rgba(16, 185, 129, 0.3)",
    paddingVertical: 14,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: appColors.text,
  },
  disabledButton: {
    opacity: 0.4,
  },
  primaryButton: {
    position: "relative",
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10B981",
    paddingVertical: 14,
    borderRadius: 999,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    overflow: "hidden",
  },
  primaryButtonGlow: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  buttonIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  buttonIcon: {
    fontSize: 12,
  },
  buttonIconWhite: {
    fontSize: 12,
    color: "#FFFFFF",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});