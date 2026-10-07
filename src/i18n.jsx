import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/* ======================================================================
 * Swar Saathi — i18n.jsx
 * ----------------------------------------------------------------------
 * One central translation table (English + Hindi). Components call
 *     const { t, lang, setLang } = useI18n();
 *     t("voice.start")                       -> localized string
 *     t("voice.timeLeft", { s: 7 })          -> "{s}" placeholders filled in
 * Switching language re-renders instantly; no page reload, state is kept.
 * Units such as Hz and % are intentionally not translated.
 * ====================================================================== */

// eslint-disable-next-line react-refresh/only-export-components
export const translations = {
  en: {
    lang: { english: "English", hindi: "हिन्दी", label: "Language" },

    /* ---- shared portal chrome (patient-facing) ---- */
    common: {
      logout: "Log out",
      refresh: "Refresh",
      greetNight: "Working late",
      greetMorning: "Good morning",
      greetAfternoon: "Good afternoon",
      greetEvening: "Good evening",
      patientPortal: "Patient portal",
      therapistDashboard: "Therapist dashboard",
      therapistProfile: "Therapist · patient profile",
      caregiverPortal: "Caregiver portal",
      backToPatients: "← Back to patients",
      level: "Level",
    },
    portal: {
      currentLevel: "Current level",
      adjusts: "Adjusts with your practice",
      exercises: "Exercises",
      assignedToYou: "Assigned to you",
      sessions: "Practice sessions",
      savedRecordings: "Saved recordings",
      avgPron: "Avg. pronunciation",
      acrossSessions: "Across all sessions",
      homeExercises: "Your home exercises",
      homeExercisesSub: "Complete your assigned exercises to earn points, then record your speech practice below. New ones are generated for you automatically as you progress.",
      getNew: "✨ Get new exercises",
      noExercises: "No exercises assigned yet — check back soon.",
      assignedHeldTitle: "Your assigned exercises",
      assignedHeldBody: "{n} exercise(s) from your care team are ready. Do your voice check first to get practice suggestions based on today's voice, or open the list now.",
      showAssigned: "Show assigned exercises",
      hideAssigned: "Hide assigned exercises",
      speechPractice: "Speech practice",
      speechPracticeSub: "Record directly in the browser. The score is an acoustic demo score, not a clinical diagnosis.",
    },

    /* ---- voice check ---- */
    voice: {
      title: "Voice Check",
      subtitle: "A 10-second check that turns your own voice into personalized practice.",
      idleHeadline: "Ready for your voice check?",
      instruction: "Take a comfortable breath and hold a steady 'aaah' sound for about 10 seconds.",
      step1: "Sit comfortably and breathe in",
      step2: "Say a steady “aaah” for 10 seconds",
      step3: "Get your scores and exercises",
      quietTip: "Tip: choose a quiet place and hold your phone about a hand-span from your mouth.",
      start: "Start Voice Check",
      stop: "Stop & analyze",
      recordAgain: "Record Again",
      tryAgain: "Try Again",
      recordingHeadline: "Keep holding 'aaah'...",
      recordingHint: "Keep the sound smooth and comfortable. You can stop early after at least 3 seconds.",
      timeLeft: "{s}s left",
      secUnit: "sec",
      micPrompt: "Your browser will ask for microphone permission. Please tap Allow.",
      listening: "Microphone is on",
      processingHeadline: "Analyzing your voice...",
      processingBody: "Measuring pitch, loudness and how long you held the sound.",
      resultHeadline: "Your voice analysis is ready.",
      resultSub: "Based on today's recording.",
      errorHeadline: "We couldn't analyze the recording. Please try again.",
      privacy: "Your recording is analyzed on your device and is not uploaded or stored.",
      disclaimer: "This voice check is a practice aid and does not provide a medical diagnosis.",
      stopPain: "Stop any exercise that causes pain or strain, and speak with your therapist or doctor if you are worried.",

      overall: "Overall Voice Score",
      outOf: "out of 100",
      score: "{n} / 100",
      metrics: {
        pitch: "Pitch Steadiness",
        volume: "Volume Steadiness",
        breath: "Breath Control",
        projection: "Projection",
      },
      metricHelp: {
        pitch: "How evenly you kept the same note.",
        volume: "How evenly you kept the same loudness.",
        breath: "How long and smoothly you held the sound.",
        projection: "How clearly your voice stood out from the background.",
      },
      band: { strong: "Strong", good: "Good", developing: "Developing", practice: "Needs practice" },
      weight: "Weight {n}%",

      rangeTitle: "Your observed pitch range",
      rangeNote: "This is the range seen in today's recording, used as a practice target. It is not a medically ideal pitch.",
      lowest: "Lowest detected pitch",
      median: "Median pitch",
      highest: "Highest detected pitch",
      practiceRange: "Practice range: {low}–{high} Hz",
      details: "Recording details",
      detailVoiced: "Voiced time",
      detailSustain: "Longest steady hold",
      detailFrames: "Analysis windows",
      seconds: "{n} s",

      focusTitle: "Your focus areas",
      focusBody: "Based on today's recording, these two areas have the most room to grow: {a} and {b}.",
      strongestNote: "Your strongest area today: {a}.",
      exercisesTitle: "Personalized exercises",
      exercisesSub: "Practice suggestions chosen from your two lowest scores and your observed voice range.",
      forArea: "For {area}",
      difficulty: "Difficulty",
      difficultyLevels: { 1: "Gentle", 2: "Moderate", 3: "Challenging" },
      duration: "Duration",
      target: "Target",
      practiceGuidance: "Practice guidance",
      guidance1: "Practice in short, relaxed sessions and rest whenever you need to.",
      guidance2: "Drink some water and keep your shoulders and jaw relaxed.",
      guidance3: "Use Record Again after a few days of practice to see how your scores change.",
      askCoach: "Ask the AI coach about these results",
      coachPrompt: "I just did a voice check. Pitch Steadiness {pitch}, Volume Steadiness {volume}, Breath Control {breath}, Projection {projection}, overall {overall} out of 100. Observed pitch range {low}–{high} Hz. Can you explain what to practice? (This is a practice aid, not a diagnosis.)",
      coachChip: "Explain my voice check results",
    },

    voiceErrors: {
      UNSUPPORTED: "This browser or device can't record audio here. Please try the latest Chrome, Edge, Firefox or Safari over a secure (https) connection.",
      PERMISSION_DENIED: "Microphone access was blocked. Please allow the microphone in your browser's site settings, then try again.",
      NO_MIC: "No microphone was found. Please connect or enable a microphone and try again.",
      MIC_BUSY: "The microphone is being used by another app. Please close it and try again.",
      STREAM_ENDED: "The recording stopped unexpectedly. Please check your microphone and try again.",
      TOO_SHORT: "That recording was too short. Please hold a steady 'aaah' for at least 3 seconds, ideally about 10.",
      SILENCE: "We couldn't detect a clear voice. Please try again in a quiet place and hold a steady 'aaah'.",
      NO_VOICE: "We couldn't detect a clear voice. Please try again in a quiet place and hold a steady 'aaah'.",
      TOO_NOISY: "There was too much background noise to measure your voice. Please move somewhere quieter and try again.",
      ANALYSIS_FAILED: "We couldn't analyze the recording. Please try again.",
      BUSY: "A recording is already in progress.",
    },
  },

  hi: {
    lang: { english: "English", hindi: "हिन्दी", label: "भाषा" },

    common: {
      logout: "लॉग आउट",
      refresh: "रीफ़्रेश",
      greetNight: "देर रात तक काम",
      greetMorning: "सुप्रभात",
      greetAfternoon: "नमस्कार",
      greetEvening: "शुभ संध्या",
      patientPortal: "रोगी पोर्टल",
      therapistDashboard: "थेरेपिस्ट डैशबोर्ड",
      therapistProfile: "थेरेपिस्ट · रोगी प्रोफ़ाइल",
      caregiverPortal: "देखभालकर्ता पोर्टल",
      backToPatients: "← रोगियों की सूची पर वापस",
      level: "स्तर",
    },
    portal: {
      currentLevel: "वर्तमान स्तर",
      adjusts: "आपके अभ्यास के साथ बदलता है",
      exercises: "अभ्यास",
      assignedToYou: "आपको सौंपे गए",
      sessions: "अभ्यास सत्र",
      savedRecordings: "सहेजी गई रिकॉर्डिंग",
      avgPron: "औसत उच्चारण",
      acrossSessions: "सभी सत्रों में",
      homeExercises: "आपके घर के अभ्यास",
      homeExercisesSub: "अंक पाने के लिए अपने सौंपे गए अभ्यास पूरे करें, फिर नीचे अपनी वाणी का अभ्यास रिकॉर्ड करें। प्रगति के साथ नए अभ्यास अपने-आप बन जाते हैं।",
      getNew: "✨ नए अभ्यास पाएँ",
      noExercises: "अभी कोई अभ्यास नहीं सौंपा गया — कुछ देर बाद देखें।",
      assignedHeldTitle: "आपके सौंपे गए अभ्यास",
      assignedHeldBody: "आपकी देखभाल टीम के {n} अभ्यास तैयार हैं। पहले अपना वॉइस चेक करें ताकि आज की आवाज़ के आधार पर अभ्यास सुझाव मिलें, या सूची अभी खोलें।",
      showAssigned: "सौंपे गए अभ्यास दिखाएँ",
      hideAssigned: "सौंपे गए अभ्यास छिपाएँ",
      speechPractice: "वाणी अभ्यास",
      speechPracticeSub: "सीधे ब्राउज़र में रिकॉर्ड करें। यह स्कोर केवल एक ध्वनि-आधारित डेमो स्कोर है, चिकित्सीय निदान नहीं।",
    },

    voice: {
      title: "वॉइस चेक",
      subtitle: "10 सेकंड की जाँच, जो आपकी अपनी आवाज़ से आपके लिए अभ्यास तय करती है।",
      idleHeadline: "वॉइस चेक के लिए तैयार हैं?",
      instruction: "आराम से एक साँस लें और लगभग 10 सेकंड तक एक स्थिर 'आआह' आवाज़ निकालते रहें।",
      step1: "आराम से बैठें और साँस भरें",
      step2: "10 सेकंड तक स्थिर “आआह” बोलें",
      step3: "अपने स्कोर और अभ्यास पाएँ",
      quietTip: "सुझाव: शांत जगह चुनें और फ़ोन को मुँह से लगभग एक बित्ते की दूरी पर रखें।",
      start: "वॉइस चेक शुरू करें",
      stop: "रोकें और विश्लेषण करें",
      recordAgain: "दोबारा रिकॉर्ड करें",
      tryAgain: "फिर से कोशिश करें",
      recordingHeadline: "'आआह' को थामे रखिए...",
      recordingHint: "आवाज़ को सहज और आरामदायक रखें। कम से कम 3 सेकंड बाद आप पहले भी रोक सकते हैं।",
      timeLeft: "{s} सेकंड बाकी",
      secUnit: "सेकंड",
      micPrompt: "आपका ब्राउज़र माइक्रोफ़ोन की अनुमति माँगेगा। कृपया “अनुमति दें” दबाएँ।",
      listening: "माइक्रोफ़ोन चालू है",
      processingHeadline: "आपकी आवाज़ का विश्लेषण हो रहा है...",
      processingBody: "स्वर, आवाज़ की तीव्रता और आपने आवाज़ कितनी देर थामी, यह मापा जा रहा है।",
      resultHeadline: "आपकी आवाज़ का विश्लेषण तैयार है।",
      resultSub: "आज की रिकॉर्डिंग के आधार पर।",
      errorHeadline: "हम रिकॉर्डिंग का विश्लेषण नहीं कर पाए। कृपया फिर से कोशिश करें।",
      privacy: "आपकी रिकॉर्डिंग का विश्लेषण आपके अपने डिवाइस पर होता है; उसे अपलोड या सहेजा नहीं जाता।",
      disclaimer: "यह वॉइस चेक केवल अभ्यास में सहायता के लिए है और चिकित्सा निदान प्रदान नहीं करता है।",
      stopPain: "जिस अभ्यास से दर्द या खिंचाव हो, उसे रोक दें। चिंता हो तो अपने थेरेपिस्ट या डॉक्टर से बात करें।",

      overall: "कुल वॉइस स्कोर",
      outOf: "100 में से",
      score: "{n} / 100",
      metrics: {
        pitch: "स्वर की स्थिरता",
        volume: "आवाज़ की तीव्रता की स्थिरता",
        breath: "साँस पर नियंत्रण",
        projection: "आवाज़ की पहुँच",
      },
      metricHelp: {
        pitch: "आपने एक ही स्वर को कितना समान बनाए रखा।",
        volume: "आपने आवाज़ की तीव्रता को कितना समान रखा।",
        breath: "आपने आवाज़ को कितनी देर और कितनी सहजता से थामे रखा।",
        projection: "आपकी आवाज़ पृष्ठभूमि की आवाज़ों से कितनी साफ़ उभरी।",
      },
      band: { strong: "मज़बूत", good: "अच्छा", developing: "विकसित हो रहा", practice: "अभ्यास की ज़रूरत" },
      weight: "भार {n}%",

      rangeTitle: "आपका देखा गया स्वर-दायरा",
      rangeNote: "यह आज की रिकॉर्डिंग में दिखा दायरा है, जिसे अभ्यास के लक्ष्य के रूप में इस्तेमाल किया गया है। यह चिकित्सकीय रूप से आदर्श स्वर नहीं है।",
      lowest: "सबसे निचला पहचाना गया स्वर",
      median: "मध्य स्वर",
      highest: "सबसे ऊँचा पहचाना गया स्वर",
      practiceRange: "अभ्यास का दायरा: {low}–{high} Hz",
      details: "रिकॉर्डिंग का ब्योरा",
      detailVoiced: "आवाज़ वाला समय",
      detailSustain: "सबसे लंबा स्थिर ठहराव",
      detailFrames: "विश्लेषण खिड़कियाँ",
      seconds: "{n} सेकंड",

      focusTitle: "आपके ध्यान देने के क्षेत्र",
      focusBody: "आज की रिकॉर्डिंग के आधार पर इन दो क्षेत्रों में सुधार की सबसे अधिक गुंजाइश है: {a} और {b}।",
      strongestNote: "आज आपका सबसे मज़बूत क्षेत्र: {a}।",
      exercisesTitle: "आपके लिए चुने गए अभ्यास",
      exercisesSub: "आपके दो सबसे कम स्कोर और आपके देखे गए स्वर-दायरे के आधार पर चुने गए अभ्यास सुझाव।",
      forArea: "{area} के लिए",
      difficulty: "कठिनाई",
      difficultyLevels: { 1: "हल्का", 2: "मध्यम", 3: "चुनौतीपूर्ण" },
      duration: "अवधि",
      target: "लक्ष्य",
      practiceGuidance: "अभ्यास के लिए मार्गदर्शन",
      guidance1: "छोटे और आरामदायक सत्रों में अभ्यास करें, और ज़रूरत हो तो बीच में आराम करें।",
      guidance2: "थोड़ा पानी पिएँ और कंधे व जबड़े को ढीला रखें।",
      guidance3: "कुछ दिन अभ्यास के बाद “दोबारा रिकॉर्ड करें” दबाकर देखें कि आपके स्कोर कैसे बदले।",
      askCoach: "इन नतीजों के बारे में AI कोच से पूछें",
      coachPrompt: "मैंने अभी वॉइस चेक किया। स्वर की स्थिरता {pitch}, आवाज़ की तीव्रता की स्थिरता {volume}, साँस पर नियंत्रण {breath}, आवाज़ की पहुँच {projection}, कुल {overall}/100। देखा गया स्वर-दायरा {low}–{high} Hz। क्या आप समझा सकते हैं कि मुझे किस पर अभ्यास करना चाहिए? (यह केवल अभ्यास में सहायता है, निदान नहीं।)",
      coachChip: "मेरे वॉइस चेक के नतीजे समझाएँ",
    },

    voiceErrors: {
      UNSUPPORTED: "यह ब्राउज़र या डिवाइस यहाँ ऑडियो रिकॉर्ड नहीं कर सकता। कृपया सुरक्षित (https) कनेक्शन पर Chrome, Edge, Firefox या Safari का नया संस्करण इस्तेमाल करें।",
      PERMISSION_DENIED: "माइक्रोफ़ोन की अनुमति रोक दी गई है। कृपया अपने ब्राउज़र की साइट सेटिंग में माइक्रोफ़ोन की अनुमति दें और फिर कोशिश करें।",
      NO_MIC: "कोई माइक्रोफ़ोन नहीं मिला। कृपया माइक्रोफ़ोन जोड़ें या चालू करें और फिर कोशिश करें।",
      MIC_BUSY: "माइक्रोफ़ोन अभी किसी दूसरे ऐप में इस्तेमाल हो रहा है। कृपया उसे बंद करके फिर कोशिश करें।",
      STREAM_ENDED: "रिकॉर्डिंग अचानक रुक गई। कृपया अपना माइक्रोफ़ोन जाँचें और फिर कोशिश करें।",
      TOO_SHORT: "रिकॉर्डिंग बहुत छोटी थी। कृपया कम से कम 3 सेकंड, बेहतर होगा लगभग 10 सेकंड तक स्थिर 'आआह' बोलें।",
      SILENCE: "हमें कोई साफ़ आवाज़ नहीं मिली। कृपया शांत जगह पर फिर कोशिश करें और स्थिर 'आआह' बोलें।",
      NO_VOICE: "हमें कोई साफ़ आवाज़ नहीं मिली। कृपया शांत जगह पर फिर कोशिश करें और स्थिर 'आआह' बोलें।",
      TOO_NOISY: "पृष्ठभूमि में शोर इतना ज़्यादा था कि आपकी आवाज़ नापी नहीं जा सकी। कृपया किसी शांत जगह जाकर फिर कोशिश करें।",
      ANALYSIS_FAILED: "हम रिकॉर्डिंग का विश्लेषण नहीं कर पाए। कृपया फिर से कोशिश करें।",
      BUSY: "एक रिकॉर्डिंग पहले से चल रही है।",
    },
  },
};

const STORAGE_KEY = "swar_lang";
const I18nContext = createContext(null);

function lookup(table, path) {
  return path.split(".").reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), table);
}

function readInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "hi") return saved;
  } catch {
    /* storage unavailable */
  }
  return "en";
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang);

  const setLang = useCallback((next) => {
    if (next !== "en" && next !== "hi") return;
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    const t = (path, vars) => {
      let str = lookup(translations[lang], path);
      if (str === undefined) str = lookup(translations.en, path);
      if (typeof str !== "string") return path;
      return vars ? str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{${k}}`)) : str;
    };
    return { lang, setLang, t };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}

/** English | हिन्दी toggle. Works on light or dark backgrounds. */
export function LanguageToggle({ dark = false }) {
  const { lang, setLang, t } = useI18n();
  const base = {
    border: "none",
    cursor: "pointer",
    padding: "8px 14px",
    fontSize: 13.5,
    fontWeight: 700,
    fontFamily: '"Plus Jakarta Sans", "Noto Sans Devanagari", system-ui, sans-serif',
    minHeight: 36,
  };
  const on = dark ? { background: "#fff", color: "#1E293B" } : { background: "#1E293B", color: "#fff" };
  const off = dark ? { background: "transparent", color: "#fff" } : { background: "transparent", color: "#1E293B" };
  return (
    <div
      role="group"
      aria-label={t("lang.label")}
      style={{
        display: "inline-flex",
        borderRadius: 999,
        overflow: "hidden",
        border: `1.5px solid ${dark ? "rgba(255,255,255,0.4)" : "#E7DFD0"}`,
      }}
    >
      <button type="button" lang="en" aria-pressed={lang === "en"} onClick={() => setLang("en")} style={{ ...base, ...(lang === "en" ? on : off) }}>
        English
      </button>
      <button type="button" lang="hi" aria-pressed={lang === "hi"} onClick={() => setLang("hi")} style={{ ...base, ...(lang === "hi" ? on : off) }}>
        हिन्दी
      </button>
    </div>
  );
}
