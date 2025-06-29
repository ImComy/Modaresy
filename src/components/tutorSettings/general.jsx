import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { User, Plus, X, Trash2 } from 'lucide-react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';
import { SearchableSelectContent } from '@/components/ui/searchSelect';

const cities = [
  { value: 'Cairo', label: 'cairo', defaultLabel: 'Cairo' },
  { value: 'Giza', label: 'giza', defaultLabel: 'Giza' },
  { value: 'Alexandria', label: 'alexandria', defaultLabel: 'Alexandria' },
  { value: 'Mansoura', label: 'mansoura', defaultLabel: 'Mansoura' },
  { value: 'Tanta', label: 'tanta', defaultLabel: 'Tanta' },
  { value: 'Zagazig', label: 'zagazig', defaultLabel: 'Zagazig' },
  { value: 'Asyut', label: 'asyut', defaultLabel: 'Asyut' },
];

const GeneralSection = ({ form, setForm, defaultForm }) => {
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleAddDetailedLocation = () => {
    setForm((prev) => ({
      ...prev,
      detailedLocation: [...(prev.detailedLocation || []), ''],
    }));
  };

  const handleDetailedLocationChange = (index, value) => {
    setForm((prev) => {
      const updatedLocations = [...(prev.detailedLocation || [])];
      updatedLocations[index] = value;
      return { ...prev, detailedLocation: updatedLocations };
    });
  };

  const handleRemoveDetailedLocation = (index) => {
    setForm((prev) => ({
      ...prev,
      detailedLocation: prev.detailedLocation.filter((_, i) => i !== index),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="shadow-2xl border border-border/20 bg-background/95 backdrop-blur-lg rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl font-bold text-primary">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            {t('generalInfo', 'General Info')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* City dropdown */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-xs sm:text-sm font-semibold text-muted-foreground">
                {t('city', 'City')}
              </Label>
              <Select
                onValueChange={(value) => setForm((prev) => ({ ...prev, location: value }))}
                value={form.location}
              >
                <SelectTrigger className="bg-input border border-border/50 rounded-lg focus:ring-2 focus:ring-primary h-10 sm:h-11 text-xs sm:text-sm">
                  <SelectValue placeholder={t('selectCityPlaceholder', 'Select a city')} />
                </SelectTrigger>
                <SearchableSelectContent
                  searchPlaceholder={t('searchCityPlaceholder', 'Search city...')}
                  items={cities.map(city => ({
                    value: city.value,
                    label: t(city.label, city.defaultLabel),
                  }))}
                />
              </Select>
            </div>

            {/* Detailed Location list */}
            <div className="space-y-2 sm:col-span-2">
              <Label className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-muted-foreground">
                {t('detailedLocations', 'Detailed Locations (Max 3)')}
              </Label>
              <div className="flex flex-wrap gap-2 sm:gap-3 overflow-x-auto scrollbar-hidden pb-2">
                <AnimatePresence>
                  {form.detailedLocation?.map((loc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center gap-2 bg-muted/60 px-3 py-2 rounded-lg border border-border/30 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 min-w-[120px]"
                    >
                      <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[100px] sm:max-w-[150px]">
                        {loc || t('locationPlaceholder', `Location ${index + 1}`)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveDetailedLocation(index)}
                        className="h-8 w-8 sm:h-9 sm:w-9 hover:bg-destructive/20"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              {form.detailedLocation?.length < 3 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddDetailedLocation}
                    className="w-full sm:w-auto h-10 sm:h-11 bg-gradient-to-r from-primary/20 to-primary/10 text-primary hover:from-primary/30 hover:to-primary/20 hover:text-primary-foreground transition-all duration-300 rounded-lg shadow-sm hover:shadow-md text-xs sm:text-sm px-4 sm:px-6"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                    {t('addLocation', 'Add Location')}
                  </Button>
              )}
            </div>

            {/* Bio */}
            <div className="sm:col-span-2 space-y-2">
              <Label htmlFor="generalBio" className="text-md sm:text-lg font-semibold text-muted-foreground">
                {t('generalBio', 'General Bio')}
              </Label>
              <textarea
                id="generalBio"
                rows={10}
                value={form.generalBio}
                onChange={handleChange}
                placeholder={t('generalBioPlaceholder', 'Tell us about yourself...')}
                className="w-full border border-border/50 rounded-lg p-3 bg-input text-foreground text-sm  focus:ring-2 focus:ring-primary transition-all duration-300"
              />
            </div>

            {/* Profile and Banner Uploads */}
            <div className="sm:col-span-2 space-y-4 ">
              <PfpUploadWithCrop formData={form} setFormData={setForm} defaultPfpUrl={defaultForm?.img} />
              <BannerUploadWithCrop formData={form} setFormData={setForm} defaultBannerUrl={defaultForm?.bannerimg} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GeneralSection;