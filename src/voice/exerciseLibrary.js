/* ======================================================================
 * Swar Saathi — exerciseLibrary.js
 * ----------------------------------------------------------------------
 * Structured exercise library for the voice check. Each entry is tagged by
 * the weakness it trains ("pitch" | "volume" | "breath" | "projection")
 * and carries everything needed to personalise it:
 *
 *   id, weakness, baseDifficulty (1-3), title/description/instruction
 *   (en + hi templates), targetTpl, and per-difficulty parameters
 *   levels[1..3] = { hold (seconds), reps, mins }.
 *
 * Placeholders inside instruction text are filled in by
 * exerciseRecommendation.js from today's measurements:
 *   {target}  comfortable practice note (median of observed pitch, Hz)
 *   {low} {high}  observed practice range (Hz)
 *   {hold} {reps}  difficulty-adjusted hold length and repetitions
 *
 * Wording rule: pitch values are an "observed practice range based on
 * today's recording" — never a medically correct or ideal pitch.
 * ====================================================================== */

export const EXERCISES = [
  /* ------------------------------- PITCH ------------------------------- */
  {
    id: "pitch-comfortable-hold",
    weakness: "pitch",
    baseDifficulty: 1,
    levels: { 1: { hold: 4, reps: 3, mins: 3 }, 2: { hold: 6, reps: 4, mins: 4 }, 3: { hold: 8, reps: 5, mins: 5 } },
    targetTpl: { en: "Around {target} Hz", hi: "लगभग {target} Hz" },
    title: { en: "Comfortable Note Hold", hi: "आरामदायक स्वर पर ठहराव" },
    description: {
      en: "Build a steady tone on one easy note.",
      hi: "एक आसान स्वर पर स्थिर आवाज़ बनाने का अभ्यास।",
    },
    instruction: {
      en: "Breathe in easily and hold a comfortable 'aaah' near the middle of your observed range, around {target} Hz (today's recording showed {low}–{high} Hz). Keep the tone as even as you can for {hold} seconds. Rest, then repeat {reps} times.",
      hi: "आराम से साँस लें और आज की रिकॉर्डिंग में दिखे अपने दायरे ({low}–{high} Hz) के बीच, लगभग {target} Hz के आसपास एक आरामदायक 'आआह' {hold} सेकंड तक रोकें। आवाज़ को जितना हो सके एक-सी रखें। आराम करें और {reps} बार दोहराएँ।",
    },
  },
  {
    id: "pitch-gentle-glide",
    weakness: "pitch",
    baseDifficulty: 2,
    levels: { 1: { hold: 4, reps: 3, mins: 3 }, 2: { hold: 6, reps: 4, mins: 4 }, 3: { hold: 8, reps: 5, mins: 5 } },
    targetTpl: { en: "Start and end near {target} Hz", hi: "{target} Hz के आसपास शुरू और खत्म करें" },
    title: { en: "Gentle Pitch Glide", hi: "धीमा स्वर-फिसलन अभ्यास" },
    description: {
      en: "Move smoothly inside your own range without sudden jumps.",
      hi: "अपने ही दायरे में बिना झटकों के सहज रूप से स्वर बदलना।",
    },
    instruction: {
      en: "Start on {target} Hz and slide very slowly a little higher, then a little lower, staying inside your observed range ({low}–{high} Hz). Finish back on {target} Hz. Keep each glide smooth, about {hold} seconds long, and do {reps} glides.",
      hi: "{target} Hz से शुरू करें और बहुत धीरे-धीरे थोड़ा ऊपर, फिर थोड़ा नीचे जाएँ, पर अपने देखे गए दायरे ({low}–{high} Hz) के भीतर ही रहें। अंत में फिर {target} Hz पर लौटें। हर फिसलन लगभग {hold} सेकंड की और सहज रखें। कुल {reps} बार करें।",
    },
  },
  {
    id: "pitch-target-return",
    weakness: "pitch",
    baseDifficulty: 3,
    levels: { 1: { hold: 5, reps: 3, mins: 4 }, 2: { hold: 7, reps: 4, mins: 5 }, 3: { hold: 10, reps: 5, mins: 6 } },
    targetTpl: { en: "Return to {target} Hz", hi: "{target} Hz पर वापसी" },
    title: { en: "Hold, Nudge and Return", hi: "ठहराव, हल्का बदलाव और वापसी" },
    description: {
      en: "A slightly harder control task: change a little, then come back to the same note.",
      hi: "थोड़ा कठिन अभ्यास: हल्का बदलाव करके उसी स्वर पर वापस आना।",
    },
    instruction: {
      en: "Hold 'aaah' near {target} Hz for {hold} seconds. Nudge the note slightly higher for about 2 seconds, then return to the same note without wobbling. Stay within your observed range ({low}–{high} Hz). Repeat {reps} times.",
      hi: "{target} Hz के आसपास 'आआह' {hold} सेकंड तक रोकें। फिर लगभग 2 सेकंड के लिए स्वर को थोड़ा ऊपर ले जाएँ और बिना काँपे उसी स्वर पर लौट आएँ। अपने देखे गए दायरे ({low}–{high} Hz) में ही रहें। {reps} बार दोहराएँ।",
    },
  },

  /* ------------------------------- VOLUME ------------------------------ */
  {
    id: "volume-even-hum",
    weakness: "volume",
    baseDifficulty: 1,
    levels: { 1: { hold: 4, reps: 3, mins: 3 }, 2: { hold: 6, reps: 4, mins: 4 }, 3: { hold: 8, reps: 5, mins: 5 } },
    targetTpl: { en: "Even loudness for {hold} s", hi: "{hold} सेकंड तक एक-सी आवाज़" },
    title: { en: "Even Volume Hum", hi: "समान आवाज़ में गुनगुनाना" },
    description: {
      en: "Keep your loudness flat, like a straight line.",
      hi: "आवाज़ की तीव्रता को सीधी रेखा की तरह एक-सी रखना।",
    },
    instruction: {
      en: "Hum 'mmm' at a comfortable, even loudness for {hold} seconds, around {target} Hz if that feels easy. Imagine your volume as a flat line: the same effort from start to finish. Rest and repeat {reps} times.",
      hi: "आराम की, एक-सी तीव्रता पर {hold} सेकंड तक 'म्म्म' गुनगुनाएँ। अगर आसान लगे तो लगभग {target} Hz के आसपास रहें। अपनी आवाज़ को सीधी रेखा समझें: शुरू से अंत तक एक जैसा प्रयास। आराम करें और {reps} बार दोहराएँ।",
    },
  },
  {
    id: "volume-steady-aaah",
    weakness: "volume",
    baseDifficulty: 2,
    levels: { 1: { hold: 5, reps: 3, mins: 3 }, 2: { hold: 7, reps: 4, mins: 4 }, 3: { hold: 9, reps: 5, mins: 5 } },
    targetTpl: { en: "Medium, even volume", hi: "मध्यम और एक-सी आवाज़" },
    title: { en: "Steady 'Aaah' Dial", hi: "स्थिर 'आआह' का वॉल्यूम-डायल" },
    description: {
      en: "Practise holding one medium volume without it drifting up or down.",
      hi: "एक मध्यम तीव्रता को ऊपर-नीचे हुए बिना थामे रखने का अभ्यास।",
    },
    instruction: {
      en: "Hold 'aaah' at a medium volume for {hold} seconds, near {target} Hz. Imagine a volume dial that never turns. Do {reps} rounds, then use Record Again to see whether your Volume Steadiness changes.",
      hi: "लगभग {target} Hz के आसपास मध्यम तीव्रता पर 'आआह' {hold} सेकंड तक रोकें। कल्पना करें कि वॉल्यूम का डायल बिल्कुल नहीं घूम रहा। {reps} राउंड करें, फिर \"दोबारा रिकॉर्ड करें\" दबाकर देखें कि आपकी आवाज़ की स्थिरता में कोई बदलाव आया या नहीं।",
    },
  },
  {
    id: "volume-soft-medium-soft",
    weakness: "volume",
    baseDifficulty: 3,
    levels: { 1: { hold: 6, reps: 3, mins: 4 }, 2: { hold: 8, reps: 4, mins: 5 }, 3: { hold: 10, reps: 5, mins: 6 } },
    targetTpl: { en: "Smooth soft–medium–soft", hi: "सहज हल्की–मध्यम–हल्की" },
    title: { en: "Soft–Medium–Soft Control", hi: "हल्की–मध्यम–हल्की आवाज़ पर नियंत्रण" },
    description: {
      en: "Change loudness smoothly on purpose, with no sudden jerks.",
      hi: "जानबूझकर आवाज़ की तीव्रता को बिना झटके के धीरे-धीरे बदलना।",
    },
    instruction: {
      en: "Hold 'aaah' near {target} Hz for {hold} seconds: start softly, grow slightly to a medium volume over about 3 seconds, hold it, then soften slowly. Keep every change smooth. Repeat {reps} times.",
      hi: "लगभग {target} Hz के आसपास 'आआह' {hold} सेकंड तक रोकें: हल्की आवाज़ से शुरू करें, लगभग 3 सेकंड में धीरे से मध्यम तीव्रता तक आएँ, उसे थामें, फिर धीरे-धीरे हल्का करें। हर बदलाव सहज रहे। {reps} बार दोहराएँ।",
    },
  },

  /* ------------------------------- BREATH ------------------------------ */
  {
    id: "breath-slow-release",
    weakness: "breath",
    baseDifficulty: 1,
    levels: { 1: { hold: 5, reps: 3, mins: 3 }, 2: { hold: 7, reps: 4, mins: 4 }, 3: { hold: 9, reps: 5, mins: 5 } },
    targetTpl: { en: "Aim for {hold} seconds", hi: "{hold} सेकंड का लक्ष्य" },
    title: { en: "Slow Breath Release", hi: "धीमी साँस छोड़ना" },
    description: {
      en: "Learn to let the air out slowly and evenly.",
      hi: "हवा को धीरे-धीरे और बराबर गति से छोड़ना सीखें।",
    },
    instruction: {
      en: "Breathe in gently through your nose for 4 counts, then release a quiet 'aaah' near {target} Hz for as long as is comfortable, aiming for about {hold} seconds. Never strain. Rest and repeat {reps} times.",
      hi: "नाक से 4 गिनती तक धीरे से साँस लें, फिर लगभग {target} Hz के आसपास एक शांत 'आआह' जितनी देर आराम से हो सके छोड़ें; लगभग {hold} सेकंड का लक्ष्य रखें। ज़ोर बिल्कुल न लगाएँ। आराम करें और {reps} बार दोहराएँ।",
    },
  },
  {
    id: "breath-belly-aaah",
    weakness: "breath",
    baseDifficulty: 2,
    levels: { 1: { hold: 6, reps: 3, mins: 4 }, 2: { hold: 8, reps: 4, mins: 5 }, 3: { hold: 10, reps: 5, mins: 6 } },
    targetTpl: { en: "Hold for {hold} seconds", hi: "{hold} सेकंड तक रोकें" },
    title: { en: "Relaxed Belly-Breath 'Aaah'", hi: "पेट से साँस लेकर 'आआह'" },
    description: {
      en: "Use low, relaxed breathing to support a longer steady sound.",
      hi: "गहरी, आरामदायक साँस से लंबी और स्थिर आवाज़ को सहारा देना।",
    },
    instruction: {
      en: "Rest one hand on your belly. Breathe in so your hand moves out, then release a steady 'aaah' near {target} Hz for {hold} seconds. Keep your shoulders relaxed. Do {reps} rounds with a short rest between each.",
      hi: "एक हाथ पेट पर रखें। इस तरह साँस लें कि हाथ बाहर की ओर उठे, फिर लगभग {target} Hz के आसपास एक स्थिर 'आआह' {hold} सेकंड तक छोड़ें। कंधे ढीले रखें। हर बार थोड़ा आराम करते हुए {reps} राउंड करें।",
    },
  },
  {
    id: "breath-extended-hold",
    weakness: "breath",
    baseDifficulty: 3,
    levels: { 1: { hold: 7, reps: 3, mins: 4 }, 2: { hold: 9, reps: 4, mins: 5 }, 3: { hold: 12, reps: 5, mins: 6 } },
    targetTpl: { en: "Strong finish at {hold} s", hi: "{hold} सेकंड तक मज़बूत अंत" },
    title: { en: "Counted Extended Hold", hi: "गिनती के साथ लंबा ठहराव" },
    description: {
      en: "Hold longer and keep the ending as steady as the start.",
      hi: "आवाज़ को ज़्यादा देर तक थामें और अंत को शुरुआत जितना स्थिर रखें।",
    },
    instruction: {
      en: "Breathe in comfortably, then hold a steady 'aaah' near {target} Hz for {hold} seconds while counting silently. Try not to let the sound fade towards the end. Rest fully between rounds and do {reps} rounds.",
      hi: "आराम से साँस लें, फिर मन में गिनती करते हुए लगभग {target} Hz के आसपास स्थिर 'आआह' {hold} सेकंड तक रोकें। कोशिश करें कि अंत की ओर आवाज़ कमज़ोर न पड़े। राउंड के बीच पूरा आराम करें और {reps} राउंड करें।",
    },
  },

  /* ----------------------------- PROJECTION ---------------------------- */
  {
    id: "projection-open-aaah",
    weakness: "projection",
    baseDifficulty: 1,
    levels: { 1: { hold: 4, reps: 3, mins: 3 }, 2: { hold: 6, reps: 4, mins: 4 }, 3: { hold: 8, reps: 5, mins: 5 } },
    targetTpl: { en: "Clear, comfortable 'aaah'", hi: "साफ़ और आरामदायक 'आआह'" },
    title: { en: "Open and Easy 'Aaah'", hi: "खुला और सहज 'आआह'" },
    description: {
      en: "Make a clear, well-supported sound without shouting.",
      hi: "चिल्लाए बिना साफ़ और सधी हुई आवाज़ निकालना।",
    },
    instruction: {
      en: "Sit tall and relax your jaw. Open your mouth comfortably and say a clear 'aaah' around {target} Hz for {hold} seconds at a comfortable loudness. Aim for a clear, ringing sound, not a shout. Repeat {reps} times.",
      hi: "सीधे बैठें और जबड़ा ढीला रखें। मुँह आराम से खोलकर, आरामदायक तीव्रता पर लगभग {target} Hz के आसपास एक साफ़ 'आआह' {hold} सेकंड तक बोलें। लक्ष्य साफ़, गूँजती आवाज़ है, चिल्लाना नहीं। {reps} बार दोहराएँ।",
    },
  },
  {
    id: "projection-count-aloud",
    weakness: "projection",
    baseDifficulty: 2,
    levels: { 1: { hold: 4, reps: 3, mins: 3 }, 2: { hold: 5, reps: 4, mins: 4 }, 3: { hold: 6, reps: 5, mins: 5 } },
    targetTpl: { en: "Equally clear words", hi: "हर शब्द बराबर साफ़" },
    title: { en: "Count Aloud with Support", hi: "सहारे के साथ ज़ोर से गिनती" },
    description: {
      en: "Keep every word equally clear using steady breath support.",
      hi: "स्थिर साँस के सहारे हर शब्द को बराबर साफ़ रखना।",
    },
    instruction: {
      en: "Take a relaxed breath and count from 1 to 5 clearly, as if talking to someone across a small room, at a comfortable pitch around {target} Hz. Keep every number equally clear. Do {reps} rounds.",
      hi: "आराम से साँस लें और 1 से 5 तक साफ़ गिनती बोलें, जैसे किसी छोटे कमरे में दूसरी ओर बैठे व्यक्ति से बात कर रहे हों। आरामदायक स्वर, लगभग {target} Hz के आसपास रखें। हर अंक बराबर साफ़ हो। {reps} राउंड करें।",
    },
  },
  {
    id: "projection-across-room",
    weakness: "projection",
    baseDifficulty: 3,
    levels: { 1: { hold: 5, reps: 3, mins: 4 }, 2: { hold: 6, reps: 4, mins: 5 }, 3: { hold: 8, reps: 5, mins: 6 } },
    targetTpl: { en: "Steady, supported voice", hi: "स्थिर और सधी आवाज़" },
    title: { en: "Across-the-Room Voice", hi: "कमरे के पार तक पहुँचती आवाज़" },
    description: {
      en: "Practise a short phrase with steady, supported, comfortable energy.",
      hi: "स्थिर, सधी और आरामदायक ऊर्जा के साथ एक छोटा वाक्य बोलने का अभ्यास।",
    },
    instruction: {
      en: "Imagine speaking to a friend a few steps away. Say a short phrase of your choice for about {hold} seconds, using steady breath and a comfortable pitch near {target} Hz. Never shout or strain. Repeat {reps} times.",
      hi: "कल्पना करें कि कुछ क़दम दूर खड़े किसी दोस्त से बात कर रहे हैं। अपनी पसंद का कोई छोटा वाक्य लगभग {hold} सेकंड तक बोलें, स्थिर साँस और लगभग {target} Hz के आसपास आरामदायक स्वर के साथ। चिल्लाएँ नहीं और ज़ोर न लगाएँ। {reps} बार दोहराएँ।",
    },
  },
];