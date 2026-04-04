import { BookOpenText, LibraryBig, PenLine } from 'lucide-react';

interface FooterProps {
  currentPage?: string;
  onNavigate?: (page: string, options?: { searchQuery?: string }) => void;
}

const footerLinks = [
  { label: 'मुख्य पृष्ठ', page: 'home' },
  { label: 'संग्रह', page: 'explore' },
  { label: 'कवि', page: 'writers' },
  { label: 'लेखन', page: 'write' },
  { label: 'पुस्तकालय', page: 'store' },
  { label: 'हमारा उद्देश्य', page: 'help' },
];

const footerIcons = [
  { icon: BookOpenText, label: 'auto_stories' },
  { icon: PenLine, label: 'ink_pen' },
  { icon: LibraryBig, label: 'library_music' },
];

export function Footer({ currentPage, onNavigate }: FooterProps) {
  return (
    <footer className="relative mt-20 overflow-hidden rounded-t-[2rem] bg-[#FDF9F3] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,162,97,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(26,46,68,0.06),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.45),rgba(255,255,255,0.12))]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply bg-[url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22240%22 viewBox=%220 0 240 240%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22240%22 height=%22240%22 filter=%22url(%23n)%22 opacity=%220.35%22/%3E%3C/svg%3E')]" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-5 py-10 text-center sm:gap-12 sm:px-10 sm:py-16 lg:px-12">
        <div className="flex flex-col items-center gap-3">
          <img src="/brand/iinaayate-logo-transparent.png" alt="iinaayate" className="h-11 w-auto object-contain sm:h-14" />
          <p className="max-w-2xl text-[11px] uppercase tracking-[0.28em] text-slate-500 sm:text-xs sm:tracking-[0.35em]">
            Built for poets, not algorithms. © 2024 इनायत. All rights reserved.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4 sm:gap-x-12 sm:gap-y-6">
          {footerLinks.map((item) => {
            const isActive = currentPage === item.page;

            return (
              <button
                key={item.page}
                type="button"
                onClick={() => onNavigate?.(item.page)}
                className={`cursor-pointer text-[1.05rem] font-medium transition-colors duration-200 sm:text-lg ${
                  isActive
                    ? 'border-b-2 border-[#F4A261] text-[#F4A261]'
                    : 'text-[#1A2E44]/70 hover:text-[#1A2E44]'
                }`}
              >
                {item.label}
              </button>
          );
        })}
        </nav>

      </div>

      <div className="pointer-events-none absolute right-0 top-0 hidden select-none opacity-[0.03] sm:opacity-[0.05] md:block">
        <span className="pr-4 pt-3 text-[4.5rem] font-semibold leading-none text-[#1A2E44] sm:pr-8 sm:pt-4 sm:text-[8rem] lg:text-[12rem]">
          इनायत
        </span>
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-5 border-t border-[#1A2E44]/10 px-5 pb-8 pt-6 text-center sm:gap-8 sm:px-10 sm:pb-10 sm:pt-8 md:grid-cols-3 lg:px-12">
        <div className="text-left">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 sm:tracking-[0.35em]">Language / भाषा</p>
          <p className="mt-2 text-sm font-medium text-slate-700">हिन्दी (India)</p>
        </div>

        <div className="flex justify-center gap-6 sm:gap-8">
          {footerIcons.map(({ icon: Icon, label }) => (
            <span
              key={label}
              aria-hidden="true"
              className="cursor-pointer text-[#1A2E44]/40 transition-colors hover:text-[#F4A261]"
            >
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </span>
          ))}
        </div>

        <div className="text-left sm:text-right">
          <p className="italic text-slate-500 opacity-50">The soul&apos;s ink never dries.</p>
        </div>

        <div className="pointer-events-none absolute right-0 top-2 block select-none opacity-[0.03] md:hidden">
          <span className="pr-4 text-[4.5rem] font-semibold leading-none text-[#1A2E44]">
            इनायत
          </span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 opacity-[0.05]">
        <div className="h-full w-full rounded-full bg-[radial-gradient(circle,rgba(244,162,97,0.75),transparent_65%)]" />
      </div>
    </footer>
  );
}
