// TutorOnboardingWrapper.jsx (updated)
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepDataContext } from "@/context/StepContext";
import ScrollToTop from "@/components/ScrollToTop";

// import individual step components
import StepUploadPfp from "@/components/signup/StepUploadPfp";
import StepSocialMedia from "@/components/signup/StepSocialMedia";
import StepBio from "@/components/signup/StepBio";
import StepFinish from "@/components/signup/StepFinish";
import TutorVideoManagerEdit from "@/components/profile/editing/TutorVideoManagerEdit";
import TutorOnboardingAside from "@/components/signup/TutorOnboardingAside";
import AddSubjectCardUI from "@/components/signup/StepSubjects";

const STORAGE_KEY = "modaresy:tutor:onboarding";

const rawSteps = [
  { id: "pfp", title: "Profile Photo & Banner", component: StepUploadPfp },
  { id: "bio", title: "Basic Info", component: StepBio },
  { id: "socials", title: "Socials", component: StepSocialMedia },
  { id: "videos", title: "Intro Videos", component: TutorVideoManagerEdit },
  { id: "subjects", title: "Subjects", component: AddSubjectCardUI },
  { id: "finish", title: "Finish", component: StepFinish },
];

export default function TutorOnboardingWrapper({ onFinish }) {
  const [index, setIndex] = useState(0);
  const steps = useMemo(() => rawSteps, []);
  const activeStep = steps[index];

  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }, [state]);

  const go = useCallback(
    (i) => {
      if (i < 0 || i >= steps.length) return;
      setIndex(i);
      const el = document.getElementById("onboard-card");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    },
    [steps.length]
  );

  const next = useCallback(() => {
    if (index < steps.length - 1) setIndex((i) => i + 1);
    else onFinish?.(state);
  }, [index, steps.length, onFinish, state]);

  const prev = useCallback(() => {
    if (index > 0) setIndex((i) => i - 1);
  }, [index]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") document.activeElement?.blur();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next, prev]);

  // smooth aside translate (more noticeable on scroll)
  const [asideOffset, setAsideOffset] = useState(0);
  const latestY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      latestY.current = window.scrollY || window.pageYOffset;
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(() => {
          // smaller cap keeps motion subtle on longer pages
          const raw = Math.max(0, Math.min(latestY.current * 0.12, 24));
          setAsideOffset(raw);
          ticking.current = false;
        });
      }
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const progress = Math.round(((index + 1) / steps.length) * 100);

  const cardVariants = {
    enter: { opacity: 0, y: 12, scale: 0.995 },
    center: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.995 },
  };

  // Mobile step list drawer
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // lock body scroll when mobile nav is open (better UX on mobile)
  useEffect(() => {
    if (mobileNavOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [mobileNavOpen]);

  // vertical centering: when the card is short we center it vertically, when it's tall we keep it at the top.
  const cardRef = useRef(null);
  const [centerCard, setCenterCard] = useState(false);

  useEffect(() => {
    if (!cardRef.current) return;

    const check = () => {
      try {
        const el = cardRef.current;
        const cardHeight = el.offsetHeight;
        const viewport = window.innerHeight;
        // buffer allows some breathing room for header / sticky aside
        const buffer = 160;
        setCenterCard(cardHeight + buffer < viewport);
      } catch (e) {
        setCenterCard(false);
      }
    };

    check();
    window.addEventListener("resize", check, { passive: true });

    // observe for content changes inside the card (e.g. image upload expands height)
    let ro = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(check);
      ro.observe(cardRef.current);
    }

    return () => {
      window.removeEventListener("resize", check);
      if (ro) ro.disconnect();
    };
  }, [index]);

  return (
    <StepDataContext.Provider value={{ state, setState }}>
      <ScrollToTop dep={index} />
      <div className="md:min-h-screen flex items-stretch bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--card)/0.98)] -mb-20 -mx-4">
        <div className="fixed left-0 right-0 top-0 z-40">
          <div className="h-1 bg-transparent">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "easeOut", duration: 0.36 }}
              className="h-1"
              style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))" }}
              aria-hidden
            />
          </div>
        </div>

        {/* Aside */}
        <TutorOnboardingAside steps={steps} index={index} go={go} asideOffset={asideOffset} />

        {/* Main: card area. We toggle vertical alignment based on card height so short cards are centered */}
        <main className={`flex-1 flex ${centerCard ? "items-center" : "items-start"} justify-center p-4 sm:p-6 md:p-6`}>
          <div className="w-full max-w-full sm:max-w-xl md:max-w-full rounded-2xl overflow-visible" style={{ background: "transparent" }}>
            {/* Mobile header: small controls + open step list */}
            <div className="md:hidden flex items-center justify-between mb-4 px-1">
              <div className="flex flex-col">
                <strong className="text-base" style={{ color: "hsl(var(--foreground))" }}>Setup your tutor profile</strong>
                <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{`Step ${index + 1} of ${steps.length}`}</div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setMobileNavOpen((s) => !s)} aria-expanded={mobileNavOpen} aria-controls="mobile-step-list" className="rounded-full p-2">
                  Steps
                </Button>
              </div>
            </div>

            {/* decorative shapes (hidden on small screens to avoid overflow) */}
            <div className="relative -mt-6 mb-4 pointer-events-none">
              <motion.div
                className="hidden md:block absolute -left-6 -top-6 w-40 h-40 rounded-3xl"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "radial-gradient(circle at 30% 20%, hsl(var(--secondary) / 0.95), transparent 50%), linear-gradient(180deg, hsl(var(--accent)), transparent)", filter: "blur(22px)", opacity: 0.85 }}
              />
              <motion.div
                className="hidden md:block absolute right-0 bottom-6 w-32 h-32 rounded-lg"
                animate={{ x: [0, 12, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ background: "linear-gradient(90deg, hsl(var(--primary) / 0.9), hsl(var(--secondary) / 0.8))", transform: "rotate(18deg)", filter: "blur(8px)", opacity: 0.95 }}
              />
            </div>

            {/* glass-like open card */}
            <div id="onboard-card" ref={cardRef} className="relative rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] backdrop-blur-md shadow-lg ring-1 ring-transparent overflow-hidden mt-10">
              <div className="relative px-4 md:px-6 pt-6 pb-6 md:pb-0">
                {/* SINGLE shared step rendering - responsive scroll behavior handled by CSS */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep.id}
                    variants={cardVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.36, ease: "easeOut" }}
                    className="rounded-lg bg-transparent"
                  >
                    {/* inner wrapper: scrollable on small screens, static on md+ */}
                    <div
                      className="max-h-[calc(100vh-160px)] md:max-h-none overflow-auto md:overflow-visible touch-pan-y"
                      aria-live="polite"
                    >
                      <activeStep.component
                        onFile={(f) => {
                          setState((s) => ({ ...s, _lastFileUploaded: !!f }));
                        }}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* footer controls - desktop */}
              <div className="hidden md:flex items-center justify-between gap-4 px-6 py-4 bg-transparent">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" onClick={() => { setState({}); setIndex(0); localStorage.removeItem(STORAGE_KEY); }} className="rounded-full">Restart</Button>
                  <Button variant="outline" onClick={prev} disabled={index === 0} className="rounded-full">Back</Button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{index === steps.length - 1 ? "All done" : `Step ${index + 1} of ${steps.length}`}</div>

                  <Button onClick={next} className="rounded-full px-6 py-2" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
                    {index === steps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </div>
            </div>

            {/* footer controls - mobile */}
            <div className="md:hidden">
              <div className="fixed left-4 right-4 bottom-4 z-20 rounded-xl backdrop-blur-sm shadow-lg border border-transparent" role="region" aria-label="Step controls">
                <div className="flex items-center justify-between gap-3 p-3">
                  <Button variant="ghost" size="sm" onClick={() => { setState({}); setIndex(0); localStorage.removeItem(STORAGE_KEY); }} className="flex-1 rounded-lg">Restart</Button>
                  <Button variant="outline" size="sm" onClick={prev} disabled={index === 0} className="flex-1 rounded-lg">Back</Button>
                  <Button size="sm" onClick={next} className="flex-1 rounded-lg" style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>{index === steps.length - 1 ? "Finish" : "Next"}</Button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile step list drawer: bottom sheet */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
              <motion.div
                initial={{ y: "40%" }}
                animate={{ y: 0 }}
                exit={{ y: "40%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 right-0 bottom-0 bg-[hsl(var(--card)/0.98)] rounded-t-2xl p-4 shadow-lg overflow-auto max-h-[80vh]"
                role="dialog"
                aria-modal="true"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-medium">Steps</div>
                  <Button size="sm" variant="ghost" onClick={() => setMobileNavOpen(false)}>Close</Button>
                </div>

                <div id="mobile-step-list" className="space-y-3 pb-8">
                  {steps.map((s, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { go(i); setMobileNavOpen(false); }}
                        className={`w-full flex items-center gap-3 p-4 rounded-lg text-left ${active ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-transparent"}`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center rounded-full font-semibold" style={{ background: active ? "hsl(var(--primary-foreground))" : "hsl(var(--muted))", color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>{i + 1}</div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{s.title}</div>
                          <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{i === index ? "Current step" : `Step ${i + 1} of ${steps.length}`}</div>
                        </div>
                        {active && <div className="text-xs font-semibold">Active</div>}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </StepDataContext.Provider>
  );
}