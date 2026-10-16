/* ===== DEPARTMENTS & EQUIPMENT: add new departments / equipment here ===== */
const DEPTS = {
  mining: {
    page: "mining.html",
    title: "Mining operations",
    en: "Mining",
    hi: "खनन",
    freezeHead: true,
    equipment: [
      { id: "loader", en: "Loader / Shovel", hi: "लोडर / शॉवेल" },
      { id: "dumper", en: "Dumper", hi: "डंपर" },
      { id: "drill", en: "Drill", hi: "ड्रिल" },
      { id: "wheeldozer", en: "Wheel Dozer", hi: "व्हील डोजर" },
      { id: "chaindozer", en: "Chain Dozer", hi: "चेन डोजर" },
      { id: "grader", en: "Motor Grader", hi: "मोटर ग्रेडर" },
      { id: "breaker", en: "Rock Breaker", hi: "रॉक ब्रेकर" },
      { id: "bowser", en: "Diesel Bowser", hi: "डीजल बाउज़र" },
      { id: "backhoe", en: "Backhoes", hi: "बैकहो" },
      { id: "tmb", en: "TMB Tanker", hi: "टीएमबी टैंकर" },
      { id: "sprinkler", en: "Water Sprinkler", hi: "वाटर स्प्रिंकलर" },
      { id: "bit", en: "Bit Handling", hi: "बिट हैंडलिंग" },
      { id: "explosive", en: "Explosive Handling", hi: "विस्फोटक हैंडलिंग" },
    ],
  },
    mech: {
    page: "mechanical.html",
    title: "Mechanical services",
    en: "Mechanical Services",
    hi: "यांत्रिक सेवाएं",
    heading: "Select Activity  /  कार्य चुनें",
    gridClass: "list",
    freezeHead: true,
    equipment: [
      {
        id: "safe_material_handling",
        en: "Safe Material Handling",
        hi: "सुरक्षित सामग्री हैंडलिंग"
      },
      {
        id: "dismantling_assembling_tyres",
        en: "Dismantling and Assembling of Tyres",
        hi: "टायरों को खोलना और लगाना (डिसमेंबलिंग एवं असेंबलिंग)"
      },
      {
        id: "safe_arc_welding_cutting",
        en: "Safe Arc Welding and Cutting",
        hi: "सुरक्षित आर्क वेल्डिंग एवं कटिंग"
      },
      {
        id: "safe_gas_welding_cutting",
        en: "Safe Gas Welding and Cutting",
        hi: "सुरक्षित गैस वेल्डिंग एवं कटिंग"
      },
      {
        id: "working_at_height",
        en: "Working at Height",
        hi: "ऊंचाई पर कार्य करना"
      },
      {
        id: "checking_radiator_coolant_level",
        en: "Checking Radiator Coolant Level in HEM Equipment and Vehicles",
        hi: "HEM उपकरण एवं वाहनों में रेडिएटर कूलेंट स्तर की जांच"
      },
      {
        id: "general_safety_precautions_hemm_workshop",
        en: "General Safety Precautions While Working in HEM Machinery / Workshop Equipment",
        hi: "HEM मशीनरी / वर्कशॉप उपकरणों में कार्य करते समय सामान्य सुरक्षा सावधानियां"
      },
      {
        id: "operation_of_buses",
        en: "Operation of Buses",
        hi: "बसों का संचालन"
      },
      {
        id: "safe_assembling_dismantling_subassemblies",
        en: "Safe Assembling and Dismantling of Sub-Assemblies Using Tools",
        hi: "औजारों का उपयोग करके सब-असेंबलियों को सुरक्षित खोलना और जोड़ना"
      },
      {
        id: "changing_parking_brake_seal_liners_dumpers",
        en: "Changing Parking Brake Seal / Liners in BEML Dumpers BH-60M / 50M",
        hi: "BEML डंपर BH-60M / 50M में पार्किंग ब्रेक सील / लाइनर बदलना"
      },
      {
        id: "shovel_bucket_tooth_point_changing",
        en: "BEML 182M, WK-10B & Hitachi EX1900-6 Shovels Bucket Tooth Point Changing Procedure",
        hi: "BEML 182M, WK-10B एवं हिताची EX1900-6 शॉवेल्स के बकेट टूथ पॉइंट बदलने की प्रक्रिया"
      },
      {
        id: "shovel_bucket_tooth_adaptor_changing",
        en: "BEML 182M, WK-10B Shovel Bucket Tooth Adaptor Changing Procedure",
        hi: "BEML 182M, WK-10B शॉवेल के बकेट टूथ एडेप्टर बदलने की प्रक्रिया"
      },
      {
        id: "shovel_track_chain_adjusting",
        en: "BEML 182M, WK-10B Shovel Track Chain Adjusting Procedure",
        hi: "BEML 182M, WK-10B शॉवेल ट्रैक चेन एडजस्ट करने की प्रक्रिया"
      },
      {
        id: "uncoiling_hoist_rope_drum",
        en: "Uncoiling of Hoist Rope from Drum",
        hi: "ड्रम से होइस्ट रोप (रस्सी) को खोलना"
      },
      {
        id: "changing_hoist_rope_electric_shovel",
        en: "Changing of Hoist Rope in BEML Bucyrus 182M & TZ WK-10B Electric Rope Shovel",
        hi: "BEML Bucyrus 182M एवं TZ WK-10B इलेक्ट्रिक रोप शॉवेल में होइस्ट रोप बदलना"
      },
      {
        id: "changing_boom_suspension_rope",
        en: "Changing of Boom Suspension Rope (Pendent Cable) in Bucyrus 182M & TZ WK-10B Electric Rope Shovel",
        hi: "Bucyrus 182M एवं TZ WK-10B इलेक्ट्रिक रोप शॉवेल में बूम सस्पेंशन रोप (पेंडेंट केबल) बदलना"
      },
      {
        id: "tyre_dismantler_machine_operation",
        en: "Tyre-Dismantler Machine Operation Procedure",
        hi: "टायर डिसमेंटलर मशीन संचालन प्रक्रिया"
      },
      {
        id: "safety_compressed_air_systems",
        en: "Safety While Using Systems Having Compressed Air",
        hi: "कंप्रेस्ड एयर (संपीड़ित वायु) प्रणालियों का उपयोग करते समय सुरक्षा"
      },
      {
        id: "cleaning_primary_air_filter_element",
        en: "Cleaning the Primary Air Filter Element in HEM Equipment",
        hi: "HEM उपकरण में प्राइमरी एयर फिल्टर एलिमेंट की सफाई"
      },
      {
        id: "track_tensioning_idm70e_drills",
        en: "Track Tensioning of IDM-70E Drills",
        hi: "IDM-70E ड्रिल्स की ट्रैक टेंशनिंग (चेन तनाव समायोजन)"
      },
      {
        id: "fitment_tow_bar_idm70e_drills",
        en: "Fitment of Tow Bar in IDM-70E Drills",
        hi: "IDM-70E ड्रिल्स में टो-बार लगाना (फिटमेंट)"
      },
      {
        id: "rotary_alignment_idm70e",
        en: "Rotary Alignment of IDM-70E",
        hi: "IDM-70E का रोटरी अलाइनमेंट"
      },
      {
        id: "rotary_gearbox_changing_idm70e",
        en: "Rotary Gearbox Changing of IDM-70E Drill",
        hi: "IDM-70E ड्रिल का रोटरी गियरबॉक्स बदलना"
      },
      {
        id: "changing_v_belts_roc_f9_drill",
        en: "Changing of V-Belts in ROC F-9 Drill",
        hi: "ROC F-9 ड्रिल में V-बेल्ट बदलना"
      },
      {
        id: "safe_operation_overhead_cranes",
        en: "Safe Working Practices in Operation of Overhead Cranes",
        hi: "ओवरहेड क्रेन संचालन में सुरक्षित कार्य पद्धतियां"
      },
      {
        id: "safe_operations_machine_shop",
        en: "General Safe Working Practices in Machine Shop",
        hi: "मशीन शॉप में सामान्य सुरक्षित कार्य पद्धतियां"
      },
      {
        id: "safe_practices_lathe_operation",
        en: "Safe Working Practices in Lathe Operation",
        hi: "लेथ मशीन संचालन में सुरक्षित कार्य पद्धतियां"
      },
      {
        id: "safe_practices_grinding_operation",
        en: "Safe Working Practices in Grinding Operation",
        hi: "ग्राइंडिंग संचालन में सुरक्षित कार्य पद्धतियां"
      },
      {
        id: "safe_operation_hydra_cranes",
        en: "Safe Operation of Hydra Cranes",
        hi: "हाइड्रा क्रेन का सुरक्षित संचालन"
      },
      {
        id: "safe_operation_truck_mounted_cranes",
        en: "Safe Operation of Truck Mounted Cranes",
        hi: "ट्रक माउंटेड क्रेन का सुरक्षित संचालन"
      },
      {
        id: "safe_operation_jump_starting",
        en: "Safe Operation of Jump Starting",
        hi: "जंप स्टार्टिंग का सुरक्षित संचालन"
      },
      {
        id: "hydraulic_cylinder_repair",
        en: "Hydraulic Cylinder Repair",
        hi: "हाइड्रोलिक सिलेंडर की मरम्मत"
      },
      {
        id: "suspension_charging_dumpers",
        en: "Suspension Charging of Dumpers",
        hi: "डंपरों की सस्पेंशन चार्जिंग"
      },
      {
        id: "safe_operation_nitrogen_generator_system",
        en: "Safe Operation of Nitrogen Generator System",
        hi: "नाइट्रोजन जनरेटर प्रणाली का सुरक्षित संचालन"
      },
      {
        id: "safe_operation_tyre_handler",
        en: "Safe Operation of Tyre Handler",
        hi: "टायर हैंडलर का सुरक्षित संचालन"
      },
      {
        id: "accumulator_charging_beml_dumpers",
        en: "Accumulator Charging in BEML 50/60 Ton Dumpers",
        hi: "BEML 50/60 टन डंपरों में एक्यूमुलेटर चार्जिंग"
      },
      {
        id: "safe_operation_diesel_welding_generator",
        en: "Safe Operation of Diesel Welding Generator",
        hi: "डीजल वेल्डिंग जनरेटर का सुरक्षित संचालन"
      },
      {
        id: "hydraulic_cylinder_changing_hemm",
        en: "Hydraulic Cylinder Changing Work in HEMM",
        hi: "HEMM में हाइड्रोलिक सिलेंडर बदलने का कार्य"
      },
      {
        id: "contract_work_housekeeping",
        en: "Contract Work of Housekeeping",
        hi: "हाउसकीपिंग का अनुबंध कार्य"
      },
      {
        id: "contract_work_ac_repair_hemm",
        en: "Contract Work of Air Conditioning Repair Work in HEMM",
        hi: "HEMM में एयर कंडीशनिंग मरम्मत का अनुबंध कार्य"
      },
      {
        id: "contract_work_afps_repair_hemm",
        en: "Contract Work of AFPS Repair / Maintenance Work in HEMM",
        hi: "HEMM में AFPS (स्वचालित आग दमन प्रणाली) मरम्मत / रखरखाव का अनुबंध कार्य"
      },
      {
        id: "climbing_ladder_machine_cabin_repairs",
        en: "Safe Practices While Climbing and Descending Ladder for Cabin Repairs in Machine",
        hi: "केबिन एवं संबंधित क्षेत्रों में मरम्मत के लिए मशीन की सीढ़ी चढ़ते और उतरते समय सुरक्षा"
      },
      {
        id: "tyre_inflation_hemm",
        en: "Tyre Inflation in HEMM",
        hi: "HEMM में टायर इन्फ्लेशन (हवा भरना)"
      },
      {
        id: "oil_draining_hemm",
        en: "Oil Draining in HEMM",
        hi: "HEMM में प्रयुक्त तेल निकालना (ऑयल ड्रेनिंग)"
      }
    ]
  },
  elec: {
    page: "electrical.html",
    title: "Electrical services",
    en: "Electrical Services",
    hi: "विद्युत सेवाएं",
    heading: "Select Activity  /  कार्य चुनें",
    gridClass: "list",
    freezeHead: true,
    // Add or merge inside the electrical services / equipment section of department.js

    equipment: [
      {
        id: "electrical_shutdown_ht_lt",
        en: "Electrical Shutdown in HT/LT Circuit",
        hi: "HT/LT सर्किट में इलेक्ट्रिकल शटडाउन (विद्युत आपूर्ति बंद करना)",
      },
      {
        id: "om_earth_pits",
        en: "Operation & Maintenance of Earth Pits",
        hi: "अर्थ पिट्स का संचालन एवं रखरखाव",
      },
      {
        id: "om_electrical_shovels_drills",
        en: "Operation & Maintenance of Electrical Shovels & Drills",
        hi: "इलेक्ट्रिकल शॉवेल्स और ड्रिल्स का संचालन एवं रखरखाव",
      },
      {
        id: "om_transformers",
        en: "Operation & Maintenance of Transformers",
        hi: "ट्रांसफार्मर का संचालन एवं रखरखाव",
      },
      {
        id: "om_ht_panels_psg_isolator",
        en: "Operation & Maintenance of HT Panels/PSG/Isolator",
        hi: "HT पैनल्स/PSG/आइसोलेटर का संचालन एवं रखरखाव",
      },
      {
        id: "om_lt_panels_psg_isolator",
        en: "Operation & Maintenance of LT Panels/PSG/ Isolator",
        hi: "LT पैनल्स/PSG/आइसोलेटर का संचालन एवं रखरखाव",
      },
      {
        id: "om_motor_generator",
        en: "Operation & Maintenance of Motor & Generator",
        hi: "मोटर एवं जनरेटर का संचालन एवं रखरखाव",
      },
      {
        id: "om_ht_lt_dg_sets",
        en: "Operation & Maintenance of HT/LT DG Sets",
        hi: "HT/LT डीजी सेट्स का संचालन एवं रखरखाव",
      },
      {
        id: "om_overhead_ht_lt_line",
        en: "Operation & Maintenance of Overhead HT/LT Line",
        hi: "ओवरहेड HT/LT लाइन का संचालन एवं रखरखाव",
      },
      {
        id: "erection_dismantling_oh_lines",
        en: "Erection/Dismantling of OH Lines",
        hi: "OH (ओवरहेड) लाइनों की स्थापना / उन्हें हटाना (डिसमेंबलिंग)",
      },
      {
        id: "handling_shifting_ht_lt_cable",
        en: "Handling/Shifting of HT/LT Cable",
        hi: "HT/LT केबल की हैंडलिंग और शिफ्टिंग (स्थानांतरण)",
      },
      {
        id: "jungle_cleaning_weed_ht_lt_oh_lines",
        en:
          "Jungle Cleaning/ Weed Growth Cutting Works for HT/LT OH Lines",
        hi:
          "HT/LT OH लाइनों के लिए जंगल/झाड़ियों की सफाई और खरपतवार काटने का कार्य",
      },
      {
        id: "working_at_height",
        en: "Working at Height",
        hi: "ऊंचाई पर कार्य करना",
      },
      {
        id: "transformer_oil_testing",
        en: "Transformer Oil Testing",
        hi: "ट्रांसफार्मर ऑयल (तेल) की टेस्टिंग (जांच)",
      },
      {
        id: "om_ups_battery_charger",
        en: "Operation & Maintenance of UPS, Battery & Battery Charger",
        hi: "यूपीएस, बैटरी एवं बैटरी चार्जर का संचालन एवं रखरखाव",
      },
      {
        id: "om_capacitor_bank",
        en: "Operation & Maintenance of Capacitor Bank",
        hi: "कैपेसिटर बैंक का संचालन एवं रखरखाव",
      },
      {
        id: "shifting_psg_kiosk",
        en: "Shifting of PSG/KIOSK",
        hi: "PSG/कियोस्क की शिफ्टिंग (स्थानांतरण)",
      },
      {
        id: "om_lightning_surge_arrestors",
        en:
          "Operation & Maintenance of Lightning Arrestors/ Surge Arrestor",
        hi: "लाइटनिंग अरेस्टर/सर्ज अरेस्टर का संचालन एवं रखरखाव",
      },
      {
        id: "om_cooling_equipment",
        en: "Operation & Maintenance of Cooling Equipment",
        hi: "कूलिंग उपकरणों का संचालन एवं रखरखाव",
      },
      {
        id: "cleaning_ht_lt_switchyard",
        en: "Cleaning of HT/LT Equipment/ Switchyard",
        hi: "HT/LT उपकरणों एवं स्विचयार्ड की सफाई",
      },
      {
        id: "om_fixed_high_mast_tower",
        en: "Operation & Maintenance of Fixed type-high Mast Tower",
        hi: "फिक्स्ड टाइप हाई-मास्ट टॉवर का संचालन एवं रखरखाव",
      },
      {
        id: "om_portable_lighting_tower",
        en: "Operation & Maintenance of Portable Lighting Tower",
        hi: "पोर्टेबल लाइटिंग टॉवर का संचालन एवं रखरखाव",
      },
      {
        id: "street_light_maintenance_mines_township",
        en: "Street Light Maintenance in Mines & Township",
        hi: "माइंस (खदानों) और टाउनशिप में स्ट्रीट लाइट का रखरखाव",
      },
      {
        id: "use_ht_lt_insulation_tester",
        en: "Use of HT/LT Insulation Tester",
        hi: "HT/LT इंसुलेशन टेस्टर का उपयोग",
      },
      {
        id: "use_multimeters",
        en: "Use of Multimeters",
        hi: "मल्टीमीटर का उपयोग",
      },
      {
        id: "ht_lt_cable_termination_works",
        en: "HT/LT Cable Termination Works",
        hi: "HT/LT केबल टर्मिनेशन का कार्य",
      },
      {
        id: "temporary_power_supply",
        en: "Providing Temporary Power Supply",
        hi: "अस्थायी विद्युत (पावर) आपूर्ति प्रदान करना",
      },
      {
        id: "relay_calibration_testing",
        en: "Relay Calibration & Testing",
        hi: "रिले कैलिब्रेशन एवं टेस्टिंग",
      },
      {
        id: "om_wireless_telephone_system",
        en: "Operation & Maintenance of Wireless / Telephone System",
        hi: "वायरलेस / टेलीफोन प्रणाली का संचालन एवं रखरखाव",
      },
      {
        id: "laying_ht_lt_telephone_cable",
        en: "Undergrounding/ Laying of HT/LT/Telephone Cable",
        hi: "HT/LT/टेलीफोन केबल बिछाना (अंडरग्राउंडिंग/लेइंग कार्य)",
      },
      {
        id: "structure_painting_electrical_installations",
        en: "Structure Painting Works of Electrical Installations",
        hi: "विद्युत प्रतिष्ठानों के स्ट्रक्चर का पेंटिंग कार्य",
      },
      {
        id: "om_eot_cranes",
        en: "Operation & Maintenance of EOT Cranes",
        hi: "EOT क्रेनों का संचालन एवं रखरखाव",
      },
      {
        id: "om_access_platform_truck",
        en: "Operation & Maintenance of Access Platform Truck",
        hi: "एक्सेस प्लेटफॉर्म ट्रक का संचालन एवं रखरखाव",
      },
    ],
  },
};
