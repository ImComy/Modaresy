import React, { useState, useEffect, Fragment } from "react";
import {
  Clock, CalendarDays, PhoneCall, Trash, Plus,
  CheckCircle, AlertCircle, Edit2, X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Listbox, Transition } from "@headlessui/react";
import MultiSelect from '@/components/ui/multi-select';

const TutorGroupsCardEdit = ({ subject, tutor, onSubjectChange, onTutorChange }) => {
  const { t, i18n } = useTranslation();

  const [daysOfWeek, setDaysOfWeek] = useState([]);

  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  const [groups, setGroups] = useState(subject?.groups || []);
  const [availability, setAvailability] = useState({
    times: tutor?.availability?.times || [],
    note: tutor?.availability?.note || "",
    _tempNewDay: "",
    _tempNewTime: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    try {
      const wd = t('constants.weekDays', { returnObjects: true });
      const canonical = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (wd && typeof wd === 'object') {
        const keys = Object.keys(wd).filter(k => canonical.includes(k));
        setDaysOfWeek(keys.length ? keys : canonical);
      } else {
        setDaysOfWeek(canonical);
      }
    } catch (err) {
      setDaysOfWeek(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
    }
  }, [i18n.language, t]);

  useEffect(() => {
    const incoming = subject?.groups || [];
    const canonical = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const normalizeDay = (d) => {
      if (!d) return d;
      if (canonical.includes(d)) return d;
      const found = canonical.find(k => t(`constants.weekDays.${k}`, { defaultValue: k }) === d);
      return found || d;
    };
    const normalizedGroups = (Array.isArray(incoming) ? incoming : []).map(g => ({
      ...g,
      Days: Array.isArray(g?.Days) ? g.Days.map(normalizeDay) : (g?.Days ? [normalizeDay(g.Days)] : [])
    }));
    setGroups(normalizedGroups);
  }, [subject, t]);

  useEffect(() => {
    const incoming = tutor?.availability || {};
    const canonical = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const normalizeDay = (d) => {
      if (!d) return d;
      if (canonical.includes(d)) return d;
      const found = canonical.find(k => t(`constants.weekDays.${k}`, { defaultValue: k }) === d);
      return found || d;
    };
    const normalizedTimes = (Array.isArray(incoming.times) ? incoming.times : []).map(entry => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object') {
        const daysArr = Array.isArray(entry.days) ? entry.days : [entry.days];
        return { ...entry, days: daysArr.map(normalizeDay) };
      }
      return entry;
    });
    setAvailability(prev => ({ ...prev, times: normalizedTimes, note: incoming.note || prev.note }));
  }, [tutor, t]);

  const handleGroupChange = (index, field, value) => {
    const newGroups = [...groups];
    newGroups[index] = { ...newGroups[index], [field]: value };
    setGroups(newGroups);
    onSubjectChange && onSubjectChange('groups', newGroups);
  };

  const handleAddGroup = () => {
    setGroups(prevGroups => {
      const updatedGroups = [
        ...prevGroups,
        {
          Name: "",
          Days: [],
          Time: "",
          additional_note: "",
          Status: false,
        },
      ];

      onSubjectChange && onSubjectChange("groups", updatedGroups);
      return updatedGroups;
    });
  };

  const handleRemoveGroup = (index) => {
    setGroups(prevGroups => {
      const updatedGroups = [...prevGroups];
      updatedGroups.splice(index, 1);
      onSubjectChange && onSubjectChange("groups", updatedGroups);
      return updatedGroups;
    });
  };

  const handleGroupTimeChange = (index, newStart, newEnd) => {
    setGroups(prevGroups => {
      const updatedGroups = [...prevGroups];
      const currentGroup = prevGroups[index];
      const parts = currentGroup.Time ? currentGroup.Time.split(" - ") : [];
      let currentStart = parts[0] || '';
      let currentEnd = parts[1] || '';

      let end = newEnd !== undefined ? newEnd : currentEnd;
      if (newStart !== undefined && !end) {
        const startIndex = timeSlots.indexOf(newStart);
        if (startIndex !== -1 && startIndex < timeSlots.length - 1) {
          end = timeSlots[startIndex + 1];
        }
      }

      const start = newStart !== undefined ? newStart : currentStart;
      const newTime = `${start}${end ? ` - ${end}` : ''}`;

      updatedGroups[index] = {
        ...currentGroup,
        Time: newTime
      };

      onSubjectChange && onSubjectChange("groups", updatedGroups);
      return updatedGroups;
    });
  };

  const handleAvailabilityChange = (field, value) => {
    const updated = { ...availability, [field]: value };
    setAvailability(updated);
    if (field !== "_tempNewDay" && field !== "_tempNewTime" && onTutorChange) {
      const { _tempNewDay, _tempNewTime, ...toSend } = updated;
      onTutorChange("availability", toSend);
    }
  };

  const handleAddAvailabilityTime = () => {
    const newDay = availability._tempNewDay;
    const newTime = availability._tempNewTime;
    const [startTime, endTime] = newTime ? newTime.split(" - ") : ["", ""];
    const daysArrayRaw = Array.isArray(newDay) ? newDay : [newDay];
    const daysArray = daysArrayRaw.map(d => {
      if (daysOfWeek.includes(d)) return d;
      const foundKey = daysOfWeek.find(k => t(`constants.weekDays.${k}`, { defaultValue: k }) === d);
      return foundKey || d;
    });

    if (!newDay || !startTime || !endTime) return;

    const newEntry = {
      days: daysArray,
      hours: newTime
    };

    const updatedTimes = editingIndex !== null
      ? availability.times.map((item, i) => i === editingIndex ? newEntry : item)
      : [...(availability.times || []), newEntry];

    const updated = {
      ...availability,
      times: updatedTimes,
      _tempNewDay: "",
      _tempNewTime: ""
    };

    setAvailability(updated);
    onTutorChange && onTutorChange("availability", (({ _tempNewDay, _tempNewTime, ...rest }) => rest)(updated));
    setEditingIndex(null);
  };

  const handleEditAvailabilityTime = (index) => {
    const entry = availability.times[index];
    if (entry && typeof entry === 'object' && entry.days && entry.hours) {
      const daysArray = Array.isArray(entry.days) ? entry.days : [entry.days];
      setAvailability({
        ...availability,
        _tempNewDay: daysArray,
        _tempNewTime: entry.hours
      });
    } else if (typeof entry === 'string') {
      const [day, time] = entry.split(', ');
      setAvailability({
        ...availability,
        _tempNewDay: day,
        _tempNewTime: time
      });
    }
    setEditingIndex(index);
  };

  const handleRemoveAvailabilityTime = (index) => {
    const updatedTimes = [...availability.times];
    updatedTimes.splice(index, 1);
    const updated = { ...availability, times: updatedTimes };
    setAvailability(updated);
    onTutorChange && onTutorChange("availability", (({ _tempNewDay, _tempNewTime, ...rest }) => rest)(updated));
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setAvailability({ ...availability, _tempNewDay: "", _tempNewTime: "" });
    setEditingIndex(null);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center items-center gap-2 text-primary">
          <CalendarDays className="w-6 h-6" />
          <h2 className="text-2xl font-bold tracking-tight">{t("bookingSchedule")}</h2>
        </div>
        <p className="text-lg text-foreground font-medium">
          {subject?.name} – {t("grade")} {subject?.grade}
        </p>
      </div>

      {groups.map((group, i) => {
        const isFull = group.Status;
        const [startTime, endTime] = group.Time ? group.Time.split(" - ") : ["", ""];
        return (
          <div
            key={i}
            className={cn(
              "rounded-xl p-5 border space-y-4 relative transition",
              isFull
                ? "bg-destructive/10 border-destructive/30"
                : "bg-accent/10 border-accent/30"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold">{group.Name || t("unnamedGroup")}</h3>
              <span className={cn("text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1", isFull ? "bg-destructive text-destructive-foreground" : "bg-accent text-accent-foreground")}> 
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

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t("groupName")}</label>
                <Input value={group.Name || ""} onChange={(e) => handleGroupChange(i, "Name", e.target.value)} className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium">{t("days")}</label>

                <MultiSelect
                  options={daysOfWeek}
                  selected={group.Days || []}
                  onChange={(sel) => handleGroupChange(i, 'Days', sel)}
                  placeholder={t('selectDays')}
                  display={(d) => t(`constants.weekDays.${d}`, { defaultValue: d })}
                />

              </div>

              <div>
                <label className="text-sm font-medium">{t("timeRange")}</label>
                <div className="flex gap-2 mt-1">
                  <Listbox value={startTime || ""} onChange={(value) => handleGroupTimeChange(i, value, endTime)}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate text-xs">{startTime || t("startTime")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-5 w-5 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option key={time} className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-accent text-accent-foreground" : "text-foreground")} value={time}>
                              {({ selected }) => (
                                <>
                                  <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>{time}</span>
                                  {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckCircle className="h-5 w-5" /></span>) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>

                  <span className="self-center text-muted-foreground">–</span>

                  <Listbox value={endTime || ""} onChange={(value) => handleGroupTimeChange(i, startTime, value)}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate text-xs">{endTime || t("endTime")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-5 w-5 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option key={time} className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-accent text-accent-foreground" : "text-foreground", timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0]) ? "opacity-50 cursor-not-allowed" : "") } value={time} disabled={timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0])}>
                              {({ selected }) => (
                                <>
                                  <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>{time}</span>
                                  {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckCircle className="h-5 w-5" /></span>) : null}
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
                <label className="text-sm font-medium">{t("note") } ({t("optional")})</label>
                <Textarea value={group.additional_note || ""} onChange={(e) => handleGroupChange(i, "additional_note", e.target.value)} className="mt-1" />
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input type="checkbox" className="accent-destructive w-4 h-4" checked={isFull || false} onChange={(e) => handleGroupChange(i, "Status", e.target.checked)} />
                  {t("markAsFull")}
                </label>
                <Button type="button" variant="ghost" className="text-destructive" onClick={() => handleRemoveGroup(i)}>
                  <Trash className="w-4 h-4 mr-2 rtl:ml-2" />
                  {t("remove")}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      <Button type="button" onClick={handleAddGroup} className="w-fit"><Plus className="w-4 h-4 mr-2" /> {t("addGroup")}</Button>

      <div className="pt-6 border-t border-border">
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-accent"><PhoneCall className="w-5 h-5" /><h4 className="text-sm font-semibold">{t("tutorAvailability")}</h4></div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("tutorCommTimes")}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {availability.times.map((entry, index) => {
                let displayText = "";
                if (typeof entry === 'string') {
                  displayText = entry;
                } else if (typeof entry === 'object') {
                  const daysArr = Array.isArray(entry.days) ? entry.days : [entry.days];
                  const days = daysArr.map(d => t(`constants.weekDays.${d}`, { defaultValue: d })).join(", ");
                  const hours = entry.hours || "";
                  displayText = `${days}: ${hours}`;
                }

                return (
                  <div key={index} className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium">
                    <span>{displayText}</span>
                    <button type="button" onClick={() => handleEditAvailabilityTime(index)} className="text-xs hover:text-primary"><Edit2 className="w-3 h-3" /></button>
                    <button type="button" onClick={() => handleRemoveAvailabilityTime(index)} className="text-xs hover:text-destructive">×</button>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex flex-col gap-2">
                <MultiSelect
                  options={daysOfWeek}
                  selected={availability._tempNewDay || []}
                  onChange={(sel) => setAvailability(prev => ({...prev, _tempNewDay: sel}))}
                  placeholder={t('selectDay')}
                  display={(d) => t(`constants.weekDays.${d}`, { defaultValue: d })}
                />

                <div className="flex gap-3">
                  <Listbox value={availability._tempNewTime?.split(" - ")[0] || ""} onChange={(value) => {
                    const endTime = timeSlots[Math.min(timeSlots.indexOf(value) + 1, timeSlots.length - 1)] || "";
                    setAvailability(prev => ({...prev, _tempNewTime: `${value} - ${endTime}`}));
                  }}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate text-xs">{availability._tempNewTime?.split(" - ")[0] || t("startTime")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-5 w-5 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option key={time} className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-accent text-accent-foreground" : "text-foreground")} value={time}>
                              {({ selected }) => (
                                <>
                                  <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>
                                    {time}
                                  </span>
                                  {selected ? (<span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary"><CheckCircle className="h-5 w-5" /></span>) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>

                  <span className="self-center text-muted-foreground">–</span>

                  <Listbox value={availability._tempNewTime?.split(" - ")[1] || ""} onChange={(value) => {
                    const startTime = availability._tempNewTime?.split(" - ")[0] || timeSlots[0];
                    setAvailability(prev => ({...prev, _tempNewTime: `${startTime} - ${value}`}));
                  }}>
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate text-xs">{availability._tempNewTime?.split(" - ")[1] || t("endTime")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-5 w-5 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => {
                            const startTimeVal = availability._tempNewTime?.split(" - ")[0] || timeSlots[0];
                            const isDisabled = timeSlots.indexOf(time) <= timeSlots.indexOf(startTimeVal);

                            return (
                              <Listbox.Option key={time} className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4", active ? "bg-accent text-accent-foreground" : "text-foreground", isDisabled ? "opacity-50 cursor-not-allowed" : "") } value={time} disabled={isDisabled}>
                                {({ selected }) => (
                                  <>
                                    <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>{time}</span>
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

              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleAddAvailabilityTime} disabled={!availability._tempNewDay || !availability._tempNewTime || !availability._tempNewTime.includes(" - ")}>{editingIndex !== null ? t("update") : t("add")}</Button>
                {editingIndex !== null && (<Button type="button" variant="outline" onClick={handleCancelEdit}><X className="w-4 h-4 mr-2" />{t("cancel")}</Button>)}
              </div>
              {availability._tempNewTime && availability._tempNewTime.includes(" - ") && timeSlots.indexOf(availability._tempNewTime.split(" - ")[1]) <= timeSlots.indexOf(availability._tempNewTime.split(" - ")[0]) && (<p className="text-xs text-destructive mt-1">{t("invalidTimeRange")}</p>)}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("commNote")} ({t("optional")})</label>
            <Textarea placeholder={t("commNotePlaceholder")} value={availability.note || ""} onChange={(e) => handleAvailabilityChange("note", e.target.value)} className="mt-1" />
          </div>

          {!availability.note && !availability.times?.length && (<p className="text-xs italic text-muted-foreground mt-1">{t("noCommInfo")}</p>)}
        </div>
      </div>
    </div>
  );
};

export default TutorGroupsCardEdit;
