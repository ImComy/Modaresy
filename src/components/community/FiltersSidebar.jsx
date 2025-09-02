// src/components/FiltersSidebar.jsx
import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { RawButton } from "@/components/ui/RawButton";
import { TagPill } from "@/components/ui/TagPill";
import { EDUCATION_COMBOS, SUBJECTS, GRADES } from "@/data/mockCommunity";

export function FiltersSidebar({ query, setQuery, authorRole, setAuthorRole, selectedTags, toggleTag, educationCombo, setEducationCombo, addFilterTag, subject, setSubject, grade, setGrade, setSelectedTags }) {
  return (
    <motion.div className="lg:sticky lg:top-20 space-y-4" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
      <Card className="p-5 rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={18} />
          <h3 className="font-semibold">Filters</h3>
        </div>

        <div className="flex items-center gap-2 mb-4 relative">
          <Search size={18} className="absolute left-3 text-muted-foreground/70 z-10" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts, tags, authors..." className="pl-10 pr-4 rounded-full" />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Author Type</h3>
          </div>
          <div className="flex gap-2 flex-wrap">
            <RawButton size="sm" variant={authorRole === "all" ? "solid" : "outline"} onClick={() => setAuthorRole("all")} className="rounded-full text-xs">
              All
            </RawButton>
            <RawButton size="sm" variant={authorRole === "tutor" ? "solid" : "outline"} onClick={() => setAuthorRole("tutor")} className="rounded-full text-xs">
              Tutors
            </RawButton>
            <RawButton size="sm" variant={authorRole === "student" ? "solid" : "outline"} onClick={() => setAuthorRole("student")} className="rounded-full text-xs">
              Students
            </RawButton>
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-sm font-semibold mb-3">Tags</h3>
          <div className="flex flex-wrap max-h-60 overflow-y-auto p-1">
            {selectedTags.map((t) => (
              <TagPill key={t} tag={t} onClick={() => toggleTag(t)} selected={true} closable={true} onClose={() => toggleTag(t)} />
            ))}
          </div>

          {/* Dropdowns under tags so the area isn't empty and to let users add filters quickly */}
          <div className="mt-3 grid grid-cols-1 gap-2">
            <Select value={educationCombo} onValueChange={(v) => { setEducationCombo(v); addFilterTag(v.split(' - ')[0]); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Education System" />
              </SelectTrigger>
              <SelectContent>
                {EDUCATION_COMBOS.map((combo) => (
                  <SelectItem key={combo} value={combo}>
                    {combo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={subject} onValueChange={(v) => { setSubject(v); addFilterTag(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((subj) => (
                  <SelectItem key={subj} value={subj}>
                    {subj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={grade} onValueChange={(v) => { setGrade(v); addFilterTag(v); }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                {GRADES.map((grd) => (
                  <SelectItem key={grd} value={grd}>
                    {grd}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedTags.length > 0 && (
          <RawButton variant="outline" size="sm" onClick={() => setSelectedTags([])} className="w-full mt-3 rounded-full">
            Clear all filters
          </RawButton>
        )}
      </Card>

      <Card className="p-5 rounded-2xl border-0 bg-card/50 backdrop-blur-sm shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={18} />
          <h3 className="font-semibold">Community Stats</h3>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Posts</span>
            <span className="font-medium">243</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Users</span>
            <span className="font-medium">1.2K</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tutors Online</span>
            <span className="font-medium">24</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}