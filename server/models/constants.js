export const User_Types = Object.freeze(["Teacher", "Student"]);

// Payment Timing
export const PaymentTiming = Object.freeze([
  "Prepaid",    // مقدم
  "Postpaid"    // مؤخر
]);

// Price period: pricing frequency
export const PricePeriod = Object.freeze([
  "Session",
  "Month"
]);

// payment methods
export const PaymentMethods = Object.freeze([
  "Cash",
  "Vodafone Cash",
  "Etisalat Cash",
  "Orange Money",
  "Bank Transfer",
  "Meeza",
  "Instapay",
  "ValU",
  "Credit Card",
  "Fawry"
]);
export const Education_Systems = Object.freeze(["National", "Azhar"]);

export const EducationStructure = Object.freeze({
  National: {
    grades: Object.freeze(["Secondary 1", "Secondary 2", "Secondary 3"]),
    sectors: Object.freeze({
      "Secondary 1": ["General"],
      "Secondary 2": ["Scientific", "Literature"],
      "Secondary 3": ["Mathematics", "Scientific", "Literature"]
    })
  },

  Azhar: {
    grades: Object.freeze(["Secondary 1", "Secondary 2", "Secondary 3"]),
    sectors: Object.freeze({
      "Secondary 1": ["General"],
      "Secondary 2": ["Scientific", "Literature"],
      "Secondary 3": ["Mathematics", "Scientific", "Literature"]
    })
  }
});

// Subjects by system and grade (track-aware for Secondary stages)
export const SubjectsBySystem = Object.freeze({
  National: Object.freeze({
    "Secondary_Shared_Subjects": ["German", "French", "Religion", "Arabic", "English"],
    "Secondary 1": ["History", "Math", "Integrated Sciences", "Philosophy and Logic", ...SubjectsBySystem.National.Secondary_Shared_Subjects],
    "Secondary 2": {
      Scientific: ["Physics", "Chemistry", "Biology", "Math", ...SubjectsBySystem.National.Secondary_Shared_Subjects],
      Literature: ["History", "Geography", "Psychology", "Math", ...SubjectsBySystem.National.Secondary_Shared_Subjects]
    },
    "Secondary 3": {
      Mathematics: ["Math", "Physics", "Chemistry", ...SubjectsBySystem.National.Secondary_Shared_Subjects],
      Scientific: ["Physics", "Chemistry", "Biology", ...SubjectsBySystem.National.Secondary_Shared_Subjects],
      Literature: ["History", "Geography", "Statistics", ...SubjectsBySystem.National.Secondary_Shared_Subjects]
    }
  }),

  /*Azhar: Object.freeze({
    "Secondary 1": ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "English", "Science"],
    "Secondary 2": ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "Logic", "English"],
    "Secondary 3": {
        Scientific: ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "Biology", "Chemistry", "English"],
        Literature: ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "Arabic Literature", "Logic", "English"]
    }
  })*/
});

// Available languages for studying
export const Languages = Object.freeze([
  "Arabic", "English", "French", "German", "Italian", "Spanish", "General"
]);

// Egyptian governates
export const Governates = Object.freeze([
  "Cairo", "Cairo - Nasr City", "Cairo - Heliopolis", "Cairo - Maadi",
  "Giza", "Giza - Mohandessin", "Giza - 6th of October",
  "Alexandria", "Alexandria - Sidi Gaber", "Alexandria - Smouha",
  "Dakahlia", "Dakahlia - Mansoura",
  "Red Sea", "Red Sea - Hurghada", "Red Sea - El Gouna",
  "Beheira", "Beheira - Damanhour",
  "Fayoum",
  "Gharbia", "Gharbia - Tanta",
  "Ismailia",
  "Monufia", "Monufia - Shebin El Kom",
  "Minya",
  "Qalyubia", "Qalyubia - Benha", "Qalyubia - Shubra El Kheima",
  "New Valley", "New Valley - Kharga",
  "Suez",
  "Aswan", "Aswan - Abu Simbel",
  "Assiut",
  "Beni Suef",
  "Port Said", "Port Said - Port Fouad",
  "Damietta",
  "Sohag",
  "North Sinai", "North Sinai - Arish",
  "South Sinai", "South Sinai - Sharm El Sheikh", "South Sinai - Dahab",
  "Kafr El Sheikh",
  "Matrouh", "Matrouh - Marsa Matruh", "Matrouh - Siwa",
  "Luxor",
  "Qena",
  "Sharqia", "Sharqia - Zagazig"
]);
