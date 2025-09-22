import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Trash, Edit, BookOpen, Award, MapPin, Languages, FileText, ChevronDown, Check, X, Lock } from "lucide-react";

export default function TutorSubjectOnboarding({
  subjects = [],
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  className = ""
}) {
  // Mock subjects for demonstration
  const mockSubjects = [
    {
      educationSystem: "igcse",
      grades: ["IGCSE Core", "IGCSE Extended"],
      name: "Mathematics",
      sectors: ["Scientific"],
      languages: ["English"],
      overview: "Specializing in algebra, geometry, and calculus. Focus on problem-solving techniques and exam preparation.",
      category: "Mathematics & Sciences"
    },
    {
      educationSystem: "american",
      grades: ["High School (9-12)", "AP Courses"],
      name: "Physics",
      sectors: ["Scientific"],
      languages: ["English", "Bilingual"],
      overview: "Teaching fundamental physics concepts with hands-on experiments and real-world applications.",
      category: "Mathematics & Sciences"
    }
  ];

  // Education systems with descriptions
  const educationSystems = [
    { value: "national", label: "National Curriculum", description: "Standard national education system" },
    { value: "igcse", label: "IGCSE", description: "International General Certificate of Secondary Education" },
    { value: "american", label: "American System", description: "US-based curriculum and standards" },
    { value: "ib", label: "International Baccalaureate", description: "Internationally recognized diploma program" },
    { value: "british", label: "British Curriculum", description: "UK-based education standards" }
  ];

  // Grades by system
  const gradesBySystem = {
    national: Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
    igcse: ["Year 7-9", "IGCSE Core", "IGCSE Extended", "AS Level", "A Level"],
    american: ["Elementary (K-5)", "Middle School (6-8)", "High School (9-12)", "AP Courses", "College Level"],
    ib: ["PYP", "MYP", "IB Diploma", "IB Certificate"],
    british: ["Key Stage 1-2", "Key Stage 3", "GCSE", "A Level"]
  };

  // All subjects flattened
  const allSubjects = [
    "Mathematics", "Physics", "Chemistry", "Biology", "Computer Science", "Statistics",
    "English Language", "English Literature", "Arabic", "French", "Spanish", "Art", "Music",
    "History", "Geography", "Economics", "Business Studies", "Psychology", "Sociology",
    "Accounting", "Engineering", "Medicine Prep", "Law Prep", "Programming"
  ];

  const sectors = ["General", "Scientific", "Literary", "Vocational", "Technical"];
  const languages = ["Arabic", "English", "French", "Spanish", "Bilingual"];

  const [form, setForm] = useState({
    educationSystem: "",
    grades: [],
    subjectName: "",
    sectors: [],
    languages: [],
    overview: ""
  });

  const [dropdowns, setDropdowns] = useState({
    system: false,
    grades: false,
    subjectName: false
  });

  const availableGrades = useMemo(() => 
    gradesBySystem[form.educationSystem] || [], 
    [form.educationSystem]
  );

  const toggleDropdown = (dropdown) => {
    setDropdowns(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [dropdown]: !prev[dropdown]
    }));
  };

  const toggleSelection = (key, value) => {
    setForm(prev => {
      const currentArray = prev[key] || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const isSelected = (key, value) => {
    return (form[key] || []).includes(value);
  };

  const canAddSubject = form.educationSystem && form.grades.length > 0 && form.subjectName && form.overview;

  const handleAddSubject = () => {
    if (!canAddSubject) return;
    
    const newSubject = {
      educationSystem: form.educationSystem,
      grades: form.grades,
      name: form.subjectName,
      sectors: form.sectors,
      languages: form.languages,
      overview: form.overview
    };
    
    onAdd(newSubject);
    setForm({
      educationSystem: "",
      grades: [],
      subjectName: "",
      sectors: [],
      languages: [],
      overview: ""
    });
  };

  const resetForm = () => {
    setForm({
      educationSystem: "",
      grades: [],
      subjectName: "",
      sectors: [],
      languages: [],
      overview: ""
    });
    setDropdowns({
      system: false,
      grades: false,
      subjectName: false
    });
  };

  // Combine mock subjects with user-added subjects
  const displaySubjects = [...mockSubjects, ...subjects];

  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Set Up Your Teaching Subjects
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Tell us what subjects you teach. This helps students find the perfect tutor match.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              Add New Subject
            </h2>

            <div className="space-y-6">
              {/* Education System */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Education System *
                </label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('system')}
                    className="w-full p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-between"
                  >
                    <span className={form.educationSystem ? "text-gray-900 dark:text-white" : "text-gray-500"}>
                      {form.educationSystem 
                        ? educationSystems.find(sys => sys.value === form.educationSystem)?.label
                        : "Select education system"
                      }
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdowns.system ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {dropdowns.system && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
                      >
                        {educationSystems.map((system) => (
                          <button
                            key={system.value}
                            onClick={() => {
                              setForm(prev => ({ ...prev, educationSystem: system.value }));
                              setDropdowns(prev => ({ ...prev, system: false }));
                            }}
                            className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900 dark:text-white">{system.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{system.description}</div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Grades - Always visible but disabled when no system selected */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Grades / Levels *
                  {!form.educationSystem && (
                    <Lock className="w-3 h-3 text-gray-400" />
                  )}
                </label>
                <div className="relative">
                  <button
                    onClick={() => form.educationSystem && toggleDropdown('grades')}
                    disabled={!form.educationSystem}
                    className={`w-full p-3 text-left border rounded-lg flex items-center justify-between transition-colors ${
                      form.educationSystem 
                        ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 cursor-pointer"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 cursor-not-allowed"
                    }`}
                  >
                    <span className={form.grades.length > 0 ? "text-gray-900 dark:text-white" : "text-gray-500"}>
                      {form.grades.length > 0 ? `${form.grades.length} selected` : "Select grades"}
                    </span>
                    <div className="flex items-center gap-2">
                      {!form.educationSystem && <Lock className="w-3 h-3 text-gray-400" />}
                      <ChevronDown className={`w-4 h-4 transition-transform ${
                        dropdowns.grades ? 'rotate-180' : ''
                      } ${!form.educationSystem ? 'text-gray-400' : ''}`} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {dropdowns.grades && form.educationSystem && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
                      >
                        {availableGrades.map((grade) => (
                          <button
                            key={grade}
                            onClick={() => toggleSelection('grades', grade)}
                            className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 flex items-center justify-between"
                          >
                            <span>{grade}</span>
                            {isSelected('grades', grade) && <Check className="w-4 h-4 text-blue-500" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* Selected Grades */}
                {form.grades.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {form.grades.map((grade) => (
                      <span key={grade} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                        {grade}
                        <button
                          onClick={() => toggleSelection('grades', grade)}
                          className="hover:text-blue-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject Name - Always visible */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Name *
                </label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('subjectName')}
                    className="w-full p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-between"
                  >
                    <span className={form.subjectName ? "text-gray-900 dark:text-white" : "text-gray-500"}>
                      {form.subjectName || "Select or type subject name"}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${dropdowns.subjectName ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {dropdowns.subjectName && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
                      >
                        {allSubjects.map((subject) => (
                          <button
                            key={subject}
                            onClick={() => {
                              setForm(prev => ({ ...prev, subjectName: subject }));
                              setDropdowns(prev => ({ ...prev, subjectName: false }));
                            }}
                            className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                          >
                            {subject}
                          </button>
                        ))}
                        <div className="p-3 border-t border-gray-100 dark:border-gray-600">
                          <input
                            type="text"
                            placeholder="Type custom subject name..."
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && e.target.value) {
                                setForm(prev => ({ ...prev, subjectName: e.target.value }));
                                setDropdowns(prev => ({ ...prev, subjectName: false }));
                                e.target.value = '';
                              }
                            }}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Subject Overview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Subject Overview *
                </label>
                <textarea
                  value={form.overview}
                  onChange={(e) => setForm(prev => ({ ...prev, overview: e.target.value }))}
                  placeholder="Describe your teaching approach, topics covered, and any specializations..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {form.overview.length}/500 characters
                </div>
              </div>

              {/* Sectors and Languages - Reorganized */}
              <div className="space-y-6">
                {/* Sectors Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Sectors (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {sectors.map((sector) => (
                      <button
                        key={sector}
                        onClick={() => toggleSelection('sectors', sector)}
                        className={`p-3 rounded-lg text-sm border transition-all duration-200 flex items-center justify-center ${
                          isSelected('sectors', sector)
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-600 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                        }`}
                      >
                        <span className="text-xs font-medium">{sector}</span>
                        {isSelected('sectors', sector) && (
                          <Check className="w-3 h-3 ml-1 text-blue-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Languages Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Languages (Optional)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {languages.map((language) => (
                      <button
                        key={language}
                        onClick={() => toggleSelection('languages', language)}
                        className={`p-3 rounded-lg text-sm border transition-all duration-200 flex items-center justify-center ${
                          isSelected('languages', language)
                            ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-300 dark:border-green-600 shadow-sm'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-500'
                        }`}
                      >
                        <span className="text-xs font-medium">{language}</span>
                        {isSelected('languages', language) && (
                          <Check className="w-3 h-3 ml-1 text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAddSubject}
                  disabled={!canAddSubject}
                  className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                    canAddSubject
                      ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Subject
                </button>
                <button
                  onClick={resetForm}
                  className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column - Preview */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-green-500" />
                Your Subjects ({displaySubjects.length})
              </h2>
            </div>

            {displaySubjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subjects added yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Start by adding your first teaching subject using the form on the left.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {displaySubjects.map((subject, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{subject.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {subject.educationSystem} • {subject.grades.join(', ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit(subject)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => onDelete(subject)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {subject.overview}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {subject.sectors.map((sector, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                          {sector}
                        </span>
                      ))}
                      {subject.languages.map((language, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">
                          {language}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}