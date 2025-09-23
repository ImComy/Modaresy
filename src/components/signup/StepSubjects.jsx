import React, { useState, useMemo, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Plus, Trash, Edit, BookOpen, Award, MapPin, Languages, FileText, ChevronDown, Check, X, Lock, AlertCircle } from "lucide-react";
import { getConstantsSync } from "@/api/constantsFetch";
import { StepDataContext } from "@/context/StepContext";

// NOTE: Changes made in this file based on feedback:
// - Removed the "Preview" UI (it was deemed useless).
// - When adding subjects we now create ONE profile per selected grade (not one per sector).
//   Each grade-profile includes all *applicable* sectors (as an array) rather than creating
//   a separate profile for every sector.
// - Improved sectors toggle to be defensive (won't allow toggling sectors that aren't available
//   for the currently selected grades).
// - Added conflict detection right before adding, and surface errors to the user.

export default function TutorSubjectOnboarding({ className = "" }) {
  // Use the context to get state and setState
  const { state, setState } = useContext(StepDataContext);

  // Get subjects from context or use empty array
  const contextSubjects = state.subjects || [];

  // Get constants from service
  const constants = getConstantsSync();

  // Education systems from constants (kept minimal as before)
  const educationSystems = [
    { value: "National", label: "National Curriculum", description: "Standard national education system" }
  ];

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

  const [errors, setErrors] = useState([]);

  // Sync subjects with context whenever they change (keep context in sync)
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      subjects: contextSubjects
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contextSubjects]);

  // Reset dependent fields when education system changes
  useEffect(() => {
    if (form.educationSystem) {
      setForm(prev => ({
        ...prev,
        grades: [],
        sectors: [],
        languages: []
      }));
      setErrors([]);
    }
  }, [form.educationSystem]);

  // When grades change, clear sectors (user must re-pick sectors for the new grade combo)
  useEffect(() => {
    if (form.grades.length > 0) {
      setForm(prev => ({
        ...prev,
        sectors: []
      }));
      setErrors([]);
    } else {
      setErrors([]);
    }
  }, [form.grades]);

  // Grades by system using constants
  const gradesBySystem = useMemo(() => ({
    National: constants?.EducationStructure?.National?.grades || []
  }), [constants]);

  const availableGrades = useMemo(() =>
    gradesBySystem[form.educationSystem] || [],
    [form.educationSystem, gradesBySystem]
  );

  // Get available sectors for selected grades
  const availableSectors = useMemo(() => {
    if (!form.educationSystem || !constants?.EducationStructure?.National?.sectors) {
      return [];
    }

    const sectorsSet = new Set();
    form.grades.forEach(grade => {
      const gradeSectors = constants.EducationStructure.National.sectors[grade];
      if (Array.isArray(gradeSectors)) {
        gradeSectors.forEach(sector => sectorsSet.add(sector));
      }
    });

    return Array.from(sectorsSet).sort();
  }, [form.grades, form.educationSystem, constants]);

  // Get available languages for selected education system and grades
  const availableLanguages = useMemo(() => {
    if (!form.educationSystem) return [];

    const systemLanguages = constants?.EducationStructure?.National?.languages || ["Arabic", "English"];
    const languagesSet = new Set(systemLanguages);

    return Array.from(languagesSet);
  }, [form.educationSystem, form.grades, constants]);

  // All subjects flattened from constants
  const allSubjects = useMemo(() => {
    if (!constants?.SubjectsBySystem?.National) return [];

    const subjectsSet = new Set();
    const nationalSubjects = constants.SubjectsBySystem.National;

    Object.keys(nationalSubjects).forEach(grade => {
      const gradeSubjects = nationalSubjects[grade];
      if (Array.isArray(gradeSubjects)) {
        gradeSubjects.forEach(subject => subjectsSet.add(subject));
      } else if (typeof gradeSubjects === 'object') {
        Object.values(gradeSubjects).forEach(sectorSubjects => {
          sectorSubjects.forEach(subject => subjectsSet.add(subject));
        });
      }
    });

    return Array.from(subjectsSet).sort();
  }, [constants]);

  // Get available subjects for selected grade and sectors
  const availableSubjects = useMemo(() => {
    if (!constants?.SubjectsBySystem?.National || !form.educationSystem) return allSubjects;

    const nationalSubjects = constants.SubjectsBySystem.National;
    const subjectsSet = new Set();

    form.grades.forEach(grade => {
      const gradeData = nationalSubjects[grade];
      if (!gradeData) return;

      if (Array.isArray(gradeData)) {
        gradeData.forEach(subject => subjectsSet.add(subject));
      } else if (typeof gradeData === 'object') {
        // If user selected sectors, include subjects only from those sectors (if they exist for this grade)
        if (form.sectors.length > 0) {
          form.sectors.forEach(sector => {
            if (gradeData[sector]) {
              gradeData[sector].forEach(subject => subjectsSet.add(subject));
            }
          });
        } else {
          Object.values(gradeData).forEach(sectorSubjects => {
            sectorSubjects.forEach(subject => subjectsSet.add(subject));
          });
        }
      }
    });

    return Array.from(subjectsSet).sort();
  }, [form.grades, form.sectors, form.educationSystem, constants, allSubjects]);

  const toggleDropdown = (dropdown) => {
    setDropdowns(prev => ({
      ...Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {}),
      [dropdown]: !prev[dropdown]
    }));
  };

  const toggleSelection = (key, value) => {
    setForm(prev => {
      const currentArray = prev[key] || [];

      // Defensive: if toggling sectors, ensure the sector is actually available for the selected grades
      if (key === 'sectors') {
        const allowed = availableSectors;
        if (!allowed.includes(value)) return prev; // ignore toggles for unavailable sectors
      }

      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      return { ...prev, [key]: newArray };
    });
  };

  const isSelected = (key, value) => {
    return (form[key] || []).includes(value);
  };

  // Build subjects (one per grade) from the current form state
  const buildSubjectsFromForm = () => {
    const built = [];
    const newErrors = [];

    if (!form.educationSystem || !form.subjectName || form.grades.length === 0) {
      newErrors.push('Please choose an education system, at least one grade, and a subject name.');
      return { built, newErrors };
    }

    form.grades.forEach(grade => {
      const gradeSectors = constants?.EducationStructure?.National?.sectors?.[grade] || [];

      // If user selected sectors, filter them to only those that apply to this grade
      const applicableSectors = form.sectors.length > 0
        ? form.sectors.filter(sector => gradeSectors.includes(sector))
        : [];

      // If user selected sectors but none apply to this grade -> it's an issue
      if (form.sectors.length > 0 && applicableSectors.length === 0 && gradeSectors.length > 0) {
        newErrors.push(`Selected sectors do not apply to ${grade}.`);
        return; // skip creating a profile for this grade
      }

      const subjectProfile = {
        educationSystem: form.educationSystem,
        grade: grade,
        name: form.subjectName,
        sectors: applicableSectors, // note: can be empty array (general profile)
        languages: form.languages,
        overview: form.overview
      };

      // Check for conflict with existing subjects (exact same system/grade/name/sectors)
      const conflict = contextSubjects.find(existing =>
        existing.educationSystem === subjectProfile.educationSystem &&
        existing.grade === subjectProfile.grade &&
        existing.name === subjectProfile.name &&
        JSON.stringify(existing.sectors || []) === JSON.stringify(subjectProfile.sectors || [])
      );

      if (conflict) {
        newErrors.push(`Subject "${subjectProfile.name}" for ${subjectProfile.grade}${subjectProfile.sectors.length > 0 ? ` (${subjectProfile.sectors.join(', ')})` : ''} already exists.`);
      } else {
        built.push({ ...subjectProfile, id: Date.now() + Math.random() });
      }
    });

    return { built, newErrors };
  };

  const canAddSubject = form.educationSystem && form.grades.length > 0 && form.subjectName && form.overview && errors.length === 0;

  const handleAddSubject = () => {
    // Build subjects from form
    const { built, newErrors } = buildSubjectsFromForm();

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    if (built.length === 0) {
      setErrors(['No valid subject profiles to add.']);
      return;
    }

    // Add to context subjects
    const updatedSubjects = [...contextSubjects, ...built];
    setState(prevState => ({
      ...prevState,
      subjects: updatedSubjects
    }));

    // Reset form
    setForm({
      educationSystem: "",
      grades: [],
      subjectName: "",
      sectors: [],
      languages: [],
      overview: ""
    });
    setDropdowns({ system: false, grades: false, subjectName: false });
    setErrors([]);
  };

  const handleEditSubject = (subjectToEdit) => {
    // Remove the subject and set form to edit values
    const updatedSubjects = contextSubjects.filter(subject => subject.id !== subjectToEdit.id);
    setState(prevState => ({
      ...prevState,
      subjects: updatedSubjects
    }));

    // Pre-fill form with subject data
    setForm({
      educationSystem: subjectToEdit.educationSystem,
      grades: [subjectToEdit.grade],
      subjectName: subjectToEdit.name,
      sectors: subjectToEdit.sectors || [],
      languages: subjectToEdit.languages || [],
      overview: subjectToEdit.overview
    });
  };

  const handleDeleteSubject = (subjectToDelete) => {
    const updatedSubjects = contextSubjects.filter(subject => subject.id !== subjectToDelete.id);
    setState(prevState => ({
      ...prevState,
      subjects: updatedSubjects
    }));
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
    setDropdowns({ system: false, grades: false, subjectName: false });
    setErrors([]);
  };

  if (!constants) {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-2xl mx-auto mb-4"></div>
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-96 mx-auto"></div>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Set Up Your Teaching Subjects</h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">Tell us what subjects you teach. This helps students find the perfect tutor match.</p>
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

              {/* Grades */}
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

              {/* Subject Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject Name *</label>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('subjectName')}
                    className="w-full p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-between"
                  >
                    <span className={form.subjectName ? "text-gray-900 dark:text-white" : "text-gray-500"}>
                      {form.subjectName || "Select subject name"}
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
                        {availableSubjects.map((subject) => (
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
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                {form.grades.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Showing subjects available for selected {form.grades.length > 1 ? 'grades' : 'grade'}{form.sectors.length > 0 && ` and sectors`}
                  </div>
                )}
              </div>

              {/* Sectors Section - Only show if grades are selected and sectors are available */}
              {form.grades.length > 0 && availableSectors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Sectors (Optional)
                    <span className="text-xs text-gray-500">- Based on selected grades</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableSectors.map((sector) => (
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
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Select sectors to include them on each grade profile. If you leave sectors empty, the created profiles will be general (no sector attached).
                  </div>
                </div>
              )}

              {/* Languages Section - Only show if education system is selected */}
              {form.educationSystem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" />
                    Languages (Optional)
                    <span className="text-xs text-gray-500">- Based on selected system</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableLanguages.map((language) => (
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
              )}

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

              {/* Error Messages */}
              {errors.length > 0 && (
                <div className="border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-300 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-medium">Issues detected:</span>
                  </div>
                  <div className="space-y-1">
                    {errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400">• {error}</div>
                    ))}
                  </div>
                </div>
              )}

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

        {/* Right Column - Existing Subjects */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-3">
                <GraduationCap className="w-5 h-5 text-green-500" />
                Your Subjects ({contextSubjects.length})
              </h2>
            </div>

            {contextSubjects.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subjects added yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Start by adding your first teaching subject using the form on the left.</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {contextSubjects.map((subject, index) => (
                  <motion.div
                    key={subject.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{subject.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{subject.educationSystem} • {subject.grade}{subject.sectors && subject.sectors.length > 0 && ` • ${subject.sectors.join(', ')}`}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSubject(subject)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </button>
                        <button
                          onClick={() => handleDeleteSubject(subject)}
                          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                          <Trash className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{subject.overview}</p>

                    <div className="flex flex-wrap gap-2">
                      {subject.sectors && subject.sectors.map((sector, i) => (
                        <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">{sector}</span>
                      ))}
                      {subject.languages && subject.languages.map((language, i) => (
                        <span key={i} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full">{language}</span>
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
