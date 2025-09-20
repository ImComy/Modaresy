import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useStepData } from "@/context/StepContext";
import {
  Youtube,
  Instagram,
  Twitter,
  Linkedin,
  Facebook,
  Github,
  Globe,
  Link as LinkIcon,
  Trash,
  ArrowUp,
  ArrowDown,
  Edit,
  Check,
  X as XIcon,
} from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

const PLATFORM_OPTIONS = [
  { key: "youtube", label: "YouTube", icon: Youtube },
  { key: "instagram", label: "Instagram", icon: Instagram },
  { key: "twitter", label: "Twitter", icon: Twitter },
  { key: "linkedin", label: "LinkedIn", icon: Linkedin },
  { key: "facebook", label: "Facebook", icon: Facebook },
  { key: "github", label: "GitHub", icon: Github },
  { key: "website", label: "Website", icon: Globe },
  { key: "other", label: "Other", icon: LinkIcon },
];

function platformBadgeStyles(platformKey) {
  switch (platformKey) {
    case "youtube":
      return "bg-[linear-gradient(90deg,rgba(255,0,0,0.12),rgba(255,0,0,0.06))] text-[hsl(var(--foreground))]";
    case "instagram":
      return "bg-[linear-gradient(90deg,rgba(131,58,180,0.08),rgba(253,29,29,0.04))]";
    case "twitter":
      return "bg-[linear-gradient(90deg,rgba(29,161,242,0.08),rgba(29,161,242,0.04))]";
    case "linkedin":
      return "bg-[linear-gradient(90deg,rgba(10,102,194,0.08),rgba(10,102,194,0.04))]";
    case "github":
      return "bg-[linear-gradient(90deg,rgba(36,41,46,0.06),rgba(36,41,46,0.03))]";
    default:
      return "bg-[hsl(var(--muted)/0.28)]";
  }
}

function normalizeUrl(raw) {
  if (!raw) return "";
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    return url.toString();
  } catch (e) {
    return raw;
  }
}

