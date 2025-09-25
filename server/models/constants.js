export const userTypes = Object.freeze(["Student", "Teacher"]);

export const weekDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const PaymentTimings = Object.freeze(["Prepaid", "Postpaid"]);

export const PricePeriod = Object.freeze(["Session", "Month"]);

export const PaymentMethods = Object.freeze([
  "Cash", "Vodafone Cash", "Etisalat Cash", "Orange Money", "Bank Transfer",
  "Meeza", "Instapay", "ValU", "Credit Card", "Fawry"
]);

export const Education_Systems = Object.freeze(["National", "Bachelor", "Al-Azhar", "IGCSE", "American_Diploma"]);

export const EducationStructure = Object.freeze({
  National: {
    grades: Object.freeze([
      "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
      "Middle 1", "Middle 2", "Middle 3",
      "Secondary 1", "Secondary 2", "Secondary 3"
    ]),
    sectors: Object.freeze({
      "Primary 1": ["General"],
      "Primary 2": ["General"],
      "Primary 3": ["General"],
      "Primary 4": ["General"],
      "Primary 5": ["General"],
      "Primary 6": ["General"],
      "Middle 1": ["General"],
      "Middle 2": ["General"],
      "Middle 3": ["General"],
      "Secondary 1": ["General"],
      "Secondary 2": ["Scientific", "Literature"],
      "Secondary 3": ["Mathematics", "Scientific", "Literature"]
    }),
    languages: ["Arabic", "English"]
  },

  Bachelor: {
    grades: Object.freeze([
      "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
      "Middle 1", "Middle 2", "Middle 3",
      "Secondary 1", "Secondary 2", "Secondary 3"
    ]),
    sectors: Object.freeze({
      "Primary 1": ["General"], "Primary 2": ["General"], "Primary 3": ["General"], "Primary 4": ["General"], "Primary 5": ["General"], "Primary 6": ["General"],
      "Middle 1": ["General"], "Middle 2": ["General"], "Middle 3": ["General"],
      "Secondary 1": ["General"],
      "Secondary 2": ["Scientific_Medicine", "Scientific_Engineering", "Literary_Business", "Literary_Arts"],
      "Secondary 3": ["Scientific_Medicine", "Scientific_Engineering", "Literary_Arts", "Literary_Business"]
    }),
    languages: ["Arabic", "English"]
  },

  "Al-Azhar": {
    grades: Object.freeze([
      "Primary 1", "Primary 2", "Primary 3", "Primary 4", "Primary 5", "Primary 6",
      "Middle 1", "Middle 2", "Middle 3",
      "Secondary 1", "Secondary 2", "Secondary 3"
    ]),
    sectors: Object.freeze({
      "Primary 1": ["General"], "Primary 2": ["General"], "Primary 3": ["General"], "Primary 4": ["General"], "Primary 5": ["General"], "Primary 6": ["General"],
      "Middle 1": ["General"], "Middle 2": ["General"], "Middle 3": ["General"],
      "Secondary 1": ["General"],
      "Secondary 2": ["Scientific", "Literary", "Islamic_Studies"],
      "Secondary 3": ["Scientific", "Literary", "Islamic_Studies"]
    }),
    languages: ["Arabic"]
  },

  "IGCSE": {
    grades: Object.freeze([
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
      "AS-Level", "A-Level"
    ]),
    sectors: Object.freeze({
      "Grade 1": ["General"], "Grade 2": ["General"], "Grade 3": ["General"], "Grade 4": ["General"], "Grade 5": ["General"], "Grade 6": ["General"],
      "Grade 7": ["General"], "Grade 8": ["General"], "Grade 9": ["General"], "Grade 10": ["General"],
      "AS-Level": ["General"], "A-Level": ["General"]
    }),
    languages: ["English"]
  },

  "American_Diploma": {
    grades: Object.freeze([
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
    ]),
    sectors: Object.freeze({
      "Grade 1": ["General"], "Grade 2": ["General"], "Grade 3": ["General"], "Grade 4": ["General"], "Grade 5": ["General"], "Grade 6": ["General"],
      "Grade 7": ["General"], "Grade 8": ["General"], "Grade 9": ["General"], "Grade 10": ["General"], "Grade 11": ["General"], "Grade 12": ["General"]
    }),
    languages: ["English"]
  }
});

export const Languages = ["Arabic", "English", "French", "German", "Spanish", "Italian"];

const Primary_Shared_Subjects = [
  "Arabic", "English", "Mathematics", "Science", "Social Studies",
  "Religion", "Art", "Music", "Physical Education"
];

const Middle_Shared_Subjects = [
  "Arabic", "English", "Mathematics", "Science", "Social Studies",
  "Religion", "French", "German", "Technology", "Computer Science",
  "Art", "Music", "Physical Education"
];

