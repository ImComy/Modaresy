import React, { useState, useEffect, Fragment, useContext } from "react";
import {
  Clock, CalendarDays, Trash, Plus,
  CheckCircle, AlertCircle, BookOpen, ChevronDown
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Listbox, Transition } from "@headlessui/react";
import MultiSelect from '@/components/ui/multi-select';
import SubjectSelector from './SubjectSelector';
import { StepDataContext } from "@/context/StepContext";

/**
 * ScheduleEditor
 * - uses StepDataContext.state.subjects for the SubjectSelector (no mocks)
 * - when a subject is selected, renders a schedule UI (default full groups editor)
 * - edits are synced back to parent state (state.subjects) so each subject stores its own schedule
 */

const ScheduleEditor = () => {
  const { t } = useTranslation();
  const { state, setState } = useContext(StepDataContext);

  const subjects = Array.isArray(state?.subjects) ? state.subjects : [];

  // Local selected subject (full object). We also keep a selectedSubjectId in the parent state.
  const [selectedSubject, setSelectedSubject] = useState(null);

  // days/time helpers
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const timeSlots = Array.from({ length: 28 }, (_, i) => {
    const hour = Math.floor(i / 2) + 8;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${String(hour).padStart(2, "0")}:${minute}`;
  });

  // Local groups state (normalized) used by the UI. Persisted to parent when changed.
  const [groups, setGroups] = useState([]);

  // Normalize various incoming group shapes so UI is consistent
  const normalizeGroup = (g) => {
    // Accept many shapes, output common shape used by the UI
    return {
      id: g?.id?.toString() || Math.random().toString(36).slice(2, 9),
      Name: g?.Name || g?.name || "",
      // Days expects an array of day values (e.g., ["Monday"])
      Days: Array.isArray(g?.Days) ? g.Days : (g?.day ? [g.day] : (g?.Days ? [g.Days] : [])),
      time_start: g?.time_start || g?.timeStart || g?.start || null,
      time_end: g?.time_end || g?.timeEnd || g?.end || null,
      Location: g?.location || g?.Location || "",
      additional_note: g?.additional_note || g?.note || g?.additionalNote || "",
      Status: !!(g?.Status || g?.isFull || g?.full),
    };
  };

  // when translation changes or mount -> build daysOfWeek mapping
  useEffect(() => {
    try {
      const wd = t('constants.weekDays', { returnObjects: true });
      const canonical = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      if (wd && typeof wd === 'object') {
        const mappedDays = canonical.map(day => ({
          value: day,
          label: wd[day] ?? day
        }));
        setDaysOfWeek(mappedDays);
      } else {
        setDaysOfWeek([
          { value: 'Monday', label: 'Monday' },
          { value: 'Tuesday', label: 'Tuesday' },
          { value: 'Wednesday', label: 'Wednesday' },
          { value: 'Thursday', label: 'Thursday' },
          { value: 'Friday', label: 'Friday' },
          { value: 'Saturday', label: 'Saturday' },
          { value: 'Sunday', label: 'Sunday' },
        ]);
      }
    } catch (error) {
      console.error("Failed to load weekDays from i18n", error);
    }
  }, [t]);

  // If parent had a selectedSubjectId already, initialize selectedSubject from parent state
  useEffect(() => {
    const id = state?.selectedSubjectId;
    if (id && subjects.length > 0) {
      const found = subjects.find(s => String(s.id) === String(id));
      if (found) {
        setSelectedSubject(found);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.selectedSubjectId, subjects.length]);

  // sync local groups when selectedSubject changes
  useEffect(() => {
    if (!selectedSubject) {
      setGroups([]);
      return;
    }
    const normalized = Array.isArray(selectedSubject.groups) ? selectedSubject.groups.map(normalizeGroup) : [];
    setGroups(normalized);
  }, [selectedSubject]);

  // Persist groups into parent state.subjects whenever groups change
  useEffect(() => {
    if (!selectedSubject) return;
    // persist groups in the same normalized format
    setState(prev => {
      const prevSubjects = Array.isArray(prev?.subjects) ? prev.subjects : [];
      const updatedSubjects = prevSubjects.map(s => {
        if (String(s.id) === String(selectedSubject.id)) {
          return { ...s, groups: groups };
        }
        return s;
      });
      return { ...prev, subjects: updatedSubjects };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups]);

  // handler the selector will call with the selected variant
  const handleSubjectSelect = (variant) => {
    // SubjectSelector provides variant.raw (the original subject) under `subject` per our contract
    const subj = variant?.subject || variant?.raw || null;
    if (!subj) return;

    setSelectedSubject(subj);
    // also update parent's selectedSubjectId (so other steps/readers know selected subject)
    setState(prev => ({ ...prev, selectedSubjectId: variant.id }));
  };

  // basic field update in groups
  const handleGroupChange = (index, field, value) => {
    setGroups(prev => {
      const next = prev.map((g, i) => i === index ? { ...g, [field]: value } : g);
      return next;
    });
  };

  // time helper used by Listbox onChange
  const handleGroupTimeChange = (index, start, end) => {
    setGroups(prev => {
      const next = prev.map((g, i) => {
        if (i !== index) return g;
        return { ...g, time_start: start, time_end: end };
      });
      return next;
    });
  };

  const handleAddGroup = () => {
    setGroups(prev => ([
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        Name: "",
        Days: [],
        time_start: null,
        time_end: null,
        Location: "",
        additional_note: "",
        Status: false,
      }
    ]));
  };

  const handleRemoveGroup = (index) => {
    setGroups(prev => prev.filter((_, i) => i !== index));
  };

  const dayLabel = (value) => {
    return daysOfWeek.find(d => d.value === value)?.label || value;
  };

  const timeLabel = (value) => {
    if (!value) return "";
    const [hour, minute] = value.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = ((h + 11) % 12) + 1;
    return `${hh}:${minute} ${ampm}`;
  };

  const validateGroup = (group) => {
    return (group.Days && group.Days.length > 0) && group.time_start && group.time_end && (group.Location || group.Location === "");
  };

  // === render decision: you can add special editors for different subjects here ===
  // For now: if subject.group_name === 'Mathematics' render a specialized placeholder editor,
  // otherwise render the default groups editor.
  const renderSubjectSchedule = () => {
    if (!selectedSubject) return null;

    // Example branching — you can expand this to render different components.
    if ((selectedSubject.group_name || "").toLowerCase().includes("mathematics")) {
      return (
        <SpecializedMathSchedule
          subject={selectedSubject}
          groups={groups}
          setGroups={setGroups}
          daysOfWeek={daysOfWeek}
          timeSlots={timeSlots}
          handleGroupChange={handleGroupChange}
          handleGroupTimeChange={handleGroupTimeChange}
          handleAddGroup={handleAddGroup}
          handleRemoveGroup={handleRemoveGroup}
          validateGroup={validateGroup}
          t={t}
        />
      );
    }

    // default full groups editor
    return (
      <DefaultGroupsEditor
        groups={groups}
        daysOfWeek={daysOfWeek}
        timeSlots={timeSlots}
        handleGroupChange={handleGroupChange}
        handleGroupTimeChange={handleGroupTimeChange}
        handleAddGroup={handleAddGroup}
        handleRemoveGroup={handleRemoveGroup}
        validateGroup={validateGroup}
        t={t}
      />
    );
  };

  // If there are no subjects in onboarding yet, show an instructive message
  if (!Array.isArray(subjects) || subjects.length === 0) {
    return (
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t("editSchedule")}</h1>
        <div className="p-6 bg-muted rounded-lg text-center">
          <BookOpen className="w-12 h-12 mx-auto mb-4" />
          <p className="text-lg font-medium">{t("noSubjectsInOnboarding", "No subjects found")}</p>
          <p className="mt-2 text-muted-foreground">{t("addSubjectsFirst", "Please add subjects in the previous step, then edit their schedules here.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">{t("editSchedule")}</h1>

      <div className="mb-8">
        <SubjectSelector
          subjects={subjects}
          selectedId={state?.selectedSubjectId}
          onSelect={handleSubjectSelect}
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

          {renderSubjectSchedule()}

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

/* ---------------------------
   DefaultGroupsEditor component
   Reuses most of your original UI with normalized fields.
   --------------------------- */
function DefaultGroupsEditor({
  groups,
  daysOfWeek,
  timeSlots,
  handleGroupChange,
  handleGroupTimeChange,
  handleAddGroup,
  handleRemoveGroup,
  validateGroup,
  t
}) {
  return (
    <>
      {groups.length === 0 && (
        <div className="text-center py-8 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No groups added yet. Click "Add Group" to start organizing your schedule.</p>
        </div>
      )}

      {groups.map((group, i) => {
        const isFull = !!group.Status;
        const startTime = group.time_start || "";
        const endTime = group.time_end || "";
        return (
          <div
            key={group.id}
            className={cn(
              "rounded-xl p-5 border space-y-4 relative transition-shadow shadow-md hover:shadow-lg",
              isFull ? "bg-destructive/5 border-destructive/20" : "bg-accent/5 border-accent/20"
            )}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-md font-semibold">{group.Name || t("unnamedGroup")}</h3>
              <span className={cn("text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1", isFull ? "bg-destructive/10 text-destructive" : "bg-accent/10 text-accent")}>
                {isFull ? (<><CheckCircle className="w-3 h-3" />{t("full")}</>) : (<><CheckCircle className="w-3 h-3" />{t("available")}</>)}
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
                        <span className="block truncate">{startTime ? timeLabelSafe(startTime) : t("startTime", "Start time")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-4 w-4 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option key={time} className={({ active }) => cn("relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm", active ? "bg-accent text-accent-foreground" : "text-foreground")} value={time}>
                              {({ selected }) => (
                                <>
                                  <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>{timeLabelSafe(time)}</span>
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
                        <span className="block truncate">{endTime ? timeLabelSafe(endTime) : t("endTime", "End time")}</span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"><Clock className="h-4 w-4 text-muted-foreground" /></span>
                      </Listbox.Button>
                      <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          {timeSlots.map((time) => (
                            <Listbox.Option
                              key={time}
                              className={({ active }) => cn(
                                "relative cursor-pointer select-none py-2 pl-10 pr-4 text-sm",
                                active ? "bg-accent text-accent-foreground" : "text-foreground",
                                timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0]) ? "opacity-50 cursor-not-allowed" : ""
                              )}
                              value={time}
                              disabled={timeSlots.indexOf(time) <= timeSlots.indexOf(startTime || timeSlots[0])}
                            >
                              {({ selected }) => (
                                <>
                                  <span className={cn("block truncate", selected ? "font-medium" : "font-normal")}>{timeLabelSafe(time)}</span>
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
    </>
  );
}

/* ---------------------------
   A tiny example specialized editor for math (placeholder)
   You can expand this to a richer editor specific to Mathematics.
   --------------------------- */
function SpecializedMathSchedule(props) {
  const { subject, groups, setGroups, handleAddGroup, handleRemoveGroup, t } = props;

  // For the purpose of this example, we show a simplified view + reuse DefaultGroupsEditor
  return (
    <div className="space-y-4">
      <div className="text-sm p-4 rounded-md bg-muted/40">
        <strong>{t("mathScheduleHint", "Special math schedule")}</strong>
        <p className="mt-1 text-muted-foreground">This subject uses the specialized Math schedule UI (placeholder). You can extend this component for math-specific fields (lab sessions, problem sets, exam weeks...)</p>
      </div>

      <DefaultGroupsEditor {...props} />
    </div>
  );
}

/* ---------------------------
   Helpers
   --------------------------- */
function timeLabelSafe(value) {
  if (!value) return "";
  const [hour, minute] = value.split(':');
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = ((h + 11) % 12) + 1;
  return `${hh}:${minute} ${ampm}`;
}