export default function StepSocialMedia() {
  const { state, setState } = useStepData();
  const [socials, setSocials] = useState(() => state?.socialsList ?? []);
  const [platform, setPlatform] = useState(PLATFORM_OPTIONS[0].key);
  const [link, setLink] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => setSocials(state?.socialsList ?? []), [state?.socialsList]);
  useEffect(() => setState((s) => ({ ...s, socialsList: socials })), [socials]); // persist to parent state

  // keep editingValue reset when editingId changes to null
  useEffect(() => {
    if (!editingId) setEditingValue("");
  }, [editingId]);

  const addDisabled = useMemo(() => !link.trim(), [link]);

  function handleAdd() {
    if (!link.trim()) return;
    const url = normalizeUrl(link.trim());
    const id = Date.now().toString();
    setSocials((prev) => [...prev, { id, platform, url }]);
    setLink("");
    setPlatform(PLATFORM_OPTIONS[0].key);
  }

  function handleRemove(id) {
    setSocials((prev) => prev.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditingValue("");
    }
  }

  function move(id, dir) {
    setSocials((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = prev.slice();
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      return copy;
    });
  }

  function startEdit(item) {
    setEditingId(item.id);
    setEditingValue(item.url ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingValue("");
  }

  function saveEdit(id) {
    setSocials((prev) => prev.map((p) => (p.id === id ? { ...p, url: normalizeUrl(editingValue) } : p)));
    setEditingId(null);
    setEditingValue("");
  }

  return (
    <div
      className="p-4 sm:p-6 space-y-6 rounded-2xl"
    >
      <div className="flex flex-col items-center text-center">
        <h3 className="text-2xl font-semibold">Connect your socials</h3>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Add links to your profiles and content. Students will see these on your public profile.
        </p>
      </div>

      {/* add row: stacks on xs, inline on sm+ */}
      <div>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl p-2 border w-full"
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--popover)/0.85)" }}
          >
            {/* select: full width on mobile, fixed on sm+ */}
            <div className="flex-shrink-0 w-full sm:w-44">
              <Select value={platform} onValueChange={(v) => setPlatform(v)}>
                <SelectTrigger className="h-10 px-2 w-full">
                  <div className="flex items-center gap-2 truncate">
                    <span className="truncate"><SelectValue /></span>
                  </div>
                </SelectTrigger>

                <SelectContent>
                  {PLATFORM_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <SelectItem key={opt.key} value={opt.key}>
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* input: always grow */}
            <div className="flex-1 min-w-0">
              <input
                placeholder="Paste profile or content link (e.g. youtube.com/yourchannel)"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full bg-transparent outline-none text-sm"
                aria-label="social link"
                style={{ color: "hsl(var(--foreground))" }}
              />
            </div>

            {/* add button: full width on mobile, auto on sm+ */}
            <div className="flex-shrink-0 w-full sm:w-auto">
              <Button
                size="sm"
                onClick={handleAdd}
                disabled={addDisabled}
                className="rounded-full w-full sm:w-auto"
                aria-disabled={addDisabled}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="text-sm text-[hsl(var(--muted-foreground))] flex items-center gap-2 mt-2 mx-2">
          <span className="hidden sm:inline">Tip:</span>
          <span className="text-xs">You can add multiple links for the same platform.</span>
        </div>
      </div>

      {/* list */}
      <div className="grid gap-3">
        {socials.length === 0 && (
          <div
            className="p-4 rounded-xl border-dashed border"
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--popover)/0.8)" }}
          >
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              No socials added yet — add links above to show them on your profile.
            </p>
          </div>
        )}

        {socials.map((item) => {
          const Opt = PLATFORM_OPTIONS.find((o) => o.key === item.platform) || { label: item.platform, icon: LinkIcon };
          const Icon = Opt.icon || LinkIcon;
          const short = item.url?.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

          return (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-xl border"
              style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card)/0.98)" }}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${platformBadgeStyles(item.platform)} flex-shrink-0`}>
                <Icon size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                  <div className="min-w-0 flex-1">
                    <div className="truncate">
                      <div className="font-medium text-sm">{Opt.label}</div>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs truncate block max-w-20"
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        {short}
                      </a>
                    </div>
                  </div>

                  {/* action buttons: on small screens they appear below (mt-2), on sm+ they’re inline */}
                  <div className="mt-2 sm:mt-0 flex items-center gap-2 flex-shrink-0">
                    {/* hidden on mobile for compactness, visible on sm+ */}
                    <button
                      aria-label="move up"
                      onClick={() => move(item.id, -1)}
                      className="p-2 rounded-full hover:bg-[hsl(var(--muted)/0.14)] hidden sm:inline-flex"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      aria-label="move down"
                      onClick={() => move(item.id, 1)}
                      className="p-2 rounded-full hover:bg-[hsl(var(--muted)/0.14)] hidden sm:inline-flex"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>

                    {editingId === item.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(item.id)}
                          className="p-2 rounded-full hover:bg-[hsl(var(--muted)/0.14)]"
                          aria-label="save edit"
                          title="Save"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 rounded-full hover:bg-[hsl(var(--muted)/0.14)]"
                          aria-label="cancel edit"
                          title="Cancel"
                        >
                          <XIcon size={14} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(item)}
                        className="p-2 rounded-full hover:bg-[hsl(var(--muted)/0.14)]"
                        aria-label="edit"
                        title="Edit"
                      >
                        <Edit size={14} />
                      </button>
                    )}

                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 rounded-full hover:bg-[hsl(var(--destructive)/0.12)]"
                      title="Remove"
                      aria-label="remove"
                    >
                      <Trash size={14} />
                    </button>
                  </div>
                </div>

                {editingId === item.id && (
                  <div className="mt-2 w-full">
                    <input
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      className="w-full bg-[transparent] text-sm p-2 rounded-md border outline-none"
                      style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                      aria-label="Edit social url"
                      placeholder="Edit URL"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
