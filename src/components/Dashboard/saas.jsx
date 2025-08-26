import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Trash2,
  Edit3,
  BookOpenCheck,
  Loader2,
  Search,
  User,
  Bell,
  Menu,
  BarChart3,
  Users,
  BookOpen,
  Download,
  Upload,
  ChevronDown,
  Filter,
  MoreHorizontal
} from 'lucide-react';

// UI primitives
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'saas-student-dashboard-v1';
const uid = (prefix = '') => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

const sampleState = () => ({
  groups: [
    {
      id: uid('g_'),
      name: 'Group A — Algebra 1',
      time: 'Mon & Wed 16:00 - 18:00',
      quizzes: [ { id: uid('q_'), title: 'Midterm 1', maxScore: 100 } ],
      students: [
        { id: uid('s_'), name: 'Sara Ahmed', email: 'sara@example.com', avatar: '', progress: 78, exams: [ { id: uid('e_'), title: 'Test 1', score: 78, max: 100, date: '2025-04-10' } ] },
        { id: uid('s_'), name: 'Mohamed Ali', email: 'mohamed@example.com', avatar: '', progress: 92, exams: [ { id: uid('e_'), title: 'Test 1', score: 92, max: 100, date: '2025-04-10' } ] }
      ]
    },
    { id: uid('g_'), name: 'Group B — Geometry', time: 'Tue & Thu 17:00 - 19:00', quizzes: [], students: [] }
  ],
});

