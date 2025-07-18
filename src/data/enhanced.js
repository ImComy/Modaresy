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
    personalAvailability: {
      times: ["Saturday 4–6 PM", "Sunday 2–3 PM"],
      note: "Open to voice chat on weekends, preferably through Zoom or WhatsApp"
    },
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
        pricePeriod: 1, // Numeric ID: 1=month
        rating: 4.8,
        private: {
          price: 800,
          note: "Private lessons available for EGP 800 per hour. Flexible scheduling to accommodate student needs.",
          pricePeriod: 2 // Numeric ID: 2=session
        },
        additionalPricing: [
          {
            name: "مراجعة نهائية ليلة الامتحان",
            price: 25,
            period: 2, // Numeric ID: 2=session
            description: "Intensive review session before the exam"
          }
        ],
        offer: {
          percentage: 20,
          from: "2025-01-01",
          to: "2025-06-30",
          description: "20% off for new students until June 30, 2025",
          for: "private",
        },
        paymentTiming: true,
        paymentMethods: [1, 3, 4], // Numeric IDs: 1=Vodafone Cash, 3=Credit Card, 4=Cash
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
      },
      {
      subject: "Chemistry",
      grade: "12",
      type: "General - scientific",
      bio: "Complete Thanaweya Amma coverage with lab-focused insights and model exam walkthroughs.",
      duration: 90,
      lecturesPerWeek: 2,
      yearsExp: 14,
      price: 110,
      rating: 4.9,
      private: {
        price: 850,
        note: "Custom revision guide included for private students"
      },
      offer: {
        percentage: 20,
        from: "2025-07-01",
        to: "2025-08-15",
        description: "20% off July-August summer intensive program",
        for: "private"
      },
      Groups: [
        {
          groupName: "Chem Essentials",
          days: ["Sunday", "Wednesday"],
          time: "6:00 PM - 7:30 PM",
          isFull: false
        }
      ],
      introVideoUrl: "",
      otherVideos: [],
      comments: [],
      courseContent: [
        "Chemical Bonds",
        "Organic Chemistry",
        "Quantitative Chemistry",
        "Electrolysis & Redox",
        "Thanaweya Revision"
      ]
    },
    ],
  },
  {
    id: 2,
    name: "Tarek Salem",
    location: "Mansoura",
    detailedLocation: ["Dokki, Giza", "elMansoura, Dakahlia"],
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
  {
    id: 4,
    name: "Sara El Nabawy",
    location: "Alexandria",
    detailedLocation: ["Smouha", "San Stefano", "Miami"],
    img: "/55e3d3464a57b10ff3d8992cc12c30771037dbf85254794e7d2b7ed79545_640.jpg",
    bannerimg: "/237-536x354.jpg",
    phone: "01122334455",
    isTopRated: false,
    personalAvailability: {
      times: ["Monday 10–12 AM", "Thursday 6–8 PM", "Friday Anytime"],
      note: "Prefers teaching in the morning. Available for in-person sessions near Smouha."
    },
    GeneralBio:
      "Dedicated language tutor with over 5 years of experience helping students of all ages master English and French. My classes are interactive and focus on communication skills, cultural understanding, and building vocabulary through real-life topics and multimedia.",
    achievements: [
      { type: "monthlyTop", label: "Top Tutor - April", isCurrent: false },
      { type: "studentFav", label: "Student Favorite", isCurrent: true }
    ],
    socials: {
      facebook: "",
      instagram: "https://instagram.com/sara.language.tutor",
      twitter: "",
      linkedin: "https://linkedin.com/in/sara-el-nabawy",
      youtube: "",
      tiktok: "",
      whatsapp: "https://wa.me/01122334455",
      telegram: "",
      email: "sara.languages@modaresy.com",
      website: "",
      github: ""
    },
    subjects: [
      {
        subject: "English",
        grade: "9",
        type: "General",
        bio: "Focus on grammar, writing, and conversational fluency. Students develop confidence speaking English through structured exercises and storytelling.",
        duration: 45,
        lecturesPerWeek: 3,
        yearsExp: 5,
        price: 75,
        rating: 4.4,
        private: {
          price: 500,
          note: "Private sessions are held online with interactive games and conversation practice."
        },
        offer: {
          percentage: 10,
          from: "2025-05-01",
          to: "2025-07-15",
          description: "10% off summer intensive course",
          for: "group"
        },
        Groups: [
          {
            groupName: "Teens English Club",
            days: ["Tuesday", "Thursday"],
            time: "3:00 PM - 4:15 PM",
            isFull: false,
            note: "For students ages 13–15"
          }
        ],
        introVideoUrl: "https://www.youtube.com/embed/english_intro_sample",
        otherVideos: [
          { id: "en1", title: "Top 5 Speaking Mistakes", url: "https://www.youtube.com/embed/english_mistakes" }
        ],
        comments: [
          { id: 1, user: "Parent M", rating: 4, text: "My daughter became more confident speaking!", date: "2025-05-10" }
        ],
        courseContent: ["Grammar Practice", "Creative Writing", "Listening Skills", "Speaking Labs"]
      },
      {
        subject: "ljsadsdafasdf",
        grade: "10",
        type: "Language - General weeewerwer",
        bio: "Interactive French classes with emphasis on vocabulary, pronunciation, and listening through music and culture.",
        duration: 60,
        lecturesPerWeek: 2,
        yearsExp: 4,
        price: 90,
        rating: 4.2,
        private: {
          price: 550,
          note: "Includes printable worksheets and audio exercises."
        },
        offer: null,
        Groups: [],
        introVideoUrl: "https://www.youtube.com/embed/french_intro_sample",
        otherVideos: [],
        comments: [],
        courseContent: ["Basic Grammar", "Conversational French", "French Cinema & Songs"]
      },
      {
        subject: "Arabic Literature",
        grade: "12",
        type: "Thanaweya Amma",
        bio: "In-depth analysis of modern and classical Arabic texts. Ideal for students preparing for national exams.",
        duration: 90,
        lecturesPerWeek: 1,
        yearsExp: 6,
        price: 120,
        rating: 4.9,
        private: {
          price: 900,
          note: "Crash courses available before exams."
        },
        offer: {
          percentage: 15,
          from: "2025-06-01",
          to: "2025-07-01",
          description: "Thanaweya Crash Discount",
          for: "private"
        },
        Groups: [
          {
            groupName: "Lit Masters",
            days: ["Sunday"],
            time: "11:00 AM - 1:00 PM",
            isFull: true
          }
        ],
        introVideoUrl: "",
        otherVideos: [],
        comments: [
          { id: 1, user: "Student F", rating: 5, text: "Best teacher for Thanaweya Amma!", date: "2025-06-01" }
        ],
        courseContent: [
          "Classical Poetry Analysis",
          "Modern Prose",
          "Exam Writing Techniques"
        ]
      },
      {
        subject: "Philosophysadfasdfasdfasdfadsasdf",
        grade: "12",
        type: "Thanaweya Amma",
        bio: "Stimulates critical thinking through Socratic discussion and real-life ethics. Simplified exam strategies included.",
        duration: 60,
        lecturesPerWeek: 2,
        yearsExp: 3,
        price: 110,
        rating: 4.7,
        private: {
          price: 850,
          note: "Free intro session for new students."
        },
        offer: null,
        Groups: [],
        introVideoUrl: "",
        otherVideos: [],
        comments: [],
        courseContent: ["Ethics", "Logic", "Eastern vs Western Thought", "Thanaweya Essay Structure"]
      },
      {
        subject: "IELTS Preparation",
        grade: "Any",
        type: "General",
        bio: "Specialized training for IELTS Academic and General. Covers Reading, Writing, Listening, and Speaking.",
        duration: 75,
        lecturesPerWeek: 2,
        yearsExp: 5,
        price: 250,
        rating: 4.6,
        private: {
          price: 1000,
          note: "Mock tests every two weeks. Tailored strategy per student."
        },
        offer: {
          percentage: 25,
          from: "2025-06-01",
          to: "2025-08-31",
          description: "Summer IELTS Bootcamp Offer",
          for: "private"
        },
        Groups: [
          {
            groupName: "IELTS Express",
            days: ["Wednesday", "Friday"],
            time: "7:00 PM - 8:30 PM",
            isFull: false
          }
        ],
        introVideoUrl: "",
        otherVideos: [],
        comments: [],
        courseContent: [
          "Writing Task 1 & 2",
          "Speaking Strategy",
          "Listening Tactics",
          "Reading Skim/Scan"
        ]
      }
    ]
  },
  {
  id: 5,
  name: "Mohamed Tarek",
  location: "Mansoura",
  detailedLocation: ["Talkha", "El Gomhoria Street", "El Shinnawy"],
  img: "/866-536x354.jpg",
  bannerimg: "/1060-536x354-blur_2.jpg",
  phone: "01099887766",
  isTopRated: true,
  personalAvailability: {
    times: ["Tuesday 3–5 PM", "Thursday 12–2 PM", "Saturday 9–11 AM"],
    note: "Available for online and in-person sessions. Prefers Google Meet."
  },
  GeneralBio:
    "Tech-savvy tutor with 6+ years of experience in computer science and software engineering education. I specialize in simplifying complex coding topics for high school and university students, with a hands-on approach and project-based learning. I'm also a certified Java instructor.",
  achievements: [
    { type: "certified", label: "Oracle Certified Java Trainer", isCurrent: true },
    { type: "studentFav", label: "Student Favorite", isCurrent: true },
    { type: "topRated", label: "Top Rated", isCurrent: true }
  ],
  socials: {
    facebook: "https://facebook.com/mohamed.tarek",
    instagram: "https://instagram.com/mohamed.codes",
    twitter: "https://twitter.com/mtarek_dev",
    linkedin: "https://linkedin.com/in/mohamedtarek",
    youtube: "https://youtube.com/@mohamed-coding",
    tiktok: "",
    whatsapp: "https://wa.me/01099887766",
    telegram: "https://t.me/mohamed_codes",
    email: "mohamed@modaresy.com",
    website: "https://mohamedtarek.dev",
    github: "https://github.com/mohamed-tarek"
  },
  subjects: [
    {
      subject: "Computer Science",
      grade: "University",
      type: "Engineering",
      bio: "Teaching data structures, algorithms, and software design patterns using Java and Python.",
      duration: 90,
      lecturesPerWeek: 3,
      yearsExp: 6,
      price: 150,
      rating: 4.9,
      private: {
        price: 1000,
        note: "Private mentorship available for software projects and portfolio reviews."
      },
      offer: {
        percentage: 25,
        from: "2025-04-01",
        to: "2025-08-31",
        description: "Spring offer for computer science mentoring!",
        for: "private"
      },
      Groups: [
        {
          groupName: "CS Advanced",
          days: ["Monday", "Wednesday"],
          time: "6:00 PM - 8:00 PM",
          isFull: false
        }
      ],
      introVideoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      otherVideos: [
        { id: "cs1", title: "Intro to Java", url: "https://www.youtube.com/embed/1aXZQcG2YAg" },
        { id: "cs2", title: "Binary Trees Explained", url: "https://www.youtube.com/embed/sIbTKN0sKx8" }
      ],
      comments: [
        { id: 1, user: "Student Y", rating: 5, text: "Very knowledgeable and easy to follow!", date: "2025-03-02" },
        { id: 2, user: "Student Z", rating: 4, text: "I passed my final thanks to him.", date: "2025-04-15" }
      ],
      courseContent: [
        "Java Fundamentals",
        "Object-Oriented Programming",
        "Data Structures",
        "Algorithms",
        "Software Engineering Principles"
      ]
    },
    {
      subject: "Mathematics",
      grade: "10",
      type: "General - scientific",
      bio: "Focused on high school level geometry and algebra. Fun and intuitive teaching methods.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 4,
      price: 80,
      rating: 4.6,
      
      private: {
        price: 600,
        note: "Private sessions include personalized worksheets."
      },
      offer: null,
      Groups: [
        {
          groupName: "Math Boosters",
          days: ["Sunday"],
          time: "10:00 AM - 12:00 PM",
          isFull: true
        }
      ],
      introVideoUrl: "https://www.youtube.com/embed/kqtD5dpn9C8",
      otherVideos: [],
      comments: [],
      courseContent: [
        "Algebra Basics",
        "Geometry and Proofs",
        "Exam Strategy"
      ]
    },
    {
      subject: "Physics",
      grade: "11",
      type: "General - scientific",
      bio: "Physics explained through real-life applications and simulations.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 3,
      price: 100,
      rating: 4.4,
      private: null,
      offer: null,
      Groups: [],
      introVideoUrl: "",
      otherVideos: [],
      comments: [],
      courseContent: ["Mechanics", "Kinematics", "Electricity", "Magnetism"]
    },
    {
      subject: "Web Development",
      grade: "Any",
      type: "Career Track",
      bio: "Learn modern full-stack web development with real-world projects using React, Node.js, and MongoDB.",
      duration: 120,
      lecturesPerWeek: 2,
      yearsExp: 5,
      price: 200,
      rating: 5,
      private: {
        price: 1200,
        note: "Includes portfolio mentorship and CV review."
      },
      offer: {
        percentage: 15,
        from: "2025-06-01",
        to: "2025-07-30",
        description: "Summer discount for career changers",
        for: "private"
      },
      Groups: [
        {
          groupName: "Web Dev Bootcamp",
          days: ["Saturday"],
          time: "1:00 PM - 3:30 PM",
          isFull: false,
          note: "Live coding sessions every week"
        }
      ],
      introVideoUrl: "https://www.youtube.com/embed/FZb_mqI0EBM",
      otherVideos: [
        { id: "web1", title: "React Hooks Overview", url: "https://www.youtube.com/embed/lPWg2rO1j6U" }
      ],
      comments: [
        { id: 1, user: "Dev Intern", rating: 5, text: "Amazing insights and great real-world examples!", date: "2025-05-10" }
      ],
      courseContent: [
        "HTML/CSS Basics",
        "JavaScript & ES6",
        "React Fundamentals",
        "Node.js & Express",
        "MongoDB Integration",
        "Deploying with Vercel"
      ]
    }
  ]
},
{
  id: 6,
  name: "Mohamed Reda",
  location: "6th of October City",
  detailedLocation: ["El Motamayez District", "El Hosary", "Sheikh Zayed"],
  img: "/1084-536x354-grayscale.jpg",
  bannerimg: "/monkey-4788328_640.jpg",
  phone: "01090112233",
  isTopRated: true,
  personalAvailability: {
    times: ["Sunday 5–7 PM", "Tuesday 6–8 PM", "Thursday 3–5 PM"],
    note: "I work with secondary school students online and in person. My focus is exam prep, past paper mastery, and confidence building."
  },
  GeneralBio:
    "I’m a certified secondary-level Physics and Math teacher with over 12 years of experience preparing students for Thanaweya Amma and IGCSE exams. I emphasize concept mastery through real-life applications, concise notes, and exam hacks that save time and boost scores.",
  achievements: [
    { type: "topRated", label: "Top Rated Physics Teacher", isCurrent: true },
    { type: "monthlyTop", label: "Top Tutor - April", isCurrent: false }
  ],
  socials: {
    facebook: "https://facebook.com/mohamed.reda.physics",
    instagram: "https://instagram.com/reda_tutoring",
    twitter: "",
    linkedin: "https://linkedin.com/in/mohamed-reda",
    youtube: "https://youtube.com/@reda-explains",
    tiktok: "",
    whatsapp: "https://wa.me/01090112233",
    telegram: "",
    email: "reda@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "Physics",
      grade: "12",
      type: "General - scientific",
      bio: "Mastering all Thanaweya Amma Physics units with a focus on diagrams, derivations, and MCQ strategies.",
      duration: 90,
      lecturesPerWeek: 2,
      yearsExp: 12,
      price: 120,
      rating: 4.9,
      private: {
        price: 900,
        note: "One-on-one sessions focus on weak areas and mock exam walkthroughs."
      },
      offer: {
        percentage: 15,
        from: "2025-06-10",
        to: "2025-07-15",
        description: "15% off for private Physics summer crash course.",
        for: "private"
      },
      Groups: [
        {
          groupName: "Physics Top Achievers",
          days: ["Sunday", "Wednesday"],
          time: "5:00 PM - 6:30 PM",
          isFull: false,
          note: "Open for Thanaweya students only"
        }
      ],
      introVideoUrl: "https://www.youtube.com/embed/xz8jhc9qP84",
      otherVideos: [
        { id: "ph101", title: "Electric Circuits Explained", url: "https://www.youtube.com/embed/NiLIeUKQ3Gg" },
        { id: "ph102", title: "Final Exam Tricks", url: "https://www.youtube.com/embed/fJzRzr0BOZ4" }
      ],
      comments: [
        { id: 1, user: "Student Y", rating: 5, text: "Clear and concise. My grades jumped!", date: "2025-04-15" },
        { id: 2, user: "Student Z", rating: 5, text: "Physics used to scare me. Now I enjoy solving problems.", date: "2025-05-01" }
      ],
      courseContent: [
        "Units & Measurements",
        "Motion & Forces",
        "Electricity & Circuits",
        "Optics & Waves",
        "Revision & Model Exams"
      ]
    },
    {
      subject: "Mathematics",
      grade: "12",
      type: "General - scientific",
      bio: "Covering Pure Math and Applied Math for Thanaweya Amma with problem-based learning.",
      duration: 90,
      lecturesPerWeek: 2,
      yearsExp: 10,
      price: 110,
      rating: 4.8,
      private: {
        price: 850,
        note: "Includes past paper bundles and strategy sheets."
      },
      offer: null,
      Groups: [],
      introVideoUrl: "",
      otherVideos: [],
      comments: [],
      courseContent: [
        "Algebra & Trigonometry",
        "Calculus (Differentiation/Integration)",
        "Statics & Dynamics",
        "Analytical Geometry",
        "Final Exam Solving Sessions"
      ]
    },
    {
      subject: "Chemistry",
      grade: "12",
      type: "General - scientific",
      bio: "Detailed explanations of every unit, with lab visuals and memory tricks.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 8,
      price: 100,
      rating: 4.7,
      private: null,
      offer: null,
      Groups: [],
      introVideoUrl: "",
      otherVideos: [],
      comments: [],
      courseContent: [
        "Periodic Table",
        "Chemical Bonds",
        "Organic Chemistry",
        "Electrochemistry",
        "Experimental Questions"
      ]
    },
    {
      subject: "Biology",
      grade: "12",
      type: "General - scientific",
      bio: "Breaking down complex systems into understandable charts and simplified flashcards.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 9,
      price: 95,
      rating: 4.6,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Cell Biology",
        "Human Systems",
        "Genetics",
        "Plant Biology",
        "Exam Training"
      ]
    },
    {
      subject: "Math",
      grade: "10",
      type: "STEM - private national",
      bio: "Helping grade 10 students build foundations for upper secondary science track.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 5,
      price: 75,
      rating: 4.5,
      private: {
        price: 500,
        note: "Tailored for STEM-prep students"
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Quadratics",
        "Linear Graphs",
        "Geometry Basics",
        "Scientific Reasoning in Math"
      ]
    }
  ]
},
{
  id: 7,
  name: "Dina El Sherif",
  location: "Alexandria",
  detailedLocation: ["Stanley", "Sporting", "Smouha"],
  img: "/nature-2609978_640.jpg",
  bannerimg: "/woman-2320581_640.jpg",
  phone: "01111222333",
  isTopRated: false,
  personalAvailability: {
    times: ["Saturday 10–12 AM", "Monday 6–8 PM", "Wednesday 4–6 PM"],
    note: "Focus on literary subjects and essay-based exams. All sessions held via Zoom with PDF notes provided."
  },
  GeneralBio:
    "I’m a Literature and Philosophy teacher with over 9 years of experience preparing Thanaweya Amma and private national students for success in humanities subjects. My approach is analytical yet accessible—I help students build arguments, understand abstract ideas, and write excellent essays.",
  achievements: [
    { type: "studentFav", label: "Student Favorite", isCurrent: true },
    { type: "topEssay", label: "Best Essay Coach - 2024", isCurrent: false }
  ],
  socials: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    whatsapp: "https://wa.me/01111222333",
    telegram: "",
    email: "dina@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "Arabic",
      grade: "12",
      type: "General - literary",
      bio: "Covering classical texts, reading comprehension, and advanced grammar rules in preparation for Thanaweya Amma exams.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 9,
      price: 85,
      rating: 4.7,
      private: {
        price: 550,
        note: "Students receive grammar drills and reading analysis weekly."
      },
      offer: {
        percentage: 10,
        from: "2025-06-15",
        to: "2025-07-30",
        description: "Summer Arabic bootcamp discount",
        for: "private"
      },
      Groups: [],
      courseContent: [
        "Classical Poetry & Prose",
        "Modern Reading Texts",
        "Grammar & Syntax",
        "Thanaweya Practice Papers"
      ]
    },
    {
      subject: "Philosophy",
      grade: "12",
      type: "General - literary",
      bio: "Helping students explore philosophical texts, memorize arguments, and write logically structured responses.",
      duration: 75,
      lecturesPerWeek: 1,
      yearsExp: 7,
      price: 90,
      rating: 4.8,
      private: {
        price: 600,
        note: "Great for students who struggle with abstract thinking. Visual diagrams included."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Greek Philosophy",
        "Ethics & Logic",
        "Modern Thinkers",
        "Question Strategy & Analysis"
      ]
    },
    {
      subject: "Psychology",
      grade: "12",
      type: "General - literary",
      bio: "Simplifying psychological theories and sociological topics with diagrams and real-world examples.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 6,
      price: 75,
      rating: 4.6,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Freud, Piaget, Pavlov",
        "Culture & Society",
        "Behavioral Theories",
        "Thanaweya Essay Strategy"
      ]
    },
    {
      subject: "English",
      grade: "12",
      type: "General - literary",
      bio: "Focusing on literary analysis, translation, and summary writing for high school students following the Egyptian curriculum.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 10,
      price: 95,
      rating: 4.9,
      private: {
        price: 650,
        note: "Vocabulary packs, translation drills, and comprehension mock exams included."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Reading Comprehension",
        "Essay Writing",
        "Translation Practice",
        "Grammar Revision"
      ]
    },
    {
      subject: "French",
      grade: "12",
      type: "General - literary",
      bio: "Full coverage of the Thanaweya French curriculum with speaking, grammar, and past paper focus.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 8,
      price: 85,
      rating: 4.5,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Conjugations",
        "Reading & Writing",
        "French Essay Structure",
        "Thanaweya Past Papers"
      ]
    }
  ]
},
{
  id: 8,
  name: "Omar Hany",
  location: "Nasr City",
  detailedLocation: ["Abbas El Akkad", "Makram Ebeid", "El Hay El Sabea"],
  img: "/57e2d54a4253af14f1dc8460962e33791c3ad6e04e5074417d2d79d59749c0_640.jpg",
  bannerimg: "/53e5dc414d55ac14f1dc8460962e33791c3ad6e04e507749742d7cd0974dc3_640.jpg",
  phone: "01155667788",
  isTopRated: true,
  personalAvailability: {
    times: ["Tuesday 5–7 PM", "Thursday 6–8 PM", "Saturday 2–4 PM"],
    note: "Online via Zoom or Google Meet. Specialized in exam prep, MCQ drills, and concept simplification."
  },
  GeneralBio:
    "STEM-focused educator with 11+ years of experience in teaching advanced Mathematics, Physics, and SAT Math for Thanaweya Amma and international school students. My sessions are strategic, results-oriented, and filled with practical problem solving.",
  achievements: [
    { type: "topRated", label: "Top STEM Instructor", isCurrent: true },
    { type: "highScore", label: "SAT Math Success Award", isCurrent: true }
  ],
  socials: {
    facebook: "",
    instagram: "https://instagram.com/omar_tutors",
    twitter: "",
    linkedin: "https://linkedin.com/in/omarhany",
    youtube: "https://youtube.com/@mathwithomar",
    tiktok: "",
    whatsapp: "https://wa.me/01155667788",
    telegram: "",
    email: "omar@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "Math",
      grade: "12",
      type: "General - scientific",
      bio: "Full Thanaweya Amma curriculum with a focus on applied and pure math, covering common tricky questions.",
      duration: 90,
      lecturesPerWeek: 2,
      yearsExp: 11,
      price: 120,
      rating: 4.9,
      private: {
        price: 950,
        note: "Includes model answer sheets and weekly tests."
      },
      offer: null,
      Groups: [
        {
          groupName: "Final Revision",
          days: ["Tuesday", "Thursday"],
          time: "6:00 PM - 7:30 PM",
          isFull: false,
          note: "Limited seats available for July crash course"
        }
      ],
      introVideoUrl: "https://www.youtube.com/embed/dJ9y7ZwHwNo",
      otherVideos: [],
      comments: [],
      courseContent: [
        "Differentiation & Integration",
        "Trigonometry & Identities",
        "Analytical Geometry",
        "Probability & Statistics",
        "Final Mock Exams"
      ]
    },
    {
      subject: "Physics",
      grade: "12",
      type: "General - scientific",
      bio: "Visual-based conceptual teaching using simulations and exam mapping techniques.",
      duration: 90,
      lecturesPerWeek: 1,
      yearsExp: 10,
      price: 110,
      rating: 4.7,
      private: null,
      offer: {
        percentage: 10,
        from: "2025-06-20",
        to: "2025-08-01",
        description: "10% off for Thanaweya final year students",
        for: "private"
      },
      Groups: [],
      courseContent: [
        "Motion & Forces",
        "Electricity",
        "Oscillations & Waves",
        "Thermodynamics",
        "Problem Solving Techniques"
      ]
    },
    {
      subject: "SAT Math",
      grade: "11",
      type: "American - STEM",
      bio: "Step-by-step training for SAT Math with digital test format adaptation and real drills.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 7,
      price: 130,
      rating: 5,
      private: {
        price: 1000,
        note: "Includes access to my private SAT mock bank and analytics dashboard."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Heart of Algebra",
        "Problem Solving & Data",
        "Advanced Math",
        "Practice Exams with Time Strategy"
      ]
    },
    {
      subject: "Chemistry",
      grade: "12",
      type: "General - scientific",
      bio: "Covering organic and inorganic chemistry with mnemonics, lab walkthroughs, and equations practice.",
      duration: 75,
      lecturesPerWeek: 2,
      yearsExp: 9,
      price: 100,
      rating: 4.6,
      private: {
        price: 850,
        note: "Bonus: Chemistry equation summaries and memory tools"
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Structure of Matter",
        "Chemical Reactions",
        "Acids & Bases",
        "Organic Chemistry",
        "Practical Lab Interpretations"
      ]
    },
    {
      subject: "IGCSE Math",
      grade: "Year 10",
      type: "IGCSE - Core & Extended",
      bio: "Prepping students for Edexcel and Cambridge papers with topic drills and paper solving.",
      duration: 80,
      lecturesPerWeek: 1,
      yearsExp: 6,
      price: 140,
      rating: 4.8,
      private: {
        price: 1100,
        note: "Targeted for A/A* students only"
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Algebra & Indices",
        "Geometry",
        "Statistics & Probability",
        "Past Paper Solving",
        "Mock Evaluation"
      ]
    }
  ]
},
{
  id: 9,
  name: "Nourhan Khaled",
  location: "Zagazig",
  detailedLocation: ["El Kawmeya", "Al Salam District", "Zagazig University Area"],
  img: "/57e4d1474e5ba914f1dc8460962e33791c3ad6e04e5074417d2f7dd49f4ec6_640.jpg",
  bannerimg: "/53e1d2474c53a814f1dc8460962e33791c3ad6e04e50744074267bd29e45c4_640.jpg",
  phone: "01099887766",
  isTopRated: false,
  personalAvailability: {
    times: ["Monday 2–4 PM", "Wednesday 5–7 PM", "Saturday 10–12 AM"],
    note: "Sessions available on Google Meet and in-person for nearby students. Strong focus on writing and grammar improvement."
  },
  GeneralBio:
    "Language and social studies teacher with over 8 years of experience working with high school students. I specialize in essay development, translation, and literary analysis for Thanaweya Amma and prep school learners. Friendly, structured, and results-driven.",
  achievements: [
    { type: "studentFav", label: "Student Favorite", isCurrent: true }
  ],
  socials: {
    facebook: "https://facebook.com/nourhan.teaches",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    whatsapp: "https://wa.me/01099887766",
    telegram: "",
    email: "nourhan@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "English",
      grade: "12",
      type: "General - literary",
      bio: "Thanaweya Amma exam preparation with structured grammar, translation tips, and essay drills.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 8,
      price: 90,
      rating: 4.6,
      private: {
        price: 650,
        note: "Includes weekly mock exams and detailed correction."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Reading Comprehension",
        "Grammar Mastery",
        "Translation (En↔Ar)",
        "Essay Templates & Feedback"
      ]
    },
    {
      subject: "English",
      grade: "11",
      type: "General - literary",
      bio: "Foundational grammar, reading skills, and exam formats tailored to Grade 11 national curriculum.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 8,
      price: 80,
      rating: 4.5,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Tenses & Sentence Types",
        "Paragraph Writing",
        "Reading Practice",
        "Listening Tasks"
      ]
    },
    {
      subject: "Arabic",
      grade: "12",
      type: "General - literary",
      bio: "Full coverage of Thanaweya Amma Arabic with a focus on grammar rules, literary analysis, and exam practice.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 7,
      price: 85,
      rating: 4.7,
      private: {
        price: 600,
        note: "Weekly grammar drills and annotated text explanations provided."
      },
      offer: {
        percentage: 15,
        from: "2025-06-01",
        to: "2025-07-31",
        description: "15% off summer Arabic preparation",
        for: "private"
      },
      Groups: [],
      courseContent: [
        "Grammar Rules",
        "Literary Texts",
        "Translation (Ar↔En)",
        "Thanaweya Questions"
      ]
    },
    {
      subject: "History",
      grade: "12",
      type: "General - literary",
      bio: "Thanaweya-style history sessions with focus on cause-effect questions, summaries, and exam structures.",
      duration: 75,
      lecturesPerWeek: 1,
      yearsExp: 5,
      price: 70,
      rating: 4.3,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Modern Egypt History",
        "European Colonialism",
        "War & Independence",
        "Question Solving Strategies"
      ]
    },
    {
      subject: "Geography",
      grade: "12",
      type: "General - literary",
      bio: "Easy-to-remember mapping methods, labeled diagrams, and geographic theory in context of Thanaweya exam.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 5,
      price: 70,
      rating: 4.4,
      private: {
        price: 500,
        note: "Includes printable maps and short recap notes"
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Climate Zones",
        "Economic Geography",
        "Natural Resources",
        "Past Paper Practice"
      ]
    }
  ]
},
{
  id: 10,
  name: "Khaled Magdy",
  location: "Fayoum",
  detailedLocation: ["El-Gomhoreya Street", "Behind Faculty of Science", "Senoures"],
  img: "/55e6dd4b4256ae14f1dc8460962e33791c3ad6e04e507440762e79d79e44cd_640.jpg",
  bannerimg: "/54e6d4454851a814f1dc8460962e33791c3ad6e04e507440762879dc974fcd_640.jpg",
  phone: "01233445566",
  isTopRated: true,
  personalAvailability: {
    times: ["Sunday 6–8 PM", "Wednesday 4–6 PM", "Friday 12–2 PM"],
    note: "Sessions available in-person or via Microsoft Teams. I also provide printed cheat sheets for every chapter."
  },
  GeneralBio:
    "Dedicated Chemistry and Biology teacher with 14 years of classroom and tutoring experience for Thanaweya Amma and STEM school students. Known for my ability to break down tough content into clear visuals and smart mnemonics.",
  achievements: [
    { type: "topRated", label: "Top Rated", isCurrent: true },
    { type: "mentorAward", label: "Fayoum Mentor of the Year", isCurrent: false }
  ],
  socials: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "https://linkedin.com/in/khaled-magdy",
    youtube: "",
    tiktok: "",
    whatsapp: "https://wa.me/01233445566",
    telegram: "",
    email: "khaled@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "Chemistry",
      grade: "12",
      type: "General - scientific",
      bio: "Complete Thanaweya Amma coverage with lab-focused insights and model exam walkthroughs.",
      duration: 90,
      lecturesPerWeek: 2,
      yearsExp: 14,
      price: 110,
      rating: 4.9,
      private: {
        price: 850,
        note: "Custom revision guide included for private students"
      },
      offer: {
        percentage: 20,
        from: "2025-07-01",
        to: "2025-08-15",
        description: "20% off July-August summer intensive program",
        for: "private"
      },
      Groups: [
        {
          groupName: "Chem Essentials",
          days: ["Sunday", "Wednesday"],
          time: "6:00 PM - 7:30 PM",
          isFull: false
        }
      ],
      introVideoUrl: "",
      otherVideos: [],
      comments: [],
      courseContent: [
        "Chemical Bonds",
        "Organic Chemistry",
        "Quantitative Chemistry",
        "Electrolysis & Redox",
        "Thanaweya Revision"
      ]
    },
    {
      subject: "Biology",
      grade: "12",
      type: "General - scientific",
      bio: "Interactive biology explanations using labeled diagrams, flow charts, and practice quizzes.",
      duration: 75,
      lecturesPerWeek: 2,
      yearsExp: 13,
      price: 100,
      rating: 4.8,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Human Physiology",
        "Plant Biology",
        "Genetics & DNA",
        "Immunology",
        "Exam Scenario Solving"
      ]
    },
    {
      subject: "Biology",
      grade: "11",
      type: "General - scientific",
      bio: "Grade 11 foundation course for future scientific students. Focused on biological processes and memory strategies.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 13,
      price: 90,
      rating: 4.7,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Cells & Organelles",
        "Tissues & Systems",
        "Plant Transport",
        "Intro to Genetics"
      ]
    },
    {
      subject: "Science",
      grade: "9",
      type: "Preparatory - national",
      bio: "A structured overview of science basics for preparatory school students headed to scientific tracks.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 12,
      price: 70,
      rating: 4.5,
      private: {
        price: 500,
        note: "Great for students with weak science background who want to catch up."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Basic Chemistry",
        "Simple Biology",
        "Lab Safety & Tools",
        "Scientific Method"
      ]
    }
  ]
},
{
  id: 11,
  name: "Yasmine Tarek",
  location: "Tanta",
  detailedLocation: ["El Gamaa Street", "Saad Zaghloul", "Kafr Essam"],
  img: "/57e5d0424d54a814f1dc8460962e33791c3ad6e04e507440752972d29e4ec4_640.jpg",
  bannerimg: "/57e6d14a4a50ab14f1dc8460962e33791c3ad6e04e50744172277fd7904dc1_640.jpg",
  phone: "01066778899",
  isTopRated: false,
  personalAvailability: {
    times: ["Saturday 11–1 PM", "Monday 4–6 PM", "Wednesday 5–7 PM"],
    note: "Available online and in-person for girls in Tanta. I use storytelling, debates, and interactive presentations to keep students engaged."
  },
  GeneralBio:
    "I specialize in literary subjects and civic education for students in Egyptian national schools. My sessions are engaging and discussion-based, with lots of memory tools, summaries, and previous exam analysis. Over 9 years of experience helping students improve writing and critical thinking.",
  achievements: [
    { type: "impactAward", label: "Educational Impact Award - Gharbia", isCurrent: true }
  ],
  socials: {
    facebook: "https://facebook.com/yasmine.tutoring",
    instagram: "https://instagram.com/yasmine.educates",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    whatsapp: "https://wa.me/01066778899",
    telegram: "",
    email: "yasmine@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "Civic Education",
      grade: "9",
      type: "Preparatory - national",
      bio: "Teaching the basics of Egyptian law, constitution, and citizenship rights to Grade 9 students using real-life examples.",
      duration: 45,
      lecturesPerWeek: 1,
      yearsExp: 6,
      price: 60,
      rating: 4.6,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Citizenship & Responsibility",
        "Egyptian Constitution",
        "Rule of Law",
        "Human Rights Principles"
      ]
    },
    {
      subject: "History",
      grade: "11",
      type: "General - literary",
      bio: "Helping students remember historical facts through thematic summaries, flowcharts, and story-based lectures.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 9,
      price: 75,
      rating: 4.7,
      private: {
        price: 450,
        note: "Includes printed summaries, timeline charts, and exam questions after each session."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Ottoman Empire",
        "European Colonialism",
        "Modern Egypt",
        "Political Systems"
      ]
    },
    {
      subject: "Arabic",
      grade: "10",
      type: "General - literary",
      bio: "Teaching foundational Arabic grammar, reading comprehension, and expressive writing for literary track students.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 8,
      price: 70,
      rating: 4.5,
      private: {
        price: 400,
        note: "Grammar worksheets and writing templates provided weekly"
      },
      offer: {
        percentage: 10,
        from: "2025-06-25",
        to: "2025-08-15",
        description: "Back-to-school Arabic offer for Grade 10 students",
        for: "private"
      },
      Groups: [],
      courseContent: [
        "Grammar (Nahw)",
        "Reading Analysis",
        "Creative & Formal Writing",
        "Exam Format Practice"
      ]
    },
    {
      subject: "Geography",
      grade: "11",
      type: "General - literary",
      bio: "Maps, climate, economic sectors, and resource-focused topics covered with drawings, digital tools, and repetition drills.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 7,
      price: 70,
      rating: 4.6,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Egyptian Geography",
        "Agriculture & Industry",
        "Map Skills",
        "Past Paper Solving"
      ]
    }
  ]
},
{
  id: 12,
  name: "Mostafa El Beltagy",
  location: "Maadi",
  detailedLocation: ["Zahraa El Maadi", "New Maadi", "Degla"],
  img: "/55e4dc4b4e55af14f1dc8460962e33791c3ad6e04e507440752f72d69e4bc4_640.jpg",
  bannerimg: "/55e0d44b4b56a414f1dc8460962e33791c3ad6e04e5074417c2d78d2954bcd_640.jpg",
  phone: "01022334455",
  isTopRated: true,
  personalAvailability: {
    times: ["Sunday 3–5 PM", "Tuesday 6–8 PM", "Friday 11–1 PM"],
    note: "All sessions include live whiteboard teaching. Focus on exam hacks and structured worksheets."
  },
  GeneralBio:
    "Math and Physics tutor for Thanaweya Amma and STEM schools, with 15+ years of experience helping students break fear of equations. I specialize in time-saving strategies and building solid foundations with step-by-step techniques.",
  achievements: [
    { type: "topRated", label: "Top Math Instructor", isCurrent: true },
    { type: "mentorAward", label: "STEM Schools Mentor - 2023", isCurrent: false }
  ],
  socials: {
    facebook: "",
    instagram: "https://instagram.com/mostafa.math",
    twitter: "",
    linkedin: "https://linkedin.com/in/mostafabeltagy",
    youtube: "https://youtube.com/@mostafabeltagy",
    tiktok: "",
    whatsapp: "https://wa.me/01022334455",
    telegram: "",
    email: "mostafa@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "Mathematics",
      grade: "12",
      type: "General - scientific",
      bio: "Complete revision for Thanaweya Amma advanced math with focus on calculus and analytic geometry.",
      duration: 90,
      lecturesPerWeek: 2,
      yearsExp: 15,
      price: 120,
      rating: 4.9,
      private: {
        price: 950,
        note: "All private students get exam bank access and model answer notes."
      },
      offer: {
        percentage: 20,
        from: "2025-07-01",
        to: "2025-08-31",
        description: "End-of-summer crash offer for Thanaweya students",
        for: "private"
      },
      Groups: [
        {
          groupName: "Math Masters - Grade 12",
          days: ["Tuesday", "Friday"],
          time: "6:00 PM - 7:30 PM",
          isFull: false
        }
      ],
      courseContent: [
        "Calculus & Limits",
        "Analytic Geometry",
        "Integration Techniques",
        "Applied Math",
        "Past Papers Solving"
      ]
    },
    {
      subject: "Mathematics",
      grade: "11",
      type: "General - scientific",
      bio: "Foundation for Thanaweya Amma math. Great for students in Grade 11 looking to prepare early.",
      duration: 75,
      lecturesPerWeek: 2,
      yearsExp: 12,
      price: 100,
      rating: 4.8,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Algebra",
        "Trigonometry",
        "Functions & Graphs",
        "Basic Calculus"
      ]
    },
    {
      subject: "Physics",
      grade: "12",
      type: "General - scientific",
      bio: "Thanaweya exam preparation with concept diagrams, unit summaries, and circuit-based problem solving.",
      duration: 90,
      lecturesPerWeek: 2,
      yearsExp: 14,
      price: 110,
      rating: 4.7,
      private: {
        price: 900,
        note: "Includes physics simulation tools and direct exam walkthroughs"
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Kinematics & Dynamics",
        "Electricity & Circuits",
        "Work, Energy, Power",
        "Modern Physics"
      ]
    },
    {
      subject: "Statistics",
      grade: "12",
      type: "General - scientific",
      bio: "Statistical reasoning, chart interpretation, and combinatorics explained for Thanaweya and STEM students.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 10,
      price: 90,
      rating: 4.6,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Mean, Median, Mode",
        "Probability",
        "Combinations & Permutations",
        "Statistical Graphs"
      ]
    }
  ]
},
{
  id: 13,
  name: "Sarah Ehab",
  location: "6th of October City",
  detailedLocation: ["El Motamayez District", "El Hosary", "Dahshur Road"],
  img: "/53e2d0464950aa14f1dc8460962e33791c3ad6e04e507440742a7ad59f49c3_640.jpg",
  bannerimg: "/fire-657110_640.jpg",
  phone: "01055664422",
  isTopRated: false,
  personalAvailability: {
    times: ["Monday 1–3 PM", "Wednesday 4–6 PM", "Friday 10–12 AM"],
    note: "Sessions are interactive and exam-focused. Includes essay writing workshops and annotated reading passages."
  },
  GeneralBio:
    "Arabic and social studies specialist with over 10 years of experience preparing literary track students for Thanaweya Amma exams. I focus on writing techniques, interpretation skills, and smart memorization methods to help students master the material.",
  achievements: [
    { type: "studentFav", label: "Student Favorite", isCurrent: true }
  ],
  socials: {
    facebook: "https://facebook.com/saraheducation",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    whatsapp: "https://wa.me/01055664422",
    telegram: "",
    email: "sarah@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "Arabic",
      grade: "12",
      type: "General - literary",
      bio: "Preparing students for Thanaweya Amma Arabic exam with deep dives into classical prose and grammar questions.",
      duration: 60,
      lecturesPerWeek: 2,
      yearsExp: 10,
      rating: 4.7,
      private: {
        price: 600,
        note: "Includes annotated texts and grammar cheat sheets."
      },
      Groups: [],
      courseContent: [
        "Classical Literature",
        "Syntax & Nahw",
        "Modern Prose & Poetry",
        "Translation & Essay Writing"
      ]
    },
    {
      subject: "Philosophy",
      grade: "12",
      type: "General - literary",
      bio: "Teaching philosophical concepts using simple analogies and past paper analysis. Great for students aiming for A+.",
      duration: 75,
      lecturesPerWeek: 1,
      yearsExp: 9,
      price: 80,
      rating: 4.6,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Greek Philosophy",
        "Epistemology",
        "Philosophy of Ethics",
        "Thanaweya Essay Prep"
      ]
    },
    {
      subject: "Sociology",
      grade: "12",
      type: "General - literary",
      bio: "Full coverage of the Thanaweya Sociology syllabus with real-world case studies and exam tactics.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 8,
      price: 70,
      rating: 4.5,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Social Norms & Values",
        "Structure of Society",
        "Family & Education Systems",
        "Past Paper Practice"
      ]
    },
    {
      subject: "History",
      grade: "11",
      type: "General - literary",
      bio: "Making history memorable through storytelling and visual timelines. Focused on Grade 11 literary curriculum.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 7,
      price: 65,
      rating: 4.4,
      private: null,
      offer: null,
      Groups: [],
      courseContent: [
        "Islamic & Modern Egyptian History",
        "Timeline Activities",
        "Important Figures",
        "Critical Thinking Questions"
      ]
    },
    {
      subject: "Geography",
      grade: "11",
      type: "General - literary",
      bio: "Interactive sessions with drawing-based learning and map work. Strong focus on terminology and graphs.",
      duration: 60,
      lecturesPerWeek: 1,
      yearsExp: 7,
      price: 65,
      rating: 4.5,
      private: {
        price: 450,
        note: "Private students get a full booklet of labeled maps and practice sheets."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "Population & Urbanization",
        "Agricultural Patterns",
        "Industrial Geography",
        "Map Analysis Skills"
      ]
    }
  ]
},
{
  id: 14,
  name: "New Tutor",
  location: "",
  detailedLocation: [],
  img: "",
  bannerimg: "/banners/default-banner.jpg",
  phone: "",
  isTopRated: false,
  personalAvailability: {
    times: [],
    note: ""
  },
  GeneralBio: "",
  achievements: [],
  socials: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    whatsapp: "",
    telegram: "",
    email: "",
    website: "",
    github: ""
  },
  subjects: []
},
{
  id: 16,
  name: "أ. شيماء سامي",
  location: "طنطا",
  detailedLocation: ["شارع البحر", "قرب كلية التربية", "ميدان المحطة"],
  img: "/tutors/shaimaa-sami.png",
  bannerimg: "/banners/arabic-literature.jpg",
  phone: "01099887722",
  isTopRated: true,
  personalAvailability: {
    times: ["الأحد ٤ - ٦ مساءً", "الثلاثاء ٥ - ٧ مساءً", "الخميس ١١ صباحاً - ١ ظهراً"],
    note: "أُفضل الحصص التفاعلية أونلاين عبر Google Meet، كما أُوفر أوراق تدريب للطلاب بعد كل درس."
  },
  GeneralBio: "مدرسة لغة عربية وخبيرة في مهارات التعبير والبلاغة لطلاب الثانوية العامة. أملك خبرة تتجاوز ١٠ سنوات في مساعدة الطلاب على التميز في الامتحانات الرسمية من خلال الشرح المبسط والتمارين المكثفة.",
  achievements: [
    { type: "topRated", label: "الأعلى تقييماً", isCurrent: true },
    { type: "monthlyTop", label: "معلمة الشهر - يونيو", isCurrent: true }
  ],
  socials: {
    facebook: "https://facebook.com/shaimaa.arabic",
    instagram: "https://instagram.com/shaimaa.language",
    twitter: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
    whatsapp: "https://wa.me/01099887722",
    telegram: "",
    email: "shaimaa@modaresy.com",
    website: "",
    github: ""
  },
  subjects: [
    {
      subject: "اللغة العربية",
      grade: "الثانوية العامة - الصف الثالث",
      type: "الثانوية العامة - أدبي",
      bio: "منهج شامل يشمل النحو، البلاغة، الأدب، النصوص، والتعبير الوظيفي والإبداعي بطريقة سهلة ومركزة.",
      duration: 10,
      lecturesPerWeek: 2,
      yearsExp: 10,
      price: 90,
      rating: 4.8,
      private: {
        price: 750,
        note: "يشمل تدريبات خاصة على التعبير وأسئلة الأعوام السابقة."
      },
      offer: {
        percentage: 20,
        from: "2025-06-20",
        to: "2025-08-10",
        description: "خصم 20% لحجوزات الصيف المبكرة",
        for: "private"
      },
      Groups: [
        {
          groupName: "المجموعة الذهبية",
          days: ["الأحد", "الثلاثاء"],
          time: "٤:٠٠ م - ٥:٣٠ م",
          isFull: false,
          note: "أماكن محدودة. المجموعة تراجع جميع فروع اللغة أسبوعياً."
        }
      ],
      introVideoUrl: "https://www.youtube.com/embed/tgbNymZ7vqY",
      otherVideos: [
        {
          id: "ar1",
          title: "شرح النعت وأنواعه",
          url: "https://www.youtube.com/embed/tgbNymZ7vqY"
        },
        {
          id: "ar2",
          title: "الفرق بين الخبر المفرد والجملة",
          url: "https://www.youtube.com/embed/tgbNymZ7vqY"
        }
      ],
      comments: [
        { id: 1, user: "طالبة مريم", rating: 5, text: "أستاذة رائعة، بفضلها فهمت النحو أخيرًا!", date: "2025-05-12" },
        { id: 2, user: "أم الطالبة سارة", rating: 4, text: "تشرح بطريقة محترمة ومنظمة جداً، شكراً لكِ", date: "2025-04-28" }
      ],
      courseContent: [
        "النحو الكامل",
        "البلاغة والتذوق الفني",
        "نصوص القراءة والأدب",
        "التعبير الوظيفي والإبداعي",
        "حل نماذج امتحانات الأعوام السابقة"
      ]
    },
    {
      subject: "التربية الدينية الإسلامية",
      grade: "الثانوية العامة - الصف الثالث",
      type: "الثانوية العامة - مشترك",
      bio: "تدريس مبسط وشامل لفهم المعاني القرآنية والأحاديث وتفسيرها، مع مراجعة دقيقة لأسئلة الامتحانات.",
      duration: 45,
      lecturesPerWeek: 1,
      yearsExp: 8,
      price: 50,
      rating: 4.6,
      private: {
        price: 400,
        note: "تُرسل ملخصات مراجعة أسبوعية للطلاب."
      },
      offer: null,
      Groups: [],
      courseContent: [
        "تفسير الآيات",
        "الحديث الشريف",
        "السيرة النبوية",
        "القيم الإسلامية",
        "المراجعة النهائية"
      ]
    }
  ]
}


];


const allSubjects = mockTutors.map(t => t.subject);
export const uniqueSubjectsSimple = ['all', ...Array.from(new Set(allSubjects))];

const allLocations = mockTutors.map(t => t.location);
export const uniqueLocationsSimple = ['all', ...Array.from(new Set(allLocations))];
