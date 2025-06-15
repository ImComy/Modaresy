import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import PfpUploadWithCrop from '@/components/pfpSignup';
import BannerUploadWithCrop from '@/components/bannerSignup';

const cities = ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Tanta', 'Zagazig', 'Asyut'];

const GeneralSection = ({
  form,
  handleChange,
  getFieldErrorClasses,
  handleAddDetailedLocation,
  handleDetailedLocationChange,
  handleRemoveDetailedLocation,
  touched,
  setForm,
  defaultForm,
}) => {
  const locationError = getFieldErrorClasses('location');
  const generalBioError = getFieldErrorClasses('generalBio');
  const detailedLocationError = getFieldErrorClasses('detailedLocation'); // ✅ Add this line

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> General Info
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City dropdown */}
        <div className="relative">
          <Label htmlFor="location" className={locationError.label}>City *</Label>
          <Select
            onValueChange={(value) => handleChange({ target: { id: 'location', value } })}
            value={form.location}
          >
            <SelectTrigger className={locationError.input}>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Detailed Location list */}
        <div className="md:col-span-2 space-y-2">
          <Label className={detailedLocationError.label}>
            Detailed Locations (Max 3) *
          </Label>
          {form.detailedLocation?.map((loc, index) => {
            const error = touched.detailedLocation && !loc.trim();
            return (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={loc}
                  placeholder={`Location ${index + 1}`}
                  onChange={(e) => handleDetailedLocationChange(index, e.target.value)}
                  className={`w-full ${error ? 'border-red-500' : ''}`}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => handleRemoveDetailedLocation(index)}
                >
                  <X className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            );
          })}
          {form.detailedLocation?.length < 3 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddDetailedLocation}
              className="gap-1 text-sm mt-1"
            >
              <Plus className="w-4 h-4" /> Add Location
            </Button>
          )}

          {detailedLocationError.message && (
            <p className="text-sm text-destructive">{detailedLocationError.message}</p>
          )}
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <Label htmlFor="generalBio" className={generalBioError.label}>
            General Bio *
          </Label>
          <textarea
            id="generalBio"
            rows={5}
            value={form.generalBio}
            onChange={handleChange}
            className="w-full border rounded-md p-3 text-sm bg-background text-foreground"
          />
        </div>
        <div>
          <PfpUploadWithCrop formData={form} setFormData={setForm} defaultPfpUrl={defaultForm?.img}/>
          <BannerUploadWithCrop formData={form} setFormData={setForm} defaultBannerUrl={defaultForm?.bannerimg}/>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralSection;
