// StepFinish.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

function CelebrateCheckbox({ initialChecked = false, size = 72 }) {
  const [checked, setChecked] = useState(initialChecked);
  const [didMountAnimate, setDidMountAnimate] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setChecked(true);
      setDidMountAnimate(true);
      setTimeout(() => setDidMountAnimate(false), 900);
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const pieces = [
    { x: -26, y: -44, r: -28, c: "hsl(var(--secondary))" },
    { x: 22, y: -42, r: 14, c: "hsl(var(--primary))" },
    { x: -6, y: -56, r: 6, c: "hsl(var(--accent))" },
    { x: 30, y: -22, r: 40, c: "hsl(var(--success))" },
    { x: -28, y: -12, r: -8, c: "hsl(var(--secondary))" },
    { x: 8, y: -30, r: -36, c: "hsl(var(--primary))" },
  ];

  return (
    <div className="relative inline-flex items-center justify-center">
      <button
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={() => setChecked((c) => !c)}
        className="relative flex items-center justify-center focus:outline-none"
        style={{ width: size, height: size }}
      >
        <motion.span
          className="absolute rounded-full"
          initial={false}
          animate={{
            scale: checked ? 1.05 : 1,
            boxShadow: checked
              ? `0 12px 36px color-mix(in srgb, hsl(var(--ring)) 18%, transparent)`
              : `0 6px 18px color-mix(in srgb, hsl(var(--border)) 8%, transparent)`,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          style={{
            width: size,
            height: size,
            borderRadius: "9999px",
            background: "transparent",
            border: `1px solid hsl(var(--border))`,
          }}
        />

        <AnimatePresence>
          {checked && (
            <motion.span
              key="ring"
              initial={{ scale: 0.6, opacity: 0.18 }}
              animate={{ scale: 1.7, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: "easeOut" }}
              style={{
                position: "absolute",
                width: size * 1.8,
                height: size * 1.8,
                borderRadius: 999,
                border: `2px dashed hsl(var(--success) / 0.9)`,
                background: "transparent",
              }}
            />
          )}
        </AnimatePresence>

        <motion.span
          className="relative flex items-center justify-center rounded-full"
          initial={false}
          animate={{
            scale: checked ? 1 : 0.94,
            background: checked ? `hsl(var(--success))` : "transparent",
            border: checked ? "none" : `2px solid hsl(var(--border))`,
          }}
          transition={{ type: "spring", stiffness: 280, damping: 20 }}
          style={{
            width: size * 0.62,
            height: size * 0.62,
            borderRadius: "9999px",
          }}
        >
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: checked ? 1 : 0.6, opacity: checked ? 1 : 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 22 }}
          >
            <Check strokeWidth={2.6} size={size * 0.34} color={checked ? "white" : "hsl(var(--muted-foreground))"} />
          </motion.span>
        </motion.span>

        <motion.span
          className="pointer-events-none absolute rounded-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: checked ? 1 : 0 }}
          transition={{ duration: 0.28 }}
          style={{
            width: size * 0.24,
            height: size * 0.24,
            right: -size * 0.08,
            top: -size * 0.08,
            background: `linear-gradient(180deg, hsl(var(--primary) / 0.95), hsl(var(--primary) / 0.18))`,
            borderRadius: 999,
            boxShadow: `0 6px 18px color-mix(in srgb, hsl(var(--primary)) 12%, transparent)`,
          }}
        />
      </button>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
        style={{ width: size * 2.4, height: size * 2.4 }}
      >
        <AnimatePresence>
          {(didMountAnimate || checked) && (
            <motion.div
              key={didMountAnimate ? "burst-mount" : `burst-${checked ? "toggle" : "off"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9 }}
              style={{ position: "relative", width: "100%", height: "100%" }}
            >
              {pieces.map((p, i) => (
                <motion.span
                  key={i}
                  initial={{ x: 0, y: 0, rotate: 0, scale: 0.75, opacity: 1 }}
                  animate={{
                    x: p.x + (Math.random() * 10 - 5),
                    y: p.y + (Math.random() * 6 - 3),
                    rotate: p.r + (Math.random() * 36 - 18),
                    scale: [1, 1.06, 0.92],
                    opacity: [1, 0.9, 0],
                  }}
                  transition={{ duration: 0.88 + Math.random() * 0.28, ease: "easeOut" }}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: size * 0.08,
                    height: size * 0.18,
                    transformOrigin: "center",
                    borderRadius: 2,
                    background: p.c,
                    boxShadow: "0 6px 10px color-mix(in srgb, hsl(var(--border)) 8%, transparent)",
                  }}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function StepFinish() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.995 }}
      animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.42, ease: [0.2, 0.8, 0.2, 1] }}
      className="w-full max-w-2xl mx-auto p-4 sm:p-6 rounded-2xl overflow-hidden"
      style={{
        background: "transparent",
      }}
    >
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-5">
        <div className="flex-shrink-0 mx-auto md:mx-0">
          <CelebrateCheckbox initialChecked={false} size={84} />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h3
            className="text-xl sm:text-2xl font-semibold flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center md:justify-start"
            style={{ color: "hsl(var(--foreground))" }}
          >
            Ready to go!
            <span
              className="px-2 py-1 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap"
              style={{
                background: "hsl(var(--muted))",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              You've Personalized Your Profile
            </span>
          </h3>

          <p
            className="mt-2 text-sm max-w-xl mx-auto md:mx-0 px-2 sm:px-0"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            Finalize and start teaching — you can edit any of this later from your profile.
            Click the check to celebrate or toggle if you want to unfinish.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center md:justify-start gap-3 w-full">
            <a
              role="button"
              href="#profile"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium shadow-sm w-full sm:w-auto justify-center"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
                boxShadow: `0 6px 20px color-mix(in srgb, hsl(var(--primary)) 12%, transparent)`,
              }}
            >
              Go to Profile
            </a>

            <a
              role="button"
              href="#dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium border w-full sm:w-auto justify-center"
              style={{
                background: "transparent",
                color: "hsl(var(--foreground))",
                borderColor: "hsl(var(--border))",
              }}
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}