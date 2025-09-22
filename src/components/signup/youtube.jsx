import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Youtube, PlusCircle, Trash2, ExternalLink, PlayCircle } from 'lucide-react';

function getYouTubeId(url) {
  if (!url) return null;
  try {
    const trimmed = url.trim();
    const safe = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    const parsed = new URL(safe);
    const host = parsed.hostname.replace('www.', '').toLowerCase();

    if (host === 'youtu.be') return parsed.pathname.slice(1) || null;
    if (host.includes('youtube.com')) {
      const v = parsed.searchParams.get('v');
      if (v) return v;
      const parts = parsed.pathname.split('/').filter(Boolean);
      if (parts.length) return parts.pop();
    }
  } catch {
    const m = url.match(/([A-Za-z0-9_-]{11})/);
    if (m) return m[0];
    return null;
  }
  return null;
}

const MOCK_VIDEOS = [
  { title: 'Intro — Algebra (demo)', url: 'https://youtu.be/dQw4w9WgXcQ' },
  { title: 'Sample lesson — Fractions', url: 'https://www.youtube.com/watch?v=3JZ_D3ELwOQ' },
  { title: 'Teaching style — Quick demo', url: 'https://youtu.be/9bZkp7q19f0' }
];

export default function TutorVideoOnboard({ initialVideos = [], onChange, className = '' }) {
  // Handle empty initialVideos and empty MOCK_VIDEOS
  const resolved = (initialVideos && initialVideos.length) 
    ? initialVideos 
    : (MOCK_VIDEOS && MOCK_VIDEOS.length) ? MOCK_VIDEOS : [];
  
  const [videos, setVideos] = useState(resolved.map(v => ({ ...v, id: getYouTubeId(v.url) })));
  const [form, setForm] = useState({ title: '', url: '' });
  const [selectedId, setSelectedId] = useState(videos[0]?.id || null);
  const [error, setError] = useState('');
  const urlRef = useRef(null);

  useEffect(() => onChange?.(videos), [videos, onChange]);

  useEffect(() => {
    if (videos.length && !selectedId) {
      setSelectedId(videos[0].id || null);
    }
  }, [videos, selectedId]);

  const addVideo = () => {
    setError('');
    const id = getYouTubeId(form.url);
    if (!form.title.trim()) { setError('Give the video a short title.'); return; }
    if (!form.url.trim()) { setError('Paste a YouTube link or ID.'); urlRef.current?.focus(); return; }
    if (!id) { setError('Invalid YouTube link/ID.'); urlRef.current?.focus(); return; }

    const next = [...videos, { title: form.title.trim(), url: form.url.trim(), id }];
    setVideos(next);
    setForm({ title: '', url: '' });
    setSelectedId(id);
  };

  const remove = (idx) => {
    const next = videos.filter((_, i) => i !== idx);
    setVideos(next);
    if (selectedId === videos[idx]?.id) {
      setSelectedId(next[0]?.id || null);
    }
  };

  const styles = {
    page: { background: 'hsl(var(--background))', color: 'hsl(var(--foreground))' },
    card: { background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))', border: '1px solid hsl(var(--border))' },
    accentBtn: { background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', color: 'hsl(var(--primary-foreground))' }
  };

  const selectedVideo = videos.find(v => v.id === selectedId) || null;

  return (
    <div className={`max-w-4xl mx-auto p-6 flex flex-col gap-6 ${className}`}>
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
      <section className='flex flex-col lg:flex-row gap-6'>
        {/* Video preview */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl overflow-hidden shadow-lg min-w-[65%]" style={{ ...styles.card }}>
            <div className="relative bg-black aspect-video">
            {selectedVideo && selectedVideo.id ? (
                <iframe
                title={selectedVideo.title}
                src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0&autoplay=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                />
            ) : (
                <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center"
                style={{ background: 'linear-gradient(135deg, hsl(var(--muted)), hsl(var(--card)))' }}>
                <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <PlayCircle className="w-10 h-10 text-white" fill="currentColor" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <Youtube className="w-3 h-3 text-white" />
                    </div>
                </div>
                <div>
                    <div className="text-lg font-semibold mb-2">
                    {videos.length === 0 ? 'Add your first teaching video' : 'Select a video to preview'}
                    </div>
                    <div className="text-sm opacity-80">
                    {videos.length === 0 
                        ? 'Showcase your teaching style with a demo video' 
                        : 'Click on any video in your playlist to preview it here'}
                    </div>
                </div>
                </div>
            )}
            {selectedVideo && selectedVideo.id && (
                <div className="absolute left-4 bottom-4 bg-black/40 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-3">
                <Youtube className="w-5 h-5" />
                <div>
                    <div className="text-sm font-semibold" style={{ color: 'hsl(var(--card-foreground))' }}>
                    {selectedVideo.title}
                    </div>
                    <div className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {selectedVideo.url}
                    </div>
                </div>
                </div>
            )}
            </div>
        </motion.div>

        {/* Add video form */}
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-4 flex flex-col gap-4" style={{ ...styles.card }}>
            <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))', color: 'hsl(var(--primary-foreground))' }}>
                <Youtube className="w-5 h-5" />
            </div>
            <div>
                <div className="text-lg font-semibold">Add a video</div>
                <div className="text-xs mt-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Title + YouTube link/ID required.
                </div>
            </div>
            </div>

            <div>
            <label className="text-xs font-medium">Title</label>
            <input
                value={form.title}
                onChange={(e) => setForm(s => ({ ...s, title: e.target.value }))}
                placeholder="Short title (e.g. Intro — Algebra)"
                className="w-full h-10 rounded-md border px-3 mt-1 mb-2 outline-none text-sm"
                style={{ background: 'hsl(var(--input))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
            />

            <label className="text-xs font-medium">YouTube link or ID</label>
            <input
                ref={urlRef}
                value={form.url}
                onChange={(e) => { setForm(s => ({ ...s, url: e.target.value })); setError(''); }}
                placeholder="https://youtu.be/… or 11-char ID"
                className="w-full h-10 rounded-md border px-3 mt-1 mb-2 outline-none text-sm"
                style={{ background: 'hsl(var(--input))', border: '1px solid hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                onKeyDown={(e) => { if (e.key === 'Enter') addVideo(); }}
            />

            {error && <div className="text-xs mb-2" style={{ color: 'hsl(var(--destructive))' }}>{error}</div>}

            <div className="flex gap-3 items-center">
                <button onClick={addVideo}
                className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium shadow"
                style={styles.accentBtn}>
                <PlusCircle className="w-4 h-4" /> Add
                </button>
            </div>
            </div>
        </motion.div>
      </section>

      {/* Playlist */}
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-4" style={{ ...styles.card }}>
        <div className="text-xs font-medium mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>Your videos</div>
        <div className="flex flex-col gap-3">
          {videos.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
              No videos added yet. Add your first video above to get started.
            </div>
          ) : (
            videos.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedId(v.id)}
                className={`w-full flex gap-3 items-start rounded-lg p-3 text-left transition-all duration-200 group border
                  ${selectedId === v.id 
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 shadow-sm' 
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
              >
                <div className="relative">
                  <img
                    src={v.id ? `https://img.youtube.com/vi/${v.id}/mqdefault.jpg` : 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="90"></svg>'}
                    alt={v.title}
                    className="w-28 h-16 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </div>
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className={`text-sm font-medium truncate ${
                    selectedId === v.id ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {v.title}
                  </div>
                  <div className={`text-xs mt-1 truncate ${
                    selectedId === v.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {v.url}
                  </div>
                  
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <a 
                      href={v.id ? `https://youtu.be/${v.id}` : '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className={`inline-flex items-center gap-1 text-xs rounded px-2 py-1 border transition-colors ${
                        selectedId === v.id 
                          ? 'border-blue-300 text-blue-700 dark:border-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30' 
                          : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-3 h-3" /> Open
                    </a>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(i);
                      }} 
                      aria-label={`Delete video ${i + 1}`}
                      className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}