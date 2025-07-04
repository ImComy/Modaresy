// User types
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

// Subjects by system and grade (track-aware for Secondary stages)
export const SubjectsBySystem = Object.freeze({
  National: Object.freeze({
    "Primary 1": ["Arabic", "Math", "Religious Education", "Values and Life Skills", "Basic English"],
    "Primary 2": ["Arabic", "Math", "Religious Education", "Values and Life Skills", "Basic English"],
    "Primary 3": ["Arabic", "Math", "Religious Education", "Values and Life Skills", "Basic English"],
    "Primary 4": ["Arabic", "Math", "Science", "Social Studies", "Religious Education", "ICT", "English", "Values and Life Skills"],
    "Primary 5": ["Arabic", "Math", "Science", "Social Studies", "Religious Education", "ICT", "English", "Values and Life Skills"],
    "Primary 6": ["Arabic", "Math", "Science", "Social Studies", "Religious Education", "ICT", "English", "Values and Life Skills"],
    "Preparatory 1": ["Arabic", "Math", "Science", "Social Studies", "English", "Religious Education", "ICT"],
    "Preparatory 2": ["Arabic", "Math", "Science", "Social Studies", "English", "Religious Education", "ICT"],
    "Preparatory 3": ["Arabic", "Math", "Science", "Social Studies", "English", "Religious Education", "ICT"],
    "Secondary 1": ["Arabic", "Math", "Biology", "English", "Social Studies", "Religious Education", "Philosophy and Logic", "Second Language"],
    "Secondary 2": {
      Scientific: ["Arabic", "Math", "English", "Religious Education", "Second Language", "Physics", "Biology", "Chemistry"],
      Literature: ["Arabic", "Math", "English", "Religious Education", "Second Language", "History", "Geography", "Philosophy"]
    },
    "Secondary 3": {
      Mathematics: ["Arabic", "Math", "English", "Religious Education", "Second Language", "Pure Math", "Applied Math", "Mechanics"],
      Scientific: ["Arabic", "Math", "English", "Religious Education", "Second Language", "Physics", "Chemistry", "Biology"],
      Literature: ["Arabic", "Math", "English", "Religious Education", "Second Language", "History", "Geography", "Philosophy", "Sociology"]
    }
  }),

  Azhar: Object.freeze({
    "Primary 1": ["Arabic", "Quran", "Islamic Studies", "Math"],
    "Primary 2": ["Arabic", "Quran", "Islamic Studies", "Math"],
    "Primary 3": ["Arabic", "Quran", "Islamic Studies", "Math"],
    "Primary 4": ["Arabic", "Quran", "Islamic Studies", "Math", "General Science"],
    "Primary 5": ["Arabic", "Quran", "Islamic Studies", "Math", "General Science"],
    "Primary 6": ["Arabic", "Quran", "Islamic Studies", "Math", "General Science"],
    "Preparatory 1": ["Arabic", "Quran", "Math", "Fiqh", "General Science", "English"],
    "Preparatory 2": ["Arabic", "Quran", "Math", "Fiqh", "Tafsir", "General Science", "English"],
    "Preparatory 3": ["Arabic", "Quran", "Math", "Fiqh", "Tafsir", "General Science", "English"],
    "Secondary 1": ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "English", "Science"],
    "Secondary 2": ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "Logic", "English"],
    "Secondary 3": {
        Scientific: ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "Biology", "Chemistry", "English"],
        Literature: ["Arabic", "Quran", "Math", "Fiqh", "Hadith", "Tafsir", "Arabic Literature", "Logic", "English"]
    }
  }),

  Technical: Object.freeze({
    "Technical 1": ["Arabic", "Math", "Technical Drawing", "Workshop", "English", "Religion"],
    "Technical 2": ["Arabic", "Physics", "Math", "Technical Subjects", "English", "Religion"],
    "Technical 3": {
        Industrial: [
        "Arabic", "English", "Math",
        "Electrical Technology", "Mechanical Technology",
        "Technical Drawing", "Final Project"
        ],
        Commercial: [
        "Arabic", "English", "Business Administration",
        "Economics", "Accounting", "Statistics", "Final Project"
        ],
        Agricultural: [
        "Arabic", "English", "Soil Science", "Plant Production",
        "Animal Production", "Agricultural Economics", "Final Project"
        ]
    }
  }),

  IGCSE: Object.freeze({
    "Year 9": ["English", "Math", "ICT", "Science Foundations"],
    "Year 10": ["Math", "English", "Physics", "Biology", "Chemistry", "Business Studies", "ICT"],
    "Year 11": ["Math (Core or Extended)", "English Literature", "Accounting", "Economics", "Biology"],
    "Year 12": ["A-Level Math", "A-Level Biology", "A-Level Physics"]
  }),

  American: Object.freeze({
    "Grade 9": ["English", "Algebra I", "Biology", "World History", "PE"],
    "Grade 10": ["English II", "Geometry", "Chemistry", "American History"],
    "Grade 11": ["English III", "Algebra II", "Physics", "World History"],
    "Grade 12": ["English IV", "Calculus", "Environmental Science", "Sociology"]
  }),

  IB: Object.freeze({
    "Year 1": ["Theory of Knowledge", "Math AA", "Biology HL", "History HL", "English A", "Business HL"],
    "Year 2": ["Theory of Knowledge", "Math AI", "Chemistry HL", "Economics HL", "English B", "CAS"]
  }),

  French: Object.freeze({
    "Seconde": ["Français", "Maths", "Histoire-Géographie", "SVT", "Physique-Chimie"],
    "Première": ["Français", "Maths", "Philosophie", "Physique", "Biologie"],
    "Terminale": ["Français", "Maths", "Philosophie", "Physique", "Biologie", "Histoire"]
  }),

  German: Object.freeze({
    "Klasse 10": ["Deutsch", "Mathematik", "Biologie", "Chemie", "Physik"],
    "Klasse 11": ["Deutsch", "Mathematik", "Informatik", "Geschichte"],
    "Klasse 12": ["Deutsch", "Mathematik", "Physik", "Wirtschaft", "Literatur"]
  })
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