export default function StudentSaaSDashboard() {
  const [state, setState] = useState(() => {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : sampleState(); } catch (e) { console.error(e); return sampleState(); }
  });

  const [activeGroupId, setActiveGroupId] = useState(() => state.groups[0]?.id || null);
  const [qGroupName, setQGroupName] = useState('');
  const [search, setSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { console.error(e); } }, [state]);

  const activeGroup = useMemo(() => state.groups.find((g) => g.id === activeGroupId) || null, [state, activeGroupId]);

  // CRUD helpers (kept simple for demo)
  function createGroup(name = 'New Group', time = 'TBD') { const newG = { id: uid('g_'), name, time, students: [], quizzes: [] }; setState((s) => ({ ...s, groups: [newG, ...s.groups] })); setActiveGroupId(newG.id); }
  function updateGroup(id, patch) { setState((s) => ({ ...s, groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) })); }
  function deleteGroup(id) { setState((s) => ({ ...s, groups: s.groups.filter((g) => g.id !== id) })); if (activeGroupId === id) setActiveGroupId(state.groups.find(g=>g.id!==id)?.id||null); }

  function addStudentToGroup(groupId, student) { setState((s) => ({ ...s, groups: s.groups.map((g) => (g.id === groupId ? { ...g, students: [...g.students, { ...student, id: uid('s_'), exams: [], progress: 0 }] } : g)), })); }
  function removeStudent(groupId, studentId) { setState((s) => ({ ...s, groups: s.groups.map((g) => (g.id === groupId ? { ...g, students: g.students.filter((st) => st.id !== studentId) } : g)), })); }
  function recordExam(groupId, studentId, exam) { setState((s) => ({ ...s, groups: s.groups.map((g) => { if (g.id !== groupId) return g; return { ...g, students: g.students.map((st) => { if (st.id !== studentId) return st; const exams = [...(st.exams || []), { ...exam, id: uid('e_') }]; const avg = Math.round((exams.reduce((a, e) => a + (e.score / e.max) * 100, 0) / exams.length) || 0); return { ...st, exams, progress: avg }; }), }; }), })); }
  function createQuiz(groupId, quiz) { setState((s) => ({ ...s, groups: s.groups.map((g) => (g.id === groupId ? { ...g, quizzes: [...g.quizzes, { ...quiz, id: uid('q_') }] } : g)), })); }

  // UI primitives
  const primaryBtn = 'px-4 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all inline-flex items-center gap-2 font-medium';
  const secondaryBtn = 'px-4 py-2.5 rounded-lg border transition-all inline-flex items-center gap-2 font-medium';

  // Header
  const Header = () => (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-primary/10 to-accent/8 backdrop-blur-md border-b border-border/50">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary p-2 text-primary-foreground font-bold">
            <BookOpenCheck className="w-5 h-5" />
          </div>
          <div className="hidden md:block">
            <div className="text-lg font-bold">Modaresy</div>
            <Label className="text-xs">Student Management</Label>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-muted-foreground" />
            <input 
              value={search} 
              onChange={(e)=>setSearch(e.target.value)} 
              placeholder="Search groups, students or quizzes..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border shadow-sm bg-background/50 backdrop-blur-sm" 
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-lg hover:bg-muted/10 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium">Tutor Name</div>
              <Label className="text-xs text-green-500">● Active now</Label>
            </div>
            <Avatar className="border-2 border-primary/20">
              <AvatarFallback className="bg-accent text-accent-foreground">TN</AvatarFallback>
            </Avatar>
          </div>
          <button 
            className="p-2.5 rounded-lg hover:bg-muted/10 transition-colors md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );

  // Hero / Banner — show-ready
  const Hero = ({ group }) => (
    <section className="max-w-[1400px] mx-auto px-6 mt-6">
      <div className="bg-gradient-to-br from-accent/6 to-primary/6 border border-border/60 rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm">
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {group ? `${group.name}` : 'Welcome, Tutor'}
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl">
            Manage your classes, track student progress, and create assessments—all in one place.
          </p>

          <div className="mt-6 flex gap-3 flex-wrap">
            <Button className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium gap-2" onClick={()=>createGroup('Show Group', 'Fri 18:00')}>
              <Plus className="w-4 h-4" /> Create demo group
            </Button>
            <Button variant="outline" className="px-5 py-2.5 rounded-lg font-medium gap-2" onClick={()=>setState(sampleState())}>
              <Upload className="w-4 h-4" /> Load sample data
            </Button>
            <Button variant="outline" className="px-5 py-2.5 rounded-lg font-medium gap-2" onClick={()=>{ const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const href=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=href; a.download='saas-dashboard-export.json'; a.click(); }}>
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
          <div className="p-4 rounded-xl border bg-card text-center shadow-sm">
            <div className="flex justify-center"><Users className="w-5 h-5 text-muted-foreground mb-2" /></div>
            <div className="text-2xl font-bold">{state.groups.length}</div>
            <Label className="text-xs mt-1">Active classes</Label>
          </div>
          <div className="p-4 rounded-xl border bg-card text-center shadow-sm">
            <div className="flex justify-center"><User className="w-5 h-5 text-muted-foreground mb-2" /></div>
            <div className="text-2xl font-bold">{state.groups.reduce((a,g)=>a+g.students.length,0)}</div>
            <Label className="text-xs mt-1">Enrolled</Label>
          </div>
          <div className="p-4 rounded-xl border bg-card text-center shadow-sm">
            <div className="flex justify-center"><BookOpen className="w-5 h-5 text-muted-foreground mb-2" /></div>
            <div className="text-2xl font-bold">{state.groups.reduce((a,g)=>a+g.quizzes.length,0)}</div>
            <Label className="text-xs mt-1">Assessments</Label>
          </div>
        </div>
      </div>
    </section>
  );

  // Re-usable UI components
  const GroupList = ({ groups = [] }) => (
    <div className="p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-lg font-semibold">My Groups</div>
          <Label className="text-xs text-muted-foreground">Switch between your classes</Label>
        </div>
        <div className="hidden sm:flex gap-2">
          <button className={`${secondaryBtn} text-sm`} onClick={()=>createGroup()}><Plus className="w-4 h-4"/> New</button>
        </div>
      </div>

      <div className="space-y-3 max-h-[58vh] overflow-auto pr-2">
        {groups.map((g) => (
          <motion.div 
            layout 
            key={g.id} 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${g.id===activeGroupId ? 'ring-2 ring-primary/20 bg-primary/5' : 'hover:bg-muted/10'}`} 
            onClick={()=>setActiveGroupId(g.id)}
          >
            <div className="min-w-0">
              <div className="font-semibold truncate flex items-center gap-2">
                {g.name}
                {g.id===activeGroupId && <div className="w-2 h-2 bg-primary rounded-full"></div>}
              </div>
              <div className="text-xs text-muted-foreground truncate mt-1">{g.time}</div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3 h-3" />
                  <span>{g.students.length} students</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BookOpen className="w-3 h-3" />
                  <span>{g.quizzes.length} quizzes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <button 
                className="p-1.5 rounded-md hover:bg-muted/20 transition-colors" 
                onClick={(e)=>{e.stopPropagation(); const name=prompt('Edit group name',g.name); if(name) updateGroup(g.id,{name});}} 
                title="Edit"
              >
                <Edit3 className="w-3.5 h-3.5"/>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <Label className="text-sm font-medium mb-2 block">Quick Create</Label>
        <input 
          placeholder="Group name..." 
          value={qGroupName} 
          onChange={(e)=>setQGroupName(e.target.value)} 
          className="w-full px-4 py-2.5 rounded-lg border mb-2" 
        />
        <div className="flex gap-2">
          <button 
            className={`${primaryBtn} bg-primary text-primary-foreground text-sm flex-1 justify-center`} 
            onClick={()=>{ if(!qGroupName) return alert('Put a name'); createGroup(qGroupName,'Custom'); setQGroupName(''); }}
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );

  const StudentRow = ({ student, onRecord, onRemove }) => (
    <div className="flex items-center gap-4 p-4 border rounded-xl bg-card hover:bg-muted/5 transition-colors">
      <div className="relative">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-sm font-semibold">
          {student.name.split(' ').map(n=>n[0]).slice(0,2).join('')}
        </div>
        <div 
          className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-background flex items-center justify-center text-xs ${
            student.progress >= 80 ? 'bg-green-100 text-green-800' : 
            student.progress >= 60 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}
        >
          {student.progress}%
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{student.name}</div>
        <div className="text-xs text-muted-foreground truncate">{student.email}</div>
        <div className="mt-1 w-full bg-muted rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              student.progress >= 80 ? 'bg-green-500' : 
              student.progress >= 60 ? 'bg-yellow-500' : 
              'bg-red-500'
            }`} 
            style={{ width: `${student.progress}%` }}
          ></div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          className="p-2 rounded-lg border hover:bg-muted/20 transition-colors" 
          onClick={()=>{ const score=Number(prompt('Score (number)')); const max=Number(prompt('Max score','100'))||100; const title=prompt('Exam title','Quiz'); if(!Number.isFinite(score)||Number.isNaN(score)) return alert('Invalid score'); onRecord({title:title||'Exam', score, max, date: new Date().toISOString().slice(0,10)}); }}
          title="Record Exam"
        >
          <BarChart3 className="w-4 h-4" />
        </button>
        <button 
          className="p-2 rounded-lg border hover:bg-destructive/10 text-destructive transition-colors" 
          onClick={()=>onRemove(student.id)}
          title="Remove Student"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  const GroupDetail = ({ group }) => {
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    if(!group) return (
      <div className="p-8 text-center flex flex-col items-center justify-center h-full">
        <BookOpenCheck className="mx-auto h-16 w-16 mb-4 text-primary/40" />
        <div className="font-semibold text-lg">No group selected</div>
        <Label className="text-muted-foreground mt-1">Select or create a group from the left panel.</Label>
      </div>
    );

    return (
      <div className="p-5 space-y-6">
        <div className="flex items-center gap-4 justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold truncate">{group.name}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {group.time}
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Users className="w-4 h-4" /> {group.students.length} students
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> {group.quizzes.length} quizzes
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              className={`${secondaryBtn} text-sm`} 
              onClick={()=>{ const t=prompt('Group times (edit)', group.time); if(t) updateGroup(group.id,{time:t}); }}
            >
              <Edit3 className="w-4 h-4" /> Edit Time
            </button>
            <button 
              className={`${primaryBtn} bg-accent text-accent-foreground text-sm`} 
              onClick={()=>{ const title=prompt('Quiz title'); const max=Number(prompt('Max score','100'))||100; if(!title) return; createQuiz(group.id,{title,maxScore:max}); }}
            >
              <Plus className="w-4 h-4" /> New Quiz
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center gap-2 bg-muted/20 p-2 rounded-lg">
              <Search className="w-5 h-5 text-muted-foreground ml-2" />
              <input 
                className="flex-1 bg-transparent px-2 py-2 outline-none" 
                placeholder="Search students..." 
                value={search} 
                onChange={(e)=>setSearch(e.target.value)} 
              />
              <button className="p-2 rounded-md hover:bg-muted/30 transition-colors">
                <Filter className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 max-h-[55vh] overflow-auto pr-2">
              {group.students.filter(st => st.name.toLowerCase().includes(search.toLowerCase()) || (st.email||'').toLowerCase().includes(search.toLowerCase())).map((st) => (
                <StudentRow key={st.id} student={st} onRecord={(exam)=>recordExam(group.id, st.id, exam)} onRemove={(sid)=>removeStudent(group.id, sid)} />
              ))}

              {group.students.length===0 && (
                <div className="text-center p-6 border rounded-xl bg-muted/10">
                  <Users className="w-10 h-10 mx-auto text-muted-foreground/50 mb-3" />
                  <div className="text-muted-foreground">No students yet</div>
                  <Label className="text-xs text-muted-foreground">Add students using the form below</Label>
                </div>
              )}
            </div>

            <div className="pt-2 bg-muted/10 p-4 rounded-xl">
              <h4 className="font-medium text-sm mb-3">Add New Student</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input 
                  placeholder="Student name" 
                  value={newStudentName} 
                  onChange={(e)=>setNewStudentName(e.target.value)} 
                  className="px-4 py-2.5 rounded-lg border bg-background" 
                />
                <input 
                  placeholder="Student email" 
                  value={newStudentEmail} 
                  onChange={(e)=>setNewStudentEmail(e.target.value)} 
                  className="px-4 py-2.5 rounded-lg border bg-background" 
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button 
                  className={`${primaryBtn} bg-primary text-primary-foreground text-sm flex-1 justify-center`} 
                  onClick={()=>{ if(!newStudentName) return alert('Name required'); addStudentToGroup(group.id,{name:newStudentName,email:newStudentEmail}); setNewStudentName(''); setNewStudentEmail(''); }}
                >
                  <Plus className="w-4 h-4" /> Add Student
                </button>
                <button 
                  className={`${secondaryBtn} text-sm`} 
                  onClick={()=>{ const csv=prompt('Comma separated names/emails (name:email,name2:email2)'); if(!csv) return; const pairs=csv.split(',').map(p=>p.trim()).filter(Boolean); pairs.forEach(p=>{ const [name,email]=p.split(':').map(x=>x&&x.trim()); if(name) addStudentToGroup(group.id,{name,email:email||''}); }); }}
                >
                  <Upload className="w-4 h-4" /> Bulk Add
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl p-5 shadow-sm">
              <h4 className="font-semibold text-lg mb-4">Class Performance</h4>
              <div className="mt-3 grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl bg-card text-center">
                  <BarChart3 className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <div className="text-xl font-bold">{Math.round((group.students.reduce((a,s)=>a+s.progress,0) || 0) / Math.max(1, group.students.length))}%</div>
                  <Label className="text-xs mt-2">Avg Progress</Label>
                </div>
                <div className="p-4 border rounded-xl bg-card text-center">
                  <BookOpen className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <div className="text-xl font-bold">{group.quizzes.length}</div>
                  <Label className="text-xs mt-2">Active Quizzes</Label>
                </div>
                <div className="p-4 border rounded-xl bg-card text-center">
                  <Users className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <div className="text-xl font-bold">{group.students.length}</div>
                  <Label className="text-xs mt-2">Enrolled</Label>
                </div>
                <div className="p-4 border rounded-xl bg-card text-center">
                  <Star className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                  <div className="text-xl font-bold truncate">{(group.students.slice().sort((a,b)=>b.progress-a.progress)[0]?.name)||'—'}</div>
                  <Label className="text-xs mt-2">Top Student</Label>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-muted/10 to-muted/30 border border-border/50 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-lg">Quizzes & Assessments</h4>
                <button className="p-1.5 rounded-md hover:bg-muted/20 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-2 space-y-3 max-h-[28vh] overflow-auto pr-2">
                {group.quizzes.map(q=> (
                  <div key={q.id} className="flex items-center justify-between p-3 border rounded-lg bg-card hover:bg-muted/5 transition-colors">
                    <div>
                      <div className="font-medium">{q.title}</div>
                      <Label className="text-xs">Max score: {q.maxScore}</Label>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        className="p-1.5 rounded-md border hover:bg-muted/20 transition-colors" 
                        onClick={()=>{ const title=prompt('Edit quiz title', q.title); const max=Number(prompt('Max score', String(q.maxScore)))||q.maxScore; if(!title) return; updateGroup(group.id, { quizzes: group.quizzes.map(qq=>qq.id===q.id?{...qq,title,maxScore:max}:qq) }); }}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        className="p-1.5 rounded-md border hover:bg-destructive/10 text-destructive transition-colors" 
                        onClick={()=>{ if(!confirm('Delete quiz?')) return; updateGroup(group.id, { quizzes: group.quizzes.filter(qq=>qq.id!==q.id) }); }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {group.quizzes.length===0 && (
                  <div className="text-center p-4 border rounded-lg bg-muted/10">
                    <BookOpen className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                    <div className="text-muted-foreground text-sm">No quizzes yet</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Icons that were used but not imported
  const Clock = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
  const Star = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;

  return (
    <div className="w-full min-h-screen bg-background text-foreground">
      <Header />
      <Hero group={activeGroup} />

      <main className="w-full mx-auto px-6 mt-6">
        <div className="flex gap-6">
          <aside className="bg-card p-1 rounded-xl border lg:sticky lg:top-[88px] lg:self-start max-h-[calc(100vh-120px)] overflow-auto shadow-sm">
            <GroupList groups={state.groups} />
          </aside>

          <section className="bg-card rounded-xl border shadow-sm">
            <GroupDetail group={activeGroup} />
          </section>
        </div>
      </main>

      <footer className="max-w-[1400px] mx-auto px-6 py-8 text-center text-sm text-muted-foreground mt-8">
        Built with ❤ for your demo • © {new Date().getFullYear()}
      </footer>
    </div>
  );
}