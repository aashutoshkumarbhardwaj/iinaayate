import { ArrowLeft, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-accent/10 via-background to-secondary/10">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="-ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-serif text-foreground">
            Create New Poem
          </h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Writing Form */}
        <div className="bg-card rounded-2xl border border-border p-8 shadow-sm">
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <label className="text-foreground">
                Title
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSuggestTitle}
                className="text-primary hover:text-primary/90"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Suggest Title
              </Button>
            </div>
            <Input
              type="text"
              placeholder="Give your poem a beautiful title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl border-border"
            />
          </div>

          {/* Genre Selection */}
          <div className="mb-6">
            <label className="text-foreground mb-2 block">
              Genre
            </label>
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
              <SelectTrigger className="border-border">
                <SelectValue placeholder="Select a genre..." />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
                <SelectItem value="__custom">Type your own…</SelectItem>
              </SelectContent>
            </Select>
            {useCustomGenre && (
              <Input
                placeholder="Enter a genre"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                className="mt-3 border-border"
              />
            )}
          </div>

          {/* Poem Content */}
          <div className="mb-6">
            <label className="text-foreground mb-2 block">
              Your Poem
            </label>
            <Textarea
              placeholder="Pour your heart out...

Write your verses here
Let emotions flow free
Each word a piece of your soul"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] text-lg leading-relaxed border-border font-serif"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-muted-foreground">
                {content.split('\n').length} lines · {content.split(/\s+/).filter(w => w).length} words
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePolish}
                className="text-primary hover:text-primary/90"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Polish My Writing
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-border/60">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onBack}
            >
              Save as Draft
            </Button>
            <Button
              className="flex-1 bg-cta text-cta-foreground hover:brightness-95 focus:ring-2 focus:ring-primary"
              onClick={handlePublish}
              disabled={!title || !content || !(useCustomGenre ? customGenre.trim() : genre) || isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Poem'}
            </Button>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="mt-8 bg-accent/10 rounded-xl border border-accent/30 p-6">
          <h3 className="text-lg font-serif text-foreground mb-3">
            ✨ Writing Tips
          </h3>
          <ul className="space-y-2 text-foreground/80">
            <li>• Let your emotions guide your words</li>
            <li>• Don't worry about perfection - authenticity resonates more</li>
            <li>• Read your poem aloud to feel its rhythm</li>
            <li>• Use imagery and metaphors to paint vivid pictures</li>
            <li>• Remember: every great poet started with a single verse</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