const Secondary_Shared_Subjects = [
  "Arabic", "English", "French", "German",
  "Religion", "National Education", "Technology", "Computer Science", "Mathematics"
];

export const Language_Independent_Subjects = ["History", "Geography"];
const physicalSciences = ["Physics", "Chemistry"];
const math = ["Mathematics"];

export const SubjectGroupsToSectorsMap = new Map([
  [physicalSciences, ["Scientific", "Mathematics"]],
  [math, ["Scientific", "Literature"]]
]);

export const SubjectsBySystem = Object.freeze({
  National: Object.freeze({
    "Primary 1": [...Primary_Shared_Subjects],
    "Primary 2": [...Primary_Shared_Subjects],
    "Primary 3": [...Primary_Shared_Subjects],
    "Primary 4": [...Primary_Shared_Subjects],
    "Primary 5": [...Primary_Shared_Subjects],
    "Primary 6": [...Primary_Shared_Subjects],
    "Middle 1": [...Middle_Shared_Subjects],
    "Middle 2": [...Middle_Shared_Subjects],
    "Middle 3": [...Middle_Shared_Subjects],
    "Secondary 1": [
      ...Language_Independent_Subjects,
      "Integrated Sciences", "Philosophy and Logic", "Mathematics",
      ...Secondary_Shared_Subjects
    ],
    "Secondary 2": {
      Scientific: [
        ...Secondary_Shared_Subjects,
        "Biology",
        ...Array.from(SubjectGroupsToSectorsMap.entries())
          .filter(([_, sectors]) => sectors.includes("Scientific"))
          .flatMap(([subjects]) => subjects)
      ],
      Literature: [
        ...Language_Independent_Subjects,
        ...Secondary_Shared_Subjects,
        "Psychology", "Sociology", "Philosophy",
        ...Array.from(SubjectGroupsToSectorsMap.entries())
          .filter(([_, sectors]) => sectors.includes("Literature"))
          .flatMap(([subjects]) => subjects)
      ]
    },
    "Secondary 3": {
      Mathematics: [
        ...Secondary_Shared_Subjects,
        ...Array.from(SubjectGroupsToSectorsMap.entries())
          .filter(([_, sectors]) => sectors.includes("Mathematics"))
          .flatMap(([subjects]) => subjects),
        "Pure Mathematics", "Applied Mathematics"
      ],
      Scientific: [
        ...Secondary_Shared_Subjects,
        "Biology", "Geology",
        ...Array.from(SubjectGroupsToSectorsMap.entries())
          .filter(([_, sectors]) => sectors.includes("Scientific"))
          .flatMap(([subjects]) => subjects)
      ],
      Literature: [
        ...Language_Independent_Subjects,
        ...Secondary_Shared_Subjects,
        "Psychology", "Sociology", "Statistics", "Economics", "Philosophy"
      ]
    }
  }),

  Bachelor: Object.freeze({
    "Primary 1": Primary_Shared_Subjects,
    "Primary 2": Primary_Shared_Subjects,
    "Primary 3": Primary_Shared_Subjects,
    "Primary 4": Primary_Shared_Subjects,
    "Primary 5": Primary_Shared_Subjects,
    "Primary 6": Primary_Shared_Subjects,
    "Middle 1": Middle_Shared_Subjects,
    "Middle 2": Middle_Shared_Subjects,
    "Middle 3": Middle_Shared_Subjects,
    "Secondary 1": [
      "Religion",
      "Arabic",
      "English",
      "Mathematics",
      "Integrated Sciences",
      "Philosophy and Logic",
      "Egyptian History",
      "French",
      "Programming & Computer Science"
    ],
    "Secondary 2": {
      Scientific_Medicine: [
        "Arabic",
        "English",
        "Egyptian History",
        "Mathematics",
        "Physics"
      ],
      Scientific_Engineering: [
        "Arabic",
        "English",
        "Egyptian History",
        "Chemistry",
        "Programming & Computer Science"
      ],
      Literary_Business: [
        "Arabic",
        "English",
        "Egyptian History",
        "Accounting",
        "Business Administration"
      ],
      Literary_Arts: [
        "Arabic",
        "English",
        "Egyptian History",
        "Psychology",
        "French"
      ]
    },
    "Secondary 3": {
      Scientific_Medicine: [
        "Religion",
        "Biology (Advanced)",
        "Chemistry (Advanced)"
      ],
      Scientific_Engineering: [
        "Religion",
        "Mathematics (Advanced)",
        "Physics (Advanced)"
      ],
      Literary_Arts: [
        "Religion",
        "Geography (Advanced)",
        "Statistics"
      ],
      Literary_Business: [
        "Religion",
        "Economics (Advanced)",
        "Mathematics"
      ]
    }
  }),

  "Al-Azhar": Object.freeze({
    "Primary 1": [...Primary_Shared_Subjects, "Quran", "Tawheed", "Fiqh", "Hadith", "Seera"],
    "Primary 2": [...Primary_Shared_Subjects, "Quran", "Tawheed", "Fiqh", "Hadith", "Seera"],
    "Primary 3": [...Primary_Shared_Subjects, "Quran", "Tawheed", "Fiqh", "Hadith", "Seera"],
    "Primary 4": [...Primary_Shared_Subjects, "Quran", "Tawheed", "Fiqh", "Hadith", "Seera"],
    "Primary 5": [...Primary_Shared_Subjects, "Quran", "Tawheed", "Fiqh", "Hadith", "Seera"],
    "Primary 6": [...Primary_Shared_Subjects, "Quran", "Tawheed", "Fiqh", "Hadith", "Seera"],
    "Middle 1": [...Middle_Shared_Subjects, "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences"],
    "Middle 2": [...Middle_Shared_Subjects, "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences"],
    "Middle 3": [...Middle_Shared_Subjects, "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences"],
    "Secondary 1": [
      "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences",
      "Arabic", "English", "Mathematics", "Physics", "Chemistry", "Biology",
      "History", "Geography", "Psychology", "Logic"
    ],
    "Secondary 2": {
      "Scientific": [
        "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences",
        "Physics", "Chemistry", "Biology", "Mathematics"
      ],
      "Literary": [
        "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences",
        "History", "Geography", "Psychology", "Sociology", "Economics"
      ],
      "Islamic_Studies": [
        "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences",
        "Logic"
      ]
    },
    "Secondary 3": {
      "Scientific": [
        "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences",
        "Physics", "Chemistry", "Biology", "Mathematics"
      ],
      "Literary": [
        "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences",
        "History", "Geography", "Psychology", "Sociology", "Economics"
      ],
      "Islamic_Studies": [
        "Quran", "Tafseer", "Hadith", "Fiqh", "Tawheed", "Seera", "Arabic Sciences",
        "Logic"
      ]
    }
  }),
  "IGCSE": Object.freeze({
    "Grade 9": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "French", "German", "Spanish"],
    "Grade 10": ["Mathematics", "English", "Physics", "Chemistry", "Biology", "History", "Geography", "French", "German", "Spanish"],
    "AS-Level": ["Physics", "Chemistry", "Biology", "Mathematics", "Economics", "Business Studies", "Accounting", "English Literature", "French", "German"],
    "A-Level": ["Physics", "Chemistry", "Biology", "Mathematics", "Economics", "Business Studies", "Accounting", "English Literature", "French", "German"]
  }),
  "American_Diploma": Object.freeze({
    "Grade 9": ["Algebra", "Geometry", "English Language Arts", "US History", "Biology", "French", "Spanish"],
    "Grade 10": ["Algebra II", "English Language Arts", "World History", "Chemistry", "French", "Spanish", "German"],
    "Grade 11": ["Pre-Calculus", "Physics", "US Government", "Economics", "French", "Spanish", "German", "Italian"],
    "Grade 12": ["Calculus", "Advanced Placement (AP) Subjects", "SAT/ACT Prep", "French", "Spanish", "German", "Electives"]
  })
});

