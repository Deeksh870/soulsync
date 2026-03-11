// app/login.tsx
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
import { useAuth } from "./contexts/AuthContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // just UI, not used
  const { login } = useAuth(); // ✅ from AuthContext

  const handleLogin = async () => {
    if (!email.trim()) {
      console.log("Please enter email");
      return;
    }

    const trimmed = email.trim();

    // ✅ tell AuthContext who is logged in
    await login(trimmed, "SoulSync User");

    // ✅ go to PROFILE first (you said profile should look like a real one)
    router.replace("/profile");
  };

  const handleQuickSignup = async () => {
    // demo signup for exam – fixed email
    await login("new@soulsync.app", "New User");
    router.replace("/profile");
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Decorative background elements */}
          <View style={styles.bgCircle1} />
          <View style={styles.bgCircle2} />
          
          <View style={styles.topSpacing} />

          {/* App title / branding */}
          <View style={styles.headerWrapper}>
            <View style={styles.appBadgeContainer}>
              <Text style={styles.appBadge}>✨ SoulSync</Text>
            </View>
            <Text style={styles.title}>Welcome back 👋</Text>
            <Text style={styles.subtitle}>
              Log in to continue your mental wellness journey.
            </Text>
          </View>

          {/* Card container */}
          <View style={styles.card}>
            <View style={styles.cardGradientTop} />
            <View style={styles.cardGlowEffect} />
            
            <View style={styles.lockIconContainer}>
              <Text style={styles.lockIcon}>🔐</Text>
            </View>
            
            <Text style={styles.cardTitle}>Sign in</Text>
            <Text style={styles.cardSubtitle}>
              Enter your details to access your dashboard.
            </Text>

            {/* Email field */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>📧 Email</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor={appColors.subtleText}
                  keyboardType="email-address"
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password field (not used yet) */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>🔒 Password</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={appColors.subtleText}
                  secureTextEntry
                  style={styles.input}
                />
              </View>
            </View>

            <Pressable style={styles.forgotWrapper}>
              <Text style={styles.forgotText}>Forgot password? →</Text>
            </Pressable>

            <Pressable style={styles.primaryButton} onPress={handleLogin}>
              <View style={styles.buttonGradient} />
              <View style={styles.buttonShine} />
              <Text style={styles.primaryButtonText}>✨ Log in</Text>
            </Pressable>

            <View style={styles.orContainer}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.orLine} />
            </View>

            {/* Continue as guest – no auth */}
            <Pressable
              style={styles.secondaryButton}
              onPress={() => router.replace("/dashboard")}
            >
              <View style={styles.secondaryButtonGlow} />
              <Text style={styles.secondaryButtonText}>
                Continue without account →
              </Text>
            </Pressable>
          </View>

          {/* Bottom text – signup / info */}
          <View style={styles.bottomTextWrapper}>
            <Text style={styles.bottomText}>
              New here?{" "}
              <Text
                style={styles.bottomTextAccent}
                onPress={handleQuickSignup}
              >
                Create an account ✨
              </Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: appSpacing.l * 2,
    justifyContent: "center",
    paddingHorizontal: appSpacing.l,
  },
  topSpacing: {
    height: appSpacing.l,
  },

  // Decorative background circles
  bgCircle1: {
    position: "absolute",
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "rgba(139,92,246,0.06)",
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(236,72,153,0.05)",
    bottom: 100,
    left: -70,
  },

  headerWrapper: {
    marginBottom: appSpacing.l * 1.5,
  },
  appBadgeContainer: {
    alignSelf: "flex-start",
    marginBottom: appSpacing.m,
  },
  appBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 14,
    fontWeight: "700",
    color: "#8B5CF6",
    backgroundColor: "rgba(139,92,246,0.12)",
    borderWidth: 1,
    borderColor: "rgba(139,92,246,0.25)",
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
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

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 32,
    padding: appSpacing.l * 1.8,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 35,
    elevation: 15,
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.12)",
    overflow: "hidden",
  },
  cardGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: "#8B5CF6",
  },
  cardGlowEffect: {
    position: "absolute",
    top: -40,
    left: "50%",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(139,92,246,0.08)",
    marginLeft: -75,
  },
  
  lockIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(139,92,246,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: appSpacing.l,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.2)",
  },
  lockIcon: {
    fontSize: 32,
  },
  
  cardTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: appColors.text,
    marginBottom: 8,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  cardSubtitle: {
    fontSize: 14,
    color: appColors.subtleText,
    marginBottom: appSpacing.l * 1.5,
    textAlign: "center",
    lineHeight: 21,
    fontWeight: "500",
  },

  fieldWrapper: {
    marginBottom: appSpacing.l,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: appColors.text,
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  inputContainer: {
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    borderWidth: 2,
    borderColor: "rgba(139,92,246,0.2)",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    fontSize: 15,
    color: appColors.text,
    backgroundColor: "#FAFBFC",
    fontWeight: "500",
  },

  forgotWrapper: {
    alignSelf: "flex-end",
    marginBottom: appSpacing.l,
    marginTop: -8,
  },
  forgotText: {
    fontSize: 13,
    color: "#8B5CF6",
    fontWeight: "700",
    letterSpacing: 0.3,
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

  orContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: appSpacing.l,
  },
  orLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: "rgba(139,92,246,0.15)",
  },
  orText: {
    fontSize: 13,
    color: appColors.subtleText,
    marginHorizontal: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  secondaryButton: {
    borderWidth: 2.5,
    borderColor: "#8B5CF6",
    paddingVertical: 15,
    borderRadius: 999,
    alignItems: "center",
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

  bottomTextWrapper: {
    marginTop: appSpacing.l * 1.5,
    alignItems: "center",
  },
  bottomText: {
    fontSize: 14,
    color: appColors.subtleText,
    textAlign: "center",
    fontWeight: "500",
  },
  bottomTextAccent: {
    fontWeight: "800",
    color: "#8B5CF6",
    letterSpacing: 0.3,
  },
});