import { ArrowLeft, Plus, BookMarked, Lock, Globe } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import { collectionsAPI } from '../utils/api';

interface CollectionsPageProps {
  onBack: () => void;
  onCollectionClick: (collectionId: string) => void;
}

export function CollectionsPage({ onBack, onCollectionClick }: CollectionsPageProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCollection, setNewCollection] = useState({
    title: '',
    description: '',
    isPublic: 'public',
  });
  const [collections, setCollections] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await collectionsAPI.getCollections();
        if (mounted) setCollections(res.collections || []);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const handleCreateCollection = async () => {
    const isPublic = newCollection.isPublic === 'public' ? 'public' : 'private';
    const created = await collectionsAPI.createCollection({
      title: newCollection.title,
      description: newCollection.description || undefined,
      isPublic,
    });
    setIsCreateDialogOpen(false);
    setNewCollection({ title: '', description: '', isPublic: 'public' });
    setCollections((prev) => [
      { id: created.id, title: created.title, description: created.description, isPublic: created.isPublic, createdAt: created.createdAt, itemCount: 0 },
      ...prev,
    ]);
  };

  const coverFor = (title: string) => {
    const seed = encodeURIComponent(title || 'poetry');
    return `https://source.unsplash.com/600x800/?poetry,${seed}`;
  };

  const totalPages = Math.max(1, Math.ceil(collections.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageItems = collections.slice(start, start + pageSize);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-semibold text-gray-900 mb-1">Poetry Collections</h1>
              <p className="text-gray-600">Journeys through verse, curated for the soul.</p>
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
                      onValueChange={(value: string) =>
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {pageItems.map((collection) => (
            <button
              key={collection.id}
              onClick={() => onCollectionClick(collection.id)}
              className="group relative rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-0.5 transition-all text-left bg-gray-100 ring-1 ring-black/5"
              style={{ aspectRatio: '3 / 4', WebkitTapHighlightColor: 'transparent' }}
            >
              <img
                src={coverFor(collection.title)}
                alt={collection.title}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-white text-lg font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">{collection.title}</h3>
                <p className="text-white/85 text-sm">A Collection by Inayati</p>
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

        {/* Pagination */}
        {collections.length > pageSize && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 bg-white"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => {
              const n = i + 1;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-9 h-9 rounded-full text-sm font-medium ${page === n ? 'bg-rose-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                >
                  {n}
                </button>
              );
            })}
            {totalPages > 5 && <span className="px-2 text-gray-500">…</span>}
            <button
              className="px-3 py-1.5 text-gray-500 hover:text-gray-700 rounded-full border border-gray-200 bg-white"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>
        )}

        {/* Empty State */}
        {collections.length === 0 && (
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
