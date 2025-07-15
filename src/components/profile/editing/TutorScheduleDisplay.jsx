import React, { useState, useEffect } from "react";
import {
  Users,
  Clock,
  CalendarDays,
  Info,
  PhoneCall,
  Trash,
  Plus,
  CheckCircle,
  AlertCircle,
  Edit2,
  X,
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
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Available time slots (every 30 minutes from 8:00 AM to 10:00 PM)
  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8; // Start from 8 AM
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
  });

  // State for editing personal availability
  const [editingIndex, setEditingIndex] = useState(null);

  // Initialize temporary fields if not present
  useEffect(() => {
    if (!tutor?.personalAvailability) {
      onTutorChange({
        ...tutor,
        personalAvailability: {
          times: [],
          note: "",
          _tempNewDay: "",
          _tempNewTime: "",
        },
      });
    }
  }, [tutor, onTutorChange]);

  // Convert time from AM/PM to 24-hour format
  const convertTo24Hour = (timeStr) => {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours, 10);
    if (modifier?.toUpperCase() === "PM" && hours !== 12) hours += 12;
    if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, "0")}:${minutes || "00"}`;
  };

  // Parse mock data time string (e.g., "Saturday 4–6 PM")
  const parseMockTime = (entry) => {
    if (typeof entry === "string") {
      const match = entry.match(/^(\w+)\s+(\d{1,2}(?::\d{2})?)\s*–\s*(\d{1,2}(?::\d{2})?)\s*(AM|PM)$/i);
      if (match) {
        const [, day, start, end, modifier] = match;
        const startTime = convertTo24Hour(`${start} ${modifier}`);
        const endTime = convertTo24Hour(`${end} ${modifier}`);
        return { day, time: `${startTime} - ${endTime}` };
      }
      console.warn(`parseMockTime: Unparseable entry "${entry}", returning as-is`);
      return { day: "", time: entry }; // Fallback for unparseable strings
    }
    return entry; // Already in { day, time } format
  };

  // Format entry for display (always return a string)
  const formatDisplayTime = (entry) => {
    const parsed = parseMockTime(entry);
    if (typeof entry === "string") {
      return entry; // Display string-based entries as-is
    }
    if (parsed.day && parsed.time) {
      return `${parsed.day}, ${parsed.time}`;
    }
    console.warn(`formatDisplayTime: Invalid entry`, entry);
    return "Invalid entry"; // Fallback for invalid entries
  };

  // Convert times array to string format for saving
  const normalizeTimesForSave = (times) => {
    return times.map((entry) => {
      if (typeof entry === "string") {
        return entry; // Keep string entries as-is
      }
      const parsed = parseMockTime(entry);
      if (parsed.day && parsed.time) {
        return `${parsed.day}, ${parsed.time}`;
      }
      console.warn(`normalizeTimesForSave: Skipping invalid entry`, entry);
      return null; // Skip invalid entries
    }).filter(entry => entry !== null);
  };

  // ---------------------------
  // GROUPS HANDLERS (UNCHANGED)
  // ---------------------------
  const handleGroupChange = (index, field, value) => {
    console.log(`handleGroupChange: index=${index}, field=${field}, value=`, value);
    const updatedGroups = [...(subject.Groups || [])];
    updatedGroups[index] = { ...updatedGroups[index], [field]: value };
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
    const updatedGroups = [...(subject.Groups || []), newGroup];
    onSubjectChange({ ...subject, Groups: updatedGroups });
  };

  const handleRemoveGroup = (index) => {
    const updatedGroups = [...(subject.Groups || [])];
    updatedGroups.splice(index, 1);
    onSubjectChange({ ...subject, Groups: updatedGroups });
  };

  const handleGroupTimeChange = (index, startTime, endTime) => {
    console.log(`handleGroupTimeChange: index=${index}, startTime=${startTime}, endTime=${endTime}`);
    if (startTime && endTime) {
      const startIndex = timeSlots.indexOf(startTime);
      const endIndex = timeSlots.indexOf(endTime);
      if (endIndex <= startIndex) return;
      const timeRange = `${startTime} - ${endTime}`;
      handleGroupChange(index, "time", timeRange);
    }
  };

  // ---------------------------
  // PERSONAL AVAILABILITY HANDLERS
  // ---------------------------
  const handleAvailabilityChange = (field, value) => {
    console.log(`handleAvailabilityChange: field=${field}, value=`, value);
    const updated = {
      ...tutor.personalAvailability,
      [field]: value,
    };
    onTutorChange({ ...tutor, personalAvailability: updated });
  };

  const handleAddAvailabilityTime = () => {
    const newDay = tutor.personalAvailability?._tempNewDay || "";
    const newTime = tutor.personalAvailability?._tempNewTime || "";
    const [startTime, endTime] = newTime ? newTime.split(" - ") : ["", ""];
    console.log(`handleAddAvailabilityTime: day=${newDay}, startTime=${startTime}, endTime=${endTime}`);

    // Validate inputs
    if (!newDay || !startTime || !endTime) {
      console.log("Validation failed: missing day or time");
      return;
    }
    const startIndex = timeSlots.indexOf(startTime);
    const endIndex = timeSlots.indexOf(endTime);
    if (startIndex < 0 || endIndex < 0 || endIndex <= startIndex) {
      console.log("Validation failed: invalid time range or times not in timeSlots");
      return;
    }

    // Update times array
    const newEntry = { day: newDay, time: `${startTime} - ${endTime}` };
    const updatedTimes = editingIndex !== null
      ? [...(tutor.personalAvailability?.times || [])].map((item, i) =>
          i === editingIndex ? newEntry : item
        )
      : [...(tutor.personalAvailability?.times || []), newEntry];

    console.log("Updating times:", updatedTimes);
    onTutorChange({
      ...tutor,
      personalAvailability: {
        ...tutor.personalAvailability,
        times: normalizeTimesForSave(updatedTimes), // Normalize to strings for saving
        _tempNewDay: "",
        _tempNewTime: "",
      },
    });
    setEditingIndex(null);
  };

  const handleEditAvailabilityTime = (index) => {
    const entry = parseMockTime(tutor.personalAvailability.times[index]);
    console.log(`handleEditAvailabilityTime: index=${index}, entry=`, entry);
    if (!entry.day || !entry.time) {
      console.warn(`Invalid entry at index ${index}:`, entry);
      return;
    }
    onTutorChange({
      ...tutor,
      personalAvailability: {
        ...tutor.personalAvailability,
        _tempNewDay: entry.day,
        _tempNewTime: entry.time,
      },
    });
    setEditingIndex(index);
  };

  const handleRemoveAvailabilityTime = (index) => {
    console.log(`handleRemoveAvailabilityTime: index=${index}`);
    const updatedTimes = [...(tutor.personalAvailability.times || [])];
    updatedTimes.splice(index, 1);
    onTutorChange({
      ...tutor,
      personalAvailability: {
        ...tutor.personalAvailability,
        times: normalizeTimesForSave(updatedTimes), // Normalize to strings for saving
        _tempNewDay: editingIndex === index ? "" : tutor.personalAvailability._tempNewDay,
        _tempNewTime: editingIndex === index ? "" : tutor.personalAvailability._tempNewTime,
      },
    });
    if (editingIndex === index) {
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    console.log("handleCancelEdit");
    onTutorChange({
      ...tutor,
      personalAvailability: {
        ...tutor.personalAvailability,
        _tempNewDay: "",
        _tempNewTime: "",
      },
    });
    setEditingIndex(null);
  };

  // Render the component
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="text-center mb-6 space-y-2">
        <div className="flex justify-center items-center gap-2 text-primary">
          <CalendarDays className="w-6 h-6" />
          <h2 className="text-2xl font-bold tracking-tight">{t("bookingSchedule")}</h2>
        </div>
        <p className="text-lg text-foreground font-medium">
          {subject?.subject} – {t("grade")} {subject?.grade}
        </p>
      </div>

      {/* Group Cards */}
      {(subject.Groups || []).map((group, i) => {
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
                  onChange={(selected) => {
                    console.log(`Group days selected: index=${i}, days=`, selected);
                    handleGroupChange(i, "days", selected);
                  }}
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
                    onChange={(value) => {
                      console.log(`Group start time selected: index=${i}, startTime=${value}`);
                      handleGroupTimeChange(i, value, endTime);
                    }}
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
                    onChange={(value) => {
                      console.log(`Group end time selected: index=${i}, endTime=${value}`);
                      handleGroupTimeChange(i, startTime, value);
                    }}
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
                  <Trash className="w-4 h-4 mr-2" />
                  {t("remove")}
                </Button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Group */}
      <Button onClick={handleAddGroup} className="w-fit">
        <Plus className="w-4 h-4 mr-2" /> {t("addGroup")}
      </Button>

      {/* Personal Availability */}
      <div className="pt-6 border-t border-border">
        <div className="bg-accent/10 border border-accent/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-accent">
            <PhoneCall className="w-5 h-5" />
            <h4 className="text-sm font-semibold">{t("tutorAvailability")}</h4>
          </div>

          {/* Availability Times */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("tutorCommTimes")}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(tutor.personalAvailability?.times || []).map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium"
                >
                  <span>{formatDisplayTime(entry)}</span>
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
                  value={tutor.personalAvailability?._tempNewDay || ""}
                  onChange={(value) => {
                    console.log(`Personal availability day selected: value=${value}`);
                    handleAvailabilityChange("_tempNewDay", value);
                  }}
                >
                  <div className="relative flex-1">
                    <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                      <span className="block truncate">
                        {tutor.personalAvailability?._tempNewDay || t("selectDay")}
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
                    value={tutor.personalAvailability?._tempNewTime?.split(" - ")[0] || ""}
                    onChange={(value) => {
                      console.log(`Personal availability start time selected: value=${value}`);
                      const endTime =
                        tutor.personalAvailability?._tempNewTime?.split(" - ")[1] ||
                        timeSlots[Math.min(timeSlots.indexOf(value) + 1, timeSlots.length - 1)] ||
                        "";
                      handleAvailabilityChange("_tempNewTime", `${value} - ${endTime}`);
                    }}
                  >
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate">
                          {tutor.personalAvailability?._tempNewTime?.split(" - ")[0] || t("startTime")}
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
                    value={tutor.personalAvailability?._tempNewTime?.split(" - ")[1] || ""}
                    onChange={(value) => {
                      console.log(`Personal availability end time selected: value=${value}`);
                      const startTime =
                        tutor.personalAvailability?._tempNewTime?.split(" - ")[0] || timeSlots[0];
                      handleAvailabilityChange("_tempNewTime", `${startTime} - ${value}`);
                    }}
                  >
                    <div className="relative flex-1">
                      <Listbox.Button className="relative w-full cursor-pointer rounded-md border border-border bg-background py-2 pl-3 pr-10 text-left focus:outline-none focus:ring-2 focus:ring-primary">
                        <span className="block truncate">
                          {tutor.personalAvailability?._tempNewTime?.split(" - ")[1] || t("endTime")}
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
                                      tutor.personalAvailability?._tempNewTime?.split(" - ")[0] || timeSlots[0]
                                    )
                                    ? "opacity-50 cursor-not-allowed"
                                    : ""
                                )
                              }
                              value={time}
                              disabled={
                                timeSlots.indexOf(time) <=
                                timeSlots.indexOf(
                                  tutor.personalAvailability?._tempNewTime?.split(" - ")[0] || timeSlots[0]
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
                    !tutor.personalAvailability?._tempNewDay ||
                    !tutor.personalAvailability?._tempNewTime ||
                    !tutor.personalAvailability?._tempNewTime.includes(" - ")
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
              {tutor.personalAvailability?._tempNewTime &&
                tutor.personalAvailability._tempNewTime.includes(" - ") &&
                timeSlots.indexOf(tutor.personalAvailability._tempNewTime.split(" - ")[1]) <=
                  timeSlots.indexOf(tutor.personalAvailability._tempNewTime.split(" - ")[0]) && (
                  <p className="text-xs text-destructive mt-1">{t("invalidTimeRange")}</p>
                )}
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">
              {t("commNote")} ({t("optional")})
            </label>
            <Textarea
              placeholder={t("commNotePlaceholder")}
              value={tutor.personalAvailability?.note || ""}
              onChange={(e) => handleAvailabilityChange("note", e.target.value)}
              className="mt-1"
            />
          </div>

          {!tutor.personalAvailability?.note &&
            !tutor.personalAvailability?.times?.length && (
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