export const Governates = Object.freeze([
  "Alexandria", "Assiut", "Aswan", "Beheira", "Bani Suef", "Cairo", "Daqahliya", "Damietta",
  "Fayyoum", "Gharbiya", "Giza", "Helwan", "Ismailia", "Kafr El Sheikh", "Luxor", "Marsa Matrouh",
  "Minya", "Monofiya", "New Valley", "North Sinai", "Port Said", "Qalioubiya", "Qena", "Red Sea",
  "Sharqiya", "Sohag", "South Sinai", "Suez", "Tanta"
]);

export const Districts = Object.freeze({
  "Alexandria": [
    "Miami", "Sidi Bishr", "Sidi Gaber", "Smouha", "Mansheya", "El Raml", "El Labban", "Kafr Abdo",
    "Gleem", "Stanley", "San Stefano", "Victoria", "Bolkly", "Camp Caesar", "Mandara", "Montaza",
    "Al Montazah", "Al Raml", "Al Gomrok", "Al Amreya", "Al Dekheila", "Borg El Arab"
  ],
  "Cairo": [
    "Nasr City", "Zahraa Nasr City", "El Ahly Club Street", "Makram Ebeid", "Abbas El Akkad",
    "Mustafa El Nahas", "Hay El Asher", "Maadi", "Old Maadi", "Degla", "Saray El Maadi",
    "Zahraa El Maadi", "New Maadi", "Heliopolis", "Korba", "Roxy", "El-Maza", "Thawra",
    "Masaken Sheraton", "Zamalek", "26th of July Street", "Brazil Street", "Abu El Feda Street",
    "Downtown Cairo", "Tahrir Square", "Garden City", "Kasr El Nil", "Shoubra", "Shoubra El Kheima",
    "Shoubra Masr", "Old Cairo", "Fustat", "Coptic Cairo", "Sayyidah Zaynab", "El Khalifa",
    "El Marg", "Dar El-Salam", "New Cairo City", "New Administrative Capital", "El Shorouk City",
    "Obour City"
  ],
  "Giza": [
    "Giza City", "Dokki", "Mohandessin", "Agouza", "Imbaba", "Haram", "Faisal", "Boulak Al Dakrour",
    "El Omraniya", "Kerdasa", "El Ayyat", "El Badrasheen", "El Wahat Road", "6 October City",
    "Sheikh Zayed City", "Al Wahat"
  ],
  "Ismailia": [
    "El-Sheikh Zayed", "Ard Elgamiaat", "Elkhamsaa", "Elsabaa", "El-Tal El-Kebir", "El-Taawan",
    "El-Qantara Sharq", "El-Qantara Gharb", "Abu Suwir", "Fayed"
  ],
  "Port Said": [
    "El Manakh", "El Arab", "El Dawahi", "El Sharq", "El Gharb", "El Zohour", "El Hayouth",
    "Port Said City", "Port Fouad"
  ],
  "Suez": [
    "Suez City", "Arbaeen", "Faisal", "Ganayen", "Attaka", "Ain Sokhna"
  ],
  "Luxor": [
    "Luxor City", "El Karnak", "El Bayadieh", "El Zenyka", "El Tod", "El Mansheya", "Qurna",
    "Armant", "Esna", "Thebes (Tiba)"
  ],
  "Aswan": [
    "Aswan City", "Elephantine", "Kom Ombo", "Nasr El Nuba", "Sahal", "Edfu", "Daraw"
  ],
  "Assiut": [
    "Assiut City", "Dayrout", "Manfalut", "El Qusiya", "Abnoub", "Abu Tig", "El Fath", "El Badari",
    "New Asyut"
  ],
  "Beheira": [
    "Damanhur", "Kafr El Dawwar", "Rashid", "Edko", "Abu El Matamir"
  ],
  "Bani Suef": [
    "Bani Suef City", "El Wasta", "Nasser", "Ehnasia", "New Fayoum", "Al Fashn", "Beba"
  ],
  "Daqahliya": [
    "Mansoura", "Mit Ghamr", "Aga", "El Senbellawein", "Talkha", "Dikirnis", "Manzala"
  ],
  "Damietta": [
    "Damietta City", "Ras El Bar", "Faraskour", "Kafr Saad", "Zarqa", "New Damietta"
  ],
  "Fayyoum": [
    "Fayyoum City", "Tamiya", "Sinnuris", "Ibsheway", "Yousef El Seddik"
  ],
  "Gharbiya": [
    "Tanta", "El Mahalla El Kubra", "Kafr El Zayat", "Zefta", "Basyoun"
  ],
  "Kafr El Sheikh": [
    "Kafr El Sheikh City", "Desouk", "Bila", "Sidi Salim", "El Hamool"
  ],
  "Minya": [
    "Minya City", "Malawi", "Deir Mawas", "Maghagha", "Beni Mazar"
  ],
  "Monofiya": [
    "Shebin El Kom", "Menouf", "Sadat City", "Tala", "Ashmoun", "Quesna"
  ],
  "Qalioubiya": [
    "Banha", "Qalyub", "Shibin El Qanater", "El Khanka", "Toukh", "Shoubra El-Kheima"
  ],
  "Qena": [
    "Qena City", "Dishna", "Naqada", "Qus", "Abu Tesht", "Farshout"
  ],
  "Sharqiya": [
    "Zagazig", "10th of Ramadan City", "Minya El Qamh", "Belbeis", "Abu Hammad", "Faqous"
  ],
  "Sohag": [
    "Sohag City", "Akhmim", "El Maragha", "Tahta", "Juhayna", "Gerga"
  ],
  "South Sinai": [
    "El Tor", "Sharm El Sheikh", "Dahab", "Nuweiba", "Saint Catherine"
  ],
  "North Sinai": [
    "El Arish", "Sheikh Zuweid", "Rafah", "Bir El Abd", "Nakhl"
  ],
  "New Valley": [
    "El Kharga", "Dakhla", "Farafra", "Baris", "Mut"
  ],
  "Red Sea": [
    "Hurghada", "El Gouna", "Safaga", "Marsa Alam", "Shalateen"
  ],
  "Marsa Matrouh": [
    "Marsa Matrouh City", "El Alamein", "El Dabaa", "Sidi Barrani", "Siwa Oasis"
  ],
  "Helwan": ["Helwan City", "Ain Helwan", "15 May"],
  "Tanta": ["Tanta City", "El-Mahalla El-Kubra", "Zefta", "Kafr El Zayat"]
});