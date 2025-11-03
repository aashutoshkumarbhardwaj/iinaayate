import { ArrowLeft, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { genres } from '../data/mockData';

interface WritePageProps {
  onBack: () => void;
}

export function WritePage({ onBack }: WritePageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [genre, setGenre] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    // Simulate publishing
    setTimeout(() => {
      setIsPublishing(false);
      alert('Your poem has been published! 🎉');
      setTitle('');
      setContent('');
      setGenre('');
      onBack();
    }, 1000);
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
          <h1 className="text-2xl text-gray-900">
            Create New Poem
          </h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>

        {/* Writing Form */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {/* Title */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <label className="text-gray-700">
                Title
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSuggestTitle}
                className="text-rose-500 hover:text-rose-600"
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
              className="text-2xl border-gray-200"
            />
          </div>

          {/* Genre Selection */}
          <div className="mb-6">
            <label className="text-gray-700 mb-2 block">
              Genre
            </label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger className="border-gray-200">
                <SelectValue placeholder="Select a genre..." />
              </SelectTrigger>
              <SelectContent>
                {genres.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Poem Content */}
          <div className="mb-6">
            <label className="text-gray-700 mb-2 block">
              Your Poem
            </label>
            <Textarea
              placeholder="Pour your heart out...

Write your verses here
Let emotions flow free
Each word a piece of your soul"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[400px] text-lg leading-relaxed border-gray-200 font-serif"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-sm text-gray-500">
                {content.split('\n').length} lines · {content.split(/\s+/).filter(w => w).length} words
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePolish}
                className="text-rose-500 hover:text-rose-600"
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Polish My Writing
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-100">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onBack}
            >
              Save as Draft
            </Button>
            <Button
              className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
              onClick={handlePublish}
              disabled={!title || !content || !genre || isPublishing}
            >
              {isPublishing ? 'Publishing...' : 'Publish Poem'}
            </Button>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="mt-8 bg-rose-50 rounded-xl border border-rose-100 p-6">
          <h3 className="text-lg text-gray-900 mb-3">
            ✨ Writing Tips
          </h3>
          <ul className="space-y-2 text-gray-700">
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
