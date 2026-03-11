// app/chatbot.tsx
import ScreenContainer from "@/components/ScreenContainer";
import { appColors, appRadius, appSpacing } from "@/constants/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { useAuth } from "./contexts/AuthContext";
import { useProtectedRoute } from "./contexts/useProtectedRoute";

import { router } from "expo-router";
import {
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

type DailyCheckIn = {
  date: string; // "YYYY-MM-DD"
  score: number; // 1–5
};

type RiskLevel = "none" | "low" | "medium" | "high";

// 🔐 Same key as emergency-contact.tsx (global for now)
const EMERGENCY_CONTACT_KEY = "@emergency_contact_simple";

// ---------- RISK DETECTION HELPERS ----------

const HIGH_RISK_PHRASES = [
  "i want to die",
  "i want to kill myself",
  "i wanna die",
  "i don't want to live",
  "i dont want to live",
  "i want to end my life",
  "i want to end it all",
  "i want to end everything",
  "i can't do this anymore",
  "i cant do this anymore",
  "life is not worth living",
  "suicide", // ✅ explicitly included as high risk
];

const MEDIUM_RISK_PHRASES = [
  "i hate my life",
  "i wish i wasn't here",
  "i wish i wasnt here",
  "i want to disappear",
  "i want to run away",
  "i am better off dead",
  "i feel completely hopeless",
];

const LOW_RISK_PHRASES = [
  "i feel empty",
  "i feel numb",
  "nothing matters",
  "i am useless",
  "i am a burden",
];

// small helper to pick random reply
function pickRandom(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

function assessRisk(message: string): RiskLevel {
  const text = message.toLowerCase().trim();

  if (!text) return "none";

  if (HIGH_RISK_PHRASES.some((p) => text.includes(p))) {
    return "high";
  }

  if (MEDIUM_RISK_PHRASES.some((p) => text.includes(p))) {
    return "medium";
  }

  if (LOW_RISK_PHRASES.some((p) => text.includes(p))) {
    return "low";
  }

  return "none";
}

export default function ChatbotScreen() {
  useProtectedRoute();
  const { user } = useAuth();
  const email = user?.email || "guest";
  const friendlyName =
    user?.name || user?.email?.split("@")[0] || "SoulSync User";

  // 🔑 Per-user storage keys
  const DAILY_STORAGE_KEY = `@daily_checkins_${email}`;
  const SUNDAY_KEY = `@sunday_seen_${email}`;
  const CHAT_STORAGE_KEY = `@chat_history_${email}`;

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [awaitingCheckIn, setAwaitingCheckIn] = useState(false);

  // ✨ Typing indicator state
  const [isTyping, setIsTyping] = useState(false);
  const [dotCount, setDotCount] = useState(1);

  // Risk state (for banner + badge)
  const [lastRisk, setLastRisk] = useState<RiskLevel>("none");

  // ---------- INITIAL LOAD (per user) ----------

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Load chat history for this user (if any)
        const storedChat = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
        if (storedChat) {
          const parsed: Message[] = JSON.parse(storedChat);
          setMessages(parsed);
        } else {
          // First time for this account → show welcome message
          const welcome: Message = {
            id: Date.now().toString(),
            text: `Hi ${friendlyName} 👋 I'm the SoulSync Bot.\n\nYou can tell me how you're feeling, ask for help, or just say hi. I'll also ask you for a daily 1–5 mood to build your weekly report.`,
            sender: "bot",
          };
          setMessages([welcome]);
        }

        // 2. Daily check-in for today
        await checkTodayStatus();

        // 3. Weekly reminder handling per user
        await resetSundayFlag();
        await checkSundayReminder();
      } catch (err) {
        console.log("Error during chatbot init", err);
      }
    };

    init();
  }, [CHAT_STORAGE_KEY, DAILY_STORAGE_KEY, SUNDAY_KEY, friendlyName]);

  // Save chat history whenever messages change
  useEffect(() => {
    const saveChat = async () => {
      try {
        await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
      } catch (err) {
        console.log("Error saving chat history", err);
      }
    };
    if (messages.length > 0) {
      saveChat();
    }
  }, [CHAT_STORAGE_KEY, messages]);

  // Animate dots "• •• •••"
  useEffect(() => {
    if (!isTyping) {
      setDotCount(1);
      return;
    }

    const id = setInterval(() => {
      setDotCount((prev) => (prev % 3) + 1);
    }, 350);

    return () => clearInterval(id);
  }, [isTyping]);

  // ---------- DAILY CHECK-IN HELPERS (PER USER) ----------

  async function checkTodayStatus() {
    try {
      const json = await AsyncStorage.getItem(DAILY_STORAGE_KEY);
      const today = new Date().toISOString().split("T")[0];

      if (json) {
        const saved: DailyCheckIn[] = JSON.parse(json);
        const alreadyDone = saved.find((entry) => entry.date === today);

        if (!alreadyDone) {
          askDailyQuestion();
        }
      } else {
        // No data yet → ask first daily check-in
        askDailyQuestion();
      }
    } catch (err) {
      console.log("Error checking today status", err);
    }
  }

  function askDailyQuestion() {
    const question: Message = {
      id: Date.now().toString(),
      text: "On a scale of 1–5, how did you feel today? (1 = Very bad, 5 = Very good)",
      sender: "bot",
    };

    setMessages((prev) => [...prev, question]);
    setAwaitingCheckIn(true);
  }

  async function saveTodayScore(score: number) {
    try {
      const today = new Date().toISOString().split("T")[0];

      const json = await AsyncStorage.getItem(DAILY_STORAGE_KEY);
      let saved: DailyCheckIn[] = json ? JSON.parse(json) : [];

      // Avoid duplicate entry for same day
      saved = saved.filter((entry) => entry.date !== today);
      saved.push({ date: today, score });

      await AsyncStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(saved));
    } catch (err) {
      console.log("Error saving daily score", err);
    }
  }

  // ---------- SUNDAY WEEKLY SUMMARY HELPERS (PER USER) ----------

  async function resetSundayFlag() {
    try {
      const day = new Date().getDay(); // Monday = 1
      if (day === 1) {
        await AsyncStorage.setItem(SUNDAY_KEY, "no");
      }
    } catch (err) {
      console.log("Error resetting Sunday flag", err);
    }
  }

  // Build list of last 7 date strings "YYYY-MM-DD"
  const getLast7Dates = (): Set<string> => {
    const set = new Set<string>();
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      set.add(d.toISOString().split("T")[0]);
    }
    return set;
  };

  async function checkSundayReminder() {
    try {
      const today = new Date();
      const day = today.getDay(); // Sunday = 0
      if (day !== 0) return; // not Sunday

      const json = await AsyncStorage.getItem(DAILY_STORAGE_KEY);
      if (!json) return; // no check-in data

      const saved: DailyCheckIn[] = JSON.parse(json);
      if (saved.length === 0) return;

      const seenFlag = await AsyncStorage.getItem(SUNDAY_KEY);
      if (seenFlag === "yes") return; // already shown today

      // Mark as shown
      await AsyncStorage.setItem(SUNDAY_KEY, "yes");

      // take only last 7 days
      const last7Dates = getLast7Dates();
      const recent = saved.filter((entry) => last7Dates.has(entry.date));

      if (recent.length === 0) {
        const msg: Message = {
          id: (Date.now() + 2).toString(),
          text:
            "📊 Weekly insight: You don't have enough mood logs this week. Try checking in daily to unlock more meaningful weekly insights.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, msg]);
        return;
      }

      const scores = recent.map((e) => e.score);
      const avg =
        scores.reduce((a, b) => a + b, 0) / Math.max(scores.length, 1);
      const avgText = avg.toFixed(1);

      let moodTrend: string;
      if (avg >= 4) {
        moodTrend =
          "Your week looks mostly positive 💜 Keep nurturing the routines that support you.";
      } else if (avg <= 2) {
        moodTrend =
          "This week seems a bit heavy 🫂 Be gentle with yourself and consider using SoulSync's self-help tools or talking to someone you trust.";
      } else {
        moodTrend =
          "You had a mix of ups and downs this week. That's completely human. Keeping track helps you notice patterns over time.";
      }

      const summaryText =
        `📊 Your weekly SoulSync summary is ready!\n\n` +
        `• Days checked in: ${recent.length} / 7\n` +
        `• Average mood score: ${avgText} / 5\n\n` +
        `${moodTrend}`;

      const msg: Message = {
        id: (Date.now() + 2).toString(),
        text: summaryText,
        sender: "bot",
      };

      setMessages((prev) => [...prev, msg]);
    } catch (err) {
      console.log("Error checking Sunday reminder", err);
    }
  }

  // ---------- SMART REPLY LOGIC ----------

  function getBotReply(msg: string): string {
    const text = msg.toLowerCase();

    // greetings
    if (["hi", "hello", "hey", "hii", "heyy"].some((w) => text.includes(w))) {
      return pickRandom([
        `Hi ${friendlyName.split(" ")[0]} 👋 I'm here with you.`,
        `Hello ${friendlyName.split(" ")[0]} 😊 What’s on your mind?`,
        `Hey ${friendlyName.split(" ")[0]}! Tell me anything – I’m listening.`,
      ]);
    }

    // exams / studies / college
    if (
      text.includes("exam") ||
      text.includes("test") ||
      text.includes("semester") ||
      text.includes("study") ||
      text.includes("studies") ||
      text.includes("college") ||
      text.includes("assignment")
    ) {
      return pickRandom([
        "Exams and studies can feel really heavy sometimes 📚. Try breaking your work into tiny tasks, take short breaks, and be kind to yourself even if you don’t finish everything. You can also use the Journal to brain-dump your worries and clear your head.",
        "Studying all the time can be exhausting 😮‍💨. It might help to plan just the **next 30 minutes** instead of the whole day. After that, reward yourself with a small break. Progress is more important than perfection.",
        "A lot of people feel anxious about studies and results 🎓. Remember that your worth is not equal to your marks. You can try the breathing or mindfulness tools for a few minutes, then come back to your notes with a calmer mind.",
      ]);
    }

    // sadness / low mood
    if (
      text.includes("sad") ||
      text.includes("lonely") ||
      text.includes("alone") ||
      text.includes("cry") ||
      text.includes("crying") ||
      text.includes("depressed")
    ) {
      return pickRandom([
        "I’m really sorry you’re feeling this way 💛. It’s okay to have low days. You don’t have to fix everything right now – just taking one gentle step is enough. Maybe write a few lines in your Journal or Gratitude section so your feelings have a safe place to sit.",
        "Feeling sad or lonely can make everything feel heavier than it is 🥺. You deserve support – even if it’s just small things like music you like, a warm drink, or messaging someone you trust. I’m here to listen to whatever you want to share.",
        "Thank you for trusting me with that 💬. If your sadness feels too much or too constant, it might help to talk to a close friend, family member, or a mental health professional. You deserve to be heard and supported.",
      ]);
    }

    // stress / anxiety / overthinking
    if (
      text.includes("stress") ||
      text.includes("stressed") ||
      text.includes("anxiety") ||
      text.includes("anxious") ||
      text.includes("overthink") ||
      text.includes("over thinking") ||
      text.includes("panic") ||
      text.includes("nervous")
    ) {
      return pickRandom([
        "It sounds like your mind is running very fast right now 😔. Try a slow 4–7–8 breath: inhale for 4 seconds, hold for 7, exhale for 8. Even 3–4 rounds can calm your body. After that, you could open the Breathing or Grounding tool inside SoulSync.",
        "Anxious thoughts can feel very real, but they’re still *thoughts*, not facts 🧠. It might help to write them in the Journal and then add one calm, realistic reply under each thought.",
        "You’re not strange for feeling anxious – it’s a very human reaction 💛. If it feels safe, try to name what exactly you’re worried about in one sentence. Sometimes naming it clearly makes it a little less powerful.",
      ]);
    }

    // tired / burnout
    if (
      text.includes("tired") ||
      text.includes("exhausted") ||
      text.includes("burnout") ||
      text.includes("burnt out") ||
      text.includes("drained") ||
      text.includes("no energy")
    ) {
      return pickRandom([
        "You sound really tired 😴. Rest is not a reward, it’s a basic need. If you can, give yourself permission to pause – even 10–15 minutes of doing nothing heavy.",
        "When your energy is low, it’s okay to switch to ‘minimum mode’ instead of forcing yourself to be 100% productive. Small steps are still steps ⭐.",
        "Your body and mind might be asking for a break. Maybe stretch a little, drink some water, or simply close your eyes and breathe slowly for a minute. You deserve rest.",
      ]);
    }

    // friendships / relationships
    if (
      text.includes("friend") ||
      text.includes("friends") ||
      text.includes("relationship") ||
      text.includes("breakup") ||
      text.includes("broke up") ||
      text.includes("fight") ||
      text.includes("argue") ||
      text.includes("argument")
    ) {
      return pickRandom([
        "Relationships and friendships can affect our mood a lot 🫂. It’s okay to feel hurt or confused. You might try journaling what happened and how you felt, so you can see your thoughts more clearly.",
        "Misunderstandings with people we care about can be really painful 💔. If it feels right and safe, a calm message about how **you** feel (without blaming) can sometimes help.",
        "Whatever happened, your feelings are valid. You are still worthy of care and respect, even when people don’t treat you perfectly.",
      ]);
    }

    // motivation / self-doubt
    if (
      text.includes("motivation") ||
      text.includes("motivated") ||
      text.includes("don't feel like") ||
      text.includes("dont feel like") ||
      text.includes("lazy") ||
      text.includes("worthless") ||
      text.includes("not good enough") ||
      text.includes("no confidence")
    ) {
      return pickRandom([
        "Feeling low on motivation or confidence doesn’t mean you’re actually incapable 💫. It just means your mind is tired. Try doing the *smallest* version of the task (like 5 minutes) and then check in with yourself again.",
        "Self-doubt is loud, but it isn’t always telling the truth. You’ve already survived many days that felt hard – that itself is proof of your strength.",
        "Be gentle with yourself today. Instead of asking ‘why am I like this?’, try asking ‘what do I need right now?’ – rest, support, a break, or a tiny win.",
      ]);
    }

    // sleep issues
    if (
      text.includes("sleep") ||
      text.includes("insomnia") ||
      text.includes("can't sleep") ||
      text.includes("cant sleep") ||
      text.includes("night")
    ) {
      return pickRandom([
        "Poor sleep can make every emotion feel stronger 🌙. You could try keeping the phone away for a bit, doing some slow breathing, or listening to something calming. Even if you can’t sleep, resting your body still helps.",
        "If your thoughts are racing at night, writing them down in the Journal and telling yourself ‘I’ll deal with this tomorrow’ can sometimes calm the mind.",
      ]);
    }

    // ask about weekly / report / chart
    if (
      text.includes("week") ||
      text.includes("weekly") ||
      text.includes("report") ||
      text.includes("chart") ||
      text.includes("graph")
    ) {
      return "You can view your Weekly Check-In Report 📊 from the Dashboard. It uses your 1–5 daily scores to show patterns in how your mood is changing across the week.";
    }

    // self-harm / severe distress → supportive but not instructional
    if (
      text.includes("kill myself") ||
      text.includes("suicide") ||
      text.includes("hurt myself") ||
      text.includes("end my life")
    ) {
      return (
        "I’m really glad you reached out and shared that 🫂. I’m just an app and I can’t keep you safe in an emergency, but you *deserve* real support.\n\n" +
        "If you’re in immediate danger or feel you might act on these thoughts, please contact your local emergency number or a trusted crisis helpline right now, or reach out to someone you trust nearby.\n\n" +
        "You don’t have to go through this alone."
      );
    }

    // fallback – more caring & guiding
    return (
      "I hear you 💛. Thank you for sharing that with me.\n\n" +
      "I might not fully understand every situation, but I’m here to listen. " +
      "If you’d like more specific suggestions, you can also tell me if this is mainly about **studies, friendships/relationships, family, health, or mood** and I’ll try to respond more clearly.\n\n" +
      "You’re allowed to take things one step at a time."
    );
  }

  // ✨ Helper: show bot message with small delay + typing
  const showBotMessage = (text: string, delayMs = 900) => {
    setIsTyping(true);
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + Math.random()).toString(),
        text,
        sender: "bot",
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, delayMs);
  };

  // ---------- EMERGENCY HELPERS (banner action) ----------

  const checkAndHandleRisk = (userMessage: string) => {
    const risk = assessRisk(userMessage);
    setLastRisk(risk);
  };

  const handleEmergencyAction = async () => {
    try {
      const stored = await AsyncStorage.getItem(EMERGENCY_CONTACT_KEY);

      if (!stored) {
        const msg: Message = {
          id: (Date.now() + 3).toString(),
          text:
            "I couldn’t find any emergency contact saved. I’ll open the Safety Settings so you can add a trusted person.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, msg]);
        router.push("/emergency-contact");
        return;
      }

      const contact = JSON.parse(stored);
      const phoneRaw = contact.phoneNumber || contact.phone;
      const name = contact.name || "your trusted person";

      if (!phoneRaw) {
        const msg: Message = {
          id: (Date.now() + 4).toString(),
          text:
            "Your saved emergency contact doesn’t seem to have a valid phone number. Please update it in Safety Settings.",
          sender: "bot",
        };
        setMessages((prev) => [...prev, msg]);
        router.push("/emergency-contact");
        return;
      }

      const phoneDigits = String(phoneRaw).replace(/[^0-9]/g, "");

      const body =
        `This is a safety alert from the SoulSync app.\n\n` +
        `We are worried that the user linked to this number may be in emotional danger or distress ` +
        `based on their recent messages in the app.\n\n` +
        `Please try to contact and check on them as soon as possible.`;

      // 🌐 WEB: use WhatsApp Web as fallback
      if (Platform.OS === "web") {
        const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(
          body
        )}`;

        const canOpenWA = await Linking.canOpenURL(waUrl);
        if (canOpenWA) {
          await Linking.openURL(waUrl);
        } else {
          const msg: Message = {
            id: (Date.now() + 5).toString(),
            text:
              `On mobile, SoulSync would open an SMS to your emergency contact.\n\n` +
              `On web, please contact ${name} at ${phoneRaw} and you can send them this message:\n\n` +
              body,
            sender: "bot",
          };
          setMessages((prev) => [...prev, msg]);
        }

        setLastRisk("none");
        return;
      }

      // 📱 NATIVE (Android / iOS): use SMS
      const smsUrl = `sms:${phoneRaw}?body=${encodeURIComponent(body)}`;
      const canOpenSMS = await Linking.canOpenURL(smsUrl);

      if (canOpenSMS) {
        await Linking.openURL(smsUrl);
      } else {
        const msg: Message = {
          id: (Date.now() + 6).toString(),
          text:
            `I couldn’t open the Messages app here. Please try calling or messaging your trusted person directly at ${phoneRaw}.`,
          sender: "bot",
        };
        setMessages((prev) => [...prev, msg]);
      }

      setLastRisk("none");
    } catch (error) {
      console.error("Error triggering emergency action", error);
      const msg: Message = {
        id: (Date.now() + 7).toString(),
        text:
          "Something went wrong while trying to start the emergency contact flow. Please try contacting someone you trust or your local emergency number directly.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, msg]);
      setLastRisk("none");
    }
  };

  // ---------- HANDLE SEND ----------

  const handleSend = () => {
  if (!input.trim()) return;

  const userText = input.trim();

  // 🔐 Check risk on every message (for badge + emergency banner)
  checkAndHandleRisk(userText);

  // Add user message to chat
  const userMessage: Message = {
    id: Date.now().toString(),
    text: userText,
    sender: "user",
  };
  setMessages((prev) => [...prev, userMessage]);
  setInput("");

  // 🟡 If we are waiting for 1–5 daily check-in answer
  if (awaitingCheckIn) {
    const num = Number(userText);

    if (!Number.isNaN(num) && num >= 1 && num <= 5) {
      // Valid 1–5 → save and only send thank-you, no normal reply
      saveTodayScore(num);
      showBotMessage(
        `Thank you 💛 I've added your score (${num}/5) to your weekly report.`
      );
      setAwaitingCheckIn(false);
      return;
    } else {
      // Not a number between 1–5 → stop forcing the rating
      // and let the chatbot reply normally
      setAwaitingCheckIn(false);
    }
  }

  // 🟢 Normal smart reply (always runs now for normal messages)
  const replyText = getBotReply(userText);
  showBotMessage(replyText);
};


  // ---------- RESET CHAT FOR THIS USER ----------

  const handleClearChat = async () => {
    try {
      setMessages([]);
      await AsyncStorage.removeItem(CHAT_STORAGE_KEY);

      const welcome: Message = {
        id: Date.now().toString(),
        text: `Chat cleared ✅\n\nHi again ${friendlyName} 👋 You can tell me how you're feeling or just say hi. I'll keep tracking your daily 1–5 check-ins from now on.`,
        sender: "bot",
      };
      setMessages([welcome]);
      setLastRisk("none");
    } catch (err) {
      console.log("Error clearing chat history", err);
    }
  };

  // ---------- RENDER MESSAGES ----------

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.sender === "user";

    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowBot,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isUser ? styles.userText : styles.botText,
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  // ---------- UI ----------

  const typingDots = ".".repeat(dotCount); // ".", "..", "..."

  const riskLabel =
    lastRisk !== "none" ? `Risk Level: ${lastRisk.toUpperCase()}` : "";

  const riskDescription =
    lastRisk === "high"
      ? "Words like ‘die’ or ‘suicide’ were detected."
      : lastRisk === "medium"
      ? "Strong distress words were detected."
      : lastRisk === "low"
      ? "Some emotionally heavy words were detected."
      : "";

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View style={styles.headerWrapper}>
          <View style={styles.headerTopRow}>
            <View>
              <Text style={styles.badge}>SoulSync Bot</Text>
              <Text style={styles.title}>Chatbot 🤖</Text>
            </View>

            <Pressable style={styles.clearButton} onPress={handleClearChat}>
              <Text style={styles.clearButtonText}>Clear chat</Text>
            </Pressable>
          </View>

          <Text style={styles.subtitle}>
            Hey {friendlyName.split(" ")[0]}, share how you’re feeling or just
            talk. I’ll also help track your daily 1–5 mood for weekly reports.
          </Text>
        </View>

        {/* Chat area inside a card */}
        <View style={styles.chatCard}>
          {/* 🔎 Risk-level badge for demo */}
          {lastRisk !== "none" && (
            <View
              style={[
                styles.riskBadgeContainer,
                lastRisk === "high" && styles.riskBadgeHigh,
                lastRisk === "medium" && styles.riskBadgeMedium,
                lastRisk === "low" && styles.riskBadgeLow,
              ]}
            >
              <Text style={styles.riskBadgeLabel}>{riskLabel}</Text>
              {riskDescription ? (
                <Text style={styles.riskBadgeText}>{riskDescription}</Text>
              ) : null}
            </View>
          )}

          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Say hi to start a conversation, or wait for your daily check-in
                question 💬
              </Text>
              {isTyping && (
                <View
                  style={[
                    styles.messageRow,
                    styles.messageRowBot,
                    { marginTop: appSpacing.m },
                  ]}
                >
                  <View style={[styles.messageBubble, styles.botBubble]}>
                    <Text style={styles.typingLabel}>
                      SoulSync is typing{typingDots}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <>
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContent}
                showsVerticalScrollIndicator={false}
              />
              {isTyping && (
                <View
                  style={[
                    styles.messageRow,
                    styles.messageRowBot,
                    { marginTop: appSpacing.s },
                  ]}
                >
                  <View style={[styles.messageBubble, styles.botBubble]}>
                    <Text style={styles.typingLabel}>
                      SoulSync is typing{typingDots}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Emergency banner (only if high risk) */}
        {lastRisk === "high" && (
          <View style={styles.emergencyBanner}>
            <Text style={styles.emergencyTitle}>This sounds very serious 🫂</Text>
            <Text style={styles.emergencyText}>
              SoulSync can’t replace doctors or emergency services, but you can
              quickly reach someone you trust.
            </Text>
            <Pressable
              style={styles.emergencyButton}
              onPress={handleEmergencyAction}
            >
              <Text style={styles.emergencyButtonText}>
                Contact my emergency person
              </Text>
            </Pressable>
            <Text style={styles.emergencyNote}>
              If you are in immediate danger, please contact your local
              emergency number right now.
            </Text>
          </View>
        )}

        {/* Input bar */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Type a message…"
              placeholderTextColor={appColors.subtleText}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <Pressable style={styles.sendButton} onPress={handleSend}>
              <Text style={styles.sendText}>Send</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerWrapper: {
    marginBottom: appSpacing.m,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: appSpacing.xs,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    fontSize: 11,
    fontWeight: "600",
    color: appColors.text,
    backgroundColor: "rgba(139,92,246,0.12)",
    marginBottom: appSpacing.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: appColors.text,
  },
  subtitle: {
    fontSize: 13,
    color: appColors.subtleText,
  },

  clearButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.7)",
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: "500",
    color: appColors.text,
  },

  chatCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: appRadius.l,
    padding: appSpacing.m,
    marginBottom: appSpacing.m,
    borderWidth: 1,
    borderColor: appColors.border,
    // soft shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 5,
  },
  chatContent: {
    paddingBottom: appSpacing.m,
  },

  messageRow: {
    marginBottom: appSpacing.s,
    flexDirection: "row",
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageRowBot: {
    justifyContent: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    paddingHorizontal: appSpacing.m,
    paddingVertical: appSpacing.s,
    borderRadius: appRadius.l,
  },
  userBubble: {
    backgroundColor: "#8B5CF6", // SoulSync purple
  },
  botBubble: {
    backgroundColor: "#F3F4F6",
  },
  messageText: {
    fontSize: 14,
  },
  userText: {
    color: "#FFFFFF",
  },
  botText: {
    color: appColors.text,
  },

  typingLabel: {
    fontSize: 13,
    color: appColors.subtleText,
  },

  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: appSpacing.l,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: appColors.text,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: appColors.subtleText,
    textAlign: "center",
  },

  // 🔎 Risk badge styles
  riskBadgeContainer: {
    marginBottom: appSpacing.s,
    paddingHorizontal: appSpacing.m,
    paddingVertical: appSpacing.s,
    borderRadius: appRadius.m,
    borderWidth: 1,
  },
  riskBadgeHigh: {
    backgroundColor: "rgba(248, 113, 113, 0.12)",
    borderColor: "#B91C1C",
  },
  riskBadgeMedium: {
    backgroundColor: "rgba(251, 191, 36, 0.12)",
    borderColor: "#D97706",
  },
  riskBadgeLow: {
    backgroundColor: "rgba(52, 211, 153, 0.12)",
    borderColor: "#059669",
  },
  riskBadgeLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: appColors.text,
  },
  riskBadgeText: {
    fontSize: 11,
    marginTop: 2,
    color: appColors.subtleText,
  },

  // Emergency banner
  emergencyBanner: {
    marginBottom: appSpacing.s,
    marginHorizontal: 2,
    backgroundColor: "rgba(248, 113, 113, 0.12)", // soft red
    borderRadius: appRadius.l,
    padding: appSpacing.m,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.7)",
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#B91C1C",
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 13,
    color: "#7F1D1D",
    marginBottom: appSpacing.s,
  },
  emergencyButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#B91C1C",
    marginBottom: appSpacing.xs,
  },
  emergencyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  emergencyNote: {
    fontSize: 12,
    color: "#7F1D1D",
  },

  inputWrapper: {
    paddingBottom: appSpacing.s,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    borderRadius: 999,
    paddingHorizontal: appSpacing.s,
    paddingVertical: 4,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: appColors.border,
    // shadow to float above edge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  input: {
    flex: 1,
    maxHeight: 90,
    fontSize: 14,
    paddingHorizontal: appSpacing.s,
    paddingVertical: appSpacing.xs,
    color: appColors.text,
  },
  sendButton: {
    paddingHorizontal: appSpacing.m,
    paddingVertical: appSpacing.s,
    borderRadius: 999,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
});
