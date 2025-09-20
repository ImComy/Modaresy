import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Plus, Trash, Edit, Info, BookOpen, Award, MapPin } from "lucide-react";

export default function AddSubjectCardUI({
  subjects = [],
  systems = ["National", "IGCSE", "American"],
  gradesBySystem = {},
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {}
}) {
  // local visual state only (helps preview while staying purely presentational)
  const [ui, setUi] = useState({
    system: systems[0] || "",
    grades: [],
    subjectName: "",
    sectors: [],
    languages: []
  });

  const availableGrades = useMemo(() => gradesBySystem[ui.system] || ["1", "2", "3", "4"], [ui.system]);

  const toggleIn = (key, value) => {
    setUi(prev => {
      const next = { ...prev };
      const set = new Set(Array.isArray(prev[key]) ? prev[key] : []);
      if (set.has(value)) set.delete(value); else set.add(value);
      next[key] = Array.from(set);
      return next;
    });
  };

  const pillClass = (active) =>
    `text-xs px-3 py-1 rounded-full border transition inline-flex items-center gap-2 ${active ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))] shadow-sm" : "bg-[transparent] border-[hsl(var(--border))] text-[hsl(var(--card-foreground))] hover:border-[hsl(var(--primary))]/60"}`;

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Form card */}
        <div className="md:col-span-1 rounded-2xl p-5 shadow-lg border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(90deg, hsla(var(--primary) / 0.08), hsla(var(--secondary) / 0.06))' }}>
              <GraduationCap size={20} className="text-[hsl(var(--primary))]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[hsl(var(--card-foreground))]">Add new subject</div>
            </div>
          </div>

          {/* System */}
          <div className="space-y-2 mb-3">
            <label className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))] flex items-center gap-1"><BookOpen size={12}/> Education system</label>
            <div className="flex gap-2 flex-wrap">
              {systems.map(s => (
                <button key={s} type="button" onClick={() => setUi(prev => ({ ...prev, system: s }))} className={pillClass(ui.system === s)}>
                  <span className="text-[12px]">{s}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grades */}
          <div className="space-y-2 mb-3">
            <label className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))] flex items-center gap-1"><Award size={12}/> Grades</label>
            <div className="flex gap-2 flex-wrap">
              {availableGrades.map(g => (
                <button key={g} type="button" onClick={() => toggleIn('grades', g)} className={pillClass(ui.grades.includes(g))}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Subject Name */}
          <div className="space-y-2 mb-3">
            <label className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))] flex items-center gap-1"><GraduationCap size={12}/> Subject</label>
            <input placeholder="e.g. Mathematics" value={ui.subjectName} onChange={(e) => setUi(prev => ({ ...prev, subjectName: e.target.value }))} className="w-full rounded-lg h-10 px-3 border bg-[hsl(var(--input))]" style={{ borderColor: 'hsl(var(--border))' }}/>
          </div>

          {/* Sectors */}
          <div className="space-y-2 mb-3">
            <label className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))] flex items-center gap-1"><MapPin size={12}/> Sectors</label>
            <div className="flex gap-2 flex-wrap">
              {["General","Scientific","Literary","Vocational"].map(s => (
                <button key={s} type="button" onClick={() => toggleIn('sectors', s)} className={pillClass(ui.sectors.includes(s))}>{s}</button>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="space-y-2 mb-4">
            <label className="text-[10px] uppercase tracking-wide text-[hsl(var(--muted-foreground))] flex items-center gap-1"><BookOpen size={12}/> Languages</label>
            <div className="flex gap-2 flex-wrap">
              {["Arabic","English","French"].map(l => (
                <button key={l} type="button" onClick={() => toggleIn('languages', l)} className={pillClass(ui.languages.includes(l))}>{l}</button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={() => onAdd(ui)} className="flex-1 h-10 rounded-lg font-semibold shadow-sm flex items-center justify-center gap-2" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
              <Plus /> Add
            </button>
            <button onClick={() => setUi({ system: systems[0] || '', grades: [], subjectName: '', sectors: [], languages: [] })} className="w-12 h-10 rounded-lg border" style={{ borderColor: 'hsl(var(--border))', background: 'transparent' }}>Reset</button>
          </div>

          <div className="mt-4 text-[12px] text-[hsl(var(--muted-foreground))]">Tip: This is a visual/hollow UI. Hook up <span className="font-medium">onAdd</span>/<span className="font-medium">onEdit</span>/<span className="font-medium">onDelete</span> to make it live.</div>
        </div>

        {/* Right: Preview list - spans 2 columns on md */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md" style={{ background: 'linear-gradient(90deg, hsla(var(--primary)/0.06), hsla(var(--accent)/0.06))' }}>
                <GraduationCap size={18} className="text-[hsl(var(--primary))]" />
              </div>
              <div>
                <div className="text-lg font-semibold text-[hsl(var(--card-foreground))]">Your subjects</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">A creative, airy preview with quick actions</div>
              </div>
            </div>
            <div className="text-xs text-[hsl(var(--muted-foreground))]">{subjects.length} subjects</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* If no subjects, show empty state */}
            {subjects.length === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full rounded-2xl p-8 border-dashed border-2 flex items-center justify-center" style={{ borderColor: 'hsl(var(--border))', background: 'linear-gradient(180deg, hsla(var(--muted)/0.05), transparent)' }}>
                <div className="text-center text-[hsl(var(--muted-foreground))]"><div className="mb-2">No subjects yet</div><div className="text-xs">Use the composer on the left to add a subject (UI-only demo)</div></div>
              </motion.div>
            )}

            {subjects.map((s, i) => (
              <motion.div whileHover={{ y: -6 }} key={s._id || `${s.name}-${i}`} className="rounded-2xl p-4 shadow-sm border flex flex-col justify-between" style={{ background: 'linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)', borderColor: 'hsl(var(--border))' }}>
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)' }}>
                        <GraduationCap className="text-white" />
                      </div>
                      <div>
                        <div className="font-semibold text-[hsl(var(--card-foreground))]">{s.name}</div>
                        <div className="text-[11px] text-[hsl(var(--muted-foreground))]">{s.grade} • {s.education_system}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onEdit(s)} className="h-9 w-9 rounded-md border flex items-center justify-center" style={{ borderColor: 'hsl(var(--border))' }}><Edit size={14} /></button>
                      <button onClick={() => onDelete(s)} className="h-9 w-9 rounded-md border flex items-center justify-center text-[hsl(var(--destructive))]" style={{ borderColor: 'hsl(var(--border))' }}><Trash size={14} /></button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(s.sector) ? s.sector : [s.sector || '—']).map((sec, idx) => (
                      <div key={idx} className="text-[11px] px-2 py-1 rounded-md border" style={{ borderColor: 'hsl(var(--border))' }}>{sec}</div>
                    ))}
                    {(Array.isArray(s.language) ? s.language : [s.language || '—']).map((lang, idx) => (
                      <div key={"l"+idx} className="text-[11px] px-2 py-1 rounded-md border" style={{ borderColor: 'hsl(var(--border))' }}>{lang}</div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
