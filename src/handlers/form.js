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
      const updateDir = () => setIsRTL(i18next.dir() === 'rtl');
      i18next.on('languageChanged', updateDir);
      return () => i18next.off('languageChanged', updateDir);
    }
  }, [isSignup]);

  const handleChange = (e, fieldName) => {
    const { id, value } = e && e.target ? e.target : { id: fieldName, value };
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Validate email
    if (id === 'email') {
      setErrors((prev) => ({
        ...prev,
        email: validationService.validateEmail(value) ? null : t('emailInvalid'),
      }));
    }

    // Validate phone number
    if (id === 'phone') {
      setErrors((prev) => ({
        ...prev,
        phone: validationService.validatePhoneNumber(value) ? null : t('phoneInvalid'),
      }));
    }

    // Validate password
    if (id === 'password' && isSignup) {
      setErrors((prev) => ({
        ...prev,
        password: value.length >= 6 ? null : t('passwordLengthError'),
      }));
    }

    // Clear errors for other fields
    if (errors[id] && id !== 'email' && id !== 'phone' && id !== 'password') {
      setErrors((prev) => ({ ...prev, [id]: null }));
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

    // Common validations
    if (!validationService.validateEmail(formData.email)) {
      newErrors.email = t('emailInvalid');
    }
    if (formData.phone && !validationService.validatePhoneNumber(formData.phone)) {
      newErrors.phone = t('phoneInvalid');
    }
    if (isSignup && formData.password && formData.password.length < 6) {
      newErrors.password = t('passwordLengthError');
    }
    if (isSignup && formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('passwordMismatch');
    }
    if (isLogin && !formData.password) {
      newErrors.password = t('passwordRequired');
    }

    // Signup-specific validations
    if (isSignup) {
      if (!formData.name) newErrors.name = t('nameRequired');
      if (!formData.agreedToTerms) newErrors.agreedToTerms = t('termsRequired');
      if (!formData.location) newErrors.location = t('locationRequired');
      if (formData.role === 'student' && !formData.grade) {
        newErrors.grade = t('gradeInvalid');
      }
      if (formData.role === 'teacher') {
        if (formData.subjects.length === 0) newErrors.subjects = t('subjectsRequired');
        if (formData.targetGrades.length === 0) newErrors.targetGrades = t('targetGradesRequired');
        if (formData.targetSectors.length === 0) newErrors.targetSectors = t('targetSectorsRequired');
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

    if (isSignup) {
      console.log('Submitting signup data:', formData);
      toast({
        title: t('signupSuccess'),
        description: t('signupSuccessDesc'),
      });
      navigate('/login');
    } else if (isLogin) {
      try {
        await authService.login(formData.email, formData.password);
        toast({
          title: t('loginSuccessTitle'),
          description: t('loginSuccessDesc'),
        });
        navigate('/');
      } catch (error) {
        toast({
          title: t('error'),
          description: error.message || t('loginError'),
          variant: 'destructive',
        });
      }
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