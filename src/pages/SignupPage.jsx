import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getConstants } from '@/api/constantsFetch';
import { useFormLogic } from '@/handlers/form';
// import { ScrollableTimeline } from '@/components/ui/timeline'; // Timeline removed
import SignupForm from '@/components/SignupForm';

const initialFormData = {
  name: '',
  email: '',
  phone_number: '',
  password: '',
  confirmPassword: '',
  user_type: 'Student',
  education_system: '',
  studying_language: '',
  grade: '',
  sector: '',
  governate: '',
  district: '',
  wishlist_id: 'default',
  photoUrl: '',
  agreedToTerms: false,
  banner: '',
  pfp: '',
};

const SignupPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.dir() === 'rtl';

  const {
    formData,
    errors,
    handleChange,
    handleSelectChange,
    handleSubmit,
    setFormData,
  } = useFormLogic(initialFormData, navigate, t, { isSignup: true });

  const [constants, setConstants] = useState(null);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableGrades, setAvailableGrades] = useState([]);
  const [availableSectors, setAvailableSectors] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);

  useEffect(() => {
    getConstants().then(setConstants).catch(console.error);
  }, []);

  useEffect(() => {
    if (formData.governate && constants?.Districts) {
      const districts = constants.Districts[formData.governate] || [];
      setAvailableDistricts(districts);

      if (formData.district && !districts.includes(formData.district)) {
        setFormData(prev => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
      setFormData(prev => ({ ...prev, district: '' }));
    }
  }, [formData.governate, constants, setFormData]);

  useEffect(() => {
    if (formData.education_system && constants?.EducationStructure) {
      const systemGrades = constants.EducationStructure[formData.education_system]?.grades || [];
      setAvailableGrades(systemGrades);

      if (formData.grade && !systemGrades.includes(formData.grade)) {
        setFormData(prev => ({ ...prev, grade: '', sector: '' }));
      }
    } else {
      setAvailableGrades([]);
      setFormData(prev => ({ ...prev, grade: '', sector: '' }));
    }
  }, [formData.education_system, constants, setFormData]);

  useEffect(() => {
    if (formData.grade && formData.education_system && constants?.EducationStructure) {
      const gradeSectors = constants.EducationStructure[formData.education_system]?.sectors[formData.grade] || [];
      setAvailableSectors(gradeSectors);

      if (formData.sector && !gradeSectors.includes(formData.sector)) {
        setFormData(prev => ({ ...prev, sector: '' }));
      }
    } else {
      setAvailableSectors([]);
      setFormData(prev => ({ ...prev, sector: '' }));
    }
  }, [formData.grade, formData.education_system, constants, setFormData]);

  useEffect(() => {
    if (formData.education_system && constants?.EducationStructure) {
      const systemLanguages = constants.EducationStructure[formData.education_system]?.languages || [];
      const languagesToShow = systemLanguages.length > 0 ? systemLanguages : ['Arabic'];
      setAvailableLanguages(languagesToShow);

      if (formData.studying_language && !languagesToShow.includes(formData.studying_language)) {
        setFormData(prev => ({ ...prev, studying_language: '' }));
      }
    } else {
      setAvailableLanguages([]);
    }
  }, [formData.education_system, constants, setFormData]);

  if (!constants) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-primary rounded-full mb-4"></div>
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );

  const isStudent = formData.user_type === 'Student';
  const showImageOnLeft = isRTL ? !isStudent : isStudent;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex justify-center items-center min-h-screen w-full bg-gradient-to-br from-background to-muted/20"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Timeline Section (left) - Removed */}
          {/* {showImageOnLeft && (
            <motion.div
              key={formData.user_type + '-timeline'}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:flex w-full lg:w-1/2 items-center justify-center"
            >
              <div className="w-full max-w-2xl">
                <ScrollableTimeline 
                  key={formData.user_type} 
                  userType={formData.user_type?.toLowerCase()} 
                />
              </div>
            </motion.div>
          )} */}

          {/* Form Section */}
          <div className="w-full lg:w-1/2 max-w-2xl">
            <div className="bg-background rounded-2xl shadow-xl border border-border/30 overflow-hidden">
              <SignupForm
                formData={formData}
                errors={errors}
                handleChange={handleChange}
                handleSelectChange={handleSelectChange}
                handleSubmit={handleSubmit}
                setFormData={setFormData}
                constants={constants}
                availableDistricts={availableDistricts}
                availableGrades={availableGrades}
                availableSectors={availableSectors}
                availableLanguages={availableLanguages}
                isRTL={isRTL}
                isStudent={isStudent}
              />
            </div>
          </div>

          {/* Timeline Section (right) - Removed */}
          {/* {!showImageOnLeft && (
            <motion.div
              key={formData.user_type + '-timeline'}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:flex w-full lg:w-1/2 items-center justify-center"
            >
              <div className="w-full max-w-2xl">
                <ScrollableTimeline 
                  key={formData.user_type} 
                  userType={formData.user_type?.toLowerCase()} 
                />
              </div>
            </motion.div>
          )} */}
        </div>
      </div>
    </motion.div>
  );
};

export default SignupPage;
