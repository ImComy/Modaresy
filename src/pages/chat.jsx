import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Send, Paperclip, Plus, X, Image as ImageIcon, FileText, Trash2, File, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/**
 * ChatPage-Improved-Mobile-UI.jsx
 * - Vertical scrolling for chats list
 * - AI renamed to "EL-DA7EE7 Agent" and given special colors/styles
 * - Selected chat has a more distinct design (uses --primary as accent)
 * - Header menu uses animated framer-motion items and closes when clicking outside
 * - Conversations are displayed with most recent first (AI always pinned to top)
 */

const sampleConversations = [
  { id: 'conv-1', title: 'General Q&A', last: 'How can I improve my exam scores?', updatedAt: Date.now() - 1000 * 60 * 60 },
  { id: 'conv-2', title: 'Math Tips', last: 'Check the attached PDF for practice', updatedAt: Date.now() - 1000 * 60 * 30 },
  { id: 'conv-3', title: 'Physics', last: 'Thanks!', updatedAt: Date.now() - 1000 * 60 * 20 },
  { id: 'conv-4', title: 'Chemistry', last: 'See graph', updatedAt: Date.now() - 1000 * 60 * 10 },
  { id: 'conv-5', title: 'History', last: 'Summaries inside', updatedAt: Date.now() - 1000 * 60 * 5 },
  { id: 'conv-6', title: 'Languages', last: 'Practice file attached', updatedAt: Date.now() - 1000 * 60 * 2 },
  { id: 'conv-7', title: 'Algebra', last: 'Try these problems', updatedAt: Date.now() - 1000 * 30 },
];

const filePreviewType = (file) => {
  if (!file) return 'other';
  const t = file.type || '';
  if (t.startsWith('image/')) return 'image';
  if (t === 'application/pdf') return 'pdf';
  if (t.includes('word') || t.includes('officedocument') || file.name.endsWith('.docx') || file.name.endsWith('.doc')) return 'doc';
  return 'file';
};

