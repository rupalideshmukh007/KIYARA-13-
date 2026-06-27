
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import Voice, { SpeechResultsEvent, SpeechErrorEvent } from "@react-native-voice/voice";
import React, { useCallback, useEffect, useState, useRef } from "react";
import { Linking, KeyboardAvoidingView, Platform, StyleSheet, Text, View, ImageBackground, TouchableOpacity, DeviceEventEmitter, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from 'expo-clipboard';

import VoiceSettings, { VOICE_PITCH_KEY, VOICE_RATE_KEY } from "../components/VoiceSettings";
import TypingAnimation from "../components/TypingAnimation";
import KnowledgeHub, { KnowledgeItem } from "../components/KnowledgeHub";
import CodingHQ, { CodeNote } from "../components/CodingHQ";
import ProxyKeyboard from "../components/ProxyKeyboard";

interface Message { id: string; sender: "buddy" | "user"; text: string; time: string; }
type LangKey = "mr" | "hi" | "en";
type AppState = "idle" | "listening" | "thinking" | "speaking" | "no_permission";
type Theme = "light" | "dark";

const brain: Record<string, { keywords: string[]; replies: Record<LangKey, string[]> }> = {
  wakeCommand: { keywords: ["ऐक ना", "aayk na", "kiyara", "कियारा", "हॅलो", "hello"], replies: { mr: ["हो, बोल ना..."] } },
  greetings: { keywords: ["नमस्कार", "hi", "हाय", "नमस्ते"], replies: { mr: ["नमस्कार! मी कियारा! आज कसे आहात? 😊"] } },
  name: { keywords: ["नाव काय", "your name", "who are you"], replies: { mr: ["माझे नाव कियारा! मी तुमची AI मैत्रीण! 🤖"] } },
  openKnowledge: { keywords: ["नॉलेज हब उघड", "knowledge hub"], replies: { mr: ["ठीक आहे, नॉलेज हब उघडत आहे..."] } },
  deactivateTopic: { keywords: ["झालं", "पूर्ण झालं", "काम झालं"], replies: { mr: ["ठीक आहे, मी हा विषय आता बंद करत आहे."] } },
  typeThis: { keywords: ["हे टाइप कर", "type this", "टाईप कर"], replies: {mr: ["मेसेज कॉपी झाला आहे! तुम्ही आता कोणत्याही ॲपमध्ये जाऊन फक्त 'पेस्ट' करू शकता."]}},
};

function getKiyaraReply(input: string): string {
    const text = input.toLowerCase();
    for (const key in brain) {
        if (['wakeCommand', 'openKnowledge', 'deactivateTopic', 'typeThis'].includes(key)) continue;
        const data = brain[key as keyof typeof brain];
        if (data.keywords.some(kw => text.includes(kw.toLowerCase()))) {
            const replies = data.replies.mr;
            return replies[Math.floor(Math.random() * replies.length)];
        }
    }
    return "माफ करा, समजले नाही.";
}

function getNow() { return new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }); }

const getFromDB = async (key: string): Promise<any> => { try { const json = await AsyncStorage.getItem(key); return json ? JSON.parse(json) : null; } catch { return null; }};
const saveToDB = async (key: string, data: any) => { await AsyncStorage.setItem(key, JSON.stringify(data)); };

const CODING_HQ_KEY = 'coding_hq_notes';
const MEMORY_KEY = 'kiyara_memory';

const getStyles = (theme: Theme) => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme === 'dark' ? "#0f0c29" : "#f0f8ff" },
    imageContainer: { flex: 1 },
    header: { flexDirection: "row", justifyContent: 'space-between', alignItems: "center", paddingHorizontal: 15, paddingVertical: 12, backgroundColor: 'rgba(0,0,0,0.1)' },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
    name: { fontSize: 22, fontWeight: '700', color: theme === 'dark' ? "#fff" : "#000" },
    settingsButton: { padding: 5 },
    settingsIcon: { fontSize: 24, color: theme === 'dark' ? '#fff' : '#000' },
    buttonRow: { flexDirection: 'row', justifyContent: 'center', paddingBottom: 10, paddingHorizontal: 20, gap: 20 },
    iconButton: { backgroundColor: 'rgba(167, 139, 250, 0.2)', borderRadius: 50, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    iconButtonText: { fontSize: 24, color: '#a78bfa' },
});

