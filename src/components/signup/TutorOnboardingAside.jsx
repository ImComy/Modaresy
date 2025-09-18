import React from "react";
import { motion } from "framer-motion";
import { Check, Star, Trophy } from "lucide-react";

const listVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 420, damping: 28 } },
};

const circleVariants = {
  initial: { scale: 1, rotate: 0 },
  active: { scale: 1.06, rotate: 6, transition: { type: "spring", stiffness: 500, damping: 28 } },
  completed: { scale: 1, rotate: 0, transition: { type: "spring", stiffness: 360, damping: 28 } },
  lastCompleted: { scale: 1.08, rotate: 0, transition: { type: "spring", stiffness: 520, damping: 30 } },
};

const confettiColors = ["#FDE68A", "#FCA5A5", "#BFDBFE", "#C7F9CC", "#FBCFE8"];

const Confetti = ({ animate = false }) => (
  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
    {confettiColors.map((c, idx) => (
      <motion.span
        key={idx}
        initial={{ y: 0, opacity: 0, scale: 0.5 }}
        animate={animate ? { y: -28 - idx * 6, opacity: 1, scale: 1 } : { opacity: 0 }}
        transition={{ delay: 0.06 * idx, type: "spring", stiffness: 400, damping: 22 }}
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{ background: c, left: `${8 + idx * 8}%` }}
      />
    ))}
  </div>
);

const TutorOnboardingAside = ({ steps, index, go, asideOffset }) => {
  return (
    <aside className="hidden md:block md:w-1/3 lg:w-1/4 p-6 md:p-8">
      <div
        className="sticky top-20"
        style={{
          transition: "transform 220ms linear",
          transform: `translateY(${asideOffset}px)`,
        }}
        aria-hidden
      >
        <motion.h2
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 320 }}
          className="text-3xl font-extrabold leading-tight"
          style={{ color: "hsl(var(--foreground))" }}
        >
          Setup your tutor profile
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.12 }}
          className="max-w-[34ch] mt-4 text-sm"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          A few quick steps to make your profile shine. Students trust tutors with photos, a short bio, and social proof.
        </motion.p>

        <motion.div className="mt-6 space-y-3" variants={listVariants} initial="hidden" animate="show">
          {steps.map((s, i) => {
            const active = i === index;
            const completed = i < index;
            const isLast = i === steps.length - 1;

            // Icon conditions
            const showCheck = completed && !isLast;
            const showStar = isLast && !completed;
            const showTrophy = isLast && completed;

            const lineBg = i < index ? "hsl(var(--primary))" : "hsl(var(--muted) / 0.3)";

            // Emphasize last step visually
            const buttonClasses = [
              "group w-full flex items-center gap-4 p-3 rounded-lg cursor-pointer relative transition-all duration-200",
              active ? "bg-gradient-to-r from-primary to-accent/90 text-primary-foreground shadow-md" : "",
              !active && completed ? "bg-primary/5 hover:bg-primary/10 text-foreground" : "",
              !active && !completed ? "text-muted-foreground hover:bg-muted/5" : "",
              isLast ? "ring-1 ring-transparent" : "",
            ]
              .filter(Boolean)
              .join(" ");

            // Different circle sizing and style for last item
            const baseCircle = isLast ? "w-12 h-12" : "w-9 h-9";
            const circleBgClass = active ? "bg-primary-foreground" : completed ? "bg-primary" : "bg-muted";
            const circleTextClass = active ? "text-primary" : completed ? "text-primary-foreground" : "text-muted-foreground";
            const circleClasses = `${baseCircle} rounded-full flex items-center justify-center font-semibold relative z-10 ${circleBgClass} ${circleTextClass}`;

            const subtitleClasses = [
              "text-xs mt-1",
              completed ? "text-primary" : active ? "text-primary-foreground/90" : "text-muted-foreground",
            ].join(" ");

            const subtitleText = showTrophy ? "Profile complete — Great job!" : completed ? "Completed" : active ? "Current step" : `Step ${i + 1} of ${steps.length}`;

            const lineClasses = [
              "absolute top-full left-1/2 w-px h-8 -translate-x-1/2",
              i < steps.length - 1 ? "" : "hidden",
            ]
              .filter(Boolean)
              .join(" ");

            return (
              <motion.button
                key={s.id}
                onClick={() => go(i)}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
                className={buttonClasses}
                aria-current={active ? "step" : undefined}
                aria-label={`Go to ${s.title}`}
              >
                <div className="relative flex-shrink-0" style={{ width: isLast ? 56 : 36 }}>
                  {/* special outer ring / glow for the final step */}
                  {isLast && (
                    <div className="absolute -inset-1 rounded-full z-0 pointer-events-none" aria-hidden>
                      <div className="absolute inset-0 rounded-full blur-md opacity-40" style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }} />
                    </div>
                  )}

                  <motion.div
                    className={circleClasses}
                    variants={circleVariants}
                    initial="initial"
                    animate={showTrophy ? "lastCompleted" : active ? "active" : completed ? "completed" : "initial"}
                  >
                    {showTrophy ? (
                      <Trophy className="w-5 h-5" />
                    ) : showStar ? (
                      <Star className="w-4 h-4 animate-pulse" />
                    ) : showCheck ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <span className="text-sm font-semibold">{i + 1}</span>
                    )}

                    {/* subtle confetti when final completed */}
                    {showTrophy && <Confetti animate={true} />}
                  </motion.div>

                  <div className={lineClasses} style={{ backgroundColor: lineBg }} aria-hidden />
                </div>

                <div className="text-left min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{s.title}</div>
                  </div>

                  <div className={subtitleClasses}>{subtitleText}</div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </aside>
  );
};

export default TutorOnboardingAside;
