// app/cbt.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appSpacing } from "@/constants/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const thinkingPatterns = [
  {
    id: "all-or-nothing",
    label: "All-or-nothing thinking",
    hint: "If it isn't perfect, it's a failure.",
  },
  {
    id: "overgeneralising",
    label: "Over-generalising",
    hint: "This went badly, so everything will always go badly.",
  },
  {
    id: "mind-reading",
    label: "Mind reading",
    hint: "They definitely think I'm stupid.",
  },
  {
    id: "catastrophising",
    label: "Catastrophising",
    hint: "This is the worst thing ever. I'll never recover.",
  },
  {
    id: "self-blame",
    label: "Self-blame",
    hint: "It's all my fault.",
  },
  {
    id: "discounting-positive",
    label: "Discounting the positive",
    hint: "That success doesn't really count.",
  },
];

export default function CBTScreen() {
  const [thought, setThought] = useState("");
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [reframe, setReframe] = useState("");
  const [error, setError] = useState("");

  function generateReframe() {
    setError("");
    setReframe("");

    if (!thought.trim()) {
      setError("Please write your thought first.");
      return;
    }
    if (!selectedPattern) {
      setError("Please choose the thinking pattern that fits best.");
      return;
    }

    let base =
      "I'm allowed to make mistakes and still have value. This situation is real, but it doesn't define all of me.";

    switch (selectedPattern) {
      case "all-or-nothing":
        base =
          "Things don't have to be perfect to still be worthwhile. Some parts went wrong, but that doesn't mean everything is a failure.";
        break;
      case "overgeneralising":
        base =
          "This is one moment or event, not proof of how everything will always be. I can learn from this and still have better experiences next time.";
        break;
      case "mind-reading":
        base =
          "I actually don't know exactly what others are thinking. There could be many explanations, and I don't have to assume the worst about myself.";
        break;
      case "catastrophising":
        base =
          "This is difficult, but it's unlikely to be the absolute worst forever. I've handled tough things before, and I can take small steps here too.";
        break;
      case "self-blame":
        base =
          "I might play a part, but it's unlikely that everything is my fault. Other factors and people are involved too, and I deserve some kindness from myself.";
        break;
      case "discounting-positive":
        base =
          "The positive things I've done still count, even if I notice the negatives more strongly. Both difficulties and strengths can exist at the same time.";
        break;
    }

    const trimmedThought = thought.trim();

    const combined =
      `Original thought:\n"${trimmedThought}"\n\n` +
      "Balanced reframe:\n" +
      base;

    setReframe(combined);
  }

  function handleReset() {
    setThought("");
    setSelectedPattern(null);
    setReframe("");
    setError("");
  }

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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerWrapper}>
            <View style={styles.badgeContainer}>
              <View style={styles.badgeGlow} />
              <Text style={styles.badge}>🧠 CBT Tool</Text>
            </View>
            <Text style={styles.title}>Thought Reframe</Text>
            <View style={styles.titleIconContainer}>
              <View style={styles.thinkingIcon}>
                <Text style={styles.thinkingEmoji}>💭</Text>
              </View>
            </View>
            <View style={styles.subtitleContainer}>
              <View style={styles.accentBar} />
              <Text style={styles.subtitle}>
                Notice a difficult thought, spot the thinking pattern, and gently
                rewrite it in a kinder, more balanced way.
              </Text>
            </View>
          </View>

          {/* Step 1: Thought */}
          <View style={styles.card}>
            <View style={styles.cardTopGradient} />
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>STEP 1</Text>
                <Text style={styles.cardTitle}>Write the thought</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              What is the exact thought running through your mind?
            </Text>

            <View style={styles.textAreaWrapper}>
              <View style={styles.textAreaIconCircle}>
                <Text style={styles.textAreaIcon}>✍️</Text>
              </View>
              <TextInput
                style={styles.textArea}
                placeholder='e.g. "I always mess things up."'
                placeholderTextColor="#EC4899"
                multiline
                value={thought}
                onChangeText={setThought}
              />
              <View style={styles.textAreaFocusLine} />
            </View>
          </View>

          {/* Step 2: Pattern */}
          <View style={styles.card}>
            <View style={styles.cardTopGradient} />
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>STEP 2</Text>
                <Text style={styles.cardTitle}>Spot the thinking pattern</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              Which pattern feels closest to how this thought works?
            </Text>

            <View style={styles.patternGrid}>
              {thinkingPatterns.map((p) => {
                const selected = selectedPattern === p.id;
                return (
                  <Pressable
                    key={p.id}
                    style={[
                      styles.patternChip,
                      selected && styles.patternChipSelected,
                    ]}
                    onPress={() => setSelectedPattern(p.id)}
                  >
                    <View style={styles.patternHeader}>
                      <View style={[
                        styles.patternCheckCircle,
                        selected && styles.patternCheckCircleSelected
                      ]}>
                        {selected && <Text style={styles.checkMark}>✓</Text>}
                      </View>
                      <Text
                        style={[
                          styles.patternLabel,
                          selected && styles.patternLabelSelected,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.patternHint,
                        selected && styles.patternHintSelected,
                      ]}
                    >
                      {p.hint}
                    </Text>
                    {selected && <View style={styles.patternSelectedAccent} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Step 3: Reframe */}
          <View style={styles.card}>
            <View style={styles.cardTopGradient} />
            <View style={styles.stepHeader}>
              <View style={styles.stepNumberCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <View style={styles.stepTextContainer}>
                <Text style={styles.stepLabel}>STEP 3</Text>
                <Text style={styles.cardTitle}>Create a gentler reframe</Text>
              </View>
            </View>
            <Text style={styles.cardSubtitle}>
              You don&apos;t need to force positivity. The goal is a thought
              that feels a little fairer and kinder.
            </Text>

            {error ? (
              <View style={styles.errorContainer}>
                <View style={styles.errorIconCircle}>
                  <Text style={styles.errorIcon}>⚠️</Text>
                </View>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable 
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && { transform: [{ scale: 0.97 }] }
              ]} 
              onPress={generateReframe}
            >
              <View style={styles.primaryButtonGlow} />
              <View style={styles.buttonIconCircle}>
                <Text style={styles.buttonIcon}>✨</Text>
              </View>
              <Text style={styles.primaryButtonText}>Generate reframe</Text>
            </Pressable>

            {reframe ? (
              <View style={styles.reframeBox}>
                <View style={styles.reframeTopAccent} />
                <View style={styles.reframeIconContainer}>
                  <View style={styles.reframeIconCircle}>
                    <Text style={styles.reframeIcon}>💡</Text>
                  </View>
                </View>
                {reframe.split("\n").map((line, idx) => (
                  <Text
                    key={idx}
                    style={
                      line.startsWith("Original")
                        ? styles.reframeHeading
                        : line.startsWith("Balanced")
                        ? styles.reframeHeading
                        : styles.reframeText
                    }
                  >
                    {line}
                  </Text>
                ))}
                <View style={styles.reframeDecor} />
              </View>
            ) : null}

            {reframe ? (
              <Pressable 
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && { opacity: 0.7 }
                ]} 
                onPress={handleReset}
              >
                <View style={styles.secondaryButtonIconCircle}>
                  <Text style={styles.secondaryButtonIcon}>🔄</Text>
                </View>
                <Text style={styles.secondaryButtonText}>Start another</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Back to tools */}
          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && { opacity: 0.7 }
            ]}
            onPress={() => router.push("/self-help")}
          >
            <View style={styles.linkIconCircle}>
              <Text style={styles.linkIcon}>←</Text>
            </View>
            <Text style={styles.linkText}>Back to Self-Help Tools</Text>
          </Pressable>

          <View style={{ height: 32 }} />
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
    backgroundColor: "rgba(236, 72, 153, 0.06)",
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
    backgroundColor: "rgba(244, 114, 182, 0.04)",
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
    backgroundColor: "rgba(236, 72, 153, 0.3)",
    opacity: 0.5,
    transform: [{ scale: 1.15 }],
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 13,
    fontWeight: "700",
    color: "#BE185D",
    backgroundColor: "rgba(244, 114, 182, 0.2)",
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
  thinkingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(236, 72, 153, 0.2)",
  },
  thinkingEmoji: {
    fontSize: 32,
  },
  subtitleContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  accentBar: {
    width: 4,
    minHeight: "100%",
    backgroundColor: "#EC4899",
    borderRadius: 2,
    marginRight: 12,
  },
  subtitle: {
    flex: 1,
    fontSize: 14,
    color: appColors.subtleText,
    lineHeight: 21,
  },

  card: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: appSpacing.l,
    marginTop: appSpacing.m,
    borderWidth: 2,
    borderColor: "rgba(236, 72, 153, 0.2)",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 6,
    overflow: "hidden",
  },
  cardTopGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: "#EC4899",
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
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  stepNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#EC4899",
  },
  stepTextContainer: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: "#EC4899",
    marginBottom: 2,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: appColors.text,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 14,
    color: appColors.subtleText,
    marginBottom: appSpacing.m,
    lineHeight: 20,
  },

  textAreaWrapper: {
    position: "relative",
  },
  textAreaIconCircle: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  textAreaIcon: {
    fontSize: 16,
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(236, 72, 153, 0.25)",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingRight: 56,
    minHeight: 110,
    textAlignVertical: "top",
    fontSize: 15,
    color: appColors.text,
    backgroundColor: "#FDF2F8",
    lineHeight: 22,
  },
  textAreaFocusLine: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: "#EC4899",
    opacity: 0.5,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  patternGrid: {
    marginTop: appSpacing.s,
    gap: appSpacing.m,
  },
  patternChip: {
    position: "relative",
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "rgba(148, 163, 184, 0.3)",
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FAFAFA",
    overflow: "hidden",
  },
  patternChipSelected: {
    backgroundColor: "#FDF2F8",
    borderColor: "#EC4899",
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  patternHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  patternCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "rgba(148, 163, 184, 0.4)",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  patternCheckCircleSelected: {
    backgroundColor: "#EC4899",
    borderColor: "#EC4899",
  },
  checkMark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  patternLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: appColors.text,
  },
  patternLabelSelected: {
    color: "#BE185D",
  },
  patternHint: {
    fontSize: 13,
    color: appColors.subtleText,
    fontStyle: "italic",
    lineHeight: 19,
  },
  patternHintSelected: {
    color: "#DB2777",
  },
  patternSelectedAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#EC4899",
  },

  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: appSpacing.m,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  errorIcon: {
    fontSize: 14,
  },
  errorText: {
    flex: 1,
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
  },

  primaryButton: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: appSpacing.s,
    backgroundColor: "#EC4899",
    paddingVertical: 16,
    borderRadius: 999,
    shadowColor: "#EC4899",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  buttonIcon: {
    fontSize: 16,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: appSpacing.m,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "rgba(236, 72, 153, 0.3)",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
  },
  secondaryButtonIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(236, 72, 153, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  secondaryButtonIcon: {
    fontSize: 12,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: appColors.text,
  },

  reframeBox: {
    position: "relative",
    marginTop: appSpacing.l,
    padding: appSpacing.l,
    borderRadius: 20,
    backgroundColor: "#FDF4FF",
    borderWidth: 2,
    borderColor: "rgba(192, 132, 252, 0.3)",
    shadowColor: "#A855F7",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    overflow: "hidden",
  },
  reframeTopAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#A855F7",
  },
  reframeIconContainer: {
    marginBottom: 12,
  },
  reframeIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(168, 85, 247, 0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  reframeIcon: {
    fontSize: 22,
  },
  reframeHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: "#7C3AED",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  reframeText: {
    fontSize: 15,
    color: appColors.text,
    marginBottom: 6,
    lineHeight: 22,
  },
  reframeDecor: {
    position: "absolute",
    bottom: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(168, 85, 247, 0.08)",
  },

  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: appSpacing.l,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "rgba(236, 72, 153, 0.08)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(236, 72, 153, 0.2)",
  },
  linkIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(236, 72, 153, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  linkIcon: {
    fontSize: 16,
    color: "#EC4899",
    fontWeight: "800",
  },
  linkText: {
    fontSize: 15,
    color: "#EC4899",
    fontWeight: "700",
  },
});