const niceSize = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${Math.round(n / (1024 * 1024))} MB`;
};

const PdfIcon = ({ className = '', size = 28 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#F44336" />
    <path d="M7 8h6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 16h6" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DocIcon = ({ className = '', size = 28 }) => (
  <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="3" width="20" height="18" rx="2" fill="#1976D2" />
    <path d="M7 8h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 12h10" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const GenericFileIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke="#6b7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Special AI badge and improved name
const AINAME = 'EL-DA7EE7 Agent';

const AiBadge = () => (
  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--primary)))', color: 'hsl(var(--primary-foreground))' }}>
    AI
  </div>
);

// Conversation item — special selected style and special AI visuals
const ConversationItem = ({ conv, active, onClick, isAi }) => {
  const base = `w-full text-left p-3 rounded-lg flex items-start gap-3 transition-all duration-200 ease-in-out ${active ? 'shadow-md' : 'hover:bg-[hsl(var(--input))]'}`;
  return (
    <button
      onClick={onClick}
      className={base}
      style={{
        background: active ? 'linear-gradient(90deg, hsl(var(--primary)) 4%, rgba(0,0,0,0.02))' : undefined,
        color: active ? 'hsl(var(--primary-foreground))' : 'hsl(var(--card-foreground))',
        border: active ? `1px solid rgba(0,0,0,0.05)` : 'transparent',
      }}
      aria-label={`Open ${conv.title}`}
    >
      <div style={{ flexShrink: 0 }}>
        {isAi ? (
          <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary)))', color: 'hsl(var(--primary-foreground))', boxShadow: '0 6px 18px rgba(0,0,0,0.06)' }}>
            🤖
          </div>
        ) : (
          <Avatar>
            <AvatarFallback>{(conv.title || 'C').charAt(0)}</AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium text-sm truncate" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{isAi ? AINAME : conv.title}</span>
            {isAi && <AiBadge />}
          </div>
          <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))', flexShrink: 0 }}>{new Date(conv.updatedAt).toLocaleTimeString()}</div>
        </div>
        <div className="text-xs mt-1 truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {conv.last}
        </div>
      </div>

      {/* selected indicator */}
      <div style={{ width: 8, height: 8, borderRadius: 999, background: active ? 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary)))' : 'transparent', flexShrink: 0 }} />
    </button>
  );
};

const AttachmentPreview = ({ a, onRemove, onOpen }) => {
  const type = filePreviewType(a.file);
  return (
    <div className="flex items-center gap-3 border rounded-md px-3 py-2" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
      <div className="w-24 h-16 flex items-center justify-center overflow-hidden rounded-md flex-shrink-0">
        {type === 'image' ? (
          <img src={a.preview} alt={a.file.name} className="object-cover w-full h-full rounded-lg" onClick={() => onOpen(a.preview)} style={{ cursor: 'pointer', maxWidth: '100%' }} />
        ) : type === 'pdf' ? (
          <PdfIcon />
        ) : type === 'doc' ? (
          <DocIcon />
        ) : (
          <GenericFileIcon />
        )}
      </div>

      <div className="flex-1 text-sm min-w-0">
        <div className="truncate" title={a.file.name} style={{ fontWeight: 600 }}>{a.file.name}</div>
        <div className="text-[12px] mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{niceSize(a.file.size)}</div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onOpen(a.preview || '')} className="p-1 rounded hover:bg-[hsl(var(--input))]" title="Preview" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <ImageIcon size={16} />
        </button>
        <button onClick={() => onRemove(a.id)} className="p-1 rounded hover:bg-[hsl(var(--input))]" title="Remove attachment" style={{ color: 'hsl(var(--muted-foreground))' }}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

const ChatPage = () => {
  const { authState } = useAuth?.() || {};
  const meName = authState?.userData?.name || 'You';
  const meAvatar = (authState?.userData && (authState.userData.avatar || authState.userData.img)) || null;

  // AI conversation metadata — special and always displayed on top
  const pinnedAI = { id: 'ai-chat', title: AINAME, last: 'Ask me anything — I\'m always here.', updatedAt: Date.now() };

  const [conversations, setConversations] = useState(sampleConversations);
  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || 'conv-1');
  const [messagesByConv, setMessagesByConv] = useState({
    'conv-1': [
      { id: 'm1', from: 'bot', text: 'Welcome! Ask me anything about studying or Modaresy features.', time: new Date().toISOString(), attachments: [] },
      { id: 'm2', from: 'me', text: 'Hi! Can you share tips for exam preparation?', time: new Date().toISOString(), attachments: [] },
      { id: 'm3', from: 'bot', text: 'Sure — start by making a revision schedule...', time: new Date().toISOString(), attachments: [] },
    ],
    'conv-2': [
      { id: 'm4', from: 'bot', text: 'I uploaded a worksheet — check it out', time: new Date().toISOString(), attachments: [] },
    ],
    'ai-chat': [
      { id: 'ai-1', from: 'bot', text: 'Hi, I am your EL-DA7EE7 Agent. I can help summarize, search, or draft messages.', time: new Date().toISOString(), attachments: [] },
    ],
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachments, setAttachments] = useState([]); // { id, file, preview }
  const [showConversations, setShowConversations] = useState(false); // mobile slide-over open
  const [dragOver, setDragOver] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const messagesRef = useRef(null);
  const fileInputRef = useRef(null);
  const createdUrls = useRef([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const el = messagesRef.current;
    if (!el) return;
    setTimeout(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, [messagesByConv, isTyping, activeConvId]);

  useEffect(() => {
    return () => {
      createdUrls.current.forEach((u) => URL.revokeObjectURL(u));
      createdUrls.current = [];
    };
  }, []);

  // close menu when clicking outside
  useEffect(() => {
    function onDocClick(e) {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  const addFiles = (files) => {
    const arr = Array.from(files || []);
    const toAdd = arr.map((f) => {
      const id = `a-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const type = filePreviewType(f);
      const preview = type === 'image' ? URL.createObjectURL(f) : null;
      if (preview) createdUrls.current.push(preview);
      return { id, file: f, preview, type };
    });
    setAttachments((s) => [...s, ...toAdd]);
  };

  const removeAttachment = (id) => setAttachments((s) => s.filter((a) => a.id !== id));

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dt = e.dataTransfer;
    if (dt?.files?.length) {
      addFiles(dt.files);
    }
  };
  const onDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setDragOver(false); };

  const createNewConversation = async () => {
    const title = prompt('New chat name');
    if (!title) return;
    const id = `conv-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newConv = { id, title, last: '', updatedAt: Date.now() };
    setConversations((c) => sortConversations([newConv, ...c]));
    setMessagesByConv((m) => ({ ...m, [id]: [] }));
    setActiveConvId(id);
    setShowConversations(false);
  };

  // helper: ensure AI pinned first, then other conversations sorted by updatedAt desc
  const sortConversations = (list) => {
    const filtered = (list || conversations).filter((c) => c.id !== 'ai-chat');
    filtered.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    return filtered;
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text && attachments.length === 0) return;
    const id = `m-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const nowISO = new Date().toISOString();

    const atts = attachments.map((a) => ({ id: a.id, name: a.file.name, size: a.file.size, type: a.file.type, preview: a.preview }));

    const newMsg = { id, from: 'me', text, time: nowISO, attachments: atts };

    setMessagesByConv((prev) => {
      const convMsgs = prev[activeConvId] || [];
      return { ...prev, [activeConvId]: [...convMsgs, newMsg] };
    });

    // update conversations: update last & updatedAt for the active conv if it's not AI
    if (activeConvId === 'ai-chat') {
      pinnedAI.updatedAt = Date.now();
    } else {
      setConversations((prev) => {
        const next = prev.map((c) => (c.id === activeConvId ? { ...c, last: text || (atts[0] && atts[0].name) || '', updatedAt: Date.now() } : c));
        return sortConversations(next);
      });
    }

    setInput('');
    setAttachments([]);

    // demo bot reply
    setIsTyping(true);
    setTimeout(() => {
      const botId = `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const reply = {
        id: botId,
        from: 'bot',
        text: activeConvId === 'ai-chat' ? 'EL-DA7EE7 Agent: How long should the summary be? Short / Medium / Long?' : "Here's a tip: break your study sessions into short focused intervals.",
        time: new Date().toISOString(),
        attachments: [],
      };
      setMessagesByConv((prev) => {
        const convMsgs = prev[activeConvId] || [];
        return { ...prev, [activeConvId]: [...convMsgs, reply] };
      });

      if (activeConvId !== 'ai-chat') {
        setConversations((prev) => prev.map((c) => (c.id === activeConvId ? { ...c, last: reply.text, updatedAt: Date.now() } : c)).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)));
      }

      setIsTyping(false);
    }, 900);
  };

  const onAttachClick = () => fileInputRef.current?.click();

  // helper: open lightbox and reset zoom
  const openLightbox = (src) => { setLightboxZoom(1); setLightboxSrc(src); };

  // header menu actions
  const handleMenuAction = (action) => {
    setMenuOpen(false);
    if (action === 'block') alert('Blocked conversation (demo)');
    if (action === 'mute') alert('Muted conversation (demo)');
    if (action === 'rename') {
      const newName = prompt('Rename conversation', conversations.find((c) => c.id === activeConvId)?.title || '');
      if (newName) setConversations((prev) => prev.map((c) => (c.id === activeConvId ? { ...c, title: newName, updatedAt: Date.now() } : c)));
    }
    if (action === 'delete') {
      if (!confirm('Delete this conversation?')) return;
      setConversations((prev) => prev.filter((c) => c.id !== activeConvId));
      setMessagesByConv((prev) => { const p = { ...prev }; delete p[activeConvId]; return p; });
      setActiveConvId(conversations[0]?.id || 'conv-1');
    }
  };

  // compute conversations sorted (AI pinned first)
  const sorted = sortConversations(conversations);

  return (
    <div className="max-w-7xl mx-auto py-6 px-3 sm:px-6" style={{ overflowX: 'hidden' }}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Conversations panel (desktop left) */}
        <div className="hidden md:block md:col-span-1">
          <div className="bg-[hsl(var(--card))] border rounded-2xl p-3" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">Chats</div>
              <button onClick={createNewConversation} className="px-2 py-1 rounded text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <Plus size={14} /> New
              </button>
            </div>

            {/* vertical scrolling list — AI pinned on top, rest sorted by recent */}
            <div className="space-y-2 overflow-auto" style={{ maxHeight: '70vh' }}>
              <ConversationItem conv={pinnedAI} active={pinnedAI.id === activeConvId} onClick={() => setActiveConvId(pinnedAI.id)} isAi />
              {sorted.map((c) => (
                <ConversationItem key={c.id} conv={c} active={c.id === activeConvId} onClick={() => setActiveConvId(c.id)} />
              ))}
            </div>
          </div>
        </div>

        {/* Mobile slide-over conversations (fixed) */}
        <AnimatePresence>
          {showConversations && (
            <motion.div className="fixed inset-0 z-50 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ backdropFilter: 'blur(6px)' }}>
              {/* backdrop goes first so it doesn't block the panel clicks */}
              <div className="absolute inset-0" onClick={() => setShowConversations(false)} />

              <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="absolute left-0 top-0 bottom-0 w-4/5 bg-[hsl(var(--card))] border-r p-4" style={{ borderColor: 'hsl(var(--border))', overflowX: 'hidden', zIndex: 10 }}>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-sm">Chats</div>
                  <div className="flex items-center gap-2">
                    <button onClick={createNewConversation} className="px-2 py-1 rounded text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      <Plus size={14} /> New
                    </button>
                    <button onClick={() => setShowConversations(false)} className="p-2 rounded-md">
                      <X />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 overflow-auto" style={{ maxHeight: '80vh', overflowX: 'hidden' }}>
                  <ConversationItem conv={pinnedAI} active={pinnedAI.id === activeConvId} onClick={() => { setActiveConvId(pinnedAI.id); setShowConversations(false); }} isAi />
                  {sorted.map((c) => (
                    <ConversationItem key={c.id} conv={c} active={c.id === activeConvId} onClick={() => { setActiveConvId(c.id); setShowConversations(false); }} />
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat area (main) */}
        <main className="md:col-span-3 flex flex-col bg-[hsl(var(--card))] border rounded-2xl overflow-hidden" style={{ borderColor: 'hsl(var(--border))' }}>
          {/* Header */}
          <div className="flex items-center gap-3 p-3 border-b relative" style={{ borderColor: 'hsl(var(--border))' }}>
            <div className="md:hidden">
              <button onClick={() => setShowConversations(true)} className="px-2 py-2 rounded-md mr-2" title="Open chats">
                <Plus />
              </button>
            </div>

            {/* avatar */}
            <Avatar>
              {meAvatar ? <AvatarImage src={meAvatar} alt={meName} /> : <AvatarFallback>{(meName || 'U').charAt(0)}</AvatarFallback>}
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{(activeConvId === pinnedAI.id ? AINAME : (conversations.find((c) => c.id === activeConvId)?.title || 'Conversation'))}</div>
              <div className="text-xs truncate" style={{ color: 'hsl(var(--muted-foreground))' }}>{activeConvId === pinnedAI.id ? 'EL-DA7EE7 Agent • ready to help' : 'Assistant • last active just now'}</div>
            </div>

            {/* menu (vertical 3 dots) replacing the second attach button */}
            <div className="relative" ref={menuRef}>
              <button onClick={() => setMenuOpen((s) => !s)} className="p-2 rounded-md" title="Conversation menu" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <MoreVertical />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }} className="absolute right-0 mt-2 w-44 bg-[hsl(var(--card))] border rounded shadow p-2" style={{ borderColor: 'hsl(var(--border))', zIndex: 30 }}>
                    {['block', 'mute', 'rename', 'delete'].map((act, idx) => (
                      <motion.button
                        key={act}
                        onClick={() => handleMenuAction(act)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.03 } }}
                        className={`w-full text-left px-3 py-2 rounded hover:bg-[hsl(var(--input))] ${act === 'delete' ? 'text-[hsl(var(--destructive-foreground))]' : ''}`}
                      >
                        {act.charAt(0).toUpperCase() + act.slice(1)}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* keep the composer attach (paperclip) only inside composer — removed from header */}
          </div>

          {/* Messages area */}
          <div
            ref={messagesRef}
            className="flex-1 overflow-auto p-4"
            style={{
              minHeight: 240,
              maxHeight: '60vh',
              background: 'linear-gradient(180deg, hsl(var(--background)) 0%, transparent 30%)',
              overflowX: 'hidden',
              wordBreak: 'break-word',
            }}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
          >
            <AnimatePresence initial={false}>
              {(messagesByConv[activeConvId] || []).map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }}>
                  <div className={`flex gap-3 ${m.from === 'me' ? 'justify-end' : 'justify-start'} mb-3`}>
                    {m.from === 'me' ? (
                      <div className="max-w-[85%] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-2xl rounded-br-sm shadow-sm" style={{ wordBreak: 'break-word' }}>
                        <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                        {m.attachments && m.attachments.length > 0 && (
                          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {m.attachments.map((a) => (
                              <div key={a.id} className="flex items-center gap-2 bg-white/6 p-2 rounded">
                                {a.preview ? (
                                  <img onClick={() => openLightbox(a.preview)} src={a.preview} alt={a.name} className="w-36 h-24 object-cover rounded" style={{ maxWidth: '100%' }} />
                                ) : a.type === 'application/pdf' || a.name?.toLowerCase?.().endsWith('.pdf') ? (
                                  <PdfIcon />
                                ) : a.name?.toLowerCase?.().endsWith('.docx') || a.name?.toLowerCase?.().endsWith('.doc') ? (
                                  <DocIcon />
                                ) : (
                                  <FileText />
                                )}
                                <div className="text-xs truncate" title={a.name} style={{ maxWidth: 120 }}>{a.name}</div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-xs mt-1 text-opacity-80" style={{ color: 'hsl(var(--primary-foreground))' }}>{new Date(m.time).toLocaleTimeString()}</div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        {/* AI messages get a special style if this is the AI conversation */}
                        <div>
                          {activeConvId === 'ai-chat' ? (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(180deg, hsl(var(--primary)), hsl(var(--primary)))', color: 'hsl(var(--primary-foreground))' }}>🤖</div>
                          ) : (
                            <Avatar><AvatarFallback>A</AvatarFallback></Avatar>
                          )}
                        </div>

                        <div className={`max-w-[85%] px-4 py-2 rounded-2xl ${activeConvId === 'ai-chat' ? 'border' : 'bg-[hsl(var(--card))] border'}`} style={{ borderColor: activeConvId === 'ai-chat' ? 'rgba(124,58,237,0.12)' : 'hsl(var(--border))', color: 'hsl(var(--card-foreground))', wordBreak: 'break-word', boxShadow: activeConvId === 'ai-chat' ? '0 8px 30px rgba(99,102,241,0.06)' : undefined }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                          {m.attachments && m.attachments.length > 0 && (
                            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {m.attachments.map((a) => (
                                <div key={a.id} className="flex items-center gap-2 bg-white/2 p-2 rounded">
                                  {a.preview ? (
                                    <img onClick={() => openLightbox(a.preview)} src={a.preview} alt={a.name} className="w-36 h-24 object-cover rounded" style={{ maxWidth: '100%' }} />
                                  ) : a.type === 'application/pdf' || a.name?.toLowerCase?.().endsWith('.pdf') ? (
                                    <PdfIcon />
                                  ) : a.name?.toLowerCase?.().endsWith('.docx') || a.name?.toLowerCase?.().endsWith('.doc') ? (
                                    <DocIcon />
                                  ) : (
                                    <FileText />
                                  )}
                                  <div className="text-xs truncate" title={a.name} style={{ maxWidth: 120 }}>{a.name}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>{new Date(m.time).toLocaleTimeString()}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'hsl(var(--muted-foreground))', color: 'white' }}>·</div>
                  <div className="px-4 py-2 rounded-2xl bg-[hsl(var(--card))]" style={{ border: '1px solid hsl(var(--border))' }}>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'hsl(var(--muted-foreground))' }} />
                      <div className="w-2 h-2 rounded-full animate-pulse delay-150" style={{ background: 'hsl(var(--muted-foreground))' }} />
                      <div className="w-2 h-2 rounded-full animate-pulse delay-300" style={{ background: 'hsl(var(--muted-foreground))' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Composer + attachments area (fixed at bottom) */}
          <div className="p-3 border-t bg-[hsl(var(--card))]" style={{ borderColor: 'hsl(var(--border))' }}>
            {/* attachments previews */}
            {attachments.length > 0 && (
              <div className="mb-2 space-y-2">
                {attachments.map((a) => <AttachmentPreview key={a.id} a={a} onRemove={removeAttachment} onOpen={(src) => openLightbox(src)} />)}
              </div>
            )}

            <div
              className={`flex items-center gap-2 rounded-full px-3 py-2 ${dragOver ? 'ring-2 ring-offset-2' : ''}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              style={{ border: '1px solid hsl(var(--border))', background: 'hsl(var(--input))', borderRadius: 9999 }}
            >
              <input ref={fileInputRef} type="file" className="hidden" multiple onChange={(e) => addFiles(e.target.files)} />
              <button onClick={onAttachClick} className="p-2 rounded-full hover:bg-[hsl(var(--input))]" title="Attach" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <Paperclip />
              </button>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={1}
                placeholder="Send a message..."
                className="flex-1 resize-none rounded-full px-4 py-2"
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'hsl(var(--card-foreground))',
                  outline: 'none',
                  wordBreak: 'break-word',
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />

              <button onClick={sendMessage} className="px-3 py-2 rounded-full flex items-center gap-2" style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                <Send />
                <span className="hidden sm:inline text-sm">Send</span>
              </button>
            </div>

            <div className="text-xs mt-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
              Tip: drag & drop files here or click the paperclip to choose. Tap images to open a zoomable preview.
            </div>
          </div>
        </main>
      </div>

      {/* lightweight lightbox for image preview with zoom controls */}
      <AnimatePresence>
        {lightboxSrc && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightboxSrc(null)}>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <motion.img src={lightboxSrc} alt="preview" initial={{ y: 20, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: lightboxZoom }} exit={{ y: 20, opacity: 0 }} style={{ maxHeight: '85vh', maxWidth: '90vw', borderRadius: 10, touchAction: 'none' }} />

              <div className="absolute top-2 right-2 flex gap-2">
                <button onClick={() => setLightboxZoom((z) => Math.min(3, +(z + 0.25).toFixed(2)))} className="px-2 py-1 bg-white/10 rounded text-white">＋</button>
                <button onClick={() => setLightboxZoom((z) => Math.max(0.5, +(z - 0.25).toFixed(2)))} className="px-2 py-1 bg-white/10 rounded text-white">−</button>
                <button onClick={() => { setLightboxZoom(1); setLightboxSrc(null); }} className="px-2 py-1 bg-white/10 rounded text-white">Close</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;