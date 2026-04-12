import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { authAPI, setAuthToken } from '../utils/api';

interface AuthPageProps {
  onAuth: () => void;
}

function AuthField({
  label,
  htmlFor,
  type,
  placeholder,
}: {
  label: string;
  htmlFor: string;
  type: string;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-[10px] uppercase tracking-[0.32em] text-[#8a93a1]/90">
        {label}
      </Label>
      <Input
        id={htmlFor}
        type={type}
        placeholder={placeholder}
        className="h-14 rounded-[0.6rem] border border-white/30 bg-white/45 px-4 text-[0.98rem] text-[#1f2937] placeholder:text-[#b5b6bb] shadow-none backdrop-blur-sm focus-visible:border-[#8e4e14] focus-visible:ring-[3px] focus-visible:ring-[#8e4e14]/15"
      />
    </div>
  );
}

export function AuthPage({ onAuth }: AuthPageProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.querySelector('#login-email') as HTMLInputElement)?.value;
    const password = (form.querySelector('#login-password') as HTMLInputElement)?.value;
    if (!email || !password) return;
    setIsLoading(true);
    try {
      const res = await authAPI.login(email, password);
      const token = res.token as string;
      setAuthToken(token);
      localStorage.setItem('authToken', token);
      if (res.user?.id) localStorage.setItem('currentUserId', res.user.id);
      onAuth();
    } catch {
      // ignore for now
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const username = (form.querySelector('#signup-username') as HTMLInputElement)?.value;
    const name = (form.querySelector('#signup-name') as HTMLInputElement)?.value || username;
    const email = (form.querySelector('#signup-email') as HTMLInputElement)?.value;
    const password = (form.querySelector('#signup-password') as HTMLInputElement)?.value;
    if (!email || !password || !username) return;
    setIsLoading(true);
    try {
      const res = await authAPI.signup(email, password, username, name);
      const token = res.token as string;
      setAuthToken(token);
      localStorage.setItem('authToken', token);
      if (res.user?.id) localStorage.setItem('currentUserId', res.user.id);
      onAuth();
    } catch {
      // ignore for now
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-app text-[#1C1C1E]">

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-8 lg:px-12 lg:py-8">
        <div className="font-serif text-[1.35rem] font-bold italic text-[#1A2E44] md:text-[2rem]">
          Kavya Darpan
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-[#9ca3af]/80 md:text-xs">
          The Digital Manuscript
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center px-4 pb-14 pt-2 md:px-6 lg:px-8">
        <section className="relative flex w-full max-w-[610px] flex-col items-center">
          <div className="absolute -left-1 -top-1 h-10 w-10 border-l-[3px] border-t-[3px] border-[#cda56c] md:h-12 md:w-12" />
          <div className="absolute inset-0 -z-10 rounded-[1rem] bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.35),transparent_50%)] blur-2xl" />
          <div className="w-full rounded-[1rem] border border-white/20 bg-[rgba(255,255,255,0.66)] px-5 py-8 shadow-[0_18px_50px_rgba(31,41,55,0.08)] backdrop-blur-[24px] md:px-10 md:py-10">
            <div className="text-center">
              <h1 className="font-serif text-[2.55rem] font-bold leading-none text-[#1A2E44] md:text-[3.45rem]">
                प्रवेश
              </h1>
              <p className="mt-7 font-serif italic text-[1.15rem] leading-8 text-[#6f7a86]/60 md:text-[1.35rem]">
                Step into the sanctuary of words.
              </p>
            </div>

            <Tabs defaultValue="login" className="mt-8 w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-[1.6rem] bg-white/35 p-1 shadow-[inset_0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm">
                <TabsTrigger
                  value="login"
                  className="h-14 rounded-[1.25rem] text-[1rem] font-semibold text-[#1C1C1E]/90 data-[state=active]:bg-white data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.08)] md:text-[1.05rem]"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="h-14 rounded-[1.25rem] text-[1rem] font-medium text-[#8a93a1] data-[state=active]:bg-white data-[state=active]:text-[#1C1C1E] data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.08)] md:text-[1.05rem]"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-10">
                <form onSubmit={handleLogin} className="space-y-7">
                  <AuthField label="Email Address" htmlFor="login-email" type="email" placeholder="shayar@kavyadarpan.com" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-[10px] uppercase tracking-[0.32em] text-[#8a93a1]/90">
                        Password
                      </Label>
                      <button type="button" className="text-[10px] uppercase tracking-[0.32em] text-[#a36116]">
                        Forgot?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 rounded-[0.6rem] border border-white/30 bg-white/45 px-4 text-[0.98rem] text-[#1f2937] placeholder:text-[#b5b6bb] shadow-none backdrop-blur-sm focus-visible:border-[#8e4e14] focus-visible:ring-[3px] focus-visible:ring-[#8e4e14]/15"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-16 w-full rounded-[1rem] bg-[#03192e] text-[0.98rem] uppercase tracking-[0.26em] text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#132235]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entering...' : 'Enter the Archive'}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#ece4d8]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white/55 px-4 text-[10px] uppercase tracking-[0.36em] text-[#a8b0ba]">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-white/35 bg-white/45 text-[#46505d] shadow-none backdrop-blur-sm hover:bg-white/60"
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-[0.35rem] bg-[#5a6675]/85 text-[10px] text-white">
                        G
                      </span>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-white/35 bg-white/45 text-[#46505d] shadow-none backdrop-blur-sm hover:bg-white/60"
                    >
                      <span className="mr-3 text-[1rem] text-[#1A2E44]"></span>
                      Apple
                    </Button>
                  </div>

                  <p className="px-2 pt-2 text-center text-[0.95rem] leading-7 text-[#8a93a1]/90">
                    By entering, you honor our{' '}
                    <a href="#" className="border-b border-[#a36116]/30 text-[#1A2E44]">
                      Linguistic Heritage
                    </a>{' '}
                    and agree to our{' '}
                    <a href="#" className="border-b border-[#a36116]/30 text-[#1A2E44]">
                      Privacy Ethos
                    </a>
                    .
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-10">
                <form onSubmit={handleSignup} className="space-y-5">
                  <AuthField label="Username" htmlFor="signup-username" type="text" placeholder="your_poet_name" />
                  <AuthField label="Display Name" htmlFor="signup-name" type="text" placeholder="Your Name" />
                  <AuthField label="Email Address" htmlFor="signup-email" type="email" placeholder="poet@example.com" />
                  <AuthField label="Password" htmlFor="signup-password" type="password" placeholder="••••••••" />

                  <div className="text-sm text-[#6f7a86]/90">
                    <label className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1 rounded border-[#d4cbbb]" required />
                      <span>
                        I agree to the Terms of Service and Privacy Policy
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="h-16 w-full rounded-[1rem] bg-[#03192e] text-[0.98rem] uppercase tracking-[0.26em] text-white shadow-[0_16px_28px_rgba(15,23,42,0.16)] transition-transform duration-300 hover:-translate-y-0.5 hover:bg-[#132235]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Enter the Archive'}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#ece4d8]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white/55 px-4 text-[10px] uppercase tracking-[0.36em] text-[#a8b0ba]">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-white/35 bg-white/45 text-[#46505d] shadow-none backdrop-blur-sm hover:bg-white/60"
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-[0.35rem] bg-[#5a6675]/85 text-[10px] text-white">
                        G
                      </span>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-white/35 bg-white/45 text-[#46505d] shadow-none backdrop-blur-sm hover:bg-white/60"
                    >
                      <span className="mr-3 text-[1rem] text-[#1A2E44]"></span>
                      Apple
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="mt-12 flex max-w-3xl flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3 text-[#d1aa74]">
            <span className="h-px w-8 bg-[#e2d8c9]" />
            <span className="text-[10px] uppercase tracking-[0.28em] text-[#a8b0ba]">✦</span>
            <span className="h-px w-8 bg-[#e2d8c9]" />
          </div>
          <p className="max-w-2xl font-serif text-[1.35rem] leading-[1.65] text-[#1A2E44] md:text-[1.8rem]">
            &ldquo;खुदी को कर बुलंद इतना कि हर तक़दीर से पहले,
            <br />
            खुदा बंदे से खुद पूछे बता तेरी रज़ा क्या है।&rdquo;
          </p>
          <p className="mt-4 font-serif italic text-[1rem] text-[#7a8591] md:text-[1.25rem]">
            &mdash; Allama Iqbal
          </p>
        </section>
      </main>

      <footer className="relative z-10 flex flex-col gap-4 px-6 pb-8 pt-10 text-[10px] uppercase tracking-[0.35em] text-[#a8b0ba] md:flex-row md:items-center md:justify-between md:px-12">
        <div>
          © 2024 Kavya Darpan. The Digital Manuscript.
        </div>
        <div className="flex gap-6 md:gap-10">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </div>
      </footer>
    </div>
  );
}
