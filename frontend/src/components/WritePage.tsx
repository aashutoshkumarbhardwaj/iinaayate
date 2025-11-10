import { ArrowLeft, Sparkles, Bold, Italic, AlignLeft, AlignCenter, ImagePlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { postAPI } from '../utils/api';

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

  const genres = useMemo(() => {
    const defaults = ['Ghazal', 'Nazm', 'Sher', 'Free Verse', 'Haiku', 'Sonnet'];
    const setVals = new Set<string>(defaults);
    for (const p of feed) if (p.genre) setVals.add(p.genre);
    return Array.from(setVals).sort();
  }, [feed]);

  const handlePublish = async () => {
    const finalGenre = useCustomGenre ? customGenre.trim() : genre;
    if (!title || !content || !finalGenre) return;
    setIsPublishing(true);
    try {
      await postAPI.createPost(title, content, finalGenre);
      setTitle('');
      setContent('');
      setGenre('');
      setCustomGenre('');
      setUseCustomGenre(false);
      onBack();
    } catch (e: any) {
      setError(e?.message || 'Failed to publish');
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
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={onBack} className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex items-center gap-2">
            <button className={`px-3 py-1 rounded-md border ${language==='Hindi'?'bg-rose-50 border-rose-200 text-rose-700':'bg-white border-gray-200 text-gray-700'}`} onClick={()=>setLanguage('Hindi')}>Hindi</button>
            <button className={`px-3 py-1 rounded-md border ${language==='Urdu'?'bg-rose-50 border-rose-200 text-rose-700':'bg-white border-gray-200 text-gray-700'}`} onClick={()=>setLanguage('Urdu')}>Urdu</button>
            <button className={`px-3 py-1 rounded-md border ${language==='Hinglish'?'bg-rose-50 border-rose-200 text-rose-700':'bg-white border-gray-200 text-gray-700'}`} onClick={()=>setLanguage('Hinglish')}>Hinglish</button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Save Draft</Button>
            <Button variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-100/80">Preview</Button>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left editor (2 cols) */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-serif text-gray-900 mb-4">Give your work a title</h2>
            <Input
              type="text"
              placeholder="Give your work a title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl border-gray-300 mb-5"
            />

            {/* Faux toolbar */}
            <div className="flex items-center gap-4 bg-amber-50/60 border border-amber-100 rounded-t-xl px-3 py-2 text-amber-900">
              <Bold className="w-4 h-4" />
              <Italic className="w-4 h-4" />
              <AlignLeft className="w-4 h-4" />
              <AlignCenter className="w-4 h-4" />
            </div>
            <Textarea
              placeholder="यहाँ अपनी रचना लिखें... / Write your masterpiece here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[420px] text-lg leading-relaxed border border-amber-100 border-t-0 rounded-b-xl font-serif bg-white"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">{content.split('\n').length} lines · {content.split(/\s+/).filter(w => w).length} words</p>
              <Button variant="ghost" size="sm" onClick={handlePolish} className="text-rose-600"><Sparkles className="w-4 h-4 mr-1" />Polish</Button>
            </div>
          </div>

          {/* Right sidebar */}
          <div>
            <h3 className="text-xl text-gray-900 mb-4">Publishing Details</h3>
            {/* Cover uploader stub */}
            <div className="rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50/40 p-6 text-center mb-6">
              {cover ? (
                <img src={cover} alt="cover" className="w-full h-40 object-cover rounded-xl mb-3" />
              ) : (
                <div className="text-amber-900/80">
                  <ImagePlus className="w-8 h-8 mx-auto mb-2" />
                  <p className="font-medium">Cover Image</p>
                  <p className="text-sm text-amber-900/70">Upload an optional cover image. Drag and drop or click to select.</p>
                </div>
              )}
              <label className="inline-block mt-3">
                <input type="file" accept="image/*" className="hidden" onChange={(e)=>{
                  const file=e.target.files?.[0];
                  if(!file) return; const url=URL.createObjectURL(file); setCover(url);
                }} />
                <span className="px-4 py-2 rounded-md bg-white border border-amber-200 cursor-pointer inline-flex items-center gap-2">Upload Image</span>
              </label>
            </div>

            {/* Category (Genre) */}
            <div className="mb-5">
              <label className="block text-gray-900 mb-2">Category</label>
              <Select
                value={useCustomGenre ? '__custom' : genre}
                onValueChange={(val: string) => {
                  if (val === '__custom') { setUseCustomGenre(true); setGenre(''); }
                  else { setUseCustomGenre(false); setGenre(val); }
                }}
              >
                <SelectTrigger className="border-gray-300">
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
                <Input placeholder="Enter a category" value={customGenre} onChange={(e)=>setCustomGenre(e.target.value)} className="mt-3 border-gray-300" />
              )}
            </div>

            {/* Tags */}
            <div className="mb-6">
              <label className="block text-gray-900 mb-2">Tags</label>
              <Input
                placeholder="Add up to 5 tags..."
                value={tagInput}
                onChange={(e)=>setTagInput(e.target.value)}
                onKeyDown={(e)=>{
                  if(e.key==='Enter' || e.key===','){
                    e.preventDefault(); const t=tagInput.trim(); if(!t) return; if(tags.length>=5) return; if(tags.includes(t)) return; setTags([...tags,t]); setTagInput('');
                  }
                }}
                className="border-gray-300"
              />
              <div className="flex flex-wrap gap-2 mt-3">
                {tags.map((t)=> (
                  <span key={t} className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs">
                    {t}
                    <button className="ml-2 text-rose-700/70" onClick={()=>setTags(tags.filter(x=>x!==t))}>×</button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full bg-rose-700 hover:bg-rose-800 text-white rounded-md"
              onClick={handlePublish}
              disabled={!title || !content || !(useCustomGenre ? customGenre.trim() : genre) || isPublishing}
            >
              {isPublishing ? 'Submitting…' : 'Submit for Review'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">Your work will be reviewed by our moderators before publishing.</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-rose-50/60 rounded-xl border border-rose-100 p-6">
          <h3 className="text-lg font-serif text-gray-900 mb-3">✨ Writing Tips</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Let your emotions guide your words</li>
            <li>• Read your poem aloud to feel its rhythm</li>
            <li>• Use imagery and metaphors to paint vivid pictures</li>
            <li>• Authenticity resonates more than perfection</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
