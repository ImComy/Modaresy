import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import AnalysisSection from '@/components/Dashboard/analysis';
import TutorProfilePage from '@/pages/TutorProfilePage';

// Define validation schema using Zod
const formSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
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
  const isTutor = user?.role === 'tutor';
  const isStudent = user?.role === 'student';

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: user?.id || '',
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: '',
      location: user?.location || '',
      sector: user?.sector || '',
      grade: user?.grade || '',
      pfp: user?.pfp || null,
      banner: user?.banner || null,
      achievements: user?.achievements || [],
      isTopTutor: user?.isTopTutor || false,
      detailedLocation: user?.detailedLocation || [],
      generalBio: user?.generalBio || '',
      socialLinks: user?.socialLinks || {},
      youtubeVideos: user?.youtubeVideos || [],
      subjects: user?.subjects || [],
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

  const onSubmit = (data) => {
    onSave?.(data);
  };

  if (!user?.id) {
    return (
      <div className="text-red-500 p-4">
        {t('error', 'Error: Invalid or missing user ID. Please select a valid user.')}
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-2">{t('tutorProfilePreview', 'Tutor Profile Preview')}</h3>
              <TutorProfilePage tutorId={Number(user.id)} isEditing={true} />
            </div>
            <AnalysisSection id={user.id} />
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