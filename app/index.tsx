
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from "@react-native-voice/voice";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, TouchableOpacity, DeviceEventEmitter, Alert, Linking, Platform, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import VoiceSettings, { VOICE_PITCH_KEY, VOICE_RATE_KEY, VOICE_LANG_KEY } from "../components/VoiceSettings";
import FloatingButton from "../components/FloatingButton";
import ThemeSettings from "../components/ThemeSettings";

type AppState = "idle" | "listening" | "thinking" | "speaking";
const FIRST_LAUNCH_KEY = 'isFirstLaunch';
const CUSTOM_BG_KEY = 'customBgUri';
const DEFAULT_BG = require('../assets/images/default_bg.jpg');

// Basic brain for replies
const brain: Record<string, { keywords: string[]; replies: Record<string, string[]> }> = {
    greetings: { keywords: ["नमस्कार", "hi", "हाय", "नमस्ते", "हॅलो", "hello"], replies: { mr: ["नमस्कार! मी कियारा! 🤖"], hi: ["नमस्ते! मैं कियारा हूँ! 🤖"], en: ["Hello! I'm Kiyara! 🤖"] } },
    name: { keywords: ["नाव काय", "your name", "who are you", "नाम क्या है"], replies: { mr: ["माझे नाव कियारा!"], hi: ["मेरा नाम कियारा है!"], en: ["My name is Kiyara!"] } },
};

function getKiyaraReply(input: string, lang: string): string {
    const text = input.toLowerCase();
    const langKey = lang.startsWith('mr') ? 'mr' : lang.startsWith('hi') ? 'hi' : 'en';
    for (const key in brain) {
        const data = brain[key as keyof typeof brain];
        if (data.keywords.some(kw => text.includes(kw.toLowerCase()))) {
            const replies = data.replies[langKey] || data.replies.en;
            return replies[Math.floor(Math.random() * replies.length)];
        }
    }
    if (langKey === 'mr') return "माफ करा, मला ते समजले नाही.";
    if (langKey === 'hi') return "माफ़ कीजिए, मुझे वह समझ नहीं आया।";
    return "Sorry, I didn't understand that.";
}

const getStyles = () => StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    imageBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    bottomBar: { position: 'absolute', bottom: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    iconButton: { padding: 15, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 50 },
    icon: { fontSize: 35 },
    statusContainer: { position: 'absolute', top: '25%', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20 },
    statusText: { color: '#fff', fontSize: 16, fontWeight: '500' }
});

