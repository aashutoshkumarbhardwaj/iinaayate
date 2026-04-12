import { ArrowLeft, Sparkles, Bold, Italic, AlignLeft, AlignCenter, ImagePlus, ChevronUp, ChevronDown, BadgeCheck } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { authAPI, postAPI } from '../utils/api';

interface WritePageProps {
  onBack: () => void;
}

export function WritePage({ onBack }: WritePageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('');
  const [useCustomGenre, setUseCustomGenre] = useState(false);
  const [customGenre, setCustomGenre] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [feed, setFeed] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'Hindi' | 'Urdu' | 'Hinglish'>('Hindi');
  const [cover, setCover] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mobileAddOpen, setMobileAddOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; avatar: string; username?: string } | null>(null);
  const [mobilePublishError, setMobilePublishError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const posts = await postAPI.getPosts({ limit: 100 });
        if (mounted) setFeed(posts);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fallbackAvatar = typeof window !== 'undefined' ? localStorage.getItem('currentUserAvatar') || '' : '';
    const fallbackName = typeof window !== 'undefined' ? localStorage.getItem('currentUserName') || '' : '';
    const fallbackUsername = typeof window !== 'undefined' ? localStorage.getItem('currentUserUsername') || '' : '';

    if (fallbackAvatar || fallbackName || fallbackUsername) {
      setCurrentUser({
        name: fallbackName || fallbackUsername || 'Your profile',
        username: fallbackUsername || undefined,
        avatar: fallbackAvatar,
      });
    }

    (async () => {
      try {
        const me = await authAPI.me();
        if (!mounted) return;
        setCurrentUser({
          name: me?.user?.name || me?.user?.username || 'Your profile',
          username: me?.user?.username,
          avatar: me?.user?.avatar || '',
        });
      } catch {
        if (!mounted) return;
        setCurrentUser(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const genres = useMemo(() => {
    const defaults = ['Ghazal', 'Nazm', 'Sher', 'Free Verse', 'Haiku', 'Sonnet'];
    const setVals = new Set<string>(defaults);
    for (const p of feed) if (p.genre) setVals.add(p.genre);
    return Array.from(setVals).sort();
  }, [feed]);

  const selectedGenre = (useCustomGenre ? customGenre : genre).trim();
  const canPublish = !!title.trim() && !!content.trim() && !!selectedGenre && !isPublishing;
  const mobileTitle = title.trim() || content.trim().split('\n').find(Boolean)?.slice(0, 60) || 'Untitled';
  const mobileGenre = selectedGenre || genres[0] || 'Nazm';
  const canMobilePublish = !!content.trim() && !isPublishing;

  const handlePublish = async () => {
    const finalTitle = title.trim();
    const finalContent = content.trim();
    const finalGenre = (useCustomGenre ? customGenre : genre).trim();
    if (!finalTitle || !finalContent || !finalGenre || isPublishing) return;
    setMobilePublishError(null);
    setIsPublishing(true);
    try {
      await postAPI.createPost(finalTitle, finalContent, finalGenre);
      setTitle('');
      setContent('');
      setGenre('');
      setCustomGenre('');
      setUseCustomGenre(false);
      setTags([]);
      setTagInput('');
      setCover(null);
      setMobileAddOpen(false);
      onBack();
    } catch (e: any) {
      setMobilePublishError(e?.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleMobilePublish = async () => {
    const finalContent = content.trim();
    if (!finalContent || isPublishing) return;
    setMobilePublishError(null);
    setIsPublishing(true);
    try {
      await postAPI.createPost(mobileTitle, finalContent, mobileGenre);
      setTitle('');
      setContent('');
      setGenre('');
      setCustomGenre('');
      setUseCustomGenre(false);
      setTags([]);
      setTagInput('');
      setCover(null);
      setMobileAddOpen(false);
      onBack();
    } catch (e: any) {
      setMobilePublishError(e?.message || 'Failed to publish');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePolish = () => {
    alert('AI suggestions feature coming soon! ✨');
  };

  const handleSuggestTitle = () => {
    const suggestions = [
      'Whispers of the Heart',
      'Moonlit Dreams',
      'Echoes of Tomorrow',
      'Silent Melodies',
      'Dancing with Shadows',
    ];
    const randomTitle = suggestions[Math.floor(Math.random() * suggestions.length)];
    setTitle(randomTitle);
  };

  return (
    <div className="min-h-screen bg-app">
      <div className="md:hidden">
        <div className="flex min-h-screen flex-col bg-transparent">
          <div className="flex items-center justify-between px-4 pb-3 pt-4">
            <button
              type="button"
              onClick={onBack}
              aria-label="Close"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white text-slate-900 shadow-[0_8px_20px_rgba(15,23,42,0.06)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <h1 className="text-[1.05rem] font-medium tracking-tight text-slate-900">Create Post</h1>

            <button
              type="button"
              onClick={handleMobilePublish}
              disabled={!canMobilePublish}
              className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-[0_10px_22px_rgba(16,185,129,0.22)] transition-colors disabled:bg-slate-100 disabled:text-slate-400"
            >
              {isPublishing ? 'Posting…' : 'Post'}
            </button>
          </div>

          <div className="flex items-center gap-3 px-4 pb-4">
            <div className="h-12 w-12 overflow-hidden rounded-full border border-slate-200 bg-slate-100 shadow-sm">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt={currentUser.name} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-[1rem] font-medium text-slate-900">{currentUser?.name || 'Your profile'}</p>
                <BadgeCheck className="h-4 w-4 text-sky-500" />
              </div>
              <p className="text-xs text-slate-500">{currentUser?.username ? `@${currentUser.username}` : ' '}</p>
            </div>
          </div>

          <div className="flex-1 px-4 pb-4">
            <Input
              type="text"
              placeholder="Give your work a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mb-3 border-0 bg-transparent px-0 text-[1.05rem] text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
            />

            <Textarea
              placeholder="What do you want to talk about?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[52vh] border-0 bg-transparent px-0 py-0 text-[1.02rem] text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
              style={{ lineHeight: 1.55 }}
            />
          </div>

          {mobilePublishError && (
            <div className="px-4 pb-3">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {mobilePublishError}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 bg-white/95 backdrop-blur-sm">
            <div className="flex items-center gap-3 overflow-x-auto px-4 py-3">
              <button
                type="button"
                onClick={() => setMobileAddOpen((value) => !value)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-sky-50 text-sky-600"
                aria-label="Add media"
              >
                <ImagePlus className="h-5 w-5" />
              </button>
              <button type="button" onClick={handlePolish} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600" aria-label="Polish">
                <Sparkles className="h-5 w-5" />
              </button>
              <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600" aria-label="Bold">
                <Bold className="h-5 w-5" />
              </button>
              <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600" aria-label="Italic">
                <Italic className="h-5 w-5" />
              </button>
              <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600" aria-label="Align left">
                <AlignLeft className="h-5 w-5" />
              </button>
              <button type="button" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600" aria-label="Align center">
                <AlignCenter className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setMobileAddOpen((value) => !value)}
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700"
                aria-label="Toggle add panel"
              >
                {mobileAddOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
              </button>
            </div>

            {mobileAddOpen && (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                <div className="grid gap-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-3">
                      <ImagePlus className="h-5 w-5 text-sky-500" />
                      <p className="font-medium text-slate-900">Cover Image</p>
                    </div>
                    {cover ? (
                      <img src={cover} alt="cover" className="mb-3 h-36 w-full rounded-xl object-cover" />
                    ) : (
                      <p className="text-sm text-slate-500">Upload an optional cover image.</p>
                    )}
                    <label className="inline-flex">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          setCover(url);
                        }}
                      />
                      <span className="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                        Upload Image
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">Category</label>
                    <Select
                      value={useCustomGenre ? '__custom' : genre}
                      onValueChange={(val: string) => {
                        if (val === '__custom') {
                          setUseCustomGenre(true);
                          setGenre('');
                        } else {
                          setUseCustomGenre(false);
                          setGenre(val);
                        }
                      }}
                    >
                      <SelectTrigger className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                        <SelectItem value="__custom">Type your own…</SelectItem>
                      </SelectContent>
                    </Select>
                    {useCustomGenre && (
                        <Input
                          placeholder="Enter a category"
                          value={customGenre}
                          onChange={(e) => setCustomGenre(e.target.value)}
                          className="mt-3 h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                        />
                      )}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-900">Tags</label>
                    <Input
                      placeholder="Add up to 5 tags..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ',') {
                          e.preventDefault();
                          const t = tagInput.trim();
                          if (!t) return;
                          if (tags.length >= 5) return;
                          if (tags.includes(t)) return;
                          setTags([...tags, t]);
                          setTagInput('');
                        }
                      }}
                      className="h-11 rounded-2xl border-slate-200 bg-white shadow-sm"
                    />
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tags.map((t) => (
                        <span key={t} className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">
                          {t}
                          <button type="button" className="ml-2 text-rose-700/70" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <div className="relative mx-auto max-w-7xl px-6 py-8 lg:px-8">

          <div className="overflow-hidden rounded-[32px] border border-white/70 bg-white/80 shadow-[0_28px_90px_rgba(15,23,42,0.12)] backdrop-blur-2xl">
            <div className="grid grid-cols-12 gap-0">
              <aside className="col-span-12 border-b border-slate-100 bg-[linear-gradient(180deg,#fff7ec_0%,#fffdf9_100%)] px-7 py-7 lg:col-span-4 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between gap-3">
                  <Button variant="ghost" onClick={onBack} className="-ml-2 rounded-full border border-slate-200 bg-white/90 px-4 shadow-sm">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <div className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-amber-700">
                    Desktop
                  </div>
                </div>

                <div className="mt-8">
                  <p className="text-[10px] uppercase tracking-[0.38em] text-[#b98a5c]">Create Post</p>
                  <h2 className="mt-3 font-serif text-4xl leading-tight text-[#1A2E44]">
                    Shape a quiet, elegant draft.
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
                    Compose your post in a calm desktop workspace with the same publishing controls and API behavior you already use.
                  </p>
                </div>

                <div className="mt-8 rounded-[26px] border border-[#eadfce] bg-white/80 p-4 shadow-[0_14px_30px_rgba(26,46,68,0.06)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f4a261]/15 text-[#8e4e14]">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1A2E44]">Writing Flow</p>
                      <p className="text-xs text-slate-500">Title, draft, media, genre, tags, publish.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-[26px] border border-[#eadfce] bg-[#fcf8f2] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#b98a5c]">Word Count</p>
                  <p className="mt-2 text-3xl font-serif text-[#1A2E44]">
                    {content.split(/\s+/).filter((w) => w).length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Words in your draft</p>
                </div>

                <div className="mt-6 rounded-[26px] border border-[#eadfce] bg-[#fffdf9] p-4">
                  <p className="text-xs uppercase tracking-[0.28em] text-[#b98a5c]">Line Count</p>
                  <p className="mt-2 text-3xl font-serif text-[#1A2E44]">
                    {content.split('\n').length}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">Lines in your draft</p>
                </div>
              </aside>

              <section className="col-span-12 px-7 py-7 lg:col-span-8 lg:px-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button className={`rounded-full border px-4 py-2 text-sm transition-colors ${language === 'Hindi' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`} onClick={() => setLanguage('Hindi')}>Hindi</button>
                    <button className={`rounded-full border px-4 py-2 text-sm transition-colors ${language === 'Urdu' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`} onClick={() => setLanguage('Urdu')}>Urdu</button>
                    <button className={`rounded-full border px-4 py-2 text-sm transition-colors ${language === 'Hinglish' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`} onClick={() => setLanguage('Hinglish')}>Hinglish</button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-full border-slate-200 bg-white px-4">Save Draft</Button>
                    <Button variant="secondary" className="rounded-full bg-rose-100 px-4 text-rose-800 hover:bg-rose-100/80">Preview</Button>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(300px,0.9fr)]">
                  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.32em] text-[#b98a5c]">Title</p>
                        <h3 className="mt-2 font-serif text-2xl text-[#1A2E44]">Give your work a title</h3>
                      </div>
                    </div>
                    <Input
                      type="text"
                      placeholder="Give your work a title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="mt-4 h-14 rounded-2xl border-slate-200 bg-[#fffdf9] px-4 text-lg text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#f4a261]/40"
                    />

                    <div className="mt-6 overflow-hidden rounded-[24px] border border-[#eddcc5] bg-[#fffcf7]">
                      <div className="flex items-center gap-3 border-b border-[#eddcc5] bg-[#fff5e8] px-4 py-3 text-[#8e4e14]">
                        <Bold className="h-4 w-4" />
                        <Italic className="h-4 w-4" />
                        <AlignLeft className="h-4 w-4" />
                        <AlignCenter className="h-4 w-4" />
                      </div>
                      <Textarea
                        placeholder="यहाँ अपनी रचना लिखें... / Write your masterpiece here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[520px] rounded-none border-0 bg-transparent px-5 py-5 font-poetry text-lg text-slate-900 shadow-none placeholder:text-slate-400 focus-visible:ring-0"
                        style={{ lineHeight: 1.9 }}
                      />
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500">
                      <p>{content.split('\n').length} lines · {content.split(/\s+/).filter((w) => w).length} words</p>
                      <Button variant="ghost" size="sm" onClick={handlePolish} className="rounded-full text-[#e07a1f] hover:bg-[#f4a261]/10 hover:text-[#c5670f]">
                        <Sparkles className="mr-1 h-4 w-4" /> Polish
                      </Button>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                      <h3 className="text-xl font-serif text-[#1A2E44]">Publishing Details</h3>
                      <div className="mt-4 rounded-[24px] border-2 border-dashed border-[#e7d7c3] bg-[#fffaf1] p-5 text-center">
                        {cover ? (
                          <img src={cover} alt="cover" className="mb-4 h-48 w-full rounded-2xl object-cover" />
                        ) : (
                          <div className="py-4 text-[#8e4e14]/80">
                            <ImagePlus className="mx-auto mb-3 h-9 w-9" />
                            <p className="font-medium text-[#1A2E44]">Cover Image</p>
                            <p className="mt-1 text-sm text-slate-500">Upload an optional cover image.</p>
                          </div>
                        )}
                        <label className="inline-flex">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const url = URL.createObjectURL(file);
                              setCover(url);
                            }}
                          />
                          <span className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#eadfce] bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
                            Upload Image
                          </span>
                        </label>
                      </div>

                      <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-slate-900">Category</label>
                        <Select
                          value={useCustomGenre ? '__custom' : genre}
                          onValueChange={(val: string) => {
                            if (val === '__custom') {
                              setUseCustomGenre(true);
                              setGenre('');
                            } else {
                              setUseCustomGenre(false);
                              setGenre(val);
                            }
                          }}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {genres.map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                            <SelectItem value="__custom">Type your own…</SelectItem>
                          </SelectContent>
                        </Select>
                        {useCustomGenre && (
                          <Input
                            placeholder="Enter a category"
                            value={customGenre}
                            onChange={(e) => setCustomGenre(e.target.value)}
                            className="mt-3 h-12 rounded-2xl border-slate-200 bg-white shadow-sm"
                          />
                        )}
                      </div>

                      <div className="mt-5">
                        <label className="mb-2 block text-sm font-medium text-slate-900">Tags</label>
                        <Input
                          placeholder="Add up to 5 tags..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ',') {
                              e.preventDefault();
                              const t = tagInput.trim();
                              if (!t) return;
                              if (tags.length >= 5) return;
                              if (tags.includes(t)) return;
                              setTags([...tags, t]);
                              setTagInput('');
                            }
                          }}
                          className="h-12 rounded-2xl border-slate-200 bg-white shadow-sm"
                        />
                        <div className="mt-3 flex flex-wrap gap-2">
                          {tags.map((t) => (
                            <span key={t} className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700">
                              {t}
                              <button type="button" className="ml-2 text-rose-700/70" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button
                          className="w-full rounded-full bg-[#1A2E44] py-3 text-white shadow-[0_14px_30px_rgba(26,46,68,0.18)] hover:bg-[#132235]"
                          onClick={handlePublish}
                          disabled={!canPublish}
                        >
                          {isPublishing ? 'Submitting…' : 'Submit for Review'}
                        </Button>
                        <p className="mt-2 text-xs text-slate-500">Your work will be reviewed by our moderators before publishing.</p>
                      </div>
                    </div>

                    <div className="rounded-[28px] border border-[#eddcc5] bg-[#fffaf4] p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                      <h3 className="text-lg font-serif text-[#1A2E44]">✨ Writing Tips</h3>
                      <ul className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                        <li>• Let your emotions guide your words</li>
                        <li>• Read your poem aloud to feel its rhythm</li>
                        <li>• Use imagery and metaphors to paint vivid pictures</li>
                        <li>• Authenticity resonates more than perfection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
