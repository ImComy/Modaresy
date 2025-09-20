export const userTypes = Object.freeze(["Student", "Teacher"]);

export const weekDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const PaymentTimings = Object.freeze(["Prepaid", "Postpaid"]);

export const PricePeriod = Object.freeze(["Session", "Month"]);

export const PaymentMethods = Object.freeze([
  "Cash", "Vodafone Cash", "Etisalat Cash", "Orange Money", "Bank Transfer",
  "Meeza", "Instapay", "ValU", "Credit Card", "Fawry"
]);

export const Education_Systems = Object.freeze(["National"]);

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
  }
});

export const Languages = ["Arabic", "English", "French", "German", "General"];

// Shared subject groups
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
    // Primary
    "Primary 1": [...Primary_Shared_Subjects, ...Language_Independent_Subjects],
    "Primary 2": [...Primary_Shared_Subjects, ...Language_Independent_Subjects],
    "Primary 3": [...Primary_Shared_Subjects, ...Language_Independent_Subjects],
    "Primary 4": [...Primary_Shared_Subjects, ...Language_Independent_Subjects],
    "Primary 5": [...Primary_Shared_Subjects, ...Language_Independent_Subjects],
    "Primary 6": [...Primary_Shared_Subjects, ...Language_Independent_Subjects],

    // Middle
    "Middle 1": [...Middle_Shared_Subjects, ...Language_Independent_Subjects],
    "Middle 2": [...Middle_Shared_Subjects, ...Language_Independent_Subjects],
    "Middle 3": [...Middle_Shared_Subjects, ...Language_Independent_Subjects],

    // Secondary 1
    "Secondary 1": [
      ...Language_Independent_Subjects,
      "Integrated Sciences", "Philosophy and Logic", "Mathematics",
      ...Secondary_Shared_Subjects
    ],

    // Secondary 2
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

    // Secondary 3
    "Secondary 3": {
      Mathematics: [
        ...Secondary_Shared_Subjects,
        ...Array.from(SubjectGroupsToSectorsMap.entries())
          .filter(([_, sectors]) => sectors.includes("Mathematics"))
          .flatMap(([subjects]) => subjects)
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
  })
});

// Regions
export const Governates = Object.freeze([
  "Alexandria", "Assiut", "Aswan", "Beheira", "Bani Suef", "Cairo", "Daqahliya", "Damietta",
  "Fayyoum", "Gharbiya", "Giza", "Helwan", "Ismailia", "Kafr El Sheikh", "Luxor", "Marsa Matrouh",
  "Minya", "Monofiya", "New Valley", "North Sinai", "Port Said", "Qalioubiya", "Qena", "Red Sea",
  "Sharqiya", "Sohag", "South Sinai", "Suez", "Tanta"
]);

export const Districts = Object.freeze({
  "Alexandria": ["Miami", "Sidi Gaber", "Smouha", "Mansheya", "El Raml", "El Labban", "Kafr Abdo", "Gleem", "Stanley", "San Stefano", "Victoria", "Bolkly", "Camp Caesar", "Mandara", "Montaza"],
  "Cairo": ["Nasr City", "Maadi", "Zamalek", "Dokki", "Heliopolis", "New Cairo", "6 October City", "El Mohandeseen", "El Rehab", "El Tagamo' El Khames", "El Shorouk", "El Marg", "El Sayeda Zeinab", "El Khalifa", "El Darb El Ahmar"],
  "Giza": ["Haram", "Faisal", "Dokki", "Agouza", "Imbaba", "El Omraniya", "El Wahat Road", "6 October", "Sheikh Zayed", "Boulak Al Dakrour", "Kerdasa", "El Ayyat", "El Badrasheen"],
  "Ismailia": ["El-shiekh zayed", "Ard Elgamiaat", "Elkhamsaa", "Elsabaa"],
  "Port Said": ["El Manakh", "El Arab", "El Dawahi", "El Sharq", "El Gharb", "El Zohour", "El Hayouth"],
  "Suez": ["Arbaeen", "Faisal", "Ganayen", "Suez", "Attaka"],
  "Luxor": ["El Karnak", "El Bayadieh", "El Zenyka", "El Tod", "El Mansheya"],
  "Aswan": ["Aswan City", "Elephantine", "Kom Ombo", "Nasr City", "Sahal"],
  "Assiut": ["Assiut City", "Dayrout", "Manfalut", "El Qusiya", "Abnoub"],
  "Beheira": ["Damanhur", "Kafr El Dawwar", "Rashid", "Edko", "Abu El Matamir"],
  "Bani Suef": ["Bani Suef City", "El Wasta", "Nasser", "Ehnasia", "New Fayoum"],
  "Daqahliya": ["Mansoura", "Mit Ghamr", "Aga", "El Senbellawein", "Talkha"],
  "Damietta": ["Damietta City", "Ras El Bar", "Faraskour", "Kafr Saad", "Zarqa"],
  "Fayyoum": ["Fayoum City", "Tamiya", "Sinnuris", "Ibsheway", "Yousef El Seddik"],
  "Gharbiya": ["Tanta", "El Mahalla El Kubra", "Kafr El Zayat", "Zefta", "Basyoun"],
  "Kafr El Sheikh": ["Kafr El Sheikh City", "Desouk", "Bila", "Sidi Salim", "El Hamool"],
  "Minya": ["Minya City", "Malawi", "Deir Mawas", "Maghagha", "Beni Mazar"],
  "Monofiya": ["Shebin El Kom", "Menouf", "Sadat City", "Tala", "Ashmoun"],
  "Qalioubiya": ["Banha", "Qalyub", "Shibin El Qanater", "El Khanka", "Toukh"],
  "Qena": ["Qena City", "Dishna", "Naqada", "Qus", "Abu Tesht"],
  "Sharqiya": ["Zagazig", "10th of Ramadan City", "Minya El Qamh", "Belbeis", "Abu Hammad"],
  "Sohag": ["Sohag City", "Akhmim", "El Maragha", "Tahta", "Juhayna"],
  "South Sinai": ["El Tor", "Sharm El Sheikh", "Dahab", "Nuweiba", "Saint Catherine"],
  "North Sinai": ["El Arish", "Sheikh Zuweid", "Rafah", "Bir El Abd", "Nakhl"],
  "New Valley": ["El Kharga", "Dakhla", "Farafra", "Baris", "Mut"],
  "Red Sea": ["Hurghada", "El Gouna", "Safaga", "Marsa Alam", "Shalateen"],
  "Marsa Matrouh": ["Marsa Matrouh City", "El Alamein", "El Dabaa", "Sidi Barrani", "Siwa Oasis"]
});
