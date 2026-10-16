/* ===== SAMPLE QUESTIONS: Mining > Dumper (16 questions) =====
   Drafted ONLY from the Dumper SOP text in sops.js. Used by Demo Mode (quiz.html?demo=1)
   and can be pasted into Admin > Generate > "Import JSON" as a starting bank.
   They must still be reviewed/approved by an officer before real use.
   ref.sec = 0-based SOP section index (used for the "Read SOP section" link). */
window.QUIZ_SAMPLE = [
  {
    id: "dumper-001", dept: "mining", topic: "dumper", correct: [1], multi: false,
    q: { en: "Which of these is strictly prohibited while driving or working on a dumper?", hi: "डम्पर चलाते या कार्य करते समय निम्न में से क्या पूर्णतः वर्जित है?" },
    options: {
      en: ["Wearing a helmet", "Using a mobile phone", "Wearing safety shoes", "Attending the safety talk"],
      hi: ["हेलमेट पहनना", "मोबाइल फोन का उपयोग करना", "सेफ्टी शूज़ पहनना", "सेफ्टी टॉक सुनना"],
    },
    explanation: { en: "Mobile phone use while driving or working is strictly prohibited as it distracts the operator.", hi: "ड्राइविंग या कार्य के दौरान मोबाइल फोन का उपयोग पूर्णतः वर्जित है क्योंकि इससे चालक का ध्यान भटकता है।" },
    ref: { sec: 0, text: "Dumper SOP – Section 1: Fitness, PPE & Personal Conduct", dgms: "" },
  },
  {
    id: "dumper-002", dept: "mining", topic: "dumper", correct: [0, 1, 3], multi: true,
    q: { en: "Which of the following are mandatory PPE for a dumper operator? (Select all correct answers)", hi: "डम्पर चालक के लिए निम्न में से कौन से सुरक्षा उपकरण (PPE) अनिवार्य हैं? (सभी सही उत्तर चुनें)" },
    options: {
      en: ["Helmet", "Safety shoes", "Towel (gamchha) around the neck", "Safety glasses"],
      hi: ["हेलमेट", "सेफ्टी शूज़", "गले में गमछा", "सुरक्षा चश्मा"],
    },
    explanation: { en: "Helmet, safety shoes, gloves and glasses are mandatory. A towel (gamchha), tie or loose clothing must not be worn.", hi: "हेलमेट, जूते, दस्ताने और चश्मा अनिवार्य हैं। गमछा, टाई या ढीले कपड़े पहनना मना है।" },
    ref: { sec: 0, text: "Dumper SOP – Section 1: Fitness, PPE & Personal Conduct", dgms: "" },
  },
  {
    id: "dumper-003", dept: "mining", topic: "dumper", correct: [1], multi: false,
    q: { en: "How should an operator climb up into the dumper cabin?", hi: "चालक को डम्पर की केबिन में कैसे चढ़ना चाहिए?" },
    options: {
      en: ["Facing away from the ladder", "Facing the ladder using three-point contact", "Quickly, holding a phone in one hand", "By jumping up from the ground"],
      hi: ["सीढ़ी की ओर पीठ करके", "सीढ़ी की ओर मुंह करके थ्री-पॉइंट कॉन्टैक्ट से", "एक हाथ में फोन पकड़कर जल्दी से", "ज़मीन से कूदकर"],
    },
    explanation: { en: "Always face the ladder and keep three-point contact (two hands and one foot, or two feet and one hand).", hi: "हमेशा सीढ़ी की ओर मुंह करके थ्री-पॉइंट कॉन्टैक्ट बनाए रखते हुए चढ़ें।" },
    ref: { sec: 1, text: "Dumper SOP – Section 2: Pre-Start Exterior & Boarding Checks", dgms: "" },
  },
  {
    id: "dumper-004", dept: "mining", topic: "dumper", correct: [0, 1, 2], multi: true,
    q: { en: "During the walk-around before boarding, what should the operator look for? (Select all correct answers)", hi: "डम्पर पर चढ़ने से पहले चारों ओर घूमकर जांच में चालक को क्या देखना चाहिए? (सभी सही उत्तर चुनें)" },
    options: {
      en: ["Loose parts or cracks", "Oil leaks", "Obstacles around the dumper", "Whether the paint colour is new"],
      hi: ["ढीले पुर्जे या दरारें", "तेल रिसाव", "डम्पर के आसपास रुकावटें", "पेंट का रंग नया है या नहीं"],
    },
    explanation: { en: "The walk-around check covers loose parts, cracks, oil leaks and obstacles. Any problem must be reported at once.", hi: "चारों ओर की जांच में ढीले पुर्जे, दरार, तेल रिसाव और रुकावटें देखी जाती हैं। समस्या मिलने पर तुरंत सूचित करें।" },
    ref: { sec: 1, text: "Dumper SOP – Section 2: Pre-Start Exterior & Boarding Checks", dgms: "" },
  },
  {
    id: "dumper-005", dept: "mining", topic: "dumper", correct: [1], multi: false,
    q: { en: "Where must the findings of the pre-use dumper checks be recorded?", hi: "डम्पर की प्री-यूज़ जांच के निष्कर्ष कहाँ दर्ज किए जाने चाहिए?" },
    options: {
      en: ["In a personal diary", "In the report book, as required under MMR 1961 Reg. 106(2)(b)", "Nowhere, it is not required", "On the gate register only"],
      hi: ["अपनी निजी डायरी में", "रिपोर्ट बुक में, जैसा MMR 1961 रेगुलेशन 106(2)(b) में आवश्यक है", "कहीं नहीं, यह आवश्यक नहीं है", "केवल गेट रजिस्टर में"],
    },
    explanation: { en: "Oil, diesel, water, tyre pressure, brakes, steering, horn and lights checks are logged in the report book.", hi: "तेल, डीजल, पानी, हवा, ब्रेक, स्टीयरिंग, हॉर्न और लाइट की जांच रिपोर्ट बुक में दर्ज की जाती है।" },
    ref: { sec: 2, text: "Dumper SOP – Section 3: Post-Start Verification & Legal Logging (MMR 1961, Reg. 106(2)(b))", dgms: "" },
  },
  {
    id: "dumper-006", dept: "mining", topic: "dumper", correct: [2], multi: false,
    q: { en: "You find a defect in the dumper during checking. When may you operate it?", hi: "जांच के दौरान डम्पर में खराबी मिली। आप उसे कब चला सकते हैं?" },
    options: {
      en: ["Immediately, if the defect looks small", "If the supervisor is not around", "Only after the defect is rectified by the authorised person", "If you drive slowly"],
      hi: ["तुरंत, अगर खराबी छोटी लगे", "अगर सुपरवाइज़र आसपास न हो", "अधिकृत व्यक्ति द्वारा खराबी ठीक किए जाने के बाद ही", "अगर आप धीरे चलाएं"],
    },
    explanation: { en: "A dumper may be operated only after authorised rectification of defects.", hi: "डम्पर तभी चलाएं जब अधिकृत व्यक्ति द्वारा खराबी ठीक कर दी गई हो।" },
    ref: { sec: 2, text: "Dumper SOP – Section 3: Post-Start Verification & Legal Logging", dgms: "" },
  },
  {
    id: "dumper-007", dept: "mining", topic: "dumper", correct: [1], multi: false,
    q: { en: "What is the speed limit for a dumper inside the mine as per the SOP?", hi: "SOP के अनुसार खदान के अंदर डम्पर की गति सीमा क्या है?" },
    options: { en: ["10 km/h", "30 km/h", "50 km/h", "60 km/h"], hi: ["10 किमी/घंटा", "30 किमी/घंटा", "50 किमी/घंटा", "60 किमी/घंटा"] },
    explanation: { en: "The speed limit in the mine is 30 km/h and mine traffic rules must be followed.", hi: "खदान में गति सीमा 30 किमी/घंटा है और यातायात नियमों का पालन करना आवश्यक है।" },
    ref: { sec: 3, text: "Dumper SOP – Section 4: Moving Off, Cabin Security & Speed Limits", dgms: "" },
  },
  {
    id: "dumper-008", dept: "mining", topic: "dumper", correct: [0, 1, 2], multi: true,
    q: { en: "Which of the following are NOT allowed while driving a dumper in the mine? (Select all correct answers)", hi: "खदान में डम्पर चलाते समय निम्न में से क्या करना मना है? (सभी सही उत्तर चुनें)" },
    options: {
      en: ["Overtaking other vehicles", "Nose-to-tail following", "Allowing an unauthorised person in the cabin", "Obeying mine traffic rules"],
      hi: ["दूसरे वाहनों को ओवरटेक करना", "नोज़-टू-टेल (बहुत पास) ड्राइविंग", "अनाधिकृत व्यक्ति को केबिन में बैठाना", "खदान के यातायात नियमों का पालन करना"],
    },
    explanation: { en: "Overtaking, nose-to-tail driving and carrying unauthorised persons are prohibited. Obeying traffic rules is required.", hi: "ओवरटेकिंग, नोज़-टू-टेल ड्राइविंग और अनाधिकृत व्यक्ति को बैठाना मना है। यातायात नियमों का पालन आवश्यक है।" },
    ref: { sec: 3, text: "Dumper SOP – Section 4: Moving Off, Cabin Security & Speed Limits", dgms: "" },
  },
  {
    id: "dumper-009", dept: "mining", topic: "dumper", correct: [3], multi: false,
    q: { en: "In fog, a dumper may be driven (with fog lights on) only if visibility is:", hi: "कोहरे में फॉग लाइट जलाकर डम्पर तभी चलाया जा सकता है जब दृश्यता:" },
    options: { en: ["5 metres", "10 metres", "20 metres", "More than 30 metres"], hi: ["5 मीटर हो", "10 मीटर हो", "20 मीटर हो", "30 मीटर से अधिक हो"] },
    explanation: { en: "Operate in fog only if visibility exceeds 30 metres, with fog lights on.", hi: "कोहरे में केवल तभी चलाएं जब दृश्यता 30 मीटर से अधिक हो और फॉग लाइट चालू हों।" },
    ref: { sec: 4, text: "Dumper SOP – Section 5: Adverse Weather, Low Visibility & Blind Spots", dgms: "" },
  },
  {
    id: "dumper-010", dept: "mining", topic: "dumper", correct: [1], multi: false,
    q: { en: "What should you do when approaching a blind corner?", hi: "अंधे मोड़ (ब्लाइंड कॉर्नर) के पास पहुँचते समय आपको क्या करना चाहिए?" },
    options: {
      en: ["Speed up to cross quickly", "Slow down and sound the horn", "Switch off the headlights", "Stop the engine"],
      hi: ["जल्दी पार करने के लिए गति बढ़ाएं", "गति धीमी करें और हॉर्न बजाएं", "हेडलाइट बंद कर दें", "इंजन बंद कर दें"],
    },
    explanation: { en: "Slow down and sound the horn at blind corners, where persons or vehicles may suddenly appear.", hi: "अंधे मोड़ पर गति धीमी करें और हॉर्न बजाएं, क्योंकि वहाँ अचानक व्यक्ति या वाहन आ सकते हैं।" },
    ref: { sec: 4, text: "Dumper SOP – Section 5: Adverse Weather, Low Visibility & Blind Spots", dgms: "" },
  },
  {
    id: "dumper-011", dept: "mining", topic: "dumper", correct: [1], multi: false,
    q: { en: "Where should the dumper operator remain while the shovel is loading the dumper?", hi: "शॉवेल द्वारा डम्पर में लोडिंग के दौरान डम्पर चालक को कहाँ रहना चाहिए?" },
    options: {
      en: ["Standing near the bucket", "Inside the cabin", "Under the dumper body", "Walking in the swing area"],
      hi: ["बकेट के पास खड़े होकर", "केबिन के अंदर", "डाले (बॉडी) के नीचे", "स्विंग क्षेत्र में टहलते हुए"],
    },
    explanation: { en: "The operator must remain inside the cabin throughout loading.", hi: "लोडिंग के दौरान चालक को पूरे समय केबिन में ही रहना चाहिए।" },
    ref: { sec: 5, text: "Dumper SOP – Section 6: Shovel Interaction & Safe Loading", dgms: "" },
  },
  {
    id: "dumper-012", dept: "mining", topic: "dumper", correct: [2], multi: false,
    q: { en: "When may the dumper move away after loading?", hi: "लोडिंग के बाद डम्पर कब आगे बढ़ाया जा सकता है?" },
    options: {
      en: ["As soon as the bucket empties", "When the operator feels ready", "After the all-clear signal from the shovel operator", "After sounding the horn twice"],
      hi: ["जैसे ही बकेट खाली हो", "जब चालक को ठीक लगे", "शॉवेल ऑपरेटर का इशारा (ऑल-क्लियर) मिलने के बाद", "दो बार हॉर्न बजाने के बाद"],
    },
    explanation: { en: "Move only after receiving the all-clear signal from the shovel operator. Do not overload beyond rated capacity.", hi: "शॉवेल ऑपरेटर का इशारा मिलने पर ही आगे बढ़ें। क्षमता से अधिक माल न भरें।" },
    ref: { sec: 5, text: "Dumper SOP – Section 6: Shovel Interaction & Safe Loading", dgms: "" },
  },
  {
    id: "dumper-013", dept: "mining", topic: "dumper", correct: [1], multi: false,
    q: { en: "While dumping at a waste dump or stockpile, how far back from the outer edge should the dumper dump?", hi: "वेस्ट डंप या स्टॉकपाइल पर डंप करते समय डम्पर को बाहरी किनारे से कितना पीछे डंप करना चाहिए?" },
    options: {
      en: ["At the very edge", "At least 3 metres back from the edge", "Only half a metre back", "Anywhere on the dump"],
      hi: ["बिल्कुल किनारे पर", "किनारे से कम से कम 3 मीटर पीछे", "केवल आधा मीटर पीछे", "डंप पर कहीं भी"],
    },
    explanation: { en: "Always dump at least 3 metres back from the outer edge, after checking the ground for cracks or instability.", hi: "ज़मीन में दरार या अस्थिरता की जांच के बाद हमेशा बाहरी किनारे से कम से कम 3 मीटर पीछे डंप करें।" },
    ref: { sec: 6, text: "Dumper SOP – Section 7: Safe Dumping & Stockpile Operations", dgms: "" },
  },
  {
    id: "dumper-014", dept: "mining", topic: "dumper", correct: [0, 1], multi: true,
    q: { en: "Which are the correct practices while driving down a slope? (Select all correct answers)", hi: "ढलान पर उतरते समय सही तरीके कौन से हैं? (सभी सही उत्तर चुनें)" },
    options: {
      en: ["Use a low gear", "Use the retarder brake", "Coast down in neutral", "Reverse the loaded dumper down the slope"],
      hi: ["लो-गियर का प्रयोग करना", "रिटार्डर ब्रेक का प्रयोग करना", "न्यूट्रल में लुढ़कते हुए उतरना", "भरे डम्पर को ढलान पर रिवर्स करना"],
    },
    explanation: { en: "Descend in a low gear and use the retarder brake. Avoid reversing a loaded dumper on an incline.", hi: "लो-गियर में उतरें और रिटार्डर ब्रेक का प्रयोग करें। ढलान पर भरे डम्पर को रिवर्स करने से बचें।" },
    ref: { sec: 7, text: "Dumper SOP – Section 8: Ramp Driving, Braking & Slope Protocols", dgms: "" },
  },
  {
    id: "dumper-015", dept: "mining", topic: "dumper", correct: [2], multi: false,
    q: { en: "Your dumper has a breakdown in an active traffic lane. What is the correct action?", hi: "आपके डम्पर में चालू यातायात मार्ग पर ब्रेकडाउन हो गया है। सही कार्यवाही क्या है?" },
    options: {
      en: ["Leave it and walk away", "Wait silently for someone to notice", "Warn approaching traffic, inform the authority and chock the tyres before leaving", "Try to push it with another dumper"],
      hi: ["उसे छोड़कर चले जाएं", "चुपचाप किसी के देखने का इंतज़ार करें", "आने वाले वाहनों को चेतावनी दें, अधिकारी को सूचित करें और जाने से पहले टायरों में स्टॉपर लगाएं", "किसी दूसरे डम्पर से धक्का लगवाएं"],
    },
    explanation: { en: "Signal approaching traffic, notify the authority immediately and chock the tyres with wheel stoppers before leaving.", hi: "आने वाले यातायात को संकेत दें, अधिकारी को तुरंत सूचना दें और जाने से पहले टायरों में व्हील स्टॉपर लगाएं।" },
    ref: { sec: 8, text: "Dumper SOP – Section 9: Emergency Breakdown & Abnormality Actions", dgms: "" },
  },
  {
    id: "dumper-016", dept: "mining", topic: "dumper", correct: [0, 1, 2], multi: true,
    q: { en: "What should be done when parking the dumper in its bay? (Select all correct answers)", hi: "डम्पर को पार्किंग बे में खड़ा करते समय क्या करना चाहिए? (सभी सही उत्तर चुनें)" },
    options: {
      en: ["Shift to neutral", "Apply the parking brake", "Place wheel stoppers between the front and rear tyres", "Leave the engine running"],
      hi: ["न्यूट्रल में डालें", "पार्किंग ब्रेक लगाएं", "आगे और पीछे के टायरों के बीच व्हील स्टॉपर रखें", "इंजन चालू छोड़ दें"],
    },
    explanation: { en: "Park straight in the designated bay, shift to neutral, apply the parking brake, place stoppers and shut down the engine.", hi: "निर्धारित बे में सीधा पार्क करें, न्यूट्रल करें, पार्किंग ब्रेक लगाएं, स्टॉपर रखें और इंजन बंद करें।" },
    ref: { sec: 9, text: "Dumper SOP – Section 10: Structured Parking & Post-Trip Handover", dgms: "" },
  },
];
