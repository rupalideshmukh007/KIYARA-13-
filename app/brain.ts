import AsyncStorage from "@react-native-async-storage/async-storage";

export type LangKey = "mr" | "hi" | "en";
export type Brain = Record<string, { keywords: string[]; replies: Record<LangKey, string[]> }>;

const initialBrain: Brain = {
  greetings: {
    keywords: ["नमस्कार","हॅलो","hello","hi","हाय","नमस्ते","good morning","सुप्रभात","मस्कार"],
    replies: {
      mr: ["नमस्कार! मी Kiyara! आज कसे आहात? 😊","हाय! काय मदत हवी?","नमस्कार मित्रा!"],
      hi: ["नमस्ते! मैं Kiyara हूं! कैसे हैं? 😊","हाय! क्या मदद चाहिए?"],
      en: ["Hello! I am Kiyara! How are you? 😊","Hey! How can I help?"],
    },
  },
  howAreYou: {
    keywords: ["कसे आहात","कसा आहे","कैसे हो","how are you","तू कसा","कशा आहात"],
    replies: {
      mr: ["मी एकदम मस्त! तुम्ही?","झकास आहे! तुम्ही सांगा?","छान! बोलताना आनंद होतो!"],
      hi: ["मैं बिल्कुल ठीक हूं! आप?","बढ़िया! आपसे बात करके अच्छा लगा!"],
      en: ["I am doing great! How about you?","Fantastic! Always happy to chat!"],
    },
  },
  name: {
    keywords: ["नाव काय","तुझे नाव","तुमचे नाव","तेरा नाम","your name","who are you","तू कोण"],
    replies: {
      mr: ["माझे नाव Kiyara! मी तुमचा AI मित्र! 🤖","मी Kiyara, तुमचा offline AI friend!"],
      hi: ["मेरा नाम Kiyara है! मैं आपका AI दोस्त! 🤖"],
      en: ["My name is Kiyara! Your AI friend! 🤖"],
    },
  },
  time: {
    keywords: ["वेळ काय","किती वाजले","time","वेळ","बजे","what time"],
    replies: {
      mr: [`आत्ता ${new Date().toLocaleTimeString("hi-IN",{hour:"2-digit",minute:"2-digit"})} वाजले`],
      hi: [`अभी ${new Date().toLocaleTimeString("hi-IN",{hour:"2-digit",minute:"2-digit"})} बजे हैं`],
      en: [`The time is ${new Date().toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"})}`],
    },
  },
  date: {
    keywords: ["तारीख","आज","date","today","दिनांक","आज काय"],
    replies: {
      mr: [`आज ${new Date().toLocaleDateString("mr-IN",{weekday:"long",day:"numeric",month:"long"})} आहे`],
      hi: [`आज ${new Date().toLocaleDateString("hi-IN",{weekday:"long",day:"numeric",month:"long"})} है`],
      en: [`Today is ${new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"})}`],
    },
  },
  thanks: {
    keywords: ["धन्यवाद","thanks","thank you","थँक्यू","शुक्रिया","आभारी"],
    replies: {
      mr: ["हे तर माझे काम आहे! 😊","कधीही सांगा, मी नेहमी इथेच! 🙏","आनंद झाला मदत करून!"],
      hi: ["यह तो मेरा काम है! 😊","बहुत खुशी हुई! 🙏"],
      en: ["You are welcome! 😊","My pleasure! Always here for you! 🙏"],
    },
  },
  bye: {
    keywords: ["bye","बाय","goodbye","निघतो","जातो","अलविदा","टाटा","भेटू"],
    replies: {
      mr: ["भेटू लवकर! काळजी घ्या! 👋","बाय! मी नेहमी इथेच! 😊","टाटा! आनंदात राहा!"],
      hi: ["अलविदा! जल्दी मिलते हैं! 👋","बाय! मैं हमेशा यहां हूं! 😊"],
      en: ["Goodbye! Take care! 👋","See you soon! Stay safe! 😊"],
    },
  },
  love: {
    keywords: ["love","प्रेम","आवडतो","i love you","pyaar","प्यार"],
    replies: {
      mr: ["मला पण तुम्ही आवडता! 🤖❤️","Kiyara ला पण तुम्ही खूप special आहात!"],
      hi: ["मुझे भी आप पसंद हैं! 🤖❤️","आप Kiyara को बहुत प्यारे हैं!"],
      en: ["I like you too! 🤖❤️","You are special to Kiyara!"],
    },
  },
  weather: {
    keywords: ["हवामान","पाऊस","weather","rain","मौसम","थंडी","ऊन"],
    replies: {
      mr: ["मी offline आहे, live हवामान माहित नाही. बाहेर बघा! ☀️"],
      hi: ["मैं offline हूं। बाहर देखिए! ☀️"],
      en: ["I am offline, so no live weather. Check outside! ☀️"],
    },
  },
  help: {
    keywords: ["मदत","help","काय सांगशील","काय करू शकतो","what can you do"],
    replies: {
      mr: ["मी हे करू शकतो: वेळ सांगणे, तारीख सांगणे, गणित, गप्पा मारणे! बोला काय हवे? 😊"],
      hi: ["मैं यह कर सकता हूं: समय, तारीख, गणित, और बातें! बताइए! 😊"],
      en: ["I can tell you: time, date, do math, and chat! What do you need? 😊"],
    },
  },
};

