import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import MultiSelect from '@/components/ui/multi-select';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';
import SocialsSection from '@/components/tutorSettings/social';
import SubjectsSection from '@/components/tutorSettings/subjects';
import ContentManagementSection from '@/components/Dashboard/content';
import GroupsAndTablesSection from '@/components/Dashboard/groups';
import AnalysisSection from '@/components/Dashboard/analysis';
import PricesAndOffersSection from '@/components/Dashboard/prices';

// Define validation schema using Zod
const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  location: z.string().optional(),
  sector: z.string().optional(),
  grade: z.string().optional(),
  pfp: z.any().optional(),
  banner: z.any().optional(),
  achievements: z.array(z.string()).optional(),
  isTopTutor: z.boolean().optional(),
  detailedLocation: z.array(z.string().min(1, 'Location cannot be empty')).max(3, 'Maximum 3 locations allowed').optional(),
  generalBio: z.string().optional(),
  socialLinks: z.record(z.string()).optional(),
  youtubeVideos: z.array(
    z.object({
      title: z.string().min(1, 'Video title is required'),
      url: z.string().url('Invalid URL'),
    })
  ).max(3, 'Maximum 3 videos allowed').optional(),
  subjects: z.array(z.any()).optional(),
});

const EditUserForm = ({ user, onSave, onCancel }) => {
  const { t } = useTranslation();
  const isTutor = user.role === 'tutor';
  const isStudent = user.role === 'student';

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      location: user.location || '',
      sector: user.sector || '',
      grade: user.grade || '',
      pfp: user.pfp || null,
      banner: user.banner || null,
      achievements: user.achievements || [],
      isTopTutor: user.isTopTutor || false,
      detailedLocation: user.detailedLocation || [],
      generalBio: user.generalBio || '',
      socialLinks: user.socialLinks || {},
      youtubeVideos: user.youtubeVideos || [],
      subjects: user.subjects || [],
    },
  });

  const handleAddDetailedLocation = useCallback(() => {
    const currentLocations = form.getValues('detailedLocation') || [];
    if (currentLocations.length < 3) {
      form.setValue('detailedLocation', [...currentLocations, '']);
    }
  }, [form]);

  const handleRemoveDetailedLocation = useCallback(
    (index) => {
      const currentLocations = form.getValues('detailedLocation') || [];
      form.setValue('detailedLocation', currentLocations.filter((_, i) => i !== index));
    },
    [form]
  );

  const handleAddVideo = useCallback(() => {
    const currentVideos = form.getValues('youtubeVideos') || [];
    if (currentVideos.length < 3) {
      form.setValue('youtubeVideos', [...currentVideos, { title: '', url: '' }]);
    }
  }, [form]);

  const handleRemoveVideo = useCallback(
    (index) => {
      const currentVideos = form.getValues('youtubeVideos') || [];
      form.setValue('youtubeVideos', currentVideos.filter((_, i) => i !== index));
    },
    [form]
  );

  const handleVideoChange = useCallback(
    (index, field, value) => {
      const currentVideos = form.getValues('youtubeVideos') || [];
      const updatedVideos = [...currentVideos];
      updatedVideos[index] = { ...updatedVideos[index], [field]: value };
      form.setValue('youtubeVideos', updatedVideos);
    },
    [form]
  );

  const handleSubjectsChange = useCallback(
    (newSubjects) => {
      form.setValue('subjects', newSubjects);
    },
    [form]
  );

  const handleSocialLinksChange = useCallback(
    (newLinks) => {
      form.setValue('socialLinks', newLinks);
    },
    [form]
  );

  const achievementsOptions = [
    { label: 'Certified Instructor', value: 'certified' },
    { label: 'Top Performer 2024', value: 'top2024' },
    { label: '100+ Students', value: '100plus' },
  ];

  const onSubmit = (data) => {
    onSave?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('name', 'Name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('name', 'Name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email', 'Email')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('email', 'Email')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('phone', 'Phone')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('phone', 'Phone')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('password', 'Password')}</FormLabel>
              <FormControl>
                <Input {...field} type="password" placeholder={t('password', 'Password')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('location', 'Location')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('location', 'Location')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isStudent && (
          <>
            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('sector', 'Sector')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('sector', 'Sector')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="grade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('grade', 'Grade')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('grade', 'Grade')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {isTutor && (
          <>
            <FormField
              control={form.control}
              name="pfp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('profilePicture', 'Profile Picture')}</FormLabel>
                  <FormControl>
                    <PfpUploadWithCrop
                      formData={{ pfp: field.value }}
                      setFormData={(newData) => form.setValue('pfp', newData.pfp)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="banner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('banner', 'Banner')}</FormLabel>
                  <FormControl>
                    <BannerUploadWithCrop
                      formData={{ banner: field.value }}
                      setFormData={(newData) => form.setValue('banner', newData.banner)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="achievements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('achievements', 'Achievements')}</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={achievementsOptions}
                      selected={field.value}
                      onChange={field.onChange}
                      placeholder={t('selectAchievements', 'Select Achievements')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isTopTutor"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormControl>
                    <Checkbox
                      id="isTopTutor"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel htmlFor="isTopTutor">{t('isTopTutor', 'Top Tutor')}</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>{t('detailedLocations', 'Detailed Locations')}</FormLabel>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {form.watch('detailedLocation')?.map((loc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg border"
                    >
                      <FormField
                        control={form.control}
                        name={`detailedLocation.${index}`}
                        render={({ field }) => (
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={`${t('location', 'Location')} ${index + 1}`}
                            />
                          </FormControl>
                        )}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDetailedLocation(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {form.watch('detailedLocation')?.length < 3 && (
                <Button type="button" onClick={handleAddDetailedLocation}>
                  <Plus className="w-4 h-4 mr-2" /> {t('addLocation', 'Add Location')}
                </Button>
              )}
            </div>
            <FormField
              control={form.control}
              name="generalBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('generalBio', 'General Bio')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={6}
                      placeholder={t('generalBio', 'General Bio')}
                      className="w-full border rounded-lg p-2"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subjects"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('subjects', 'Subjects')}</FormLabel>
                  <FormControl>
                    <SubjectsSection subjects={field.value} onChange={handleSubjectsChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="socialLinks"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('socialLinks', 'Social Links')}</FormLabel>
                  <FormControl>
                    <SocialsSection
                      socialLinks={field.value}
                      youtubeVideos={form.watch('youtubeVideos')}
                      setSocialLinks={handleSocialLinksChange}
                      onVideoChange={handleVideoChange}
                      onAddVideo={handleAddVideo}
                      onRemoveVideo={handleRemoveVideo}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <ContentManagementSection />
            <GroupsAndTablesSection />
            <PricesAndOffersSection />
            <AnalysisSection />
          </>
        )}

        <div className="flex gap-2">
          <Button type="submit">{t('save', 'Save')}</Button>
          <Button type="button" variant="outline" onClick={onCancel}>
            {t('cancel', 'Cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default EditUserForm;