import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Calendar,
  Award,
  Trophy,
  Users,
  ThumbsUp,
  Sparkles,
  X,
} from "lucide-react";
import Tooltip from "@/components/ui/tooltip";

const iconMap = {
  topRated: <Star size={20} className="text-yellow-500" />,
  monthlyTop: <Calendar size={20} className="text-purple-600" />,
  award: <Award size={20} className="text-blue-600" />,
  consistent: <Trophy size={20} className="text-green-600" />,
  studentFav: <ThumbsUp size={20} className="text-pink-600" />,
  groupLeader: <Users size={20} className="text-indigo-600" />,
};

const emojiMap = {
  topRated: "🌟",
  monthlyTop: "📅",
  award: "🏅",
  consistent: "🏆",
  studentFav: "💖",
  groupLeader: "👥",
};

const bgMap = {
  topRated: "bg-yellow-100 border-yellow-300 text-yellow-900 dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-200",
  monthlyTop: "bg-purple-100 border-purple-300 text-purple-900 dark:bg-purple-900/20 dark:border-purple-600 dark:text-purple-200",
  award: "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-200",
  consistent: "bg-green-100 border-green-300 text-green-900 dark:bg-green-900/20 dark:border-green-600 dark:text-green-200",
  studentFav: "bg-pink-100 border-pink-300 text-pink-900 dark:bg-pink-900/20 dark:border-pink-600 dark:text-pink-200",
  groupLeader: "bg-indigo-100 border-indigo-300 text-indigo-900 dark:bg-indigo-900/20 dark:border-indigo-600 dark:text-indigo-200",
};

const TutorBadge = ({ type, label, dateRange }) => (
  <Tooltip content={`${label}${dateRange ? ` (${dateRange})` : ""} — earned by this tutor based on consistent performance and ratings.`}>
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-md transition-all duration-300 ${bgMap[type] || "bg-muted"}`}
    >
      <div className="shrink-0">{iconMap[type] || <Sparkles size={20} />}</div>
      <div className="flex flex-col text-sm">
        <span className="font-semibold">{label}</span>
        {dateRange && <span className="text-xs opacity-70">{dateRange}</span>}
      </div>
    </motion.div>
  </Tooltip>
);


const TutorAchievements = ({ tutor }) => {
  const [open, setOpen] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const badges = tutor?.achievements || [];
  if (!badges.length) return null;

  const togglePanel = () => {
    setOpen(prev => !prev);
    setClicked(true);
    setTimeout(() => setClicked(false), 300);
  };

  const emojis = Array.from(new Set(badges.map(b => emojiMap[b.type]).filter(Boolean)));
  const categories = Array.from(new Set(badges.map(b => b.type)));
  const filteredBadges = selectedCategory === "all" ? badges : badges.filter(b => b.type === selectedCategory);

  return (
    <>
      <motion.button
        onClick={togglePanel}
        className="fixed bottom-5 right-5 z-[60] p-4 rounded-full bg-primary text-white shadow-2xl visible overflow-visible"
        animate={{
          scale: clicked ? 1.3 : 1,
          boxShadow: clicked
            ? "0 0 32px hsl(var(--primary))"
            : "0 0 18px hsl(var(--primary))",
        }}
        transition={{ type: "spring", stiffness: 250, damping: 18 }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 1 }}
      >
        <motion.div
          animate={{ rotate: [0, 5, -5, 3, -3, 0] }}
          transition={{ repeat: Infinity, repeatDelay: 5, duration: 1.4 }}
        >
          <Sparkles size={22} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePanel}
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 250, damping: 30 }}
              className="fixed top-8 right-0 h-full w-full sm:w-[420px] z-50 bg-background text-foreground border-l border-muted shadow-lg flex flex-col  rounded-none md:rounded-l-lg"
            >
              <div className="flex items-center justify-between p-4 border-b border-muted ">
                <h2 className="text-xl font-bold flex items-center gap-2">🌟 Achievements</h2>
                <button onClick={togglePanel}>
                  <X size={22} className="text-muted-foreground" />
                </button>
              </div>

              {emojis.length > 0 && (
                <motion.div
                  className="px-6 py-4 text-3xl flex gap-2 flex-wrap justify-start"
                  initial={{ y: -15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {emojis.map((emoji, i) => (
                    <motion.span
                      key={i}
                      whileHover={{ scale: 1.4, rotate: [0, 10, -10, 0] }}
                      className="cursor-default"
                    >
                      {emoji}
                    </motion.span>
                  ))}
                </motion.div>
              )}

              <div className="flex flex-col gap-4 p-4 overflow-y-auto max-h-full">
                <AnimatePresence>
                  {filteredBadges.map((badge, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <TutorBadge {...badge} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorAchievements;
