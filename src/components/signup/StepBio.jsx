import React, { useEffect, useState, Fragment } from "react";
import { useStepData } from "@/context/StepContext";
import { User, Briefcase, MapPin, PhoneCall, Clock, CheckCircle, Edit2, X, Plus, Trash } from "lucide-react";
import TutorLocationMapEdit from "@/components/profile/editing/map";
import { Listbox, Transition } from "@headlessui/react";
import MultiSelect from '@/components/ui/multi-select';

export default function StepBio() {
  const { state, setState } = useStepData();

  const handleChange = (field, value) => {
    setState((s) => ({ ...s, [field]: value }));
  };

  const fieldStyle = {
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--input))",
  };

  // --- Personal availability state (stored under state.availability) ---
  const canonicalDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const availability = state?.availability || { times: [], note: "" };

  // Local temp values are stored inside state.availability to persist between steps
  useEffect(() => {
    if (!state?.availability) {
      setState(s => ({ ...s, availability: { times: [], note: "", _tempNewDay: [], _tempNewTime: "" } }));
    } else {
      // ensure keys exist
      setState(s => ({ ...s, availability: { ...{ times: [], note: "", _tempNewDay: [], _tempNewTime: "" }, ...s.availability } }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAvailabilityField = (field, value) => {
    setState(prev => ({ ...prev, availability: { ...prev.availability, [field]: value } }));
  };

  const handleAddOrUpdateAvailability = () => {
    const av = state.availability || {};
    const newDay = av._tempNewDay;
    const newTime = av._tempNewTime;
    const [startTime, endTime] = newTime ? newTime.split(" - ") : ["", ""];
    let daysArray = Array.isArray(newDay) ? newDay : (newDay ? [newDay] : []);

    if (!daysArray.length || !startTime || !endTime) return;

    // Sort days by canonical order
    const dayOrder = day => canonicalDays.indexOf(day);
    daysArray = daysArray.sort((a, b) => dayOrder(a) - dayOrder(b));

    const newEntry = { days: daysArray, hours: newTime };

    // if editing, there could be an _editingIndex in the persisted availability
    const editingIndex = av._editingIndex;
    const updatedTimes = Array.isArray(av.times) ? [...av.times] : [];

    if (typeof editingIndex === 'number' && editingIndex >= 0 && editingIndex < updatedTimes.length) {
      updatedTimes[editingIndex] = newEntry;
    } else {
      updatedTimes.push(newEntry);
    }

    handleAvailabilityField('times', updatedTimes);
    handleAvailabilityField('_tempNewDay', []);
    handleAvailabilityField('_tempNewTime', "");
    handleAvailabilityField('_editingIndex', null);
  };

  const handleEditAvailability = (index) => {
    const av = state.availability || {};
    const entry = av.times?.[index];
    if (!entry) return;
    handleAvailabilityField('_tempNewDay', entry.days || []);
    handleAvailabilityField('_tempNewTime', entry.hours || '');
    handleAvailabilityField('_editingIndex', index);
  };

  const handleRemoveAvailability = (index) => {
    const av = state.availability || {};
    const updated = [...(av.times || [])];
    updated.splice(index, 1);
    handleAvailabilityField('times', updated);
    // clear editing if removed
    if (av._editingIndex === index) handleAvailabilityField('_editingIndex', null);
  };

  const handleCancelEdit = () => {
    handleAvailabilityField('_tempNewDay', []);
    handleAvailabilityField('_tempNewTime', "");
    handleAvailabilityField('_editingIndex', null);
  };

  return (
    <div className="px-6 py-8">
      <header className="flex flex-col items-center text-center">
        <h3
          className="text-2xl font-semibold mb-2 flex items-center gap-2"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Tell students who you are
        </h3>
        <p
          className="max-w-[64ch]"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          A short intro, your teaching style, and background details help students
          choose you with confidence.
        </p>
      </header>

      <div className="space-y-5 mt-6">
        {/* Bio */}
        <div>
          <label
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <User className="w-4 h-4" />
            Bio
          </label>
          <textarea
            placeholder="Write a short introduction about yourself and your teaching style"
            value={state?.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full p-3 rounded-lg resize-none h-28"
            style={fieldStyle}
            aria-label="bio"
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <Briefcase className="w-4 h-4" />
            Years of Experience
          </label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={state?.yearsExp || ""}
            onChange={(e) => handleChange("yearsExp", e.target.value)}
            className="w-full p-3 rounded-lg"
            style={fieldStyle}
            aria-label="years of experience"
          />
        </div>

        {/* Address */}
        <div>
          <label
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <MapPin className="w-4 h-4" />
            Address
          </label>
          <input
            placeholder="City, Neighborhood, or Online Only"
            value={state?.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full p-3 rounded-lg"
            style={fieldStyle}
            aria-label="address"
          />
        </div>

        {/* Map */}
        <div>
          <label
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <MapPin className="w-4 h-4" />
            Location
          </label>
          <TutorLocationMapEdit isOnboarding={true} />
        </div>

        {/* --- Personal Availability (improved) --- */}
        <div className="pt-6 border-t border-border">
          <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-accent"><Clock className="w-5 h-5" /><h4 className="text-sm font-semibold">Personal Availability</h4></div>
            <p className="text-sm text-muted-foreground">Let students know when you're generally available for contact or inquiries. You can add multiple time slots for different days. This helps set expectations for response times.</p>

            <div className="space-y-1">
              <label className="text-sm font-medium text-foreground">Your current availability slots</label>
              <div className="space-y-2 mt-2">
                {(availability.times || []).map((entry, i) => (
                  <div key={i} className="flex items-center justify-between bg-background border border-border rounded-md p-3 text-sm">
                    <span>{entry.days.join(', ')}: {entry.hours}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEditAvailability(i)} className="text-muted-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                      <button type="button" onClick={() => handleRemoveAvailability(i)} className="text-muted-foreground hover:text-destructive"><Trash className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
                {!(availability.times || []).length && (
                  <p className="text-sm text-muted-foreground italic">No availability slots added yet. Add one below!</p>
                )}
              </div>
            </div>

            <div className="space-y-1 pt-4 border-t border-border/50">
              <label className="text-sm font-medium text-foreground">Add or edit a slot</label>
              <p className="text-xs text-muted-foreground">Select one or more days and a time range.</p>

              <div className="space-y-3 mt-2">
                <MultiSelect
                  options={canonicalDays}
                  selected={availability._tempNewDay || []}
                  onChange={(sel) => handleAvailabilityField('_tempNewDay', sel)}
                  placeholder={'Select days'}
                  display={(d) => d.slice(0,3)}
                />

                <div className="flex gap-3 items-center">
                  <Listbox value={(availability._tempNewTime || '').split(' - ')[0] || ''} onChange={(value) => {
                    const endTime = timeSlots[Math.min(timeSlots.indexOf(value) + 1, timeSlots.length - 1)] || "";
                    handleAvailabilityField('_tempNewTime', `${value} - ${endTime}`);
                  }}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate text-sm">{(availability._tempNewTime || '').split(' - ')[0] || 'Start time'}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-5 w-5 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option key={time} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-accent text-accent-foreground' : 'text-foreground'}`} value={time}>
                              {({ selected }) => (
                                <>
                                  <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{time}</span>
                                  {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckCircle className="h-5 w-5" /></span>) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>

                  <span className="text-muted-foreground">to</span>

                  <Listbox value={(availability._tempNewTime || '').split(' - ')[1] || ''} onChange={(value) => {
                    const startTime = (availability._tempNewTime || '').split(' - ')[0] || timeSlots[0];
                    handleAvailabilityField('_tempNewTime', `${startTime} - ${value}`);
                  }}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate text-sm">{(availability._tempNewTime || '').split(' - ')[1] || 'End time'}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-5 w-5 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => {
                            const startTimeVal = (availability._tempNewTime || '').split(' - ')[0] || timeSlots[0];
                            const isDisabled = timeSlots.indexOf(time) <= timeSlots.indexOf(startTimeVal);
                            return (
                              <Listbox.Option key={time} className={({ active }) => `relative cursor-pointer select-none py-2 pl-10 pr-4 ${active ? 'bg-accent text-accent-foreground' : 'text-foreground'} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}` } value={time} disabled={isDisabled}>
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{time}</span>
                                    {selected && (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckCircle className="h-5 w-5" /></span>)}
                                  </>
                                )}
                              </Listbox.Option>
                            );
                          })}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>

                <div className="flex gap-2">
                  <button type="button" onClick={handleAddOrUpdateAvailability} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">{(availability._editingIndex != null) ? 'Update slot' : 'Add slot'}</button>
                  {availability._editingIndex != null && (
                    <button type="button" onClick={handleCancelEdit} className="px-4 py-2 rounded-md border border-border bg-background text-sm hover:bg-accent">Cancel</button>
                  )}
                </div>

                {(availability._tempNewTime && availability._tempNewTime.includes(' - ') && timeSlots.indexOf(availability._tempNewTime.split(' - ')[1]) <= timeSlots.indexOf(availability._tempNewTime.split(' - ')[0])) && (<p className="text-sm text-destructive mt-1">End time must be after start time.</p>)}
              </div>
            </div>

            <div className="space-y-1 pt-4 border-t border-border/50">
              <label className="text-sm font-medium text-foreground">Communication note (optional)</label>
              <p className="text-xs text-muted-foreground">Share any additional details, like preferred contact methods or typical response times.</p>
              <textarea 
                placeholder="e.g., I prefer WhatsApp for quick responses and usually reply within 24 hours. For urgent matters, call me during availability hours."
                value={availability.note || ''} 
                onChange={(e) => handleAvailabilityField('note', e.target.value)} 
                className="w-full p-3 rounded-lg h-20" 
                style={fieldStyle} 
              />
            </div>

            {(!(availability.times || []).length && !availability.note) && (
              <p className="text-sm italic text-muted-foreground mt-4">Example: Add slots like Monday, Wednesday: 16:00 - 18:00, and a note like "I reply within 24 hours via WhatsApp or email."</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}