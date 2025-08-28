import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { SearchableSelectContent } from '@/components/ui/searchSelect';
import PasswordInputs from '@/components/ui/password';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';
import { Link } from 'react-router-dom';

const SignupForm = ({
  formData,
  errors,
  handleChange,
  handleSelectChange,
  handleSubmit,
  setFormData,
  constants,
  availableDistricts,
  availableGrades,
  availableSectors,
  availableLanguages,
  isRTL,
  isStudent
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key={formData.user_type + '-form'}
      initial={{ x: isRTL ? (isStudent ? -100 : 100) : (isStudent ? 100 : -100), opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full p-6 sm:p-8"
    >
      <CardHeader className="p-0 pb-6 text-center">
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <CardTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            {t('signupTitle')}
          </CardTitle>
        </motion.div>
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <CardDescription className="text-sm md:text-base">
            {t('signupSubtitle')}
          </CardDescription>
        </motion.div>
      </CardHeader>

      <CardContent className="p-0">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Label htmlFor="user_type" className="text-sm font-medium">
              {t('selectRole')} <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              name="user_type"
              value={formData.user_type}
              onValueChange={(value) => handleSelectChange('user_type', value)}
              className={`flex gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}
              required
            >
              {constants.userTypes.map((value) => (
                <div key={value} className="flex items-center gap-2">
                  <RadioGroupItem 
                    value={value} 
                    id={`role-${value}`} 
                    className="h-5 w-5 border-2 border-primary data-[state=checked]:bg-primary"
                  />
                  <Label htmlFor={`role-${value}`} className="font-medium text-sm">
                    {t(value.toLowerCase())}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {errors.user_type && (
              <p className="text-xs text-destructive mt-1">{errors.user_type}</p>
            )}
          </motion.div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {['name', 'email', 'phone_number'].map((field, index) => (
              <motion.div
                key={field}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="space-y-2"
              >
                <Label htmlFor={field} className="text-sm font-medium">
                  {t(field)} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={field}
                  type={field === 'email' ? 'email' : 'text'}
                  value={formData[field]}
                  onChange={(e) => handleChange(e, field)}
                  placeholder={t(`placeholder.${field}`)}
                  required
                  error={errors[field]}
                  className="h-11"
                />
                {errors[field] && (
                  <p className="text-xs text-destructive mt-1">{errors[field]}</p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Password Fields */}
          <PasswordInputs 
            form={formData} 
            handleChange={handleChange} 
            errors={errors} 
            required 
          />

          {/* Location Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-2"
            >
              <Label htmlFor="governate" className="text-sm font-medium">
                {t('location')} <span className="text-destructive">*</span>
              </Label>
              <Select 
                value={formData.governate} 
                onValueChange={(val) => handleSelectChange('governate', val)} 
                required
              >
                <SelectTrigger id="governate" className="h-11">
                  <SelectValue placeholder={t('placeholder.selectLocation')} />
                </SelectTrigger>
                <SearchableSelectContent
                  items={constants.Governates.map((loc) => ({ value: loc, label: loc }))}
                  searchPlaceholder={t('placeholder.searchLocation')}
                />
              </Select>
              {errors.governate && (
                <p className="text-xs text-destructive mt-1">{errors.governate}</p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="space-y-2"
            >
              <Label htmlFor="district" className="text-sm font-medium">
                {t('district')} <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.district}
                onValueChange={(val) => handleSelectChange('district', val)}
                disabled={!formData.governate}
                required
              >
                <SelectTrigger id="district" className="h-11">
                  <SelectValue placeholder={
                    formData.governate ? t('placeholder.district') : t('selectGovernateFirst')
                  } />
                </SelectTrigger>
                {formData.governate && (
                  <SearchableSelectContent
                    items={availableDistricts.map((d) => ({ value: d, label: d }))}
                    searchPlaceholder={t('placeholder.searchDistrict')}
                  />
                )}
              </Select>
              {errors.district && (
                <p className="text-xs text-destructive mt-1">{errors.district}</p>
              )}
            </motion.div>
          </div>

          {/* Student Specific Fields */}
          {isStudent && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="space-y-2"
                >
                  <Label htmlFor="education_system" className="text-sm font-medium">
                    {t('educationSystem')} <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.education_system} 
                    onValueChange={(val) => handleSelectChange('education_system', val)} 
                    required
                  >
                    <SelectTrigger id="education_system" className="h-11">
                      <SelectValue placeholder={t('placeholder.selectEducationSystem')} />
                    </SelectTrigger>
                    <SearchableSelectContent
                      items={constants.Education_Systems.map(val => ({ value: val, label: t(val.toLowerCase()) }))}
                    />
                  </Select>
                  {errors.education_system && (
                    <p className="text-xs text-destructive mt-1">{errors.education_system}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 }}
                  className="space-y-2"
                >
                  <Label htmlFor="studying_language" className="text-sm font-medium">
                    {t('studyingLanguage')} <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.languages} 
                    onValueChange={(val) => handleSelectChange('studying_language', val)} 
                    disabled={!formData.education_system}
                    required
                  >
                    <SelectTrigger id="studying_language" className="h-11">
                      <SelectValue placeholder={
                        formData.education_system ? t('placeholder.selectLanguage') : t('selectSystemFirst')
                      } />
                    </SelectTrigger>
                    {formData.education_system && (
                      <SearchableSelectContent 
                        items={availableLanguages.map(lang => ({ value: lang, label: t(lang.toLowerCase()) }))} 
                      />
                    )}
                  </Select>
                  {errors.studying_language && (
                    <p className="text-xs text-destructive mt-1">{errors.studying_language}</p>
                  )}
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="space-y-2"
                >
                  <Label htmlFor="grade" className="text-sm font-medium">
                    {t('grade')} <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.grade} 
                    onValueChange={(val) => handleSelectChange('grade', val)} 
                    disabled={!formData.education_system}
                    required
                  >
                    <SelectTrigger id="grade" className="h-11">
                      <SelectValue placeholder={
                        formData.education_system ? t('placeholder.selectGrade') : t('selectSystemFirst')
                      } />
                    </SelectTrigger>
                    {formData.education_system && (
                      <SearchableSelectContent 
                        items={availableGrades.map(grade => ({ value: grade, label: t(grade.toLowerCase()) }))} 
                      />
                    )}
                  </Select>
                  {errors.grade && (
                    <p className="text-xs text-destructive mt-1">{errors.grade}</p>
                  )}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="space-y-2"
                >
                  <Label htmlFor="sector" className="text-sm font-medium">
                    {t('sector')} <span className="text-destructive">*</span>
                  </Label>
                  <Select 
                    value={formData.sector} 
                    onValueChange={(val) => handleSelectChange('sector', val)} 
                    disabled={!formData.grade}
                    required
                  >
                    <SelectTrigger id="sector" className="h-11">
                      <SelectValue placeholder={
                        formData.grade ? t('placeholder.selectSector') : t('selectGradeFirst')
                      } />
                    </SelectTrigger>
                    {formData.grade && (
                      <SearchableSelectContent 
                        items={availableSectors.map(sec => ({ value: sec, label: t(sec.toLowerCase()) }))} 
                      />
                    )}
                  </Select>
                  {errors.sector && (
                    <p className="text-xs text-destructive mt-1">{errors.sector}</p>
                  )}
                </motion.div>
              </div>
            </div>
          )}

          {/* Teacher Specific Fields
          {formData.user_type === 'Teacher' && (
            <div className="space-y-5">
              <PfpUploadWithCrop 
                formData={formData} 
                setFormData={setFormData} 
                required 
              />
              <BannerUploadWithCrop 
                formData={formData} 
                setFormData={setFormData} 
                required 
              />
            </div>
          )} */}

          {/* Terms and Conditions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="flex items-start space-x-3 rtl:space-x-reverse pt-2"
          >
            <Checkbox
              id="agreedToTerms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) => handleSelectChange('agreedToTerms', checked)}
              required
              className="mt-1 h-5 w-5 border-2 data-[state=checked]:bg-primary"
            />
            <Label htmlFor="agreedToTerms" className="text-xs font-normal leading-relaxed">
              <Trans i18nKey="agreeToTerms">
                By signing up, you agree to our <Link to="/terms" className="underline text-primary hover:text-primary/80">Terms</Link> and <Link to="/privacy" className="underline text-primary hover:text-primary/80">Privacy Policy</Link>.
              </Trans>
            </Label>
          </motion.div>
          {errors.agreedToTerms && (
            <p className="text-xs text-destructive -mt-3">{errors.agreedToTerms}</p>
          )}

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium shadow-md hover:shadow-lg transition-shadow"
            >
              {t('signup')}
            </Button>
          </motion.div>
        </form>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6 }}
          className="mt-6 text-center text-sm text-muted-foreground"
        >
          {t('alreadyHaveAccount')}{' '}
          <Link 
            to="/login" 
            className="font-medium text-primary hover:underline hover:text-primary/80"
          >
            {t('login')}
          </Link>
        </motion.div>
      </CardContent>
    </motion.div>
  );
};

export default SignupForm;