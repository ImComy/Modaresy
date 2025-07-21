import { useState, useEffect } from 'react';
import i18next from 'i18next';
import { useToast } from '@/components/ui/use-toast';
import { validationService } from '@/api/validation';
import { authService } from '@/api/authentication';

export const useFormLogic = (initialFormData, navigate, t, config = {}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [isRTL, setIsRTL] = useState(i18next.dir() === 'rtl');

  const { isSignup = false, isLogin = false } = config;

  useEffect(() => {
    if (isSignup) {
      const updateDirection = () => setIsRTL(i18next.dir() === 'rtl');
      i18next.on('languageChanged', updateDirection);
      return () => i18next.off('languageChanged', updateDirection);
    }
  }, [isSignup]);

  const handleChange = (e, field) => {
    const value = e?.target?.value ?? '';
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }

    if (field === 'email') {
      setErrors((prev) => ({
        ...prev,
        email: validationService.validateEmail(value) ? null : t('emailInvalid'),
      }));
    } else if (field === 'phone') {
      setErrors((prev) => ({
        ...prev,
        phone: validationService.validatePhoneNumber(value) ? null : t('phoneInvalid'),
      }));
    } else if (field === 'password' && isSignup) {
      setErrors((prev) => ({
        ...prev,
        password: value.length >= 6 ? null : t('passwordLengthError'),
      }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Shared
    if (!validationService.validateEmail(formData.email)) {
      newErrors.email = t('emailInvalid');
    }
    if (formData.phone && !validationService.validatePhoneNumber(formData.phone)) {
      newErrors.phone = t('phoneInvalid');
    }

    if (isLogin && !formData.password) {
      newErrors.password = t('passwordRequired');
    }

    // Signup specific
    if (isSignup) {
      if (!formData.name) newErrors.name = t('nameRequired');
      if (!formData.agreedToTerms) newErrors.agreedToTerms = t('termsRequired');
      if (!formData.governate) newErrors.governate = t('locationRequired');
      if (!formData.district) newErrors.district = t('districtRequired');
      if (!formData.education_system) newErrors.education_system = t('educationSystemRequired');
      if (!formData.studying_language) newErrors.studying_language = t('languageRequired');
      if (!formData.wishlist_id) newErrors.wishlist_id = t('wishlistRequired');

      if (!formData.password || formData.password.length < 6) {
        newErrors.password = t('passwordLengthError');
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = t('passwordMismatch');
      }

      if (formData.user_type === 'Student') {
        if (!formData.grade) newErrors.grade = t('gradeInvalid');
        if (!formData.sector) newErrors.sector = t('sectorRequired');
      }

      if (formData.user_type === 'Teacher') {
        if (!formData.subjects?.length) newErrors.subjects = t('subjectsRequired');
        if (!formData.targetGrades?.length) newErrors.targetGrades = t('targetGradesRequired');
        if (!formData.targetSectors?.length) newErrors.targetSectors = t('targetSectorsRequired');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: t('error'),
        description: isLogin ? t('fixFormErrors') : t('validationError'),
        variant: 'destructive',
      });
      return;
    }

    try {
      if (isSignup) {
        const basePayload = {
          name: formData.name,
          email: formData.email,
          phone_number: formData.phone,
          password: formData.password,
          photoUrl: formData.pfp,
          banner: formData.banner,
          type: formData.user_type,
        };

        const studentPayload = {
          governate: formData.governate,
          district: formData.district,
          education_system: formData.education_system,
          grade: formData.grade,
          sector: formData.sector,
          language: formData.studying_language,
          wishlist_id: formData.wishlist_id || 'default-wishlist',
        };

        const teacherPayload = {
          location: formData.governate,
          subjects: formData.subjects || [],
          targetGrades: formData.targetGrades || [],
          targetSectors: formData.targetSectors || [],
        };

        const payload =
          formData.user_type === 'Student'
            ? { ...basePayload, ...studentPayload }
            : { ...basePayload, ...teacherPayload };

        await authService.signup(payload);

        toast({
          title: t('signupSuccess'),
          description: t('signupSuccessDesc'),
        });

        navigate('/login');
      }

      if (isLogin) {
        await authService.login(formData.email, formData.password);

        toast({
          title: t('loginSuccessTitle'),
          description: t('loginSuccessDesc'),
        });

        navigate('/');
      }
    } catch (error) {
      toast({
        title: t('error'),
        description: error?.message || (isSignup ? t('signupError') : t('loginError')),
        variant: 'destructive',
      });
    }
  };

  return {
    formData,
    setFormData,
    errors,
    isRTL,
    handleChange,
    handleSelectChange,
    handleSubmit,
    validateForm,
  };
};
