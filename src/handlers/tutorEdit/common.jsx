import { structuredClone } from 'structured-clone';

// Handle generic field changes for tutor object
export const handleFieldChange = (field, value, setTutor, markDirty) => {
  setTutor((prev) => ({
    ...prev,
    [field]: value,
  }));
  if (markDirty) markDirty();
};

// Handle social media platform URL changes
export const handleSocialChange = (platform, value, socials, setSocials, onChange) => {
  const updated = { ...socials, [platform]: value };
  setSocials(updated);
  onChange('socials', updated);
};

// Add a new social media platform
export const addSocial = (newSocial, socials, setSocials, setNewSocial, onChange) => {
  if (!newSocial.platform || !newSocial.url) return;
  handleSocialChange(newSocial.platform, newSocial.url, socials, setSocials, onChange);
  setNewSocial({ platform: '', url: '' });
};

// Remove a social media platform
export const removeSocial = (platform, socials, setSocials, onChange) => {
  const updated = structuredClone(socials);
  delete updated[platform];
  setSocials(updated);
  onChange('socials', updated);
};

// Add a detailed location to the tutor's location list
export const addDetailedLocation = (newDetailLoc, detailedLocation, updateDetailedLocation) => {
  const trimmed = newDetailLoc.trim();
  const currentLocations = Array.isArray(detailedLocation) ? detailedLocation : [];
  if (trimmed && !currentLocations.includes(trimmed)) {
    updateDetailedLocation([...currentLocations, trimmed]);
  }
};

// Remove a detailed location by index
export const removeDetailedLocation = (index, detailedLocation, updateDetailedLocation) => {
  const currentLocations = Array.isArray(detailedLocation) ? detailedLocation : [];
  const updated = structuredClone(currentLocations);
  updated.splice(index, 1);
  updateDetailedLocation(updated);
};

// Handle changes to a subject's fields
export const handleSubjectChange = (index, field, value, subjects, setSubjects, onChange) => {
  const updated = structuredClone(subjects);
  updated[index] = {
    ...updated[index],
    [field]: field === 'yearsExp' ? parseInt(value) || 0 : value,
  };
  setSubjects(updated);
  onChange('subjects', updated);
};

// Add a new subject to the tutor's subjects
export const addSubject = (subjects, setSubjects, onChange) => {
  const newSubject = { subject: '', grade: '', type: '', yearsExp: 0 };
  const updated = [...subjects, newSubject];
  setSubjects(updated);
  onChange('subjects', updated);
};

// Remove a subject by index
export const removeSubject = (index, subjects, setSubjects, onChange) => {
  const updated = structuredClone(subjects);
  updated.splice(index, 1);
  setSubjects(updated);
  onChange('subjects', updated);
};