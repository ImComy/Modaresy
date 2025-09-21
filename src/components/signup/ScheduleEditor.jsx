import React, { useState, useEffect, Fragment } from "react";
import {
  Clock, CalendarDays, Trash, Plus,
  CheckCircle, AlertCircle, Edit2, X, BookOpen, ChevronDown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Listbox, Transition } from "@headlessui/react";
import MultiSelect from '@/components/ui/multi-select';
import SubjectSelector from './SubjectSelector';

// --- MOCK SUBJECTS ---
const MOCK_SUBJECTS = [
  {
    "id": "1",
    "name": "Introduction to Computer Science",
    "code": "CS101",
    "group_name": "Core Subjects",
    "groups": [
      {
        "id": "group-cs101-1",
        "day": "Monday",
        "time_start": "09:00",
        "time_end": "10:30",
        "location": "Room 301",
        "Status": false,
        "additional_note": "First half of the semester."
      },
      {
        "id": "group-cs101-2",
        "day": "Wednesday",
        "time_start": "11:00",
        "time_end": "12:30",
        "location": "Lab C",
        "Status": false,
        "additional_note": "Practical exercises."
      }
    ]
  },
  {
    "id": "2",
    "name": "Linear Algebra",
    "code": "MATH202",
    "group_name": "Mathematics",
    "groups": [
      {
        "id": "group-math202-1",
        "day": "Tuesday",
        "time_start": "13:00",
        "time_end": "14:30",
        "location": "Lecture Hall 5",
        "Status": true,
        "additional_note": "This group is currently full."
      }
    ]
  },
  {
    "id": "3",
    "name": "Digital Marketing",
    "code": "MKT301",
    "group_name": "Business & Marketing",
    "groups": [
      {
        "id": "group-mkt301-1",
        "day": "Friday",
        "time_start": "10:00",
        "time_end": "11:30",
        "location": "Room 205",
        "Status": false,
        "additional_note": "Guest speaker this week."
      }
    ]
  },
  {
    "id": "4",
    "name": "Introduction to Philosophy",
    "code": "PHIL101",
    "group_name": "Humanities",
    "groups": []
  },
  {
    "id": "5",
    "name": "Calculus I",
    "code": "MATH101",
    "group_name": "Mathematics",
    "groups": [
      {
        "id": "group-math101-1",
        "day": "Monday",
        "time_start": "13:00",
        "time_end": "14:30",
        "location": "Auditorium A",
        "Status": false,
        "additional_note": ""
      },
      {
        "id": "group-math101-2",
        "day": "Wednesday",
        "time_start": "15:00",
        "time_end": "16:30",
        "location": "Room 102",
        "Status": false,
        "additional_note": ""
      }
    ]
  },
  {
    "id": "6",
    "name": "Advanced Data Structures",
    "code": "CS305",
    "group_name": "Core Subjects",
    "groups": [
      {
        "id": "group-cs305-1",
        "day": "Thursday",
        "time_start": "10:00",
        "time_end": "12:00",
        "location": "Room 401",
        "Status": false,
        "additional_note": "Algorithm analysis"
      }
    ]
  }
];
// --- END MOCK SUBJECTS ---

