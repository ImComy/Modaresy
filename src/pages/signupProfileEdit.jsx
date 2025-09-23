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
import TutorVideoOnboard from "@/components/signup/youtube";
import TutorOnboardingAside from "@/components/signup/TutorOnboardingAside";
import AddSubjectCardUI from "@/components/signup/StepSubjects";
import ScheduleEditor from "@/components/signup/ScheduleEditor";
import SubjectPricingInfoEditHollow from "@/components/signup/pricing";

const STORAGE_KEY = "modaresy:tutor:onboarding";

const rawSteps = [
  { id: "pfp", title: "Profile Photo & Banner", component: StepUploadPfp, subtitle: "Add profile picture + banner" },
  { id: "bio", title: "Basic Info", component: StepBio, subtitle: "Enter name, bio and experience" },
  { id: "socials", title: "Socials", component: StepSocialMedia, subtitle: "Add links and social handles" },
  { id: "videos", title: "Intro Videos", component: TutorVideoOnboard, subtitle: "Upload or link your intro" },
  { id: "subjects", title: "Subjects", component: AddSubjectCardUI, subtitle: "What do you teach?" },
  { id: "schedule", title: "Schedule", component: ScheduleEditor, subtitle: "Set your availability" },
  { id: "pricing", title: "Pricing", component: SubjectPricingInfoEditHollow, subtitle: "Set lesson prices & offers" },
  { id: "finish", title: "Finish", component: StepFinish, subtitle: "Review & publish" },
];

export default function TutorOnboardingWrapper({ onFinish }) {
  // load initial index from localStorage so reload restores the same step
  const [index, setIndex] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      const parsed = JSON.parse(raw);
      return typeof parsed._currentStep === "number" ? parsed._currentStep : 0;
    } catch (e) {
      return 0;
    }
  });

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

  // persist state object whenever it changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      // keep any stored _currentStep if present
      parsed._data = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {}
  }, [state]);

  // persist current step index whenever it changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed._currentStep = index;
      // ensure we don't accidentally overwrite stored data object
      if (!parsed._data) parsed._data = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    } catch (e) {}
  }, [index, state]);

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
    else {
      // final step: finish and clear saved draft
      onFinish?.(state);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {}
    }
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
        const buffer = 160;
        setCenterCard(cardHeight + buffer < viewport);
      } catch (e) {
        setCenterCard(false);
      }
    };

    check();
    window.addEventListener("resize", check, { passive: true });

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

  // helpers: small svg icons to avoid pulling other icon libs in this file
  const IconList = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <circle cx="4" cy="6" r="1.2" />
      <circle cx="4" cy="12" r="1.2" />
      <circle cx="4" cy="18" r="1.2" />
    </svg>
  );

  const IconClose = ({ className = "w-5 h-5" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );

  const IconChevron = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );

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

            {/* Mobile header: pill style with progress ring + clearer "Steps" affordance */}
            <div className="md:hidden flex items-center justify-between mb-4 px-1">
              <div className="flex flex-col">
                <strong className="text-base" style={{ color: "hsl(var(--foreground))" }}>Setup your tutor profile</strong>
                <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{`Step ${index + 1} of ${steps.length}`}</div>
              </div>

              <div className="flex items-center gap-2">
                {/* improved pill button: shows a small circular progress, label and chevron */}
                <button
                  onClick={() => setMobileNavOpen((s) => !s)}
                  aria-expanded={mobileNavOpen}
                  aria-controls="mobile-step-list"
                  className="flex items-center gap-3 px-3 py-2 rounded-full shadow-sm ring-1 ring-transparent bg-[hsl(var(--card)/0.9)]"
                >
                  <div className="relative w-9 h-9 flex items-center justify-center">
                    <svg className="absolute inset-0 w-9 h-9" viewBox="0 0 36 36" aria-hidden>
                      <path strokeWidth="2.5" stroke="rgba(0,0,0,0.05)" fill="none" d="M18 2a16 16 0 1 0 0 32 16 16 0 1 0 0-32" />
                      <motion.path
                        d="M18 2a16 16 0 0 1 0 32"
                        strokeWidth="2.5"
                        stroke="currentColor"
                        fill="none"
                        strokeDasharray="100"
                        initial={{ strokeDashoffset: 100 }}
                        animate={{ strokeDashoffset: 100 - progress }}
                        transition={{ ease: "linear", duration: 0.3 }}
                      />
                    </svg>
                    <span className="text-[10px] font-semibold" aria-hidden>{index + 1}</span>
                  </div>

                  <div className="flex flex-col text-left pr-2">
                    <div className="text-sm font-medium">Steps</div>
                    <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{steps[index].title}</div>
                  </div>

                  <IconChevron />
                </button>
              </div>
            </div>

            {/* glass-like open card */}
            <div id="onboard-card" ref={cardRef} className="relative rounded-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.02))] backdrop-blur-md shadow-lg ring-1 ring-transparent overflow-hidden mt-10">
              <div className="relative md:px-6  md:pb-0">
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
                    <div className="max-h-none overflow-auto md:overflow-visible touch-pan-y" aria-live="polite">
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

            {/* footer controls - mobile: condensed, larger tap targets and a strong primary next button */}
            <div className="md:hidden">
              <div className="fixed left-4 right-4 bottom-4 z-20 rounded-xl backdrop-blur-sm shadow-lg border border-transparent" role="region" aria-label="Step controls">
                <div className="flex items-center justify-between gap-3 p-3">
                  <button
                    onClick={() => { setState({}); setIndex(0); localStorage.removeItem(STORAGE_KEY); }}
                    className="flex-1 rounded-lg p-2 text-sm"
                    aria-label="Restart onboarding"
                  >Restart</button>

                  <button
                    onClick={prev}
                    disabled={index === 0}
                    className="flex-1 rounded-lg p-2 text-sm"
                    aria-label="Previous step"
                  >Back</button>

                  <button
                    onClick={next}
                    className="flex-1 rounded-lg p-2 text-sm"
                    aria-label={index === steps.length - 1 ? "Finish onboarding" : "Next step"}
                    style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                  >{index === steps.length - 1 ? "Finish" : "Next"}</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile step list drawer: bottom sheet with drag handle and clearer layout */}
        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
              <motion.div
                initial={{ y: "40%" }}
                animate={{ y: 0 }}
                exit={{ y: "40%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute left-0 right-0 bottom-0 bg-[hsl(var(--card)/0.98)] rounded-t-2xl p-3 shadow-lg overflow-auto max-h-[86vh]"
                role="dialog"
                aria-modal="true"
              >
                {/* drag handle */}
                <div className="w-12 mx-auto mb-3">
                  <div className="h-1.5 rounded-full bg-[hsl(var(--muted)/0.14)]" />
                </div>

                <div className="flex items-center justify-between mb-3 px-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[hsl(var(--muted)/0.06)]"><IconList /></div>
                    <div>
                      <div className="text-lg font-medium">Steps</div>
                      <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{`Select a step — ${progress}% complete`}</div>
                    </div>
                  </div>
                  <button className="p-2 rounded-md" onClick={() => setMobileNavOpen(false)} aria-label="Close steps">
                    <IconClose />
                  </button>
                </div>

                <div id="mobile-step-list" className="space-y-3 pb-8">
                  {steps.map((s, i) => {
                    const active = i === index;
                    return (
                      <button
                        key={s.id}
                        onClick={() => { go(i); setMobileNavOpen(false); }}
                        className={`w-full flex items-start gap-3 p-4 rounded-lg text-left transition-shadow ${active ? "shadow-md ring-1 ring-[hsl(var(--primary))]/20 bg-[hsl(var(--primary)/0.08)]" : "bg-transparent hover:bg-[hsl(var(--muted)/0.02)]"}`}
                      >
                        <div className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold ${active ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]" : "bg-[hsl(var(--muted)/0.12)] text-[hsl(var(--muted-foreground))]"}`}>
                          {i + 1}
                        </div>

                        <div className="flex-1">
                          <div className="text-sm font-medium">{s.title}</div>
                          <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{s.subtitle}</div>
                        </div>

                        <div className="self-start text-xs font-semibold" style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>{active ? "Active" : `Step ${i + 1}`}</div>
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