export default function BuddyScreen() {
    const insets = useSafeAreaInsets();
    const [appState, setAppState] = useState<AppState>("idle");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isVoiceSettingsVisible, setVoiceSettingsVisible] = useState(false);
    const [isKnowledgeHubVisible, setKnowledgeHubVisible] = useState(false);
    const [isCodingHQVisible, setCodingHQVisible] = useState(false);
    const [activeTopic, setActiveTopic] = useState<KnowledgeItem | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [theme, setTheme] = useState<Theme>('dark');
    const [customBg, setCustomBg] = useState<string | null>(null);
    const [voiceSettings, setVoiceSettings] = useState({ pitch: 1.4, rate: 0.9 });
    const [lastScenario, setLastScenario] = useState<string | null>(null);
    const [proxyKeyboardContent, setProxyKeyboardContent] = useState<string | null>(null);

    const appStateRef = useRef(appState);
    useEffect(() => { appStateRef.current = appState; }, [appState]);

    const s = getStyles(theme);

    const addMsg = useCallback((sender: "buddy" | "user", text: string) => { setMessages(prev => [...prev, { id: `${Date.now()}-${sender}`, sender, text, time: getNow() }]); }, []);

    const speak = useCallback((text: string, onDoneCallback?: () => void) => {
        setAppState("speaking");
        Speech.speak(text, { language: "mr-IN", pitch: voiceSettings.pitch, rate: voiceSettings.rate, onDone: () => onDoneCallback ? onDoneCallback() : setAppState("idle"), onError: () => setAppState("idle"), });
    }, [voiceSettings]);

    const _startRecognizing = useCallback(async () => {
        setAppState("listening");
        try { await Voice.start('mr-IN'); } catch (e) { console.error(e); setAppState("idle"); }
    }, []);

    const handleSelectItem = (item: KnowledgeItem) => {
        setActiveTopic(item);
        setKnowledgeHubVisible(false);
        const reply = `ठीक आहे, आता आपण '${item.title}' यावर बोलूया. बोला, काय मदत करू?`;
        speak(reply); addMsg("buddy", reply);
    };
    
    const getCodingSolution = async (problem: string): Promise<string | null> => {
        const notes = await getFromDB(CODING_HQ_KEY) as CodeNote[] | null;
        if (!notes) return null;
        const lowerProblem = problem.toLowerCase();
        for (const note of notes) {
             // Simple keyword matching for now
            if (lowerProblem.split(' ').some(word => note.title.toLowerCase().includes(word))) {
                return note.content;
            }
        }
        return null;
    }
    
    const handleProxyDone = () => {
        setProxyKeyboardContent(null);
        speak(brain.typeThis.replies.mr[0]);
    }

    const processInput = useCallback(async (text: string) => {
        if (!text.trim() || appState === 'speaking') return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        addMsg("user", text);
        setAppState("thinking");

        const lowerText = text.toLowerCase();
        
        const typeThisMatch = lowerText.match(/(?:हे टाइप कर|type this|टाईप कर):?\s*(.*)/i);
        if (typeThisMatch && typeThisMatch[1]) {
            const contentToType = typeThisMatch[1].trim();
            const solution = await getCodingSolution(contentToType);
            const finalContent = solution || contentToType;
            setProxyKeyboardContent(finalContent);
            return;
        }

        const kiyaraThinkMatch = lowerText.match(/आता काय करायचं\?/i);
        if (kiyaraThinkMatch) {
            const lastUserMessage = messages.slice().reverse().find(m => m.sender === 'user' && !m.text.includes("आता काय करायचं"));
            if(lastUserMessage) {
                const solution = await getCodingSolution(lastUserMessage.text);
                if (solution) {
                    const reply = `मी 🤡 हेडक्वार्टरमध्ये एक उपाय शोधला आहे. तो वापरून पाहू शकता: \n\n${solution}`;
                    speak(reply); addMsg("buddy", reply);
                    return;
                }
            }
             const reply = "माफ करा, मला 🤡 हेडक्वार्टरमध्ये यावर काही उपाय सापडला नाही.";
             speak(reply); addMsg("buddy", reply);
             return;
        }

        const teachMatch = lowerText.match(/(?:पुढच्या वेळी असं म्हण|पुढच्या वेळी असं सांग)[\s:]*([\s\S]+)/i);
        if (teachMatch && lastScenario) {
            const newResponse = teachMatch[1].trim();
            const memory = await getFromDB(MEMORY_KEY) || { responses: {} };
            memory.responses = memory.responses || {};
            memory.responses[lastScenario] = newResponse;
            await saveToDB(MEMORY_KEY, memory);
            const reply = "ठीक आहे, मी लक्षात ठेवेन.";
            speak(reply); addMsg("buddy", reply);
            setLastScenario(null);
            return;
        }

        if (!teachMatch) setLastScenario(null);

        if (activeTopic) {
             if (brain.deactivateTopic.keywords.some(kw => lowerText.includes(kw))) {
                speak(brain.deactivateTopic.replies.mr[0]);
                setActiveTopic(null); return;
            }
            // Logic to search within the active topic
             const reply = `माफ करा, मला '${activeTopic.title}' मध्ये ही माहिती सापडली नाही.`;
             speak(reply); addMsg("buddy", reply);
             return;
        }

        if (brain.wakeCommand.keywords.some(kw => lowerText.includes(kw))) { speak(brain.wakeCommand.replies.mr[0], _startRecognizing); return; }
        if (brain.openKnowledge.keywords.some(kw => lowerText.includes(kw))) { setKnowledgeHubVisible(true); speak(brain.openKnowledge.replies.mr[0]); return; }

        const reply = getKiyaraReply(text);
        addMsg("buddy", reply);
        speak(reply);
    }, [appState, voiceSettings, addMsg, speak, lastScenario, _startRecognizing, activeTopic, messages]);

    const onSpeechResults = (e: SpeechResultsEvent) => { if (e.value && e.value[0]) { processInput(e.value[0]); } setAppState('idle'); };
    const onSpeechError = (e: SpeechErrorEvent) => { console.error(e); setAppState('idle'); };
    
    useEffect(() => { 
        const loadData = async () => { 
            const [theme, bg] = await Promise.all([ AsyncStorage.getItem('theme') as Promise<Theme | null>, AsyncStorage.getItem('customBg') ]);
            if (theme) setTheme(theme);
            if (bg) setCustomBg(bg);
            setMessages([{ id: "1", sender: "buddy", text: "नमस्कार! मी तुमची मैत्रीण कियारा! 🤖 बोला, काय मदत करू?", time: getNow() }])
        }; 
        loadData();

        Voice.onSpeechResults = onSpeechResults;
        Voice.onSpeechError = onSpeechError;
        const micSubscription = DeviceEventEmitter.addListener('start-buddy-listening', _startRecognizing);
        return () => { Voice.destroy().then(Voice.removeAllListeners); micSubscription.remove(); };
    }, [_startRecognizing, processInput]);
    
    return (
        <ImageBackground source={customBg ? { uri: customBg } : undefined} style={s.imageContainer} resizeMode="cover">
            <View style={[s.container, customBg && { backgroundColor: 'transparent' }, { paddingTop: insets.top }]}>
                <View style={s.header}>
                    <View style={s.headerLeft}>
                        {activeTopic ? <Text style={s.name}>🧠: {activeTopic.title}</Text> : <Text style={s.name}>Kiyara</Text>}
                    </View>
                    <TouchableOpacity style={s.settingsButton} onPress={() => setVoiceSettingsVisible(true)}><Text style={s.settingsIcon}>⚙️</Text></TouchableOpacity>
                </View>

                 <View style={{flex: 1}} />
                 
                 <View style={s.buttonRow}>
                     <TouchableOpacity style={s.iconButton} onPress={() => setKnowledgeHubVisible(true)}><Text style={s.iconButtonText}>🧠</Text></TouchableOpacity>
                     <TouchableOpacity style={s.iconButton} onPress={() => setCodingHQVisible(true)}><Text style={s.iconButtonText}>🤡</Text></TouchableOpacity>
                 </View>
                 
                 <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} />

                <KnowledgeHub visible={isKnowledgeHubVisible} onClose={() => setKnowledgeHubVisible(false)} onSelectItem={handleSelectItem} />
                <CodingHQ visible={isCodingHQVisible} onClose={() => setCodingHQVisible(false)} />
                <VoiceSettings visible={isVoiceSettingsVisible} onClose={() => setVoiceSettingsVisible(false)} />
                <TypingAnimation visible={isTyping} />
                {proxyKeyboardContent && <ProxyKeyboard visible={!!proxyKeyboardContent} content={proxyKeyboardContent} onDone={handleProxyDone} />}
            </View>
        </ImageBackground>
    );
}
