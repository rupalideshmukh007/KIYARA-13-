import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated, FlatList, KeyboardAvoidingView,
  Platform, Pressable, StyleSheet, Text,
  TextInput, View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getKiyaraReply, loadBrain } from "./brain";

interface Message {
  id: string;
  sender: "kiyara" | "user";
  text: string;
  time: string;
}

function getNow() {
  return new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Avatar ──────────────────────────────────────
function KiyaraAvatar({ isTalking }: { isTalking: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const glow  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isTalking) {
      Animated.loop(Animated.sequence([
        Animated.timing(scale, { toValue: 1.07, duration: 300, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1.00, duration: 300, useNativeDriver: true }),
      ])).start();
      Animated.loop(Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])).start();
    } else {
      scale.stopAnimation();
      glow.stopAnimation();
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
      Animated.timing(glow, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
  }, [isTalking]);

  const glowOp = glow.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.85] });

  return (
    <View style={s.avatarWrapper}>
      <Animated.View style={[s.ring, s.ring3, { opacity: glowOp }]} />
      <Animated.View style={[s.ring, s.ring2, { opacity: glowOp }]} />
      <Animated.View style={[s.ring, s.ring1, { opacity: glowOp }]} />
      <Animated.View style={[s.avatar, { transform: [{ scale }] }]}>
        <Text style={s.avatarEmoji}>🤖</Text>
      </Animated.View>
    </View>
  );
}

// ── Bubble ──────────────────────────────────────
function Bubble({ item }: { item: Message }) {
  const isKiyara = item.sender === "kiyara";
  return (
    <View style={[s.row, isKiyara ? s.left : s.right]}>
      <View style={[s.bubble, isKiyara ? s.kiyaraBubble : s.userBubble]}>
        <Text style={s.bubbleText}>{item.text}</Text>
        <Text style={s.timeText}>{item.time}</Text>
      </View>
    </View>
  );
}

// ── Main ─────────────────────────────────────────
export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const flatRef = useRef<FlatList>(null);
  const [messages, setMessages] = useState<Message[]>([{
    id: "1",
    sender: "kiyara",
    text: "नमस्कार! मी Kiyara आहे — तुमचा AI मित्र! 🤖\nमराठी, हिंदी किंवा English मध्ये बोला.\nगणित, वेळ, तारीख — सगळं विचारा! 😊",
    time: getNow(),
  }]);
  const [input, setInput]     = useState("");
  const [talking, setTalking] = useState(false);

  useEffect(() => {
    loadBrain();
  }, []);

  const speak = useCallback((text: string) => {
    Speech.stop();
    setTalking(true);
    Speech.speak(text, {
      language: "mr-IN",
      pitch: 1.1,
      rate: 0.85,
      onDone:    () => setTalking(false),
      onStopped: () => setTalking(false),
      onError:   () => setTalking(false),
    });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => speak("नमस्कार! मी Kiyara आहे — तुमचा AI मित्र!"), 1000);
    return () => { clearTimeout(t); Speech.stop(); };
  }, []);

  const send = useCallback(() => {
    const text = input.trim();
    if (!text) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages((p) => [...p, { id: Date.now().toString(), sender: "user", text, time: getNow() }]);
    setInput("");
    setTimeout(() => {
      const reply = getKiyaraReply(text);
      setMessages((p) => [...p, { id: (Date.now()+1).toString(), sender: "kiyara", text: reply, time: getNow() }]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      speak(reply);
    }, 600);
  }, [input, speak]);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={s.header}>
        <KiyaraAvatar isTalking={talking} />
        <View style={{ flex: 1 }}>
          <Text style={s.name}>Kiyara</Text>
          <View style={s.onlineRow}>
            <View style={[s.dot, talking && s.dotTalking]} />
            <Text style={s.onlineTxt}>{talking ? "बोलतोय... 🔊" : "Online ✓"}</Text>
          </View>
        </View>
      </View>

      <View style={s.divider} />

      {/* Chat + Input */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <Bubble item={item} />}
          contentContainerStyle={s.chatContent}
          onContentSizeChange={() => flatRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        />

        <View style={[s.inputRow, { paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={s.input}
            value={input}
            onChangeText={setInput}
            placeholder="Kiyara ला काहीतरी सांगा..."
            placeholderTextColor="rgba(255,255,255,0.35)"
            onSubmitEditing={send}
            returnKeyType="send"
          />
          <Pressable
            style={({ pressed }) => [s.micBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.micIcon}>🍫</Text>
          </Pressable>
          <Pressable
            onPress={send}
            style={({ pressed }) => [s.sendBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.sendIcon}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ── Styles ───────────────────────────────────────
const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: "#0f0c29" },
  header:      { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, gap: 14 },
  name:        { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  onlineRow:   { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  dot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: "#4ade80" },
  dotTalking:  { backgroundColor: "#a78bfa" },
  onlineTxt:   { fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "Inter_400Regular" },
  divider:     { height: 1, backgroundColor: "rgba(255,255,255,0.08)" },
  chatContent: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  row:         { marginBottom: 8 },
  left:        { alignItems: "flex-start" },
  right:       { alignItems: "flex-end" },
  bubble:      { maxWidth: "82%", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  kiyaraBubble: { backgroundColor: "rgba(167,139,250,0.18)", borderWidth: 1, borderColor: "rgba(167,139,250,0.25)", borderBottomLeftRadius: 4 },
  userBubble:  { backgroundColor: "#a78bfa", borderBottomRightRadius: 4 },
  bubbleText:  { fontSize: 15, lineHeight: 22, fontFamily: "Inter_400Regular", color: "#fff" },
  timeText:    { fontSize: 10, color: "rgba(255,255,255,0.38)", marginTop: 4, fontFamily: "Inter_400Regular" },
  inputRow:    { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 10, gap: 10, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.08)" },
  input:       { flex: 1, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 24, borderWidth: 1, borderColor: "rgba(167,139,250,0.3)", paddingHorizontal: 18, paddingVertical: 12, fontSize: 15, color: "#fff", fontFamily: "Inter_400Regular" },
  micBtn:      { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(167,139,250,0.3)" },
  micIcon:     { color: "#fff", fontSize: 20 },
  sendBtn:     { width: 46, height: 46, borderRadius: 23, backgroundColor: "#a78bfa", alignItems: "center", justifyContent: "center" },
  sendIcon:    { color: "#fff", fontSize: 18, marginLeft: 2 },
  avatarWrapper: { width: 54, height: 54, alignItems: "center", justifyContent: "center" },
  avatar:      { width: 54, height: 54, borderRadius: 27, backgroundColor: "rgba(167,139,250,0.25)", borderWidth: 2, borderColor: "#a78bfa", alignItems: "center", justifyContent: "center", zIndex: 10 },
  avatarEmoji: { fontSize: 28 },
  ring:        { position: "absolute", borderRadius: 999, borderWidth: 1.5, borderColor: "#a78bfa" },
  ring1:       { width: 64, height: 64 },
  ring2:       { width: 76, height: 76 },
  ring3:       { width: 90, height: 90 },
});
