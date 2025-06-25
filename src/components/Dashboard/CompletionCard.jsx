import React from "react";
import {
  GaugeCircle,
  UserCog,
  BarChart,
  AlertTriangle,
  Sparkles,
  Lightbulb,
} from "lucide-react";
import { motion } from "framer-motion";

const SettingsCompletionCard = ({ completionPercentage = 60 }) => {
  const getStatusColor = () => {
    if (completionPercentage >= 80) return "text-green-600";
    if (completionPercentage >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getBarColor = () => {
    if (completionPercentage >= 80) return "bg-green-500";
    if (completionPercentage >= 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  const recommendations = [
    { key: "bio", label: "Add a detailed general bio" },
    { key: "video", label: "Upload a short introduction video" },
    { key: "availability", label: "Set weekly availability" },
    { key: "pricing", label: "Add subject pricing and offers" },
    { key: "socials", label: "Link social media for more visibility" },
    { key: "content", label: "Upload sample lesson content" },
  ];

  const missingItems =
    completionPercentage >= 90
      ? []
      : recommendations.slice(0, Math.max(1, 6 - Math.floor(completionPercentage / 15)));

  const encouragement =
    completionPercentage >= 90
      ? "You're doing great! Your profile is ready to shine 🌟"
      : completionPercentage >= 70
      ? "Almost there! Just a few tweaks to boost your reach!"
      : "Let’s level up your profile to reach more students!";

  return (
    <div className="relative overflow-hidden border border-border rounded-xl bg-gradient-to-br from-muted/10 to-muted/20 shadow-md p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserCog className="w-6 h-6 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">
            Profile Setup Completion
          </h2>
        </div>
        <GaugeCircle className="w-8 h-8 text-muted-foreground" />
      </div>

      {/* Custom Progress Bar */}
      <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${getBarColor()}`}
          initial={{ width: 0 }}
          animate={{ width: `${completionPercentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${getStatusColor()}`}>
          {completionPercentage}% completed
        </span>
        <span className="text-muted-foreground">Keep going!</span>
      </div>

      {/* Encouragement Message */}
      <div className="flex items-start gap-3 text-sm bg-muted/30 border border-border rounded-lg p-4">
        <Sparkles className="w-5 h-5 text-primary" />
        <div className="text-foreground leading-snug font-medium">
          {encouragement}
        </div>
      </div>

      {/* Tips or Missing Recommendations */}
      {missingItems.length > 0 && (
        <div className="space-y-3 text-sm bg-muted/20 border border-dashed border-border rounded-lg p-4">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            Quick Suggestions to Boost Reach
          </div>
          <ul className="list-disc list-inside pl-1 text-muted-foreground">
            {missingItems.map((item, idx) => (
              <li key={idx} className="text-foreground">
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warning if profile is too empty */}
      {completionPercentage < 50 && (
        <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 border border-destructive rounded-lg p-3">
          <AlertTriangle className="w-4 h-4" />
          Your profile might be hidden from search results until more settings are completed.
        </div>
      )}
    </div>
  );
};

export default SettingsCompletionCard;
