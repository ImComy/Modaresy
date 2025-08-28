import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import EditToggleButton from '@/components/ui/EditToggleButton';
import TutorProfileHeader from '@/components/profile/TutorProfileHeader';
import SubjectSelector from '@/components/profile/subjectSelector';
import BlogSection from '@/components/profile/BlogSection';
import useTutorProfile from '@/hooks/useTutorProfile';
import useEditMode from '@/hooks/useEditMode';
import { apiFetch, API_BASE } from '@/api/apiService';
import { BookOpen, FileText } from 'lucide-react';
import Loader from '@/components/ui/loader';

const SegmentedControl = ({ options, value, onChange, ariaLabel = 'View Mode' }) => {
  const containerRef = useRef(null);

  const activeIndex = options.findIndex((o) => o.value === value);
  const handleKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    let next = activeIndex;
    if (e.key === 'ArrowRight') next = (activeIndex + 1) % options.length;
    if (e.key === 'ArrowLeft') next = (activeIndex - 1 + options.length) % options.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = options.length - 1;
    onChange(options[next].value);
    const btn = containerRef.current?.querySelectorAll('[role="tab"]')[next];
    btn && btn.focus();
  };

  const activeBg = `linear-gradient(90deg, hsl(var(--primary)), hsl(var(--secondary)))`;
  const inactiveText = 'hsl(var(--muted-foreground))';
  const activeText = 'hsl(var(--primary-foreground))';
  const borderColor = 'hsl(var(--border))';

  return (
    <div className="w-full flex justify-center">
      <div
        ref={containerRef}
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={handleKeyDown}
        className="relative inline-flex rounded-full p-1"
        style={{
          background: 'hsl(var(--muted))',
          padding: 6,
          borderRadius: 9999,
          boxShadow: '0 2px 10px rgba(2,6,23,0.03)',
        }}
      >
        {options.map((opt, i) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              role="tab"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(opt.value)}
              className="relative z-10 flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer select-none focus:outline-none"
              style={{
                background: 'transparent',
                color: active ? activeText : inactiveText,
                minWidth: 120,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                fontWeight: 600,
              }}
            >
              {active && (
                <motion.span
                  layoutId="segmented-pill"
                  className="absolute inset-0 rounded-3xl"
                  style={{
                    background: activeBg,
                    zIndex: -1,
                    boxShadow: '0 10px 30px rgba(2,6,23,0.08)',
                  }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                />
              )}

              {opt.icon && <opt.icon size={16} style={{ color: 'inherit' }} />}
              <span style={{ pointerEvents: 'none' }}>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const TutorProfilePage = ({ tutorId: propTutorId, isEditing: externalEditing = null }) => {
  const { t } = useTranslation();

  const {
    tutor,
    isLoading,
    isOwner,
    subjects,
    fetchTutorData,
    addSubject: addSubjectToBackend,
    updateSubject: updateSubjectInBackend,
    deleteSubject: deleteSubjectFromBackend,
    updateSubjectProfile,
    deleteSubjectProfile,
  } = useTutorProfile(propTutorId, externalEditing);

  const {
    isEditing,
    hasChanges,
    editedData,
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
    reset,
    isSubmitting
  } = useEditMode({
    initialData: tutor,
    onSaveCallback: async (updatedData) => {
      try {
        const originalSubjects = tutor?.subjects || [];
        const updatedSubjects = updatedData.subjects || [];

        const originalSubjectIds = new Set(originalSubjects.map(s => s._id));
        const updatedSubjectIds = new Set(updatedSubjects.map(s => s._id).filter(id => id));

        const addedSubjects = updatedSubjects.filter(s => !s._id);
        const deletedSubjectIds = originalSubjects.filter(s => !updatedSubjectIds.has(s._id)).map(s => s._id);
        const existingSubjectsToUpdate = updatedSubjects.filter(s => s._id && originalSubjectIds.has(s._id));

        const promises = [];

        addedSubjects.forEach(subject => {
          promises.push(addSubjectToBackend(subject));
        });

        deletedSubjectIds.forEach(subjectId => {
          promises.push(deleteSubjectFromBackend(subjectId));
        });

        existingSubjectsToUpdate.forEach(subject => {
          const { profileId, ...coreData } = subject;
          const { name, grade, education_system, language, sector, years_experience, ...profileData } = coreData;

          ['group_pricing', 'private_pricing'].forEach(key => {
            if (profileData[key]?.offer?.percentage) {
              profileData[key].offer.percentage = Number(profileData[key].offer.percentage);
            }
          });
          
          if (profileData.additional_pricing) {
            profileData.additional_pricing = profileData.additional_pricing.map(item => ({
              ...item,
              offer: item.offer ? {
                ...item.offer,
                percentage: Number(item.offer.percentage) || 0
              } : null
            }));
          }
          
          const coreFields = { name, grade, education_system, language, sector, years_experience };

          promises.push(updateSubjectInBackend(subject._id, coreFields));

          if (profileId) {
            const profileFields = Object.keys(profileData).reduce((acc, key) => {
              if (!['subjects', '_id', 'tutor_id', 'createdAt', 'updatedAt', '__v'].includes(key)) {
                acc[key] = profileData[key];
              }
              return acc;
            }, {});
            promises.push(updateSubjectProfile(profileId, profileFields));
          }
        });

        const tutorProfileData = { ...updatedData };
        delete tutorProfileData.subjects;

        const uploadToStorage = async (file, shape) => {
          if (!file) return null;
          const form = new FormData();
          if (shape === 'profile') form.append('profile_picture', file);
          else form.append('banner', file);
          const token = localStorage.getItem('token');
          const url = `${API_BASE}/storage/tutor/${tutor._id}/${shape === 'profile' ? 'pfp' : 'banner'}`;
          const res = await fetch(url, {
            method: 'POST',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            body: form,
          });
          if (!res.ok) {
            const txt = await res.text();
            throw new Error(txt || 'Upload failed');
          }
          const parsed = await res.json();
          return parsed.profile_picture || parsed.banner || null;
        };

        const pending = (pendingFilesRef && pendingFilesRef.current) ? pendingFilesRef.current : {};
        console.debug('Saving tutor - pending files from header ref:', pending);
        try {
          // profile picture delete
          if (pending.pendingPfpDelete) {
            promises.push(apiFetch(`/storage/tutor/${tutor._id}/pfp`, { method: 'DELETE' }));
            tutorProfileData.profile_picture = null;
            tutorProfileData.img = '';
          }

          // profile picture upload
          if (pending.pendingPfpFile) {
            console.debug('Uploading pendingPfpFile...', pending.pendingPfpFile);
            const returned = await uploadToStorage(pending.pendingPfpFile, 'profile');
            console.debug('uploadToStorage returned (pfp):', returned);
            if (returned) {
              const url = returned.url || returned.path || '';
              tutorProfileData.profile_picture = returned;
              tutorProfileData.img = url && url.startsWith('/') ? `${API_BASE}${url}` : url;
            }
          }

          // banner delete
          if (pending.pendingBannerDelete) {
            promises.push(apiFetch(`/storage/tutor/${tutor._id}/banner`, { method: 'DELETE' }));
            tutorProfileData.banner = null;
            tutorProfileData.bannerimg = '';
          }

          // banner upload
          if (pending.pendingBannerFile) {
            console.debug('Uploading pendingBannerFile...', pending.pendingBannerFile);
            const returned = await uploadToStorage(pending.pendingBannerFile, 'banner');
            console.debug('uploadToStorage returned (banner):', returned);
            if (returned) {
              const url = returned.url || returned.path || '';
              tutorProfileData.banner = returned;
              tutorProfileData.bannerimg = url && url.startsWith('/') ? `${API_BASE}${url}` : url;
            }
          }
        } catch (imgErr) {
          console.error('Image upload/delete error:', imgErr);
          throw imgErr;
        }

        promises.push(apiFetch('/tutors/updateProfile', {
          method: 'PUT',
          body: JSON.stringify({ updated_information: tutorProfileData })
        }));

        await Promise.all(promises);

        await fetchTutorData(tutor._id);
        // clear any pending file references after successful save
        if (pendingFilesRef && pendingFilesRef.current) {
          pendingFilesRef.current.pendingPfpFile = null;
          pendingFilesRef.current.pendingBannerFile = null;
          pendingFilesRef.current.pendingPfpDelete = false;
          pendingFilesRef.current.pendingBannerDelete = false;
        }
        return { success: true };

      } catch (error) {
        console.error('Error updating tutor profile:', error);
        throw error;
      }
    },
    onCancelCallback: () => reset()
  });

  const pendingFilesRef = useRef({ pendingPfpFile: null, pendingBannerFile: null, pendingPfpDelete: false, pendingBannerDelete: false });
  const [viewMode, setViewMode] = useState('subjects');

  const addSubject = (newSubject) => {
    const updatedSubjects = [...(editedData?.subjects || []), { ...newSubject, tempId: Date.now() }];
    updateField('subjects', updatedSubjects);
  };

  const updateSubject = (index, subjectData) => {
    const updatedSubjects = [...(editedData?.subjects || [])];
    if (index < 0 || index >= updatedSubjects.length) return;
    
    updatedSubjects[index] = { ...updatedSubjects[index], ...subjectData };
    updateField('subjects', updatedSubjects);
  };

  const removeSubject = (index) => {
    const subjectsToDelete = editedData?.subjects || [];
    if (index < 0 || index >= subjectsToDelete.length) return;

    const updatedSubjects = subjectsToDelete.filter((_, i) => i !== index);
    updateField('subjects', updatedSubjects);
  };

  const handleSubmit = async (e) => {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();
    if (!hasChanges) return;
    try {
      await saveChanges();
    } catch (error) {
      console.error('Submission error:', error);
    }
  };

  const segOptions = [
    { value: 'subjects', label: t('Subjects') || 'Subjects', icon: BookOpen },
    { value: 'blog', label: t('Blog') || 'Blog', icon: FileText },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader />
      </div>
    );
  }

  if (!tutor) {
    return <div className="text-center py-10">{t('tutorNotFound')}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="max-w-6xl mx-auto space-y-8 pb-12"
    >
      <form onSubmit={handleSubmit}>
        {/* Hide edit toggle when viewing blog */}
        {isOwner && viewMode !== 'blog' && (
          <div className="mb-4 flex justify-end">
            <EditToggleButton
              isEditing={isEditing}
              isSaving={isSubmitting}
              startEditing={startEditing}
              cancelEditing={cancelEditing}
              onSave={saveChanges}
            />
          </div>
        )}

        <TutorProfileHeader
          tutor={isEditing ? editedData : tutor}
          onChange={updateField}
          onAddSubject={addSubject}
          onUpdateSubject={updateSubject}
          onDeleteSubject={removeSubject}
          isEditing={isEditing}
          isOwner={isOwner}
          pendingFilesRef={pendingFilesRef}
        />

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            {/* Centered, animated segmented control */}
            <div className="flex-1 flex justify-center mt-5">
              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="inline-block"
              >
                <SegmentedControl
                  options={segOptions}
                  value={viewMode}
                  onChange={(val) => setViewMode(val)}
                  ariaLabel="Profile view mode"
                />
              </motion.div>
            </div>
          </div>

          {/* Animated view container */}
          <div>
            <AnimatePresence mode="wait">
              {viewMode === 'subjects' ? (
                <motion.div
                  key="subjects"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                >
                  <SubjectSelector
                    tutor={isEditing ? editedData : tutor}
                    subjects={isEditing && editedData?.subjects ? editedData.subjects : (subjects || [])}
                    isEditing={isEditing}
                    isOwner={isOwner}
                    onUpdateSubject={updateSubject}
                    onDeleteSubject={removeSubject}
                    onTutorChange={updateField}
                    onReviewUpdate={() => fetchTutorData(tutor._id)}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="blog"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28 }}
                >
                  <BlogSection tutorId={tutor._id} isOwner={isOwner} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default TutorProfilePage;
