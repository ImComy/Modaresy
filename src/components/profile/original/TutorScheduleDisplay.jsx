import React from "react";
import { Repeat, Clock, CalendarDays, Info, PhoneCall, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const TutorScheduleDisplay = ({ subject, tutor }) => {
  const { t } = useTranslation();
  const noGroups = !subject || !Array.isArray(subject.Groups) || subject.Groups.length === 0;

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm space-y-6">
      <div className="space-y-2 text-center mb-6">
        <div className="flex justify-center items-center gap-2 text-primary">
          <CalendarDays className="w-6 h-6" />
          <h2 className="text-2xl font-bold tracking-tight">{t("bookingSchedule")}</h2>
        </div>
        <p className="text-lg text-foreground font-medium">
          {subject?.subject} – {t("grade")} {subject?.grade}
        </p>
      </div>

      {noGroups ? (
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted border border-dashed border-border px-4 py-6 rounded-xl text-center justify-center">
          <AlertTriangle className="w-5 h-5" />
          <span>{t("noGroupsYet")}</span>
        </div>
      ) : (
        <div className="grid gap-5">
          {subject.Groups.map((group, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 border relative transition hover:shadow-md ${
                group.isFull
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-accent/10 border-accent/30"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  {group.groupName || t("unnamedGroup")}
                </h3>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    group.isFull
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-accent text-accent-foreground"
                  }`}
                >
                  {group.isFull ? t("full") : t("available")}
                </span>
              </div>

              <div className="space-y-1 text-sm text-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <strong>{t("days")}:</strong> {group.days?.join(", ") || t("tba")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <strong>{t("time")}:</strong> {group.time || t("tba")}
                  </span>
                </div>
                {group.note && (
                  <div className="flex items-center gap-2 italic text-primary">
                    <Info className="w-4 h-4" />
                    <span>{group.note}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-border text-sm text-muted-foreground flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Repeat className="w-4 h-4" />
          <span>كل شيء منسّق مسبقًا لراحتك.</span>
        </div>
      </div>

      {tutor?.availability ? (
        <div className="rounded-xl p-5 mt-6 border border-accent/30 bg-accent/5 space-y-4">
          <div className="flex items-center gap-2 text-accent mb-1">
            <PhoneCall className="w-5 h-5" />
            <h4 className="text-sm font-semibold">{t("personalComm")}</h4>
          </div>

          {tutor.availability.times?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tutor.availability.times.map((time, index) => {
                let displayText = "Invalid time format";
                
                if (typeof time === 'string') {
                  displayText = time;
                } else if (time && typeof time === 'object' && time.days && time.hours) {
                  const days = Array.isArray(time.days) ? time.days.join(", ") : time.days;
                  displayText = `${days}: ${time.hours}`;
                }
                
                return (
                  <span
                    key={index}
                    className="bg-accent text-accent-foreground text-xs font-medium px-3 py-1 rounded-full"
                  >
                    {displayText}
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="text-xs italic text-muted-foreground">
              {t("noCommTimes")}
            </p>
          )}

          {tutor.availability.note ? (
            <div className="text-sm text-muted-foreground italic leading-relaxed border-t pt-3 border-border">
              {tutor.availability.note}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground italic text-center pt-4">
          {t("noCommInfo")}
        </div>
      )}
    </div>
  );
};

export default TutorScheduleDisplay;