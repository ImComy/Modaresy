import React from "react";
import { Repeat , Clock, CalendarDays, Info, PhoneCall, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

const TutorGroupsCardDisplay = ({ subject, tutor }) => {
  const { t } = useTranslation();
  const noGroups = !subject || !Array.isArray(subject.Groups) || subject.Groups.length === 0;

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm space-y-6">
      <div className="space-y-2 text-center mb-6">
        <div className="flex justify-center items-center gap-2 text-[hsl(var(--primary))]">
          <CalendarDays className="w-6 h-6" />
          <h2 className="text-2xl font-bold tracking-tight">{t("bookingSchedule")}</h2>
        </div>
        <p className="text-lg text-[hsl(var(--foreground))] font-medium">
          {subject?.subject} – {t("grade")} {subject?.grade}
        </p>
      </div>

      {noGroups ? (
        <div className="flex items-center gap-3 text-sm text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))] border border-dashed border-[hsl(var(--border))] px-4 py-6 rounded-xl text-center justify-center">
          <AlertTriangle className="w-5 h-5 text-[hsl(var(--muted-foreground))]" />
          <span>{t("noGroupsYet")}</span>
        </div>
      ) : (
        <div className="grid gap-5">
          {subject.Groups.map((group, i) => (
            <div
              key={i}
              className={`rounded-xl p-5 border relative transition hover:shadow-md ${
                group.isFull
                  ? "bg-[hsl(var(--destructive)/0.1)] border-[hsl(var(--destructive)/0.3)]"
                  : "bg-[hsl(var(--accent)/0.08)] border-[hsl(var(--accent)/0.3)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  {group.groupName || t("unnamedGroup")}
                </h3>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    group.isFull
                      ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]"
                      : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                  }`}
                >
                  {group.isFull ? t("full") : t("available")}
                </span>
              </div>

              <div className="space-y-1 text-sm text-[hsl(var(--foreground))]">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <span>
                    <strong>{t("days")}:</strong> {group.days?.join(", ") || t("tba")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <span>
                    <strong>{t("time")}:</strong> {group.time || t("tba")}
                  </span>
                </div>
                {group.note && (
                  <div className="flex items-center gap-2 italic text-[hsl(var(--primary))]">
                    <Info className="w-4 h-4" />
                    <span>{group.note}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="pt-4 border-t border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Repeat  className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span>
            كل شيء منسّق مسبقًا لراحتك.
          </span>
        </div>
      </div>

      {tutor?.personalAvailability ? (
        <div className="rounded-xl p-5 mt-6 border border-[hsl(var(--accent)/0.3)] bg-[hsl(var(--accent)/0.05)] space-y-4">
          <div className="flex items-center gap-2 text-[hsl(var(--accent))] mb-1">
            <PhoneCall className="w-5 h-5" />
            <h4 className="text-sm font-semibold">{t("personalComm")}</h4>
          </div>

          {tutor.personalAvailability.times?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tutor.personalAvailability.times.map((time, index) => (
                <span
                  key={index}
                  className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] text-xs font-medium px-3 py-1 rounded-full"
                >
                  {time}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs italic text-[hsl(var(--muted-foreground))]">
              {t("noCommTimes")}
            </p>
          )}

          {tutor.personalAvailability.note ? (
            <div className="text-sm text-[hsl(var(--muted-foreground))] italic leading-relaxed border-t pt-3 border-[hsl(var(--border))]">
              {tutor.personalAvailability.note}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="text-xs text-[hsl(var(--muted-foreground))] italic text-center pt-4">
          {t("noCommInfo")}
        </div>
      )}
    </div>
  );
};

export default TutorGroupsCardDisplay;
