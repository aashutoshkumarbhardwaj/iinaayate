import { ArrowLeft, Heart, Menu, Search, ShoppingBag, User } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { storeAPI } from '../utils/api';

interface StorePageProps {
  onBack: () => void;
}

function formatPrice(value?: number) {
  const amount = typeof value === 'number' ? value / 100 : 0;
  return amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function productInitial(title?: string) {
  return (title || 'P').trim().slice(0, 1).toUpperCase();
}

function productSubtitle(description?: string) {
  if (!description) return 'Curated object';
  return description.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 1).join(' ');
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
    return () => {
      mounted = false;
    };
  }, []);

  const heroProduct = products[0];
  const archiveCards = useMemo(() => products.slice(1, 5), [products]);
  const collectionCards = useMemo(() => products.slice(0, 4), [products]);
  return (
    <div className="min-h-screen overflow-x-hidden bg-app font-body text-[#1c1c18] antialiased">
      <nav className="fixed top-0 z-50 w-full border-b border-black/5 bg-app shadow-[0_1px_12px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-4 py-4 sm:px-6 lg:px-12 lg:py-6">
          <div className="font-serif text-[1.05rem] font-bold text-[#1A2E44] md:text-2xl">
            The Modern Mushaira
          </div>

          <div className="hidden items-center gap-10 font-serif italic tracking-wide md:flex">
            <span className="text-[#1A2E44]/80 transition-all duration-300 hover:text-[#F4A261]">Collections</span>
            <span className="text-[#1A2E44]/80 transition-all duration-300 hover:text-[#F4A261]">Artisans</span>
            <span className="text-[#1A2E44]/80 transition-all duration-300 hover:text-[#F4A261]">Poetry Tools</span>
            <span className="text-[#1A2E44]/80 transition-all duration-300 hover:text-[#F4A261]">Journal</span>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <button
              type="button"
              aria-label="Profile"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A2E44] transition-transform active:scale-90 md:h-auto md:w-auto"
            >
              <User className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <button
              type="button"
              aria-label="Favorites"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#1A2E44] transition-transform active:scale-90 md:h-auto md:w-auto"
            >
              <Heart className="h-4 w-4 md:h-5 md:w-5" />
            </button>
            <Button className="hidden rounded-xl bg-[#03192e] px-3 py-2 text-[10px] text-white hover:bg-[#132235] sm:inline-flex sm:px-4 md:px-5">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Shopping Bag
            </Button>
            <button
              type="button"
              aria-label="Menu"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-black/8 bg-white text-[#1A2E44] shadow-sm sm:hidden"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-[72px] md:pt-[84px]">
        <section className="relative flex min-h-[760px] items-center overflow-hidden md:min-h-[921px]">
          <div className="absolute inset-0 z-0">
            {heroProduct?.image ? (
              <img
                className="h-full w-full object-cover"
                src={heroProduct.image}
                alt={heroProduct.title}
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-[#d8c9b8] via-[#f5eee5] to-[#7d8da1]" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-[#FDF9F3] via-[#FDF9F3]/60 to-transparent" />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-12">
            <div className="max-w-2xl">
              <h1 className="mb-4 font-serif text-[3.2rem] leading-[0.96] text-[#03192e] md:text-[5.5rem] lg:text-[6.5rem]">
                शिल्प और शब्द
              </h1>
              <p className="mb-8 font-serif italic text-[1.8rem] text-[#8e4e14] md:text-[2.5rem] lg:text-4xl">
                The Master&apos;s Pen
              </p>
              <p className="mb-10 max-w-lg text-[1rem] leading-8 text-[#43474d] md:text-xl">
                Bespoke instruments for the modern Shayar. Crafted at the intersection of classical tradition and contemporary precision.
              </p>
              <div className="flex gap-4">
                <Button className="rounded-xl bg-[#03192e] px-6 py-3 text-[10px] uppercase tracking-widest text-white hover:bg-[#132235] md:px-10 md:py-5 md:text-sm">
                  Explore the Sanctuary
                </Button>
              </div>
            </div>
          </div>

          <div className="pointer-events-none absolute bottom-8 right-4 opacity-20 md:bottom-12 md:right-12">
            <span className="select-none font-serif text-[8rem] text-[#8e4e14] md:text-[14rem] lg:text-[20rem]">कलम</span>
          </div>
        </section>

        <section className="bg-[#fdf9f3] py-20 md:py-32">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12">
            <div className="mb-10 md:mb-16">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[#8e4e14] md:text-xs">Curated Archives</p>
              <h2 className="mt-3 font-serif text-[2rem] text-[#03192e] md:text-[3rem] lg:text-[4rem]">The Poet&apos;s Arsenal</h2>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              <div className="group relative overflow-hidden rounded-xl bg-[#f7f3ed] transition-all duration-700 hover:scale-[0.99] md:col-span-8">
                <div className="absolute inset-0">
                  {archiveCards[0]?.image ? (
                    <img
                      className="h-full w-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-100"
                      src={archiveCards[0].image}
                      alt={archiveCards[0].title}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#1a2e44] via-[#6f3800] to-[#d9c8a8]" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#03192e]/80 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 md:bottom-10 md:left-10 md:right-auto">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#f4a261] md:text-xs">View Collection</p>
                  <h3 className="font-serif text-[1.5rem] text-white md:text-[2.5rem]">
                    {archiveCards[0]?.title || 'Rare Manuscripts'}
                  </h3>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/80">
                    {productSubtitle(archiveCards[0]?.description) || 'Limited edition museum-grade prints of timeless Hindi couplets.'}
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-xl bg-[#f7f3ed] transition-all duration-700 hover:scale-[0.99] md:col-span-4">
                <div className="absolute inset-0">
                  {archiveCards[1]?.image ? (
                    <img
                      className="h-full w-full object-cover opacity-70 transition-transform duration-1000 group-hover:scale-110 group-hover:opacity-90"
                      src={archiveCards[1].image}
                      alt={archiveCards[1].title}
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-[#c8c6c5] via-[#f1ede7] to-[#8b9fb3]" />
                  )}
                </div>
                <div className="absolute inset-0 bg-[#03192e]/20" />
                <div className="absolute inset-x-4 bottom-4 rounded-lg border border-black/5 bg-white/90 p-4 backdrop-blur-sm md:inset-x-auto md:bottom-10 md:left-10 md:right-10 md:p-8">
                  <p className="mb-2 text-[10px] uppercase tracking-widest text-[#8e4e14]">Discover</p>
                  <h3 className="font-serif text-[1.3rem] text-[#03192e] md:text-[2rem]">
                    {archiveCards[1]?.title || 'Vellum Journals'}
                  </h3>
                  <p className="mt-3 text-[0.8rem] leading-6 text-[#43474d] md:text-xs">
                    {productSubtitle(archiveCards[1]?.description) || 'Tactile leather-bound notebooks for fleeting thoughts.'}
                  </p>
                </div>
              </div>

              <div className="grid gap-8 md:col-span-5">
                <div className="rounded-xl bg-[#f1ede7] p-6 md:p-12">
                  <div className="mx-auto flex aspect-square max-w-[20rem] items-center justify-center rounded-full border border-[#8e4e14]/10 bg-[#fdf9f3]">
                    <div className="relative flex h-40 w-40 items-center justify-center rounded-3xl shadow-[0_24px_48px_rgba(15,23,42,0.12)] md:h-48 md:w-48">
                      {archiveCards[2]?.image ? (
                        <img
                          className="h-full w-full rounded-3xl object-cover"
                          src={archiveCards[2].image}
                          alt={archiveCards[2].title}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center rounded-3xl bg-gradient-to-br from-[#1a2e44] via-[#4a5f75] to-[#8e4e14] text-4xl font-serif text-white">
                          {productInitial(archiveCards[2]?.title)}
                        </div>
                      )}
                      <div className="absolute right-3 top-3 text-right">
                        <h3 className="font-serif text-[1.4rem] text-[#03192e] md:text-[1.75rem]">
                          {archiveCards[2]?.title || 'Ink of the Soul'}
                        </h3>
                        <p className="text-[9px] uppercase tracking-[0.2em] text-[#8e4e14]">
                          Saffron &amp; Deep Indigo Blends
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl bg-[#03192e] p-8 text-white md:p-16">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-[#f4a261]">Community</p>
                  <h3 className="mt-4 font-serif text-[2rem] leading-tight text-white md:text-[3rem]">
                    Traditional <br /> Nib Society
                  </h3>
                  <p className="mt-6 max-w-sm leading-relaxed text-[#b4c8e4]">
                    Join a guild of modern calligraphers. Access exclusive workshops and archival nib releases.
                  </p>
                  <Button className="mt-8 rounded-xl border border-white/20 bg-transparent px-6 text-[10px] uppercase tracking-widest text-white hover:bg-white hover:text-[#03192e]">
                    Become a Member
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-[#f7f3ed] py-20 md:py-32">
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12">
            <div className="mb-10 flex items-end justify-between md:mb-16">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-[#8e4e14] md:text-xs">Featured Artisanal Goods</p>
                <h2 className="mt-3 font-serif text-[2rem] text-[#03192e] md:text-[3rem] lg:text-[4rem]">The Collection</h2>
              </div>
              <span className="hidden text-[10px] uppercase tracking-widest text-[#03192e] md:block">Browse Full Archive</span>
            </div>

            {loading ? (
              <div className="rounded-[32px] border border-black/8 bg-white p-12 text-center text-[#6B6B6B] shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
                Loading...
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-[32px] border border-black/8 bg-white p-12 text-center text-[#6B6B6B] shadow-[0_14px_32px_rgba(15,23,42,0.06)]">
                No products yet
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {collectionCards.map((product) => (
                  <article key={product.id} className="group">
                    <div className="relative mb-6 overflow-hidden rounded-t-[5rem] bg-[#fffdf9]">
                      <div className="aspect-[4/5] overflow-hidden">
                        {product.image ? (
                          <img
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                            src={product.image}
                            alt={product.title}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1a2e44] via-[#4a5f75] to-[#8e4e14] text-5xl font-serif text-white">
                            {productInitial(product.title)}
                          </div>
                        )}
                      </div>
                      <div className="absolute inset-0 bg-[#03192e]/0 transition-colors duration-500 group-hover:bg-[#03192e]/10" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                        <button className="rounded-xl bg-white px-6 py-3 text-[10px] uppercase tracking-widest text-[#03192e] shadow-xl">
                          View Craft
                        </button>
                      </div>
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="mb-1 font-serif text-[1.25rem] text-[#03192e] md:text-[1.5rem]">
                          {product.title}
                        </h4>
                        <p className="text-sm italic text-[#43474d]">
                          {productSubtitle(product.description)}
                        </p>
                      </div>
                      <span className="font-label text-[0.95rem] text-[#03192e]">₹{formatPrice(product.price)}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#fdf9f3] py-20 md:py-32">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-12">
            <p className="mb-8 text-[10px] uppercase tracking-[0.4em] text-[#8e4e14]">The Ethics of Craft</p>
            <h2 className="mb-12 font-serif text-[2.2rem] leading-tight text-[#03192e] md:text-[3.8rem]">
              Instruments for the Immortal Word
            </h2>
            <div className="grid gap-16 text-left md:grid-cols-2">
              <div>
                <h5 className="mb-4 font-serif text-[1.4rem] text-[#03192e] md:text-[1.8rem]">Sourced with Soul</h5>
                <p className="leading-relaxed text-[#43474d]">
                  Every sheet of paper is handmade by third-generation artisans in Sanganer, using methods that respect both the worker and the earth.
                </p>
              </div>
              <div>
                <h5 className="mb-4 font-serif text-[1.4rem] text-[#03192e] md:text-[1.8rem]">Precise Lineage</h5>
                <p className="leading-relaxed text-[#43474d]">
                  Our pens are not mass-produced. They are balanced by hand, ensuring that the tension of the nib matches the fluidity of the Shayar&apos;s thought.
                </p>
              </div>
            </div>
            <div className="mt-14 rounded-xl bg-[#ebe8e2] p-10 md:p-12">
              <p className="font-serif italic text-[1.3rem] leading-relaxed text-[#03192e] md:text-[1.8rem]">
                &quot;The nib is the threshold where the silent soul meets the vocal ink.&quot;
              </p>
              <p className="mt-6 text-[10px] uppercase tracking-widest text-[#8e4e14]">
                — The Modern Mushaira Creed
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute -right-20 top-1/2 hidden -translate-y-1/2 opacity-5 lg:block">
            <svg height="400" viewBox="0 0 200 200" width="400" aria-hidden="true">
              <path
                d="M44.7,-76.4C58.1,-69.2,69.5,-57.4,77.3,-43.8C85.1,-30.2,89.2,-15.1,88.7,-0.3C88.2,14.5,83,28.9,74.5,41.4C66,53.8,54.1,64.2,40.4,71.5C26.7,78.8,11.3,83,1.6,80.3C-14.1,77.5,-28.1,67.8,-39.8,57.4C-51.5,47,-60.8,35.9,-67.2,23.3C-73.6,10.6,-77.1,-3.6,-74.6,-16.9C-72.1,-30.2,-63.7,-42.6,-52.4,-50.7C-41.2,-58.8,-27.1,-62.7,-14.1,-68.3C-1.1,-73.9,13.8,-81.3,28.8,-82.6C43.8,-83.8,58.9,-78.9,64.7,-68.5"
                fill="#1A2E44"
                transform="translate(100 100)"
              />
            </svg>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-[#FDF9F3]/10 bg-[#1A2E44] px-4 py-12 text-white md:px-12 md:py-16">
        <div className="mx-auto grid max-w-screen-2xl grid-cols-1 items-center gap-8 text-center md:grid-cols-2 md:text-left">
          <div>
            <div className="mb-4 font-serif text-lg text-[#F4A261]">The Modern Mushaira</div>
            <div className="font-serif text-sm uppercase tracking-widest text-[#FDF9F3]/80">
              © 2024 The Modern Mushaira. Crafted with ink and soul.
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4 font-serif text-sm uppercase tracking-widest md:justify-end">
            <span className="text-[#FDF9F3]/60 transition-colors hover:text-[#F4A261]">The Parchment Archive</span>
            <span className="text-[#FDF9F3]/60 transition-colors hover:text-[#F4A261]">Shipping &amp; Returns</span>
            <span className="text-[#FDF9F3]/60 transition-colors hover:text-[#F4A261]">Artisanal Ethics</span>
            <span className="text-[#FDF9F3]/60 transition-colors hover:text-[#F4A261]">Privacy Policy</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