const ScheduleEditor = () => {
  const { t, i18n } = useTranslation();

  const [selectedSubject, setSelectedSubject] = useState(null);

  const handleSubjectSelection = (subject) => {
    setSelectedSubject(subject);
  };
  
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const [groups, setGroups] = useState(selectedSubject?.groups || []);

  useEffect(() => {
    try {
      const wd = t('constants.weekDays', { returnObjects: true });
      const canonical = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (wd && typeof wd === 'object') {
        const mappedDays = canonical.map(day => ({
          value: day,
          label: wd[day]
        }));
        setDaysOfWeek(mappedDays);
      }
    } catch (error) {
      console.error("Failed to load weekDays from i18n", error);
    }
  }, [t]);

  useEffect(() => {
    if (selectedSubject) {
      setGroups(selectedSubject.groups || []);
    }
  }, [selectedSubject]);

  const handleGroupChange = (index, field, value) => {
    const newGroups = [...groups];
    newGroups[index][field] = value;
    setGroups(newGroups);
  };

  const handleAddGroup = () => {
    setGroups([...groups, {
      id: Math.random().toString(36).substr(2, 9),
      day: null,
      time_start: null,
      time_end: null,
      location: "",
      note: "",
      isFull: false,
    }]);
  };

  const handleRemoveGroup = (index) => {
    const newGroups = groups.filter((_, i) => i !== index);
    setGroups(newGroups);
  };

  const dayLabel = (value) => {
    return daysOfWeek.find(d => d.value === value)?.label || value;
  };

  const timeLabel = (value) => {
    if (!value) return "";
    const [hour, minute] = value.split(':');
    return `${parseInt(hour, 10) % 12 || 12}:${minute} ${parseInt(hour, 10) >= 12 ? 'PM' : 'AM'}`;
  };

  const validateGroup = (group) => {
    return group.day && group.time_start && group.time_end && group.location;
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("editSchedule")}</h1>
      
      <div className="mb-8">
        <SubjectSelector
          subjects={MOCK_SUBJECTS} // Pass the mock data here
          onSelectSubject={handleSubjectSelection}
        />
      </div>

      {selectedSubject ? (
    <div className="p-6 shadow-sm space-y-6">
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center items-center gap-2 text-primary">
          <CalendarDays className="w-6 h-6" />
          <h2 className="text-2xl font-bold tracking-tight">{t("bookingSchedule")}</h2>
        </div>
        <p className="text-muted-foreground max-w-[64ch] mx-auto">
          Organize your teaching groups for this subject. Add groups, select days, set time ranges, and add notes to help students understand the schedule.
        </p>
      </div>

      {groups.length === 0 && (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No groups added yet. Click "Add Group" to start organizing your schedule.</p>
        </div>
      )}

      {groups.map((group, i) => {
        const isFull = group.Status;
        const [startTime, endTime] = group.Time ? group.Time.split(" - ") : ["", ""];
        return (
          <div
            key={i}
            className={cn(
              "rounded-xl p-5 border space-y-4 relative transition-shadow shadow-md hover:shadow-lg",
              isFull
                ? "bg-destructive/5 border-destructive/20"
                : "bg-accent/5 border-accent/20"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold">{group.Name || t("unnamedGroup")}</h3>
              <span className={cn("text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1", isFull ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent")}> 
                {isFull ? (
                  <>
                    <AlertCircle className="w-3 h-3" />{t("full")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" />{t("available")}
                  </>
                )}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">{t("groupName")}</label>
                <Input 
                  placeholder={t("enterGroupName", "e.g., Beginner Level, Morning Session")} 
                  value={group.Name || ""} 
                  onChange={(e) => handleGroupChange(i, "Name", e.target.value)} 
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("days")}</label>
                <p className="text-xs text-muted-foreground mb-1">Choose the days of the week for this group.</p>
                <MultiSelect
                  options={daysOfWeek}
                  selected={group.Days || []}
                  onChange={(sel) => handleGroupChange(i, 'Days', sel)}
                  placeholder={t('selectDays', "Select days...")}
                  display={(d) => t(`constants.weekDays.${d}`, { defaultValue: d })}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("timeRange")}</label>
                <p className="text-xs text-muted-foreground mb-2">Choose the time range for this group.</p>
                <div className="flex gap-3 items-center">
                  <Listbox value={startTime || ""} onChange={(value) => handleGroupTimeChange(i, value, endTime)}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary text-md">
                        <span className="block truncate">{startTime || t("startTime", "Start time")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-4 w-4 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option key={time} className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm", active ? "bg-accent text-accent-foreground" : "text-foreground")} value={time}>
                              {({ selected }) => (
                                <>
                                  <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>{time}</span>
                                  {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckCircle className="h-4 w-4" /></span>) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>

                  <span className="text-muted-foreground">to</span>

                  <Listbox value={endTime || ""} onChange={(value) => handleGroupTimeChange(i, startTime, value)}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary text-md">
                        <span className="block truncate">{endTime || t("endTime", "End time")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-4 w-4 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option key={time} className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm", active ? "bg-accent text-accent-foreground" : "text-foreground", timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0]) ? "opacity-50 cursor-not-allowed" : "") } value={time} disabled={timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0])}>
                              {({ selected }) => (
                                <>
                                  <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>{time}</span>
                                  {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckCircle className="h-4 w-4" /></span>) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
                {startTime && endTime && timeSlots.indexOf(endTime) <= timeSlots.indexOf(startTime) && (<p className="text-xs text-destructive mt-1">{t("invalidTimeRange")}</p>)}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">{t("note")} ({t("optional")})</label>
                <Textarea 
                  placeholder={t("enterNote", "e.g., Please bring your textbook and notebook. Sessions focus on practical exercises.")} 
                  value={group.additional_note || ""} 
                  onChange={(e) => handleGroupChange(i, "additional_note", e.target.value)} 
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" className="accent-destructive w-4 h-4 rounded" checked={isFull || false} onChange={(e) => handleGroupChange(i, "Status", e.target.checked)} />
                  {t("markAsFull")}
                </label>
                <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => handleRemoveGroup(i)}>
                  <Trash className="w-4 h-4 mr-2 rtl:ml-2" />
                  {t("remove")}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      <Button type="button" variant="default" onClick={handleAddGroup} className="w-fit"><Plus className="w-4 h-4 mr-2" /> {t("addGroup")}</Button>

    </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-muted rounded-lg">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p className="text-lg font-medium">{t("noSubjectSelected")}</p>
          <p>{t("pleaseSelectASubjectAbove")}</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleEditor;