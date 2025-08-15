import React, { useState, useEffect } from "react";
import {
  Users, Clock, CalendarDays, Info, PhoneCall, Trash, Plus, 
  CheckCircle, AlertCircle, Edit2, X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Listbox, Transition } from "@headlessui/react";
import { Fragment } from "react";

const TutorGroupsCardEdit = ({ subject, tutor, onSubjectChange, onTutorChange }) => {
  const { t } = useTranslation();
  
  // Available days for selection
  const daysOfWeek = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
  ];
  
  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // State for groups
  const [groups, setGroups] = useState(subject?.Groups || []);
  
  // State for personal availability
  const [availability, setAvailability] = useState({
    times: tutor?.personalAvailability?.times || [],
    note: tutor?.personalAvailability?.note || "",
    _tempNewDay: "",
    _tempNewTime: ""
  });
  
  const [editingIndex, setEditingIndex] = useState(null);

  // Sync groups with subject prop
  useEffect(() => {
    setGroups(subject?.Groups || []);
  }, [subject]);

  // Sync availability with tutor prop
  useEffect(() => {
    setAvailability({
      times: tutor?.personalAvailability?.times || [],
      note: tutor?.personalAvailability?.note || "",
      _tempNewDay: "",
      _tempNewTime: ""
    });
  }, [tutor]);

  // Group handlers
  const handleGroupChange = (index, field, value) => {
    const updatedGroups = [...groups];
    updatedGroups[index] = { ...updatedGroups[index], [field]: value };
    setGroups(updatedGroups);
    onSubjectChange({ ...subject, Groups: updatedGroups });
  };

  const handleAddGroup = () => {
    const newGroup = {
      groupName: "",
      days: [],
      time: "",
      note: "",
      isFull: false,
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    onSubjectChange({ ...subject, Groups: updatedGroups });
  };

  const handleRemoveGroup = (index) => {
    const updatedGroups = [...groups];
    updatedGroups.splice(index, 1);
    setGroups(updatedGroups);
    onSubjectChange({ ...subject, Groups: updatedGroups });
  };

  const handleGroupTimeChange = (index, startTime, endTime) => {
    if (startTime && endTime) {
      handleGroupChange(index, "time", `${startTime} - ${endTime}`);
    }
  };

  // Availability handlers
  const handleAvailabilityChange = (field, value) => {
    const updated = { ...availability, [field]: value };
    setAvailability(updated);
    onTutorChange({
      ...tutor,
      personalAvailability: {
        times: updated.times,
        note: updated.note
      }
    });
  };

  const handleAddAvailabilityTime = () => {
    const newDay = availability._tempNewDay;
    const newTime = availability._tempNewTime;
    const [startTime, endTime] = newTime ? newTime.split(" - ") : ["", ""];
    
    if (!newDay || !startTime || !endTime) return;
    
    const newEntry = `${newDay}, ${startTime} - ${endTime}`;
    const updatedTimes = editingIndex !== null
      ? [...availability.times].map((item, i) => i === editingIndex ? newEntry : item)
      : [...availability.times, newEntry];
    
    const updated = {
      ...availability,
      times: updatedTimes,
      _tempNewDay: "",
      _tempNewTime: ""
    };
    
    setAvailability(updated);
    onTutorChange({
      ...tutor,
      personalAvailability: {
        times: updatedTimes,
        note: availability.note
      }
    });
    setEditingIndex(null);
  };

  const handleEditAvailabilityTime = (index) => {
    const entry = availability.times[index];
    const [day, time] = entry.split(', ');
    setAvailability({
      ...availability,
      _tempNewDay: day,
      _tempNewTime: time
    });
    setEditingIndex(index);
  };

  const handleRemoveAvailabilityTime = (index) => {
    const updatedTimes = [...availability.times];
    updatedTimes.splice(index, 1);
    const updated = {
      ...availability,
      times: updatedTimes
    };
    
    setAvailability(updated);
    onTutorChange({
      ...tutor,
      personalAvailability: {
        times: updatedTimes,
        note: availability.note
      }
    });
    
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setAvailability({
      ...availability,
      _tempNewDay: "",
      _tempNewTime: ""
    });
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
          {subject?.subject} – {t("grade")} {subject?.grade}
        </p>
      </div>

      {groups.map((group, i) => {
        const isFull = group.isFull;
        const [startTime, endTime] = group.time ? group.time.split(" - ") : ["", ""];
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
              <h3 className="text-md font-semibold">
                {group.groupName || t("unnamedGroup")}
              </h3>
              <span
                className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1",
                  isFull
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-accent text-accent-foreground"
                )}
              >
                {isFull ? (
                  <>
                    <AlertCircle className="w-3 h-3" />
                    {t("full")}
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    {t("available")}
                  </>
                )}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">{t("groupName")}</label>
                <Input
                  value={group.groupName || ""}
                  onChange={(e) => handleGroupChange(i, "groupName", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t("days")}</label>
                <Listbox
                  value={group.days || []}
                  onChange={(selected) => handleGroupChange(i, "days", selected)}
                  multiple
                >
                  <div className="relative mt-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                      <span className="block truncate">
                        {group.days?.length > 0
                          ? group.days.join(", ")
                          : t("selectDays")}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {daysOfWeek.map((day) => (
                          <Listbox.Option
                            key={day}
                            className={({ active }) =>
                              cn(
                                "relative cursor-pointer select-none py-2 pl-10 pr-4",
                                active ? "bg-accent text-accent-foreground" : "text-foreground"
                              )
                            }
                            value={day}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={cn(
                                    "block truncate",
                                    selected ? "font-medium" : "font-normal"
                                  )}
                                >
                                  {day}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                    <CheckCircle className="h-5 w-5" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>

              <div>
                <label className="text-sm font-medium">{t("timeRange")}</label>
                <div className="flex gap-2 mt-1">
                  <Listbox
                    value={startTime || ""}
                    onChange={(value) => handleGroupTimeChange(i, value, endTime)}
                  >
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate">
                          {startTime || t("startTime")}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option
                              key={time}
                              className={({ active }) =>
                                cn(
                                  "relative cursor-pointer select-none py-2 pl-10 pr-4",
                                  active ? "bg-accent text-accent-foreground" : "text-foreground"
                                )
                              }
                              value={time}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={cn(
                                      "block truncate",
                                      selected ? "font-medium" : "font-normal"
                                    )}
                                  >
                                    {time}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                      <CheckCircle className="h-5 w-5" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                  <span className="self-center text-muted-foreground">–</span>
                  <Listbox
                    value={endTime || ""}
                    onChange={(value) => handleGroupTimeChange(i, startTime, value)}
                  >
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate">
                          {endTime || t("endTime")}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option
                              key={time}
                              className={({ active }) =>
                                cn(
                                  "relative cursor-pointer select-none py-2 pl-10 pr-4",
                                  active ? "bg-accent text-accent-foreground" : "text-foreground",
                                  timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0])
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                )
                              }
                              value={time}
                              disabled={timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0])}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={cn(
                                      "block truncate",
                                      selected ? "font-medium" : "font-normal"
                                    )}
                                  >
                                    {time}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                      <CheckCircle className="h-5 w-5" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
                {startTime && endTime && timeSlots.indexOf(endTime) <= timeSlots.indexOf(startTime) && (
                  <p className="text-xs text-destructive mt-1">{t("invalidTimeRange")}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">
                  {t("note")} ({t("optional")})
                </label>
                <Textarea
                  value={group.note || ""}
                  onChange={(e) => handleGroupChange(i, "note", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-destructive w-4 h-4"
                    checked={isFull || false}
                    onChange={(e) => handleGroupChange(i, "isFull", e.target.checked)}
                  />
                  {t("markAsFull")}
                </label>
                <Button
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => handleRemoveGroup(i)}
                >
                  <Trash className="w-4 h-4 mr-2 rtl:ml-2" />
                  {t("remove")}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      <Button onClick={handleAddGroup} className="w-fit">
        <Plus className="w-4 h-4 mr-2" /> {t("addGroup")}
      </Button>

      <div className="pt-6 border-t border-border">
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <PhoneCall className="w-5 h-5" />
            <h4 className="text-sm font-semibold">{t("tutorAvailability")}</h4>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("tutorCommTimes")}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {availability.times.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium"
                >
                  <span>{entry}</span>
                  <button
                    type="button"
                    onClick={() => handleEditAvailabilityTime(index)}
                    className="text-xs hover:text-primary"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveAvailabilityTime(index)}
                    className="text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="space-y-2 mt-2">
              <div className="flex flex-col gap-2">
                <Listbox
                  value={availability._tempNewDay || ""}
                  onChange={(value) => setAvailability({...availability, _tempNewDay: value})}
                >
                  <div className="relative flex-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                      <span className="block truncate">
                        {availability._tempNewDay || t("selectDay")}
                      </span>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                      </span>
                    </Listbox.Button>
                    <Transition
                      as={Fragment}
                      leave="transition ease-in duration-100"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        {daysOfWeek.map((day) => (
                          <Listbox.Option
                            key={day}
                            className={({ active }) =>
                              cn(
                                "relative cursor-pointer select-none py-2 pl-10 pr-4",
                                active ? "bg-accent text-accent-foreground" : "text-foreground"
                              )
                            }
                            value={day}
                          >
                            {({ selected }) => (
                              <>
                                <span
                                  className={cn(
                                    "block truncate",
                                    selected ? "font-medium" : "font-normal"
                                  )}
                                >
                                  {day}
                                </span>
                                {selected ? (
                                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                    <CheckCircle className="h-5 w-5" />
                                  </span>
                                ) : null}
                              </>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
                <div className="flex gap-3">
                  <Listbox
                    value={availability._tempNewTime?.split(" - ")[0] || ""}
                    onChange={(value) => {
                      const endTime = timeSlots[Math.min(timeSlots.indexOf(value) + 1, timeSlots.length - 1)] || "";
                      setAvailability({...availability, _tempNewTime: `${value} - ${endTime}`});
                    }}
                  >
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate">
                          {availability._tempNewTime?.split(" - ")[0] || t("startTime")}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option
                              key={time}
                              className={({ active }) =>
                                cn(
                                  "relative cursor-pointer select-none py-2 pl-10 pr-4",
                                  active ? "bg-accent text-accent-foreground" : "text-foreground"
                                )
                              }
                              value={time}
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={cn(
                                      "block truncate",
                                      selected ? "font-medium" : "font-normal"
                                    )}
                                  >
                                    {time}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                      <CheckCircle className="h-5 w-5" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                  <span className="self-center text-muted-foreground">–</span>
                  <Listbox
                    value={availability._tempNewTime?.split(" - ")[1] || ""}
                    onChange={(value) => {
                      const startTime = availability._tempNewTime?.split(" - ")[0] || timeSlots[0];
                      setAvailability({...availability, _tempNewTime: `${startTime} - ${value}`});
                    }}
                  >
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate">
                          {availability._tempNewTime?.split(" - ")[1] || t("endTime")}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                          <Clock className="h-5 w-5 text-muted-foreground" />
                        </span>
                      </Listbox.Button>
                      <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option
                              key={time}
                              className={({ active }) =>
                                cn(
                                  "relative cursor-pointer select-none py-2 pl-10 pr-4",
                                  active ? "bg-accent text-accent-foreground" : "text-foreground",
                                  timeSlots.indexOf(time) <=
                                    timeSlots.indexOf(
                                      availability._tempNewTime?.split(" - ")[0] || timeSlots[0]
                                    )
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                )
                              }
                              value={time}
                              disabled={
                                timeSlots.indexOf(time) <=
                                timeSlots.indexOf(
                                  availability._tempNewTime?.split(" - ")[0] || timeSlots[0]
                                )
                              }
                            >
                              {({ selected }) => (
                                <>
                                  <span
                                    className={cn(
                                      "block truncate",
                                      selected ? "font-medium" : "font-normal"
                                    )}
                                  >
                                    {time}
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                                      <CheckCircle className="h-5 w-5" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          ))}
                        </Listbox.Options>
                      </Transition>
                    </div>
                  </Listbox>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddAvailabilityTime}
                  disabled={
                    !availability._tempNewDay ||
                    !availability._tempNewTime ||
                    !availability._tempNewTime.includes(" - ")
                  }
                >
                  {editingIndex !== null ? t("update") : t("add")}
                </Button>
                {editingIndex !== null && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="w-4 h-4 mr-2" />
                    {t("cancel")}
                  </Button>
                )}
              </div>
              {availability._tempNewTime &&
                availability._tempNewTime.includes(" - ") &&
                timeSlots.indexOf(availability._tempNewTime.split(" - ")[1]) <=
                  timeSlots.indexOf(availability._tempNewTime.split(" - ")[0]) && (
                  <p className="text-xs text-destructive mt-1">{t("invalidTimeRange")}</p>
                )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              {t("commNote")} ({t("optional")})
            </label>
            <Textarea
              placeholder={t("commNotePlaceholder")}
              value={availability.note || ""}
              onChange={(e) => handleAvailabilityChange("note", e.target.value)}
              className="mt-1"
            />
          </div>

          {!availability.note &&
            !availability.times?.length && (
              <p className="text-xs italic text-muted-foreground mt-1">
                {t("noCommInfo")}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default TutorGroupsCardEdit;