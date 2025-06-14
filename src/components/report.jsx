import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Flag, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const REPORT_REASONS = [
  "Inappropriate content",
  "Misleading information",
  "Offensive behavior",
  "Spam or advertisement",
  "Other",
];

const ReportButton = ({ tutorId }) => {
  const [open, setOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState(null);
  const [customReason, setCustomReason] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setOpen(false);
    setSelectedReason(null);
    setCustomReason("");
    setStatus(null);
    setSubmitting(false);
  };

  const submitReport = () => {
    const reason = selectedReason === "Other" ? customReason.trim() : selectedReason;

    if (!reason || reason.length < 3) {
      setStatus("error");
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      console.log(`Reported tutor ${tutorId}: ${reason}`);
      setStatus("success");

      setTimeout(() => {
        reset();
      }, 1500);
    }, 1200);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-red-600 hover:text-red-600 border-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
      >
        <Flag size={16} />
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 backdrop-blur-sm bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={reset}
            />

            {/* Modal */}
            <motion.div
              className="fixed top-1/2 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background shadow-xl p-6 space-y-5"
              initial={{ scale: 0.9, opacity: 0, x: "-50%", y: "-50%" }}
              animate={{ scale: 1, opacity: 1, x: "-50%", y: "-50%" }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-foreground">Report Tutor</h2>
                <button onClick={reset} disabled={submitting}>
                  <X className="text-muted-foreground" size={20} />
                </button>
              </div>

              {/* Reason Buttons */}
              <div className="space-y-2">
                {REPORT_REASONS.map((reason, idx) => (
                  <button
                    key={idx}
                    disabled={submitting}
                    onClick={() => {
                      setSelectedReason(reason);
                      setStatus(null);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg border text-sm transition-colors",
                      selectedReason === reason
                        ? "bg-destructive/10 border-destructive text-destructive dark:bg-destructive/20"
                        : "border-border text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {/* Custom Reason Textarea */}
              {selectedReason === "Other" && (
                <Textarea
                  disabled={submitting}
                  value={customReason}
                  onChange={(e) => {
                    setCustomReason(e.target.value);
                    setStatus(null);
                  }}
                  placeholder="Please describe your reason"
                  rows={3}
                  className="mt-2"
                />
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="ghost"
                  onClick={reset}
                  disabled={submitting}
                  className="text-muted-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitReport}
                  disabled={!selectedReason || submitting}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </Button>
              </div>

              {/* Feedback */}
              <AnimatePresence>
                {status && (
                  <motion.div
                    key="statusMessage"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={cn(
                      "mt-4 px-4 py-3 rounded-md text-sm flex items-center gap-2",
                      status === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                    )}
                  >
                    {status === "success" ? (
                      <>
                        <CheckCircle size={18} />
                        Report submitted successfully.
                      </>
                    ) : (
                      <>
                        <AlertCircle size={18} />
                        Please select or write a valid reason.
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ReportButton;
