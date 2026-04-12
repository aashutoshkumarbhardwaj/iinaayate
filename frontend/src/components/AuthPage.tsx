import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { authAPI, setAuthToken } from '../utils/api';

interface AuthPageProps {
  onAuth: () => void;
}

function ManuscriptBackdrop() {
  return (
    <svg
      viewBox="0 0 1600 1200"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full opacity-[0.18] mix-blend-multiply"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <linearGradient id="paper" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fdf7ee" />
          <stop offset="55%" stopColor="#f4ecdf" />
          <stop offset="100%" stopColor="#ede3d2" />
        </linearGradient>
        <radialGradient id="inkGlow" cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#2d2b2a" stopOpacity="0.22" />
          <stop offset="65%" stopColor="#2d2b2a" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#2d2b2a" stopOpacity="0" />
        </radialGradient>
        <path
          id="orbit"
          d="M 800 310 m -220 0 a 220 220 0 1 1 440 0 a 220 220 0 1 1 -440 0"
        />
      </defs>

      <rect width="1600" height="1200" fill="url(#paper)" />
      <circle cx="800" cy="310" r="248" fill="none" stroke="#2b2a29" strokeOpacity="0.18" strokeWidth="2" />
      <circle cx="800" cy="310" r="182" fill="url(#inkGlow)" />

      <text fill="#1f1b18" fillOpacity="0.82" fontSize="28" letterSpacing="0.5">
        <textPath href="#orbit" startOffset="10%">
          खुदी को कर बुलंद इतना कि हर तक़दीर से पहले, खुदा बंदे से खुद पूछे बता तेरी रज़ा क्या है।
        </textPath>
      </text>

      <g transform="translate(320 320)" opacity="0.88">
        <path
          d="M240 140c-18 6-36 20-49 36-17 21-31 46-38 73-7 26-8 55-2 82 3 14 8 28 15 42 13 25 31 47 52 66 9 8 18 15 28 21 11 7 22 13 33 17 8 3 16 5 24 6"
          fill="none"
          stroke="#25221f"
          strokeWidth="24"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M260 86c-31 0-58 12-79 34-15 16-25 35-32 56-7 23-10 47-10 70 0 18 2 36 7 53 5 18 12 34 22 49 12 17 27 32 44 43 16 10 33 16 52 19 19 3 39 2 58-3 20-5 39-14 56-28 16-13 29-28 39-46 10-18 16-37 18-58 2-18 1-36-2-54-5-23-14-44-27-63-13-19-29-35-48-48-17-12-36-20-56-25-14-3-28-4-42-2Z"
          fill="#f5efe4"
          stroke="#2f2a27"
          strokeWidth="8"
          strokeLinejoin="round"
        />
        <path
          d="M247 142c17-14 37-22 61-22 29 0 54 11 75 31 12 11 22 24 29 39 7 15 11 31 11 48 0 18-4 34-12 50-8 16-19 29-34 39-18 12-38 18-61 18-23 0-43-6-61-18-15-10-27-23-35-40-8-15-12-31-12-48 0-22 5-42 16-59 8-13 18-25 24-38Z"
          fill="#d1c0aa"
          fillOpacity="0.28"
        />
        <path
          d="M104 414c42 18 92 16 135 0 17-6 32-15 45-28 19-18 33-41 40-66 4-16 5-33 4-49"
          fill="none"
          stroke="#282522"
          strokeWidth="7"
          strokeLinecap="round"
          strokeOpacity="0.6"
        />
        <path
          d="M338 266c14 46 14 96 6 144-5 29-14 58-25 84"
          fill="none"
          stroke="#282522"
          strokeWidth="6"
          strokeLinecap="round"
          strokeOpacity="0.55"
        />
        <path
          d="M452 290L770 410"
          fill="none"
          stroke="#241f1b"
          strokeWidth="20"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M770 410l28-16c13-7 26-8 39-2l20 9-35 17-27 41-37-11 12-38Z"
          fill="#251f1a"
        />
        <path d="M491 322l231 86" fill="none" stroke="#ecdcc4" strokeWidth="6" strokeLinecap="round" opacity="0.55" />
        <path d="M520 308l231 86" fill="none" stroke="#705e48" strokeWidth="4" strokeLinecap="round" opacity="0.6" />
      </g>

      <g opacity="0.18" fill="#7e6b59">
        <circle cx="250" cy="520" r="5" />
        <circle cx="1210" cy="240" r="5" />
        <circle cx="1240" cy="870" r="6" />
        <circle cx="360" cy="920" r="4" />
        <circle cx="1320" cy="380" r="3" />
      </g>
    </svg>
  );
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
      <Label htmlFor={htmlFor} className="text-[10px] uppercase tracking-[0.28em] text-[#8a93a1]">
        {label}
      </Label>
      <Input
        id={htmlFor}
        type={type}
        placeholder={placeholder}
        className="h-14 rounded-[0.6rem] border-[#dfd6ca] bg-[#ede8df] px-4 text-[0.98rem] text-[#1f2937] placeholder:text-[#b5b6bb] shadow-none focus-visible:border-[#d29a5f] focus-visible:ring-[#d29a5f]/20"
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
    <div className="relative min-h-screen overflow-hidden bg-[#fdf9f3] text-[#1C1C1E]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(228,214,192,0.35),transparent_24%),radial-gradient(circle_at_80%_15%,rgba(243,232,219,0.4),transparent_26%),radial-gradient(circle_at_50%_80%,rgba(235,226,212,0.55),transparent_24%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(253,249,243,0.9)_0%,rgba(253,249,243,0.76)_50%,rgba(253,249,243,0.95)_100%)]" />
      <ManuscriptBackdrop />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-8 lg:px-12 lg:py-8">
        <div className="font-serif text-[1.35rem] font-bold italic text-[#1A2E44] md:text-[2rem]">
         
        </div>
        <div className="text-[10px] uppercase tracking-[0.4em] text-[#9ca3af] md:text-xs">
         
        </div>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-88px)] flex-col items-center px-4 pb-16 pt-2 md:px-6 lg:px-8">
        <section className="relative flex w-full max-w-[640px] flex-col items-center">
          <div className="absolute left-0 top-0 h-10 w-10 border-l-2 border-t-2 border-[#d1aa74] md:h-12 md:w-12" />
          <div className="w-full rounded-[1rem] border border-[#efe4d5] bg-[#fbf7ef]/95 px-5 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-sm md:px-10 md:py-10">
            <div className="text-center">
              <h1 className="font-serif text-[2.4rem] font-bold leading-none text-[#1A2E44] md:text-[3.35rem]">
                प्रवेश
              </h1>
              <p className="mt-5 font-serif italic text-[1.15rem] leading-8 text-[#6f7a86] md:text-[1.35rem]">
                Step into the sanctuary of words.
              </p>
            </div>

            <Tabs defaultValue="login" className="mt-8 w-full">
              <TabsList className="grid h-auto w-full grid-cols-2 rounded-[1.6rem] bg-[#f3ece2] p-1 shadow-inner">
                <TabsTrigger
                  value="login"
                  className="h-14 rounded-[1.25rem] text-[1rem] font-semibold text-[#1C1C1E] data-[state=active]:bg-white data-[state=active]:shadow-[0_6px_18px_rgba(15,23,42,0.08)] md:text-[1.05rem]"
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
                <form onSubmit={handleLogin} className="space-y-6">
                  <AuthField label="Email Address" htmlFor="login-email" type="email" placeholder="shayar@kavyadarpan.com" />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="login-password" className="text-[10px] uppercase tracking-[0.28em] text-[#8a93a1]">
                        Password
                      </Label>
                      <button type="button" className="text-[10px] uppercase tracking-[0.28em] text-[#a36116]">
                        Forgot?
                      </button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className="h-14 rounded-[0.6rem] border-[#dfd6ca] bg-[#ede8df] px-4 text-[0.98rem] text-[#1f2937] placeholder:text-[#b5b6bb] shadow-none focus-visible:border-[#d29a5f] focus-visible:ring-[#d29a5f]/20"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-16 w-full rounded-[1rem] bg-[#03192e] text-[0.95rem] uppercase tracking-[0.22em] text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] hover:bg-[#132235]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Entering...' : 'Enter the Archive'}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#ece4d8]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#fbf7ef] px-4 text-[10px] uppercase tracking-[0.36em] text-[#a8b0ba]">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-[#e8dfd2] bg-[#fbf7ef] text-[#46505d] shadow-none hover:bg-white"
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-[0.35rem] bg-[#5a6675] text-[10px] text-white">
                        G
                      </span>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-[#e8dfd2] bg-[#fbf7ef] text-[#46505d] shadow-none hover:bg-white"
                    >
                      <span className="mr-3 text-[1rem]"></span>
                      Apple
                    </Button>
                  </div>

                  <p className="px-2 pt-2 text-center text-[0.95rem] leading-7 text-[#8a93a1]">
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

                  <div className="text-sm text-[#6f7a86]">
                    <label className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1 rounded border-[#d4cbbb]" required />
                      <span>
                        I agree to the Terms of Service and Privacy Policy
                      </span>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="h-16 w-full rounded-[1rem] bg-[#03192e] text-[0.95rem] uppercase tracking-[0.22em] text-white shadow-[0_18px_30px_rgba(15,23,42,0.18)] hover:bg-[#132235]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating...' : 'Enter the Archive'}
                  </Button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#ece4d8]" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-[#fbf7ef] px-4 text-[10px] uppercase tracking-[0.36em] text-[#a8b0ba]">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-[#e8dfd2] bg-[#fbf7ef] text-[#46505d] shadow-none hover:bg-white"
                    >
                      <span className="mr-3 inline-flex h-6 w-6 items-center justify-center rounded-[0.35rem] bg-[#5a6675] text-[10px] text-white">
                        G
                      </span>
                      Google
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-16 rounded-[1rem] border border-[#e8dfd2] bg-[#fbf7ef] text-[#46505d] shadow-none hover:bg-white"
                    >
                      <span className="mr-3 text-[1rem]"></span>
                      Apple
                    </Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        <section className="mt-10 flex max-w-3xl flex-col items-center text-center">
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
          © 2024 iinaayate. The Digital Manuscript.
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
