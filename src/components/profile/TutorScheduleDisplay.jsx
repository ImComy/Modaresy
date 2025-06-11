import React from "react";
import { Users, Clock, CalendarDays, Info } from "lucide-react";

const TutorGroupsCard = ({ subject }) => {
  if (!subject || !subject.Groups) {
    return (
      <div className="p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
        No group information available.
      </div>
    );
  }

  return (
    <div className="bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-xl p-6 shadow-sm space-y-6">
      <div className="space-y-2 text-center mb-6">
        <div className="flex justify-center items-center gap-2 text-[hsl(var(--primary))]">
          <CalendarDays className="w-6 h-6" />
          <h2 className="text-2xl font-bold tracking-tight">
            Booking Schedule
          </h2>
        </div>
        <p className="text-lg text-[hsl(var(--foreground))] font-medium">
          {subject.subject} – Grade {subject.grade}
        </p>
      </div>

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
                {group.groupName}
              </h3>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  group.isFull
                    ? "bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))]"
                    : "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
                }`}
              >
                {group.isFull ? "Full" : "Available"}
              </span>
            </div>

            <div className="space-y-1 text-sm text-[hsl(var(--foreground))]">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <span><strong>Days:</strong> {group.days.join(", ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <span><strong>Time:</strong> {group.time}</span>
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

      <div className="pt-4 border-t border-[hsl(var(--border))] text-sm text-[hsl(var(--muted-foreground))] flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          <span>
            <strong>Weekly Schedule:</strong> {subject.lecturesPerWeek} lectures · {subject.duration} mins each
          </span>
        </div>
      </div>
    </div>
  );
};

export default TutorGroupsCard;
