export const mockTutors = [
  {
    id: 1,
    name: "Ahmed Hassan",
    location: "Cairo",
    detailedLocation: ["Dokki, Giza", "elMansoura, Dakahlia"],
    img: "/pfp.png",
    bannerimg: "/52e7d04b4a52a814f1dc8460962e33791c3ad6e04e5074417d2d73dc934fcc_640.jpg",
    phone: "01234567890",
    isTopRated: true,
    GeneralBio: "Experienced Mathematics tutor with over 8 years of teaching high school and university students. Passionate about making complex concepts understandable and helping students build strong problem-solving skills. Proven track record of improving grades and boosting confidence. My approach focuses on identifying individual student needs and tailoring lessons accordingly. I utilize various teaching methods, including visual aids and real-world examples, to ensure comprehension and retention.",
    achievements: [
      { type: 'topRated', label: 'Top Rated', isCurrent: true },
      { type: 'monthlyTop', label: 'Top Tutor - May', isCurrent: true },
      { type: 'studentFav', label: 'Student Favorite', isCurrent: false },
    ],
    socials: {
      facebook: "https://www.facebook.com/ahmed.hassan",
      instagram: "https://www.instagram.com/ahmed.hassan",
      twitter: "https://twitter.com/ahmed_hassan",
      linkedin: "https://www.linkedin.com/in/ahmed-hassan",
      youtube: "https://www.youtube.com/channel/ahmed.hassan",
      tiktok: "https://www.tiktok.com",
      whatsapp: "https://wa.me/01234567890",
      telegram: "https://t.me/ahmed_hassan",
      email: "info@modaresy.com",
      website: "https://www.modaresy.com",
      github: "",
    },
    subjects: [
      {
        subject: "Mathematics",
        grade: "11",
        type: "General - scientific",
        bio: "Experienced Mathematics tutor with over 8 years of teaching high school and university students. Passionate about making complex concepts understandable and helping students build strong problem-solving skills. Proven track record of improving grades and boosting confidence. My approach focuses on identifying individual student needs and tailoring lessons accordingly. I utilize various teaching methods, including visual aids and real-world examples, to ensure comprehension and retention.",
        duration: 60,
        lecturesPerWeek: 2,
        yearsExp: 8,
        price: 100,
        rating: 4.8,
        private:{
          price: 800,
          note: "Private lessons available for EGP 800 per hour. Flexible scheduling to accommodate student needs.",
        },
        offer: {
          percentage: 20,
          from: "2025-01-01",
          to: "2025-06-30",
          description: "20% off for new students until June 30, 2025",
          for: "private",
        },
        Groups: [
            {
                groupName: "Group A",
                days: ["Monday", "Wednesday"],
                time: "5:00 PM - 6:30 PM",
                isFull: false,
                note: "Available for new students",
            },
            {
                groupName: "Group B",
                days: ["Saturday"],
                time: "2:00 PM - 3:30 PM",
                isFull: true,
            }
        ],
        introVideoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
        otherVideos: [
        { id: 'v1a', title: "Solving Quadratic Equations", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
        { id: 'v1b', title: "Introduction to Calculus", url: "https://www.youtube.com/embed/tgbNymZ7vqY" },
        ],
        comments: [
          { id: 1, user: "Student A", rating: 5, text: "1", date: "2025-04-15" },
          { id: 2, user: "Parent B", rating: 4, text: "Very patient and explains things clearly. My son's grades improved significantly.", date: "2025-03-20" },
          { id: 3, user: "Student C", rating: 5, text: "Highly recommended! Makes math fun.", date: "2025-02-10" },
        ],
        courseContent: [
          "Algebra I & II",
          "Geometry",
          "Trigonometry",
          "Pre-Calculus",
          "Calculus I",
          "Exam Preparation (Thanaweya Amma, SAT)"
        ]
      }
    ],
  },
  {
    id: 2,
    name: "Tarek Salem",
    location: "Mansoura",
    detailedLocation: "Talkha, Mansoura",
    img: "/50e2dd414d4faa0df7c5d57bc32f3e7b1d3ac3e456587049722c7dd291_640.jpg",
    bannerimg: "/53e2d6444f5bae14f1dc8460962e33791c3ad6e04e507440742e7bd0944dc0_640.jpg",
    phone: "01234567890",
    price: 200,
    isTopRated: false,
    GeneralBio: "Passionate and experienced tutor committed to student success. Uses a tailored approach with real-world examples and interactive methods. Focuses on building confidence and understanding in students.",
    socials: {
      facebook: "https://www.facebook.com/ahmed.hassan",
      instagram: "https://www.instagram.com/ahmed.hassan",
      twitter: "https://twitter.com/ahmed_hassan",
      linkedin: "https://www.linkedin.com/in/ahmed-hassan",
      youtube: "https://www.youtube.com/channel/ahmed.hassan",
      tiktok: "https://www.tiktok.com",
    },
    subjects: [
      {
        subject: "Biology",
        grade: "12",
        type: "General - scientific",
        bio: "Passionate and experienced tutor committed to student success. Uses a tailored approach with real-world examples and interactive methods.",
        duration: 60,
        lecturesPerWeek: 3,
        yearsExp: 9,
        price: 200,
        offer: {
          percentage: 20,
          from: "2025-01-01",
          to: "2025-06-30",
          description: "20% off for new students until June 30, 2025",
          for: "group",
        },
        rating: 3.8,
        Groups: [
          {
            groupName: "Group A",
            days: ["Monday", "Wednesday"],
            time: "4:00 PM - 5:30 PM",
            isFull: false,
            note: "Available for new students",
          },
          {
            groupName: "Group B",
            days: ["Saturday"],
            time: "2:00 PM - 3:30 PM",
            isFull: true,
          }
        ],
        introVideoUrl: "https://www.youtube.com/watch?v=sample",
        otherVideos: [
          { id: "v5a", title: "Lecture Sample A", url: "https://www.youtube.com/watch?v=example3" },
          { id: "v9b", title: "Lecture Sample B", url: "https://www.youtube.com/watch?v=example4" }
        ],
        comments: [
          { id: 1, user: "Student A", rating: 5, text: "1", date: "2025-04-15" },
          { id: 2, user: "Parent B", rating: 4, text: "Very patient and explains things clearly. My son's grades improved significantly.", date: "2025-03-20" },
          { id: 3, user: "Student C", rating: 5, text: "Highly recommended! Makes math fun.", date: "2025-02-10" },
        ],
        courseContent: ["Cell Biology", "Genetics", "Ecology", "Human Biology"]
      },
      {
        subject: "English",
        grade: "5",
        type: "Language",
        bio: "Passionate and experienced tutor committed to student success. Uses a tailored approach with real-world examples and interactive methods.",
        duration: 60,
        lecturesPerWeek: 2,
        yearsExp: 4,
        price: 150,
        rating: 1.8,
        offer: {
          percentage: 20,
          from: "2025-01-01",
          to: "2025-06-30",
        },
        Groups: [
          {
            groupName: "Group A",
            days: ["Monday", "Wednesday"],
            time: "4:00 PM - 5:30 PM",
            isFull: false,
            note: "Available for new students",
          },
          {
            groupName: "Group B",
            days: ["Sunday", "Mondaay"],
            time: "2:00 PM - 3:30 PM",
            isFull: true,
          }
        ],
        introVideoUrl: "https://www.youtube.com/watch?v=sample",
        otherVideos: [
          { id: "v4a", title: "Lecture Sample A", url: "https://www.youtube.com/watch?v=example3" },
          { id: "v8b", title: "Lecture Sample B", url: "https://www.youtube.com/watch?v=example4" }
        ],
        comments: [
          { id: 1, user: "Student A", rating: 5, text: "2", date: "2025-04-15" },
          { id: 2, user: "Parent B", rating: 4, text: "Very patient and explains things clearly. My son's grades improved significantly.", date: "2025-03-20" },
          { id: 3, user: "Student C", rating: 5, text: "Highly recommended! Makes math fun.", date: "2025-02-10" },
        ],
        courseContent: ["Grammar", "Reading Comprehension", "Writing", "Vocabulary"]
      }
    ]
  },
  {
    id: 3,
    name: "Sara Adel",
    location: "Giza",
    detailedLocation: "Mohandessin, Giza",
    img: "/54e5d6454c54ae14f1dc8460962e33791c3ad6e04e50744077297bd69148c4_640.jpg",
    bannerimg: "/54e8d2424c56ad14f1dc8460962e33791c3ad6e04e507441722978d6904ac0_640.jpg",
    phone: "01234567890",
    price: 200,
    isTopRated: false,
    GeneralBio: "Passionate and experienced tutor committed to student success. Uses a tailored approach with real-world examples and interactive methods. Focuses on building confidence and understanding in students.",
    subjects: [
      {
        subject: "Mathematics",
        grade: "11",
        type: "General - scientific",
        bio: "Passionate and experienced tutor committed to student success. Uses a tailored approach with real-world examples and interactive methods.",
        duration: 60,
        lecturesPerWeek: 2,
        yearsExp: 7,
        price: 150,
        rating: 3.2,
        Groups: [
          {
            groupName: "Group A",
            days: ["Monday", "Wednesday"],
            time: "4:00 PM - 5:30 PM",
            isFull: false,
            note: "Available for new students",
          },
          {
            groupName: "Group B",
            days: ["Saturday"],
            time: "2:00 PM - 3:30 PM",
            isFull: true,
          }
        ],
        introVideoUrl: "https://www.youtube.com/watch?v=sample",
        otherVideos: [
          { id: "v7a", title: "Lecture Sample A", url: "https://www.youtube.com/watch?v=example3" },
          { id: "v6b", title: "Lecture Sample B", url: "https://www.youtube.com/watch?v=example4" }
        ],
        comments: [
          { id: 1, user: "Student A", rating: 5, text: "Amazing tutor! Helped me understand calculus like never before.", date: "2025-04-15" },
          { id: 2, user: "Parent B", rating: 4, text: "Very patient and explains things clearly. My son's grades improved significantly.", date: "2025-03-20" },
          { id: 3, user: "Student C", rating: 5, text: "Highly recommended! Makes math fun.", date: "2025-02-10" },
        ],
        courseContent: ["Algebra", "Geometry", "Trigonometry", "Calculus"]
      },
      {
        subject: "Chemistry",
        grade: "11",
        type: "General - scientific",
        bio: "Passionate and experienced tutor committed to student success. Uses a tailored approach with real-world examples and interactive methods.",
        duration: 60,
        lecturesPerWeek: 2,
        yearsExp: 6,
        price: 200,
        rating: 1.8,
        Groups: [
          {
            groupName: "Group A",
            days: ["Monday", "Wednesday"],
            time: "4:00 PM - 5:30 PM",
            isFull: false,
            note: "Available for new students",
          },
          {
            groupName: "Group B",
            days: ["Saturday"],
            time: "2:00 PM - 3:30 PM",
            isFull: false,
          }
        ],
        introVideoUrl: "https://www.youtube.com/watch?v=sample",
        otherVideos: [
          { id: "v6a", title: "Lecture Sample A", url: "https://www.youtube.com/watch?v=example3" },
          { id: "v2b", title: "Lecture Sample B", url: "https://www.youtube.com/watch?v=example4" }
        ],
       comments: [
          { id: 1, user: "Student A", rating: 5, text: "Amazing tutor! Helped me understand calculus like never before.", date: "2025-04-15" },
          { id: 2, user: "Parent B", rating: 4, text: "Very patient and explains things clearly. My son's grades improved significantly.", date: "2025-03-20" },
          { id: 3, user: "Student C", rating: 5, text: "Highly recommended! Makes math fun.", date: "2025-02-10" },
        ],
        courseContent: ["Organic Chemistry", "Inorganic Chemistry", "Physical Chemistry", "Equations"]
      }
    ]
  },
];


const allSubjects = mockTutors.map(t => t.subject);
export const uniqueSubjectsSimple = ['all', ...Array.from(new Set(allSubjects))];

const allLocations = mockTutors.map(t => t.location);
export const uniqueLocationsSimple = ['all', ...Array.from(new Set(allLocations))];
