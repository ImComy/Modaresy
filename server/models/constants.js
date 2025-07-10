export const User_Types = Object.freeze(["Teacher", "Student"]);

export const weekDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export const PaymentTimings = Object.freeze([
  "Prepaid",
  "Postpaid"
]);

export const PricePeriod = Object.freeze([
  "Session",
  "Month"
]);

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
    }),
    languages: ["Arabic", "English"]
  },

  Azhar: {
    grades: Object.freeze(["Secondary 1", "Secondary 2", "Secondary 3"]),
    sectors: Object.freeze({
      "Secondary 1": ["General"],
      "Secondary 2": ["Scientific", "Literature"],
      "Secondary 3": ["Mathematics", "Scientific", "Literature"]
    }),
    langauges: ["Arabic"]
  }
});
export const Languages = ["Arabic", "English", "French", "German", "General"]

const Secondary_Shared_Subjects = ["German", "French", "Religion", "Arabic", "English"];

export const SubjectsBySystem = Object.freeze({
  National: Object.freeze({
    "Secondary 1": ["History", "Math", "Integrated Sciences", "Philosophy and Logic", ...Secondary_Shared_Subjects],
    "Secondary 2": {
      Scientific: ["Physics", "Chemistry", "Biology", "Math", ...Secondary_Shared_Subjects],
      Literature: ["History", "Geography", "Psychology", "Math", ...Secondary_Shared_Subjects]
    },
    "Secondary 3": {
      Mathematics: ["Math", "Physics", "Chemistry", ...Secondary_Shared_Subjects],
      Scientific: ["Physics", "Chemistry", "Biology", ...Secondary_Shared_Subjects],
      Literature: ["History", "Geography", "Statistics", ...Secondary_Shared_Subjects]
    }
  })
});

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
