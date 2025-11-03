import { ArrowLeft, Plus, BookMarked, Lock, Globe } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

interface CollectionsPageProps {
  onBack: () => void;
  onCollectionClick: (collectionId: string) => void;
}

// Mock collections data
const mockCollections = [
  {
    id: '1',
    title: 'Heartbreak & Healing',
    description: 'Poems about love lost and found',
    poemCount: 12,
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1518893063132-36e46dbe2428?w=400&h=300&fit=crop',
    createdAt: '2 weeks ago',
  },
  {
    id: '2',
    title: 'Nature\'s Symphony',
    description: 'Beautiful verses celebrating the natural world',
    poemCount: 8,
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
    createdAt: '1 month ago',
  },
  {
    id: '3',
    title: 'Midnight Musings',
    description: 'Personal favorites for late-night reading',
    poemCount: 15,
    isPublic: false,
    coverImage: 'https://images.unsplash.com/photo-1532153975070-2e9ab71f1b14?w=400&h=300&fit=crop',
    createdAt: '3 weeks ago',
  },
  {
    id: '4',
    title: 'Urdu Classics',
    description: 'Timeless Urdu poetry and ghazals',
    poemCount: 20,
    isPublic: true,
    coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop',
    createdAt: '2 months ago',
  },
];

export function CollectionsPage({ onBack, onCollectionClick }: CollectionsPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: '',
    description: '',
    isPublic: 'public',
  });

  const handleCreateCollection = () => {
    console.log('Creating collection:', newCollection);
    setIsCreateDialogOpen(false);
    setNewCollection({ title: '', description: '', isPublic: 'public' });
    alert('Collection created! 🎉');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl text-gray-900 mb-2">
                My Collections
              </h1>
              <p className="text-gray-600">
                Organize and curate your favorite poems
              </p>
            </div>

            {/* Create Collection Dialog */}
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-rose-500 hover:bg-rose-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  New Collection
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Collection</DialogTitle>
                  <DialogDescription>
                    Organize your favorite poems into a beautiful collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="collection-title">Collection Title</Label>
                    <Input
                      id="collection-title"
                      placeholder="e.g., Love & Longing"
                      value={newCollection.title}
                      onChange={(e) =>
                        setNewCollection({ ...newCollection, title: e.target.value })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="collection-description">Description</Label>
                    <Textarea
                      id="collection-description"
                      placeholder="What's this collection about?"
                      value={newCollection.description}
                      onChange={(e) =>
                        setNewCollection({ ...newCollection, description: e.target.value })
                      }
                      className="mt-1 min-h-[80px]"
                    />
                  </div>
                  <div>
                    <Label>Privacy</Label>
                    <RadioGroup
                      value={newCollection.isPublic}
                      onValueChange={(value) =>
                        setNewCollection({ ...newCollection, isPublic: value })
                      }
                      className="mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="public" id="public" />
                        <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer">
                          <Globe className="w-4 h-4 text-blue-500" />
                          <span>Public - Anyone can view</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="private" id="private" />
                        <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer">
                          <Lock className="w-4 h-4 text-gray-500" />
                          <span>Private - Only you can view</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleCreateCollection}
                      className="flex-1 bg-rose-500 hover:bg-rose-600 text-white"
                      disabled={!newCollection.title}
                    >
                      Create Collection
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreateDialogOpen(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Collections Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCollections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onCollectionClick(collection.id)}
              className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all text-left"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={collection.coverImage}
                  alt={collection.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="bg-white/90 text-gray-900">
                      {collection.poemCount} poems
                    </Badge>
                    {collection.isPublic ? (
                      <Badge variant="secondary" className="bg-blue-500/90 text-white">
                        <Globe className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-gray-500/90 text-white">
                        <Lock className="w-3 h-3 mr-1" />
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Collection Info */}
              <div className="p-5">
                <div className="flex items-start gap-2 mb-2">
                  <BookMarked className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                  <h3 className="text-lg text-gray-900 group-hover:text-rose-600 transition-colors">
                    {collection.title}
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {collection.description}
                </p>
                <p className="text-xs text-gray-500">Created {collection.createdAt}</p>
              </div>
            </button>
          ))}

          {/* Create New Collection Card */}
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="group bg-gradient-to-br from-rose-50 to-purple-50 rounded-2xl border-2 border-dashed border-rose-200 hover:border-rose-400 transition-all p-12 flex flex-col items-center justify-center min-h-[320px]"
          >
            <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-rose-500" />
            </div>
            <p className="text-lg text-gray-900 mb-1">Create New Collection</p>
            <p className="text-sm text-gray-600 text-center">
              Start organizing your favorite poems
            </p>
          </button>
        </div>

        {/* Empty State */}
        {mockCollections.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <BookMarked className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl text-gray-900 mb-2">
              No collections yet
            </h3>
            <p className="text-gray-600 mb-6">
              Create your first collection to organize your favorite poems
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Collection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
