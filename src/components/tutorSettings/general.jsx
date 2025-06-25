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
import {SearchableSelectContent} from '@/components/ui/searchSelect';

const cities = ['Cairo', 'Giza', 'Alexandria', 'Mansoura', 'Tanta', 'Zagazig', 'Asyut'];

const GeneralSection = ({ form, setForm, defaultForm }) => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" /> General Info
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* City dropdown with smart search */}
        <div className="relative">
          <Label htmlFor="location">City</Label>
          <Select
            onValueChange={(value) => setForm((prev) => ({ ...prev, location: value }))}
            value={form.location}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a city" />
            </SelectTrigger>
            <SearchableSelectContent
              searchPlaceholder="Search city..."
              items={cities.map(city => ({
                value: city,
                label: city,
              }))}
            />
          </Select>
        </div>

        {/* Detailed Location list */}
        <div className="md:col-span-2 space-y-2">
          <Label>Detailed Locations (Max 3)</Label>
          {form.detailedLocation?.map((loc, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input
                value={loc}
                placeholder={`Location ${index + 1}`}
                onChange={(e) => handleDetailedLocationChange(index, e.target.value)}
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
          ))}
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
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <Label htmlFor="generalBio">General Bio</Label>
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