export default function BuddyScreen() {
    const insets = useSafeAreaInsets();
    const [appState, setAppState] = useState<AppState>("idle");
    const [isVoiceSettingsVisible, setVoiceSettingsVisible] = useState(false);
    const [isThemeSettingsVisible, setThemeSettingsVisible] = useState(false);
    const [customBgUri, setCustomBgUri] = useState<string | null>(null);
    const [voiceConfig, setVoiceConfig] = useState({ pitch: 1.8, rate: 0.85, lang: 'mr-IN' });
    
    const appStateRef = useRef(appState);
    useEffect(() => { appStateRef.current = appState; }, [appState]);

    const s = getStyles();

    const loadSettings = async () => {
        const bgUri = await AsyncStorage.getItem(CUSTOM_BG_KEY);
        setCustomBgUri(bgUri);
        const pitch = await AsyncStorage.getItem(VOICE_PITCH_KEY);
        const rate = await AsyncStorage.getItem(VOICE_RATE_KEY);
        const lang = await AsyncStorage.getItem(VOICE_LANG_KEY);
        setVoiceConfig({ pitch: pitch ? parseFloat(pitch) : 1.8, rate: rate ? parseFloat(rate) : 0.85, lang: lang || 'mr-IN' });
    };
    
    const requestPermissions = async () => {
        const isFirst = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
        if (isFirst !== null) return;
        
        try {
            const hasMicPermission = await Voice.hasSpeechRecognitionPermission();
            if (!hasMicPermission) { await Voice.requestSpeechRecognitionPermission(); }
        } catch (e) { console.error("Mic permission error:", e); }

        if (Platform.OS === 'android') {
                Alert.alert("एक छोटीशी परवानगी", "कियाराला इतर ॲप्सवर दिसण्यासाठी, कृपया सेटिंग्जमध्ये जाऊन 'Display over other apps' ला परवानगी द्या.", [
                    { text: "नंतर", style: "cancel" },
                    { text: "सेटिंग्ज उघडा", onPress: () => Linking.openSettings() }
                ]);
        }
        await AsyncStorage.setItem(FIRST_LAUNCH_KEY, 'false');
    };

    useEffect(() => {
        loadSettings();
        requestPermissions();
        const subscription = DeviceEventEmitter.addListener('voiceSettingsChanged', loadSettings);
        return () => subscription.remove();
    }, []);

    const speak = useCallback((text: string) => {
        setAppState("speaking");
        Speech.speak(text, { language: voiceConfig.lang, pitch: voiceConfig.pitch, rate: voiceConfig.rate, onDone: () => setAppState("idle"), onError: () => setAppState("idle") });
    }, [voiceConfig]);

    const startListening = useCallback(async () => {
        if (appStateRef.current !== 'idle') {
            try { await Voice.stop(); } catch (e) { console.error("Voice stop error:", e); }
            setAppState('idle');
            return;
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setAppState("listening");
        try { await Voice.start(voiceConfig.lang); } catch (e) { console.error("Voice start error:", e); setAppState("idle"); }
    }, [voiceConfig, appStateRef.current]);

    const processInput = useCallback((text: string) => {
        if (!text.trim()) { setAppState("idle"); return; }
        setAppState("thinking");
        const reply = getKiyaraReply(text, voiceConfig.lang);
        speak(reply);
    }, [speak, voiceConfig.lang]);

    useEffect(() => {
        const onSpeechResults = (e: SpeechResultsEvent) => { if (e.value && e.value[0]) { processInput(e.value[0]); } else { setAppState("idle"); } };
        const onSpeechError = (e: SpeechErrorEvent) => { console.error("Speech error:", e.error); setAppState('idle'); };
        const onSpeechEnd = () => setAppState('idle');
        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        Voice.onSpeechEnd = onSpeechEnd;
        return () => { Voice.destroy().then(Voice.removeAllListeners); };
    }, [processInput]);

    const handleSetTheme = async (themeUri: string | null) => {
        setCustomBgUri(themeUri);
        if (themeUri) {
            await AsyncStorage.setItem(CUSTOM_BG_KEY, themeUri);
        } else {
            await AsyncStorage.removeItem(CUSTOM_BG_KEY);
        }
    };
    
    const getStatusText = () => {
        const lang = voiceConfig.lang;
        if (appState === 'listening') return lang.startsWith('hi') ? 'सुन रही हूँ...' : lang.startsWith('en') ? 'Listening...' : 'ऐकत आहे...';
        if (appState === 'thinking') return lang.startsWith('hi') ? 'सोच रही हूँ...' : lang.startsWith('en') ? 'Thinking...' : 'समजून घेत आहे...';
        if (appState === 'speaking') return lang.startsWith('hi') ? 'बोल रही हूँ...' : lang.startsWith('en') ? 'Speaking...' : 'बोलत आहे...';
        return "";
    }
    
    return (
        <ImageBackground 
            source={customBgUri ? { uri: customBgUri } : DEFAULT_BG} 
            style={s.imageBg}
            resizeMode="cover"
        >
            <View style={[s.container, {backgroundColor: 'transparent'}]}>
                {appState !== 'idle' && (
                    <View style={s.statusContainer}>
                        <Text style={s.statusText}>{getStatusText()}</Text>
                    </View>
                )}

                <FloatingButton onPress={startListening} />

                <View style={[s.bottomBar, { paddingBottom: insets.bottom }]}>
                    <TouchableOpacity style={s.iconButton} onPress={() => setVoiceSettingsVisible(true)}>
                        <Text style={s.icon}>🪆</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.iconButton} onPress={() => setThemeSettingsVisible(true)}>
                        <Text style={s.icon}>👗</Text>
                    </TouchableOpacity>
                </View>

                <VoiceSettings 
                    visible={isVoiceSettingsVisible} 
                    onClose={() => setVoiceSettingsVisible(false)} 
                />
                <ThemeSettings 
                    visible={isThemeSettingsVisible}
                    onClose={() => setThemeSettingsVisible(false)}
                    onSetTheme={handleSetTheme}
                />
            </View>
        </ImageBackground>
    );
}
