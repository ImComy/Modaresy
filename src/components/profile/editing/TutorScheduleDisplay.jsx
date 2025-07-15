import React from "react";
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
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TutorGroupsCardEdit = ({ subject, tutor, onSubjectChange, onTutorChange }) => {
  const { t } = useTranslation();

  // ---------------------------
  // GROUPS HANDLERS
  // ---------------------------
  const handleGroupChange = (index, field, value) => {
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

  // ---------------------------
  // PERSONAL AVAILABILITY HANDLERS
  // ---------------------------
  const handleAvailabilityChange = (field, value) => {
    const updated = {
      ...tutor.personalAvailability,
      [field]: value,
    };
    onTutorChange({ ...tutor, personalAvailability: updated });
  };

  const handleAddAvailabilityTime = () => {
    const newTime = (tutor._tempNewTime || "").trim();
    if (!newTime) return;
    const updated = [
      ...(tutor.personalAvailability?.times || []),
      newTime,
    ];
    handleAvailabilityChange("times", updated);
    handleAvailabilityChange("_tempNewTime", "");
  };

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
                  value={group.groupName}
                  onChange={(e) => handleGroupChange(i, "groupName", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t("days")}</label>
                <Input
                  value={group.days?.join(", ")}
                  onChange={(e) =>
                    handleGroupChange(i, "days", e.target.value.split(",").map((d) => d.trim()))
                  }
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">{t("time")}</label>
                <Input
                  value={group.time}
                  onChange={(e) => handleGroupChange(i, "time", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">
                  {t("note")} ({t("optional")})
                </label>
                <Textarea
                  value={group.note}
                  onChange={(e) => handleGroupChange(i, "note", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center justify-between mt-2">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    className="accent-destructive w-4 h-4"
                    checked={isFull}
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
            <h4 className="text-sm font-semibold">{t("personalComm")}</h4>
          </div>

          {/* Availability Times */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground">{t("commTimes")}</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(tutor.personalAvailability?.times || []).map((time, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium"
                >
                  <span>{time}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...tutor.personalAvailability.times];
                      updated.splice(index, 1);
                      handleAvailabilityChange("times", updated);
                    }}
                    className="text-xs hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mt-2">
              <Input
                placeholder={t("commTimesPlaceholder")}
                value={tutor._tempNewTime || ""}
                onChange={(e) =>
                  onTutorChange({ ...tutor, _tempNewTime: e.target.value })
                }
                className="flex-grow"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAvailabilityTime}
              >
                +
              </Button>
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
              <p className="text-xs italic text-muted-foreground mt-2">
                {t("noCommInfo")}
              </p>
            )}
        </div>
      </div>
    </div>
  );
};

export default TutorGroupsCardEdit;
