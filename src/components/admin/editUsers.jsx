import React, { useCallback, useMemo } from 'react';
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
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Define validation schema using Zod
const subjectSchema = z.object({
  subject: z.string().min(1, 'Subject name is required'),
  grade: z.string().min(1, 'Grade is required'),
  type: z.string().min(1, 'Type is required'),
  bio: z.string().optional(),
  duration: z.number().min(1, 'Duration must be at least 1 minute'),
  lecturesPerWeek: z.number().min(1, 'At least one lecture per week is required'),
  yearsExp: z.number().min(0, 'Years of experience cannot be negative'),
  price: z.number().min(0, 'Price cannot be negative'),
  pricePeriod: z.number().min(1, 'Price period is required'),
  private: z.object({
    price: z.number().min(0, 'Private lesson price cannot be negative').optional(),
    note: z.string().optional(),
    pricePeriod: z.number().min(1, 'Price period is required').optional(),
  }).optional(),
  Groups: z.array(
    z.object({
      groupName: z.string().min(1, 'Group name is required'),
      days: z.array(z.string()).min(1, 'At least one day is required'),
      time: z.string().min(1, 'Time is required'),
      isFull: z.boolean(),
      note: z.string().optional(),
    })
  ).optional(),
});

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  location: z.string().optional(),
  GeneralBio: z.string().optional(),
  personalAvailability: z.object({
    times: z.array(z.string()).optional(),
    note: z.string().optional(),
  }).optional(),
  detailedLocation: z.array(z.string()).optional(),
  subjects: z.array(subjectSchema).optional(),
});

const EditUserForm = ({ user, onSave, onCancel }) => {
  const { t } = useTranslation();

  // Initialize form with react-hook-form and zod validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...user,
      subjects: user.subjects || [],
      personalAvailability: user.personalAvailability || { times: [], note: '' },
      detailedLocation: user.detailedLocation || [],
    },
  });

  const isTutor = user.role === 'tutor';

  // Memoize callbacks to prevent unnecessary re-renders
  const handleSubjectChange = useCallback(
    (index, field, value) => {
      const updatedSubjects = [...form.getValues('subjects')];
      updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
      form.setValue('subjects', updatedSubjects);
    },
    [form]
  );

  const handleGroupChange = useCallback(
    (subjectIndex, groupIndex, field, value) => {
      const updatedSubjects = [...form.getValues('subjects')];
      const updatedGroups = [...(updatedSubjects[subjectIndex].Groups || [])];
      updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], [field]: value };
      updatedSubjects[subjectIndex] = { ...updatedSubjects[subjectIndex], Groups: updatedGroups };
      form.setValue('subjects', updatedSubjects);
    },
    [form]
  );

  const handleAvailabilityChange = useCallback(
    (field, value) => {
      form.setValue(`personalAvailability.${field}`, value);
    },
    [form]
  );

  // Handle form submission
  const onSubmit = (data) => {
    onSave(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mb-4 space-y-4">
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
        <FormField
          control={form.control}
          name="GeneralBio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('bio', 'General Bio')}</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder={t('bio', 'General Bio')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isTutor && (
          <>
            <FormField
              control={form.control}
              name="personalAvailability.times"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('availabilityTimes', 'Availability Times')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => field.onChange(e.target.value.split(', '))}
                      placeholder={t('availabilityTimes', 'Availability Times')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="personalAvailability.note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('availabilityNote', 'Availability Note')}</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder={t('availabilityNote', 'Availability Note')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="detailedLocation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('detailedLocation', 'Detailed Location')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value?.join(', ') || ''}
                      onChange={(e) => field.onChange(e.target.value.split(', '))}
                      placeholder={t('detailedLocation', 'Detailed Location')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('subjects')?.map((subject, index) => (
              <div key={index} className="border p-4 rounded-md space-y-4">
                <h3 className="font-semibold">{t('subject', 'Subject')} {index + 1}</h3>
                <FormField
                  control={form.control}
                  name={`subjects.${index}.subject`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('subjectName', 'Subject Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('subjectName', 'Subject Name')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.grade`}
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
                <FormField
                  control={form.control}
                  name={`subjects.${index}.type`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('type', 'Type')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('type', 'Type')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.bio`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('subjectBio', 'Subject Bio')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder={t('subjectBio', 'Subject Bio')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.duration`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('duration', 'Duration (minutes)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder={t('duration', 'Duration (minutes)')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.lecturesPerWeek`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('lecturesPerWeek', 'Lectures per Week')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder={t('lecturesPerWeek', 'Lectures per Week')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.yearsExp`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('yearsExp', 'Years of Experience')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder={t('yearsExp', 'Years of Experience')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('price', 'Price')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder={t('price', 'Price')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.pricePeriod`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('pricePeriod', 'Price Period')}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('pricePeriod', 'Price Period')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">{t('month', 'Month')}</SelectItem>
                          <SelectItem value="2">{t('session', 'Session')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.rating`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('rating', 'Rating')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="0.1"
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          placeholder={t('rating', 'Rating')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.private.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('privatePrice', 'Private Lesson Price')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          placeholder={t('privatePrice', 'Private Lesson Price')}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.private.note`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('privateNote', 'Private Lesson Note')}</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder={t('privateNote', 'Private Lesson Note')} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`subjects.${index}.private.pricePeriod`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('privatePricePeriod', 'Private Price Period')}</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('privatePricePeriod', 'Private Price Period')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">{t('month', 'Month')}</SelectItem>
                          <SelectItem value="2">{t('session', 'Session')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(subject.Groups || []).map((group, groupIndex) => (
                  <div key={groupIndex} className="border p-3 rounded-md space-y-3">
                    <h4 className="font-semibold">{t('group', 'Group')} {groupIndex + 1}</h4>
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.Groups.${groupIndex}.groupName`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('groupName', 'Group Name')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('groupName', 'Group Name')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.Groups.${groupIndex}.days`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('days', 'Days')}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value?.join(', ') || ''}
                              onChange={(e) => field.onChange(e.target.value.split(', '))}
                              placeholder={t('days', 'Days')}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.Groups.${groupIndex}.time`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('time', 'Time')}</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder={t('time', 'Time')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.Groups.${groupIndex}.isFull`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('groupStatus', 'Group Status')}</FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(value === 'true')}
                            value={field.value?.toString()}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder={t('groupStatus', 'Group Status')} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="false">{t('available', 'Available')}</SelectItem>
                              <SelectItem value="true">{t('full', 'Full')}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`subjects.${index}.Groups.${groupIndex}.note`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('groupNote', 'Group Note')}</FormLabel>
                          <FormControl>
                            <Textarea {...field} placeholder={t('groupNote', 'Group Note')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                ))}
              </div>
            ))}
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