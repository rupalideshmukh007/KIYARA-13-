
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';

// NOTE: This is a headless JS task. It runs in the background, independent of the UI.

const NOTES_KEY = 'notes';
const VOICE_LANG_KEY = 'voice_lang_key'; // Assuming this is the key from VoiceSettings

// --- Duplicating the core brain logic for background use ---

const brain = {
    time: { keywords: ["वेळ", "time"], replies: { mr: `आता ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} वाजले आहेत.`, en: `The time is ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}.` } },
    date: { keywords: ["तारीख", "date"], replies: { mr: `आज ${new Date().toLocaleDateString("mr-IN",{weekday:"long",day:"numeric",month:"long"})} आहे.`, en: `Today is ${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}.` } },
};

async function getKiyaraReply(input, lang) {
    const text = input.toLowerCase();
    const words = text.split(/\s+/);
    const langKey = lang.startsWith('mr') ? 'mr' : 'en';

    const noteNumberMatch = text.match(/(?:note|number|नंबर|नोट)\s*(\d+)/);
    if (noteNumberMatch && noteNumberMatch[1]) {
        const targetNumber = parseInt(noteNumberMatch[1], 10);
        try {
            const notesString = await AsyncStorage.getItem(NOTES_KEY);
            if (notesString) {
                const notes = JSON.parse(notesString);
                const targetNote = notes.find(n => n.noteNumber === targetNumber);
                if (targetNote) {
                    const noteContent = targetNote.content?.filter(item => item.type === 'text').map(item => item.value).join(' \n') || 'काही मजकूर नाही';
                    return `नोट नंबर ${targetNumber} म्हणते: ${noteContent}`;
                }
            }
        } catch (e) { return "नोट्स वाचण्यात अडचण येत आहे."; }
    }

    for (const key in brain) {
        const data = brain[key];
        if (data.keywords.some(kw => words.includes(kw.toLowerCase()))) {
            return data.replies[langKey] || data.replies.en;
        }
    }

    return "माफ करा, मला ते समजले नाही.";
}

// --- Headless Task Definition ---

const kiyaraHeadlessTask = async (taskData) => {
    console.log('Kiyara Headless Task Started!');

    const processInput = async (text, lang) => {
        if (!text || !text.trim()) return;
        const reply = await getKiyaraReply(text, lang);
        Speech.speak(reply, { language: lang });
    };
    
    Voice.onSpeechResults = (e) => {
        if (e.value && e.value[0]) {
            // We need to know the language. Let's try to get it from storage.
            AsyncStorage.getItem(VOICE_LANG_KEY).then(lang => {
                processInput(e.value[0], lang || 'mr-IN');
            });
        }
    };

    Voice.onSpeechError = (e) => {
        console.error('Headless Speech error:', e.error);
    };

    try {
        const lang = await AsyncStorage.getItem(VOICE_LANG_KEY);
        await Voice.start(lang || 'mr-IN');
    } catch (e) {
        console.error('Headless Voice start error:', e);
    }
};

export default kiyaraHeadlessTask;
