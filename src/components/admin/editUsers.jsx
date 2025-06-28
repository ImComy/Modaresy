import React from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const EditUserForm = ({ user, onChange, onSave, onCancel }) => {
  const { t } = useTranslation();

  const isTutor = user.role === 'tutor';

  const handleSubjectChange = (index, field, value) => {
    const updatedSubjects = [...(user.subjects || [])];
    updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
    onChange({ ...user, subjects: updatedSubjects });
  };

  const handleGroupChange = (subjectIndex, groupIndex, field, value) => {
    const updatedSubjects = [...(user.subjects || [])];
    const updatedGroups = [...(updatedSubjects[subjectIndex].Groups || [])];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], [field]: value };
    updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], Groups: updatedGroups };
    onChange({ ...user, subjects: updatedSubjects });
  };

  const handleSocialChange = (field, value) => {
    onChange({ ...user, socials: { ...user.socials, [field]: value } });
  };

  const handleAvailabilityChange = (field, value) => {
    onChange({ ...user, personalAvailability: { ...user.personalAvailability, [field]: value } });
  };

  return (
    <div className="mb-4 space-y-3">
      <Input
        value={user.name}
        onChange={(e) => onChange({ ...user, name: e.target.value })}
        placeholder={t('name', 'Name')}
      />
      <Input
        value={user.email}
        onChange={(e) => onChange({ ...user, email: e.target.value })}
        placeholder={t('email', 'Email')}
      />
      <Input
        value={user.phone}
        onChange={(e) => onChange({ ...user, phone: e.target.value })}
        placeholder={t('phone', 'Phone')}
      />
      <Input
        value={user.password}
        onChange={(e) => onChange({ ...user, password: e.target.value })}
        placeholder={t('password', 'Password')}
      />
      <Input
        value={user.location}
        onChange={(e) => onChange({ ...user, location: e.target.value })}
        placeholder={t('location', 'Location')}
      />
      <Input
        value={user.detailedLocation?.join(', ')}
        onChange={(e) => onChange({ ...user, detailedLocation: e.target.value.split(', ') })}
        placeholder={t('detailedLocation', 'Detailed Location')}
      />
      <Textarea
        value={user.GeneralBio}
        onChange={(e) => onChange({ ...user, GeneralBio: e.target.value })}
        placeholder={t('bio', 'General Bio')}
      />

      {isTutor && (
        <>
          <Input
            value={user.personalAvailability?.times?.join(', ')}
            onChange={(e) => handleAvailabilityChange('times', e.target.value.split(', '))}
            placeholder={t('availabilityTimes', 'Availability Times')}
          />
          <Textarea
            value={user.personalAvailability?.note}
            onChange={(e) => handleAvailabilityChange('note', e.target.value)}
            placeholder={t('availabilityNote', 'Availability Note')}
          />
          <Input
            value={user.socials?.facebook}
            onChange={(e) => handleSocialChange('facebook', e.target.value)}
            placeholder={t('facebook', 'Facebook')}
          />
          <Input
            value={user.socials?.instagram}
            onChange={(e) => handleSocialChange('instagram', e.target.value)}
            placeholder={t('instagram', 'Instagram')}
          />
          <Input
            value={user.socials?.twitter}
            onChange={(e) => handleSocialChange('twitter', e.target.value)}
            placeholder={t('twitter', 'Twitter')}
          />
          <Input
            value={user.socials?.linkedin}
            onChange={(e) => handleSocialChange('linkedin', e.target.value)}
            placeholder={t('linkedin', 'LinkedIn')}
          />
          <Input
            value={user.socials?.youtube}
            onChange={(e) => handleSocialChange('youtube', e.target.value)}
            placeholder={t('youtube', 'YouTube')}
          />
          <Input
            value={user.socials?.tiktok}
            onChange={(e) => handleSocialChange('tiktok', e.target.value)}
            placeholder={t('tiktok', 'TikTok')}
          />
          <Input
            value={user.socials?.whatsapp}
            onChange={(e) => handleSocialChange('whatsapp', e.target.value)}
            placeholder={t('whatsapp', 'WhatsApp')}
          />
          <Input
            value={user.socials?.telegram}
            onChange={(e) => handleSocialChange('telegram', e.target.value)}
            placeholder={t('telegram', 'Telegram')}
          />
          <Input
            value={user.socials?.website}
            onChange={(e) => handleSocialChange('website', e.target.value)}
            placeholder={t('website', 'Website')}
          />
          <Input
            value={user.socials?.github}
            onChange={(e) => handleSocialChange('github', e.target.value)}
            placeholder={t('github', 'GitHub')}
          />

          {(user.subjects || []).map((subject, index) => (
            <div key={index} className="border p-4 rounded-md space-y-3">
              <h3 className="font-semibold">{t('subject', 'Subject')} {index + 1}</h3>
              <Input
                value={subject.subject}
                onChange={(e) => handleSubjectChange(index, 'subject', e.target.value)}
                placeholder={t('subjectName', 'Subject Name')}
              />
              <Input
                value={subject.grade}
                onChange={(e) => handleSubjectChange(index, 'grade', e.target.value)}
                placeholder={t('grade', 'Grade')}
              />
              <Input
                value={subject.type}
                onChange={(e) => handleSubjectChange(index, 'type', e.target.value)}
                placeholder={t('type', 'Type')}
              />
              <Textarea
                value={subject.bio}
                onChange={(e) => handleSubjectChange(index, 'bio', e.target.value)}
                placeholder={t('subjectBio', 'Subject Bio')}
              />
              <Input
                value={subject.duration}
                type="number"
                onChange={(e) => handleSubjectChange(index, 'duration', parseInt(e.target.value))}
                placeholder={t('duration', 'Duration (minutes)')}
              />
              <Input
                value={subject.lecturesPerWeek}
                type="number"
                onChange={(e) => handleSubjectChange(index, 'lecturesPerWeek', parseInt(e.target.value))}
                placeholder={t('lecturesPerWeek', 'Lectures per Week')}
              />
              <Input
                value={subject.yearsExp}
                type="number"
                onChange={(e) => handleSubjectChange(index, 'yearsExp', parseInt(e.target.value))}
                placeholder={t('yearsExp', 'Years of Experience')}
              />
              <Input
                value={subject.price}
                type="number"
                onChange={(e) => handleSubjectChange(index, 'price', parseInt(e.target.value))}
                placeholder={t('price', 'Price')}
              />
              <Select
                value={subject.pricePeriod?.toString()}
                onValueChange={(value) => handleSubjectChange(index, 'pricePeriod', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('pricePeriod', 'Price Period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('month', 'Month')}</SelectItem>
                  <SelectItem value="2">{t('session', 'Session')}</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={subject.rating}
                type="number"
                step="0.1"
                onChange={(e) => handleSubjectChange(index, 'rating', parseFloat(e.target.value))}
                placeholder={t('rating', 'Rating')}
              />
              <Input
                value={subject.private?.price}
                type="number"
                onChange={(e) =>
                  handleSubjectChange(index, 'private', { ...subject.private, price: parseInt(e.target.value) })
                }
                placeholder={t('privatePrice', 'Private Lesson Price')}
              />
              <Textarea
                value={subject.private?.note}
                onChange={(e) =>
                  handleSubjectChange(index, 'private', { ...subject.private, note: e.target.value })
                }
                placeholder={t('privateNote', 'Private Lesson Note')}
              />
              <Select
                value={subject.private?.pricePeriod?.toString()}
                onValueChange={(value) =>
                  handleSubjectChange(index, 'private', { ...subject.private, pricePeriod: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('privatePricePeriod', 'Private Price Period')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{t('month', 'Month')}</SelectItem>
                  <SelectItem value="2">{t('session', 'Session')}</SelectItem>
                </SelectContent>
              </Select>
              {(subject.Groups || []).map((group, groupIndex) => (
                <div key={groupIndex} className="border p-3 rounded-md space-y-2">
                  <h4 className="font-semibold">{t('group', 'Group')} {groupIndex + 1}</h4>
                  <Input
                    value={group.groupName}
                    onChange={(e) => handleGroupChange(index, groupIndex, 'groupName', e.target.value)}
                    placeholder={t('groupName', 'Group Name')}
                  />
                  <Input
                    value={group.days?.join(', ')}
                    onChange={(e) => handleGroupChange(index, groupIndex, 'days', e.target.value.split(', '))}
                    placeholder={t('days', 'Days')}
                  />
                  <Input
                    value={group.time}
                    onChange={(e) => handleGroupChange(index, groupIndex, 'time', e.target.value)}
                    placeholder={t('time', 'Time')}
                  />
                  <Select
                    value={group.isFull?.toString()}
                    onValueChange={(value) => handleGroupChange(index, groupIndex, 'isFull', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('groupStatus', 'Group Status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">{t('available', 'Available')}</SelectItem>
                      <SelectItem value="true">{t('full', 'Full')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Textarea
                    value={group.note}
                    onChange={(e) => handleGroupChange(index, groupIndex, 'note', e.target.value)}
                    placeholder={t('groupNote', 'Group Note')}
                  />
                </div>
              ))}
            </div>
          ))}
        </>
      )}

      <div className="flex gap-2">
        <Button onClick={onSave}>{t('save', 'Save')}</Button>
        <Button variant="outline" onClick={onCancel}>
          {t('cancel', 'Cancel')}
        </Button>
      </div>
    </div>
  );
};

export default EditUserForm;