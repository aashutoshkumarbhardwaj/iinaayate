import { ArrowLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { storeAPI } from '../utils/api';

interface StorePageProps {
  onBack: () => void;
}

export function StorePage({ onBack }: StorePageProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await storeAPI.getProducts();
        if (mounted) setProducts(res.products || []);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/30 via-white to-blue-50/20">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl text-gray-900">Store</h1>
          <p className="text-gray-600">Browse products and support the platform</p>
        </div>

        {loading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500">No products yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all">
                <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="text-gray-400">No image</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-lg text-gray-900">{p.title}</h3>
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200">₹{(p.price / 100).toFixed(2)}</Badge>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3">{p.description}</p>
                  <div className="mt-4">
                    <Button className="w-full bg-rose-500 hover:bg-rose-600 text-white">Buy</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
