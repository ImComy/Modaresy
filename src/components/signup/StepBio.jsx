import React from "react";
import { useStepData } from "@/context/StepContext";
import { User, Briefcase, MapPin } from "lucide-react";
import TutorLocationMapEdit from "@/components/profile/editing/map"

export default function StepBio() {
  const { state, setState } = useStepData();

  const handleChange = (field, value) => {
    setState((s) => ({ ...s, [field]: value }));
  };

  const fieldStyle = {
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--input))",
  };

  return (
    <div className="px-6 py-8">
        <header className="flex flex-col items-center text-center">
      <h3
        className="text-2xl font-semibold mb-2 flex items-center gap-2"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Tell students who you are
      </h3>
      <p
        className="max-w-[64ch]"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        A short intro, your teaching style, and background details help students
        choose you with confidence.
      </p>
        </header>

      <div className="space-y-5">
        {/* Bio */}
        <div>
          <label
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <User className="w-4 h-4" />
            Bio
          </label>
          <textarea
            placeholder="Write a short introduction about yourself and your teaching style"
            value={state?.bio || ""}
            onChange={(e) => handleChange("bio", e.target.value)}
            className="w-full p-3 rounded-lg resize-none h-28"
            style={fieldStyle}
            aria-label="bio"
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <Briefcase className="w-4 h-4" />
            Years of Experience
          </label>
          <input
            type="number"
            placeholder="e.g. 5"
            value={state?.yearsExp || ""}
            onChange={(e) => handleChange("yearsExp", e.target.value)}
            className="w-full p-3 rounded-lg"
            style={fieldStyle}
            aria-label="years of experience"
          />
        </div>

        {/* Address */}
        <div>
          <label
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <MapPin className="w-4 h-4" />
            Address
          </label>
          <input
            placeholder="City, Neighborhood, or Online Only"
            value={state?.address || ""}
            onChange={(e) => handleChange("address", e.target.value)}
            className="w-full p-3 rounded-lg"
            style={fieldStyle}
            aria-label="address"
          />
        </div>

        {/* Map */}
        <div>
          <label  
            className="flex items-center gap-2 text-sm font-medium mb-1"
            style={{ color: "hsl(var(--foreground))" }}
          >
            <MapPin className="w-4 h-4" />
            Location
          </label>
          <TutorLocationMapEdit isOnboarding={true} />
        </div>
      </div>
    </div>
  );
}