let brain: Brain = initialBrain;

export async function loadBrain() {
  try {
    const storedBrain = await AsyncStorage.getItem("kiyara-brain");
    if (storedBrain) {
      brain = JSON.parse(storedBrain);
    } else {
      // No stored brain, use initial and save it
      await saveBrain();
    }
  } catch (e) {
    console.error("Failed to load brain.", e);
  }
}

export async function saveBrain() {
  try {
    await AsyncStorage.setItem("kiyara-brain", JSON.stringify(brain));
  } catch (e) {
    console.error("Failed to save brain.", e);
  }
}

export function getBrain() {
  return brain;
}

export function updateBrain(newBrain: Brain) {
  brain = newBrain;
  saveBrain();
}

function detectLang(text: string): LangKey {
  const deva = /[\u0900-\u097F]/;
  if (!deva.test(text)) return "en";
  const hiW = ["है","हैं","मैं","आप","का","की","हो"];
  const mrW = ["आहे","आहेत","मी","तुम्ही","काय","आहात"];
  const hi = hiW.filter((w) => text.includes(w)).length;
  const mr = mrW.filter((w) => text.includes(w)).length;
  return mr >= hi ? "mr" : "hi";
}

function tryMath(text: string, lang: LangKey): string | null {
  const t = text.toLowerCase()
    .replace(/plus|जमा|बेरीज/g, "+")
    .replace(/minus|वजा/g, "-")
    .replace(/times|multiply|गुणाकार/g, "*")
    .replace(/divided by|भागाकार/g, "/");
  const match = t.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
  if (!match) return null;
  const a = parseFloat(match[1]);
  const op = match[2] as "+" | "-" | "*" | "/";
  const b = parseFloat(match[3]);
  let res: number | string;
  if (op === "+") res = a + b;
  else if (op === "-") res = a - b;
  else if (op === "*") res = a * b;
  else res = b !== 0 ? parseFloat((a / b).toFixed(2)) : "अशक्य";
  const label: Record<LangKey, string> = { mr: "उत्तर", hi: "जवाब", en: "Answer" };
  return `${label[lang]}: ${a} ${op} ${b} = ${res} 🧮`;
}

export function getKiyaraReply(input: string): string {
  loadBrain(); // Ensure brain is loaded
  const text = input.toLowerCase();
  const lang = detectLang(input);
  const math = tryMath(text, lang);
  if (math) return math;
  for (const [, data] of Object.entries(brain)) {
    if (data.keywords.some((kw) => text.includes(kw.toLowerCase()))) {
      const arr = data.replies[lang] ?? data.replies.en;
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }
  const defaults: Record<LangKey, string[]> = {
    mr: ["माफ करा, नक्की समजले नाही. वेगळ्या शब्दात सांगाल का? 🙏","हम्म... पुन्हा सांगाल का?","Interesting! मला आणखी सांगा."],
    hi: ["माफ करना, समझ नहीं आया। दोबारा बताइए?","हम्म, मैं सीख रहा हूं!"],
    en: ["I did not understand. Can you rephrase?","Tell me more?","Hmm, interesting!"],
  };
  const arr = defaults[lang];
  return arr[Math.floor(Math.random() * arr.length)];
}