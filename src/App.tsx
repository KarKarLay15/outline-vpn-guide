import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  Check,
  Clipboard,
  Cloud,
  CreditCard,
  Download,
  Flame,
  Globe,
  Info,
  Laptop,
  Lock,
  LogOut,
  Moon,
  Shield,
  Sun,
  Terminal,
  TriangleAlert,
  Wrench,
  Zap,
} from 'lucide-react'
import outlineAdminLogin from './assets/outlineadmin-login.png'
import outlineAdminDashboard from './assets/outlineadmin-dashboard.png'

type CalloutVariant = 'tip' | 'warning' | 'info'
type Lang = 'en' | 'my'

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

function useLang() {
  const [lang, setLang] = useState<Lang>(() => {
    const stored = localStorage.getItem('lang')
    return stored === 'en' || stored === 'my' ? stored : 'my'
  })

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  return { lang, setLang }
}

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  })

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}

function useLocalAuth() {
  const [isAuthed, setIsAuthed] = useState<boolean>(() => {
    return localStorage.getItem('guide_authed') === '1'
  })

  function login(passcode: string) {
    if (passcode === '1234') {
      localStorage.setItem('guide_authed', '1')
      setIsAuthed(true)
      return true
    }
    return false
  }

  function logout() {
    localStorage.removeItem('guide_authed')
    setIsAuthed(false)
  }

  return { isAuthed, login, logout }
}

function PasscodeScreen(props: { onLogin: (passcode: string) => boolean }) {
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [lockedUntil, setLockedUntil] = useState<number>(() => {
    const raw = localStorage.getItem('login_lock_until')
    const n = raw ? Number(raw) : 0
    return Number.isFinite(n) ? n : 0
  })

  useEffect(() => {
    const raw = localStorage.getItem('login_lock_until')
    const n = raw ? Number(raw) : 0
    if (Number.isFinite(n)) setLockedUntil(n)
  }, [])

  return (
    <div className="min-h-screen bg-grid">
      <main className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/50 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
                <Lock className="h-8 w-8 text-zinc-900 dark:text-white" />
              </div>
              <h1 className="mt-5 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                Passcode Login
              </h1>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
                Enter the passcode to access the guide.
              </p>
            </div>

            <form
              className="mt-7 space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                const now = Date.now()
                if (lockedUntil && now < lockedUntil) {
                  setError('Too many failed attempts. Please try again later.')
                  return
                }
                const ok = props.onLogin(passcode)
                if (!ok) {
                  const rawCount = localStorage.getItem('login_failed_count')
                  const nextCount = (rawCount ? Number(rawCount) : 0) + 1
                  localStorage.setItem('login_failed_count', String(nextCount))

                  if (nextCount >= 5) {
                    const until = Date.now() + 30_000
                    localStorage.setItem('login_lock_until', String(until))
                    setLockedUntil(until)
                    setError('Too many failed attempts. Please try again later.')
                    return
                  }

                  setError('မှားယွင်းနေပါသည်။ ပြန်လည်ကြိုးစားပါ။')
                  return
                }

                localStorage.removeItem('login_failed_count')
                localStorage.removeItem('login_lock_until')
                setLockedUntil(0)
              }}
            >
              <div className="space-y-2">
                <label
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-200"
                  htmlFor="passcode"
                >
                  Passcode
                </label>
                <div className="rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 shadow-sm transition focus-within:border-zinc-300 focus-within:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:focus-within:border-zinc-700 dark:focus-within:bg-zinc-950">
                  <input
                    id="passcode"
                    autoFocus
                    inputMode="numeric"
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value)
                      setError(null)
                    }}
                    placeholder="Enter Passcode"
                    disabled={Boolean(lockedUntil && Date.now() < lockedUntil)}
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500 sm:text-base"
                  />
                </div>
                {error ? (
                  <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">
                    {error}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl border border-zinc-200 bg-white/70 px-4 py-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-white active:translate-y-px dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-100 dark:hover:bg-zinc-950 sm:text-base"
              >
                Login
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
            𝙼𝚊𝚍𝚎 𝚠𝚒𝚝𝚑 ❤ 𝚋𝚢 𝗸𝗸𝗿𝗲𝗺𝗼𝘁𝗲𝗿.𝗰𝗼𝗺 𝚏𝚘𝚛 𝙵𝚁𝙴𝙴 𝚒𝚗𝚝𝚎𝚛𝚗𝚎𝚝
          </p>
        </div>
      </main>
    </div>
  )
}

function Callout(props: {
  variant: CalloutVariant
  title: string
  children: React.ReactNode
}) {
  const meta = useMemo(() => {
    switch (props.variant) {
      case 'tip':
        return {
          icon: <Info className="h-4 w-4" />,
          cls: 'border-emerald-300/50 bg-emerald-50/60 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-50',
          badge: 'TIP',
        }
      case 'warning':
        return {
          icon: <TriangleAlert className="h-4 w-4" />,
          cls: 'border-amber-300/60 bg-amber-50/70 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-50',
          badge: 'WARNING',
        }
      case 'info':
      default:
        return {
          icon: <Shield className="h-4 w-4" />,
          cls: 'border-sky-300/60 bg-sky-50/70 text-sky-950 dark:border-sky-500/30 dark:bg-sky-950/30 dark:text-sky-50',
          badge: 'NOTE',
        }
    }
  }, [props.variant])

  return (
    <div className={cn('rounded-2xl border p-4', meta.cls)}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{meta.icon}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-black/10 bg-white/40 px-2 py-0.5 text-[10px] font-bold tracking-wide dark:border-white/10 dark:bg-black/20">
              {meta.badge}
            </span>
            <p className="text-sm font-semibold">{props.title}</p>
          </div>
          <div className="mt-2 text-sm leading-6 opacity-95">{props.children}</div>
        </div>
      </div>
    </div>
  )
}

function CodeBlock(props: {
  title?: string
  code: string
  hint?: string
  description?: string
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  async function onCopy() {
    await navigator.clipboard.writeText(props.code.trimEnd() + '\n')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div
      className={cn(
        'rounded-2xl border border-zinc-200 bg-white/70 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40',
        props.className,
      )}
    >
      <div className="flex flex-col gap-3 border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/70 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          {props.title ? (
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
              {props.title}
            </p>
          ) : (
            <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
              Commands
            </p>
          )}
          {props.description ? (
            <p className="mt-1 text-xs leading-5 text-zinc-600 dark:text-zinc-300 sm:text-sm">
              {props.description}
            </p>
          ) : null}
          {props.hint ? (
            <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
              {props.hint}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:translate-y-px dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 sm:w-auto sm:px-3 sm:py-2 sm:text-xs"
          aria-label="Copy commands to clipboard"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Clipboard className="h-4 w-4" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="h-auto max-w-full overflow-x-auto bg-zinc-950 px-4 py-4 text-xs leading-6 text-zinc-100 sm:text-sm">
        <code className="font-mono whitespace-pre-wrap break-words">
          {props.code.trimEnd()}
        </code>
      </pre>
    </div>
  )
}

function TimelineSection(props: {
  id: string
  step: number
  icon: React.ReactNode
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section id={props.id} className="scroll-mt-28">
      <div className="relative pl-10 sm:pl-12">
        <div className="absolute left-3 top-0 h-full w-px bg-zinc-200 dark:bg-zinc-800" />
        <div className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full border border-zinc-200 bg-white text-xs font-bold text-zinc-800 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100">
          {props.step}
        </div>

        <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/50 sm:p-8">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              {props.icon}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-2xl">
                {props.title}
              </h2>
              {props.subtitle ? (
                <p className="mt-1 text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
                  {props.subtitle}
                </p>
              ) : null}
            </div>
          </div>
          <div className="mt-6 space-y-5">{props.children}</div>
        </div>
      </div>
    </section>
  )
}

type PreviewImage = {
  id: 'login' | 'dashboard'
  src: string
  alt: string
  captionMy: string
  captionEn: string
}

function App() {
  const { theme, setTheme } = useTheme()
  const { lang, setLang } = useLang()
  const auth = useLocalAuth()
  const t = (en: string, my: string) => (lang === 'my' ? my : en)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewActive, setPreviewActive] = useState<'login' | 'dashboard'>(
    'login',
  )

  const adminPreviews: PreviewImage[] = useMemo(
    () => [
      {
        id: 'login',
        src: outlineAdminLogin,
        alt: 'Outline Admin login screen preview',
        captionMy: 'Login Screen ပုံစံ',
        captionEn: 'Login screen preview',
      },
      {
        id: 'dashboard',
        src: outlineAdminDashboard,
        alt: 'Outline Admin dashboard preview',
        captionMy: 'Dashboard ပုံစံ',
        captionEn: 'Dashboard preview',
      },
    ],
    [],
  )

  useEffect(() => {
    try {
      console.clear()
    } catch {
      // ignore
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const isMac = navigator.platform.toLowerCase().includes('mac')
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey

      const blocked =
        e.key === 'F12' ||
        (ctrlOrCmd && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) ||
        (ctrlOrCmd && key === 'u')

      if (blocked) {
        e.preventDefault()
        e.stopPropagation()
      }
    }

    window.addEventListener('contextmenu', onContextMenu)
    window.addEventListener('keydown', onKeyDown, { capture: true })

    return () => {
      window.removeEventListener('contextmenu', onContextMenu)
      window.removeEventListener('keydown', onKeyDown, { capture: true } as never)
    }
  }, [])

  const nav = useMemo(
    () => [
      {
        id: 'sec1-credit',
        label: lang === 'my' ? 'Credit (ကရက်ဒစ်)' : 'Credit',
        icon: <CreditCard className="h-4 w-4" />,
      },
      {
        id: 'sec2-droplet',
        label: lang === 'my' ? 'Droplet (ဆာဗာ)' : 'Droplet',
        icon: <Cloud className="h-4 w-4" />,
      },
      {
        id: 'sec3-prep-bbr',
        label: lang === 'my' ? 'Prep + BBR' : 'Prep + BBR',
        icon: <Flame className="h-4 w-4" />,
      },
      {
        id: 'sec4-outline',
        label: lang === 'my' ? 'Outline' : 'Outline',
        icon: <Download className="h-4 w-4" />,
      },
      {
        id: 'sec5-final',
        label: lang === 'my' ? 'Finalize (ပြီးစီး)' : 'Finalize',
        icon: <Lock className="h-4 w-4" />,
      },
      {
        id: 'sec6-admin',
        label: lang === 'my' ? 'Admin UI' : 'Admin UI',
        icon: <Shield className="h-4 w-4" />,
      },
      {
        id: 'sec7-dynamic-keys',
        label: lang === 'my' ? 'Dynamic Keys' : 'Dynamic Keys',
        icon: <Zap className="h-4 w-4" />,
      },
      {
        id: 'sec8-command-cards',
        label: lang === 'my' ? 'Commands' : 'Commands',
        icon: <Terminal className="h-4 w-4" />,
      },
    ],
    [lang],
  )

  if (!auth.isAuthed) {
    return <PasscodeScreen onLogin={auth.login} />
  }

  return (
    <div className="min-h-screen bg-grid protect-content">
      {previewOpen ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="w-full max-w-4xl rounded-3xl border border-white/10 bg-zinc-950/80 p-3 shadow-2xl backdrop-blur"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-2 py-2">
              <p className="text-sm font-semibold text-white">
                {t('Preview', 'Preview')} •{' '}
                {t(
                  adminPreviews.find((i) => i.id === previewActive)?.captionEn ??
                    'Preview',
                  adminPreviews.find((i) => i.id === previewActive)?.captionMy ??
                    'Preview',
                )}
              </p>
              <button
                type="button"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/10"
                onClick={() => setPreviewOpen(false)}
              >
                {t('Close', 'Close')}
              </button>
            </div>
            <div className="px-2 pb-2">
              <img
                src={adminPreviews.find((i) => i.id === previewActive)?.src}
                alt={adminPreviews.find((i) => i.id === previewActive)?.alt ?? 'Preview'}
                className="h-auto w-full rounded-2xl shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-50 border-b border-zinc-200/60 bg-white/70 backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
              {t(
                'DigitalOcean $200 Free Credit + Outline VPN Setup Guide',
                'DigitalOcean $200 Free Credit + Outline VPN Setup Guide (MM)',
              )}
            </p>
            <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">
              {t(
                'Notebook Method style • English / Burmese • Commands in English',
                'Notebook Method style • Burmese instructions + English commands',
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#sec1-credit"
              className="hidden items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:translate-y-px dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900 sm:inline-flex"
            >
              Start Setup <ArrowRight className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => setLang(lang === 'my' ? 'en' : 'my')}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:translate-y-px dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              aria-label="Toggle language"
            >
              {lang === 'my' ? 'ENG' : 'MYM'}
            </button>
            <button
              type="button"
              onClick={() => auth.logout()}
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 shadow-sm transition hover:bg-zinc-50 active:translate-y-px dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 dark:hover:bg-zinc-900"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
            <button
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white p-2 text-zinc-800 shadow-sm transition hover:bg-zinc-50 active:translate-y-px dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <nav className="border-t border-zinc-200/60 dark:border-zinc-800/60">
          <div className="mx-auto max-w-6xl overflow-x-auto px-4 py-2 sm:px-6">
            <div className="flex min-w-max items-center gap-2">
              {nav.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-zinc-200 bg-white/70 px-3 py-2.5 text-sm font-semibold text-zinc-700 shadow-sm transition hover:bg-white dark:border-zinc-800 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-950 sm:py-2 sm:text-xs"
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/70 p-6 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/50 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs font-semibold text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950/50 dark:text-zinc-200">
                <Globe className="h-4 w-4" />
                Singapore / Sydney • Basic $6/mo
              </p>
              <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white sm:text-4xl">
                {t(
                  'DigitalOcean $200 Free Credit + Outline VPN Setup',
                  'DigitalOcean $200 Free Credit + Outline VPN Setup (မြန်မာ)',
                )}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-300 sm:text-base">
                {t(
                  'A beginner-friendly, step-by-step “Notebook Method” guide. Commands are copyable.',
                  'ဒီစာမျက်နှာက “Notebook Method” ပုံစံနဲ့ မြန်မာလို စနစ်တကျ အဆင့်လိုက်ရေးထားတဲ့ Setup Guide ပါ။ Command တွေကိုတော့ copy လုပ်လို့ရအောင် English နဲ့ထားပါတယ်။',
                )}
              </p>
            </div>
            <div className="grid gap-2 sm:w-64">
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="flex items-center gap-2 font-semibold text-zinc-900 dark:text-white">
                  <Laptop className="h-4 w-4" />
                  {t('What you need', 'လိုအပ်သည့်အရာများ')}
                </p>
                <ul className="mt-2 space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    {t('DigitalOcean account (valid card)', 'DigitalOcean account (valid card)')}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    {t('Ubuntu Droplet (recommended)', 'Ubuntu Droplet (recommended)')}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                    {t('SSH access (Terminal)', 'SSH access (Terminal)')}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          <TimelineSection
            id="sec1-credit"
            step={1}
            icon={<CreditCard className="h-5 w-5 text-sky-700 dark:text-sky-200" />}
            title={
              lang === 'my'
                ? 'Section 1: $200 Free Credit Claim'
                : 'Section 1: $200 Free Credit Claim'
            }
            subtitle={
              lang === 'my'
                ? 'Account အသစ်ဖွင့်ပြီး $200 credit ကို claim လုပ်ပါ'
                : 'Create a new account and claim the $200 credit.'
            }
          >
            <p className="text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
              {lang === 'my'
                ? 'အောက်ပါ Link တစ်ခုခုကို အသုံးပြုပြီး Account အသစ်ဖွင့်မှသာ $200 Credit ရရှိမှာဖြစ်ပါတယ်။'
                : 'You must sign up with a NEW account using one of the links below to receive the $200 credit.'}
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href="https://www.digitalocean.com/go/developer-brand"
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-sky-200/70 bg-sky-50/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 dark:border-sky-500/20 dark:bg-sky-950/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-sky-950 dark:text-sky-50">
                      {t('Claim via Official Promo', 'Official Promo ဖြင့် Claim လုပ်ပါ')}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-sky-900/80 dark:text-sky-100/80">
                      {t(
                        "This is a direct offer from DigitalOcean (official promo).",
                        'DigitalOcean က တိုက်ရိုက်ပေးတဲ့ offer (Official promo) ဖြစ်ပါတယ်။',
                      )}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-200 bg-white/70 text-sky-700 shadow-sm transition group-hover:bg-white dark:border-sky-500/20 dark:bg-black/20 dark:text-sky-200">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 truncate text-xs font-semibold text-sky-700 dark:text-sky-200">
                  digitalocean.com/go/developer-brand
                </p>
              </a>

              <a
                href="https://m.do.co/c/28c8959f6b5b"
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border border-violet-200/70 bg-violet-50/60 p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-violet-50 dark:border-violet-500/20 dark:bg-violet-950/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-violet-950 dark:text-violet-50">
                      {t('Claim via Referral Link', 'Referral Link ဖြင့် Claim လုပ်ပါ')}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-violet-900/80 dark:text-violet-100/80">
                      {t(
                        'This is the most common way users claim the $200 credit.',
                        'User အများစုက $200 credit ကို ဒီ referral link နဲ့ရယူကြတာ အများဆုံးပါ။',
                      )}
                    </p>
                  </div>
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-200 bg-white/70 text-violet-700 shadow-sm transition group-hover:bg-white dark:border-violet-500/20 dark:bg-black/20 dark:text-violet-200">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <p className="mt-3 truncate text-xs font-semibold text-violet-700 dark:text-violet-200">
                  m.do.co/c/28c8959f6b5b
                </p>
              </a>
            </div>

            <Callout
              variant="warning"
              title={
                lang === 'my'
                  ? 'အကောင့်အသစ်နှင့် ကတ်အသစ် ဖြစ်ရပါမည်။ VPN ပိတ်ပြီးမှ အကောင့်ဖွင့်ပါ။'
                  : 'Use a NEW account + NEW card. Turn OFF VPN during signup.'
              }
            >
              {lang === 'my'
                ? 'အကောင့်ဖွင့်နေစဉ်အတွင်း VPN ဖွင့်ထားရင် Fraud အဖြစ်သတ်မှတ်ပြီး disable လုပ်တတ်ပါတယ်။'
                : 'Using a VPN while signing up may trigger fraud checks and your account can be disabled.'}
            </Callout>
          </TimelineSection>

          <TimelineSection
            id="sec2-droplet"
            step={2}
            icon={<Cloud className="h-5 w-5 text-emerald-700 dark:text-emerald-200" />}
            title={lang === 'my' ? 'Section 2: Droplet Configuration' : 'Section 2: Droplet Configuration'}
            subtitle={
              lang === 'my'
                ? 'Region/Plan/OS/Auth ကို beginner-friendly အတိုင်းရွေးပါ'
                : 'Choose region/plan/OS/auth with beginner-friendly settings.'
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {t('Region (recommended for Myanmar)', 'Region (မြန်မာအတွက် အကြံပြု)')}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  {t('Singapore ', 'Singapore ')}
                  <span className="font-semibold">(SGP1)</span>
                  {t(' or Sydney ', ' သို့မဟုတ် Sydney ')}
                  <span className="font-semibold">(SYD1)</span>
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  Plan + OS
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  Basic <span className="font-semibold">($6/mo)</span> • Ubuntu{' '}
                  <span className="font-semibold">24.04 LTS</span>
                </p>
              </div>
            </div>

            <Callout variant="info" title={t('Auth (for beginners)', 'Auth (Beginner အတွက်)')}>
              {lang === 'my'
                ? 'Password method ကို beginner အတွက် recommend လုပ်ပါတယ်။ Password ကို ခန့်မှန်းခက်အောင် strong ထားပါ။'
                : 'For beginners, the password method is recommended. Use a strong password.'}
            </Callout>
          </TimelineSection>

          <TimelineSection
            id="sec3-prep-bbr"
            step={3}
            icon={<Wrench className="h-5 w-5 text-amber-700 dark:text-amber-200" />}
            title={
              lang === 'my'
                ? 'Section 3: Server Preparation & Optimization (BBR)'
                : 'Section 3: Server Preparation & Optimization (BBR)'
            }
            subtitle={
              lang === 'my'
                ? 'Server ကို update လုပ်ပြီး BBR speed boost ကို enable လုပ်ပါ'
                : 'Update the server and enable BBR for better speed/latency.'
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CodeBlock
                title={t('Step 1 — Update', 'Step 1 — Update')}
                description={t('Update packages first.', 'Package list/update ကို အရင်လုပ်ပါ')}
                code={`sudo apt update && sudo apt upgrade -y`}
              />
              <CodeBlock
                title={t('Step 2 — BBR Speed Boost', 'Step 2 — BBR Speed Boost')}
                description={t(
                  'Enable BBR for better speed/latency.',
                  'BBR algorithm ကို enable လုပ်ပြီး speed/latency ကိုတိုးနိုင်ပါတယ်',
                )}
                code={`echo "net.core.default_qdisc=fq" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p`}
              />
            </div>
          </TimelineSection>

          <TimelineSection
            id="sec4-outline"
            step={4}
            icon={<Download className="h-5 w-5 text-violet-700 dark:text-violet-200" />}
            title={lang === 'my' ? 'Section 4: Outline Installation' : 'Section 4: Outline Installation'}
            subtitle={
              lang === 'my'
                ? 'Docker တပ်ဆင်ပြီး Outline server ကို install လုပ်ပါ'
                : 'Install Docker, then install the Outline server.'
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CodeBlock
                title={t(
                  'Step 1 — Install Docker',
                  'Step 1 — Docker တပ်ဆင်ခြင်း (Install Docker)',
                )}
                description={t(
                  'Install Docker (required to run Outline).',
                  'Outline VPN ကို Run ရန်အတွက် အခြေခံ လိုအပ်ချက်ဖြစ်သော Docker ကို တပ်ဆင်ခြင်း။',
                )}
                code={`curl -sS https://get.docker.com/ | sh`}
              />
              <CodeBlock
                title={t(
                  'Step 2 — Install Outline Server',
                  'Step 2 — Outline Server တပ်ဆင်ခြင်း (Setup Outline)',
                )}
                description={t(
                  'After running, copy the JSON output and paste it into Outline Manager.',
                  'ဤ Command ကို Run ပြီးပါက ထွက်လာသော JSON code ကို Outline Manager တွင် ထည့်သွင်းရမည်။',
                )}
                code={`sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/Jigsaw-Code/outline-server/master/src/server_manager/install_scripts/install_server.sh)"`}
              />
            </div>
          </TimelineSection>

          <TimelineSection
            id="sec5-final"
            step={5}
            icon={<Lock className="h-5 w-5 text-rose-700 dark:text-rose-200" />}
            title={lang === 'my' ? 'Section 5: Finalizing Setup' : 'Section 5: Finalizing Setup'}
            subtitle={
              lang === 'my'
                ? 'Ports ဖွင့်၊ firewall စစ်၊ JSON ကို Outline Manager ထဲထည့်ပါ'
                : 'Open ports, configure firewall, and paste the JSON into Outline Manager.'
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                  {t('Port Opening (Important)', 'Port Opening (အရေးကြီး)')}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  {t(
                    'Open ports ',
                    'DigitalOcean Firewall (Cloud Firewall) / Network rules မှာ port ',
                  )}
                  <span className="font-semibold">4642</span>
                  {t(' and ', ' နဲ့ ')}
                  <span className="font-semibold">43405</span>
                  {t('.', ' ကို ဖွင့်ထားရပါမယ်။')}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                  {t('Firewall Management', 'Firewall Management')}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  {t('Choose Option A or Option B below.', 'အောက်က Option (A) သို့မဟုတ် (B) တစ်ခုကိုရွေးပါ။')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                  {t('Option A: The Simple Way (All Ports Open)', 'Option A: The Simple Way (All Ports Open)')}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  {t(
                    'The easiest approach; disables firewall (all ports open).',
                    'အလွယ်ကူဆုံးနည်းလမ်းဖြစ်ပြီး Port အားလုံးကို ပွင့်စေပါသည်။',
                  )}
                </p>
                <div className="mt-3">
                  <CodeBlock
                    title={t('UFW Disable', 'UFW Disable')}
                    description={t('Disable firewall', 'Firewall ကိုပိတ်လိုက်ခြင်း (All ports open)')}
                    code={`sudo ufw disable`}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                  {t('Option B: The Secure Way (Specific Ports Only)', 'Option B: The Secure Way (Specific Ports Only)')}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  {t(
                    'More secure; only allow the required ports.',
                    'လုံခြုံရေးအတွက် လိုအပ်သော Port များကိုသာ သီးသန့်ဖွင့်ခြင်း။',
                  )}
                </p>
                <div className="mt-3 space-y-3">
                  <CodeBlock
                    title={t('1) Allow SSH (22/tcp)', '1) Allow SSH (22/tcp)')}
                    description={t(
                      'SSH (most important).',
                      'SSH အတွက် - ဤအချက်သည် အရေးကြီးဆုံးဖြစ်သည်',
                    )}
                    code={`sudo ufw allow 22/tcp`}
                  />
                  <CodeBlock
                    title={t(
                      '2) Allow Management Port (4642/tcp)',
                      '2) Allow Management Port (4642/tcp)',
                    )}
                    description={t('Management port', 'Management Port')}
                    code={`sudo ufw allow 4642/tcp`}
                  />
                  <CodeBlock
                    title={t(
                      '3) Allow Access Key Port (43405/tcp)',
                      '3) Allow Access Key Port (43405/tcp)',
                    )}
                    description={t('Access key port', 'Access Key Port')}
                    code={`sudo ufw allow 43405/tcp`}
                  />
                  <CodeBlock
                    title={t(
                      '4) Allow Access Key Port (43405/udp)',
                      '4) Allow Access Key Port (43405/udp)',
                    )}
                    description={t('Access key port', 'Access Key Port')}
                    code={`sudo ufw allow 43405/udp`}
                  />
                  <CodeBlock
                    title={t('5) Enable Firewall', '5) Enable Firewall')}
                    description={t('Enable firewall', 'Firewall ကို စတင်အသုံးပြုရန်')}
                    code={`sudo ufw enable`}
                  />
                </div>
              </div>
            </div>

            <Callout
              variant="warning"
              title={t(
                'Warning: If you use Option B, you MUST allow SSH port 22 first. Otherwise you may lose SSH access.',
                'သတိပြုရန် - Option B ကို အသုံးပြုပါက SSH Port 22 ကို မဖြစ်မနေ အရင် allow လုပ်ရပါမည်။ မဟုတ်ပါက Server အတွင်းသို့ ပြန်လည် Login ဝင်၍ ရတော့မည် မဟုတ်ပါ။',
              )}
            >
              {lang === 'my' ? (
                <>
                  Option B ကိုလုပ်မယ်ဆိုရင် <span className="font-semibold">ပထမဆုံး</span> `sudo ufw allow 22/tcp`
                  ကို run လုပ်ပြီးမှသာ firewall enable လုပ်ပါ။
                </>
              ) : (
                'Run `sudo ufw allow 22/tcp` first, then enable the firewall.'
              )}
            </Callout>

            <Callout variant="tip" title={t('How to use (Outline Manager)', 'How to use (Outline Manager)')}>
              {t(
                'After installing Outline, copy the JSON output and paste it into Outline Manager.',
                'Outline install command run ပြီးနောက် ထွက်လာတဲ့ JSON output ကို copy လုပ်ပြီး Outline Manager ထဲမှာ paste ထည့်ပါ။',
              )}
            </Callout>
          </TimelineSection>

          <TimelineSection
            id="sec6-admin"
            step={6}
            icon={<Shield className="h-5 w-5 text-sky-700 dark:text-sky-200" />}
            title={
              lang === 'my'
                ? 'Advanced Section: Outline Admin (Web Interface Setup)'
                : 'Advanced: Outline Admin (Web Interface Setup)'
            }
            subtitle={
              lang === 'my'
                ? 'Outline keys ကို web UI နဲ့ စီမံခန့်ခွဲရန် (Advanced)'
                : 'Manage Outline keys with a web UI (advanced).'
            }
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CodeBlock
                title={t('Step 1 — Clone the Repository', 'Step 1 — Repository ကို Clone လုပ်ခြင်း')}
                description={t(
                  'Clone OutlineAdmin and enter the directory.',
                  'OutlineAdmin project ကို server ထဲမှာ download လုပ်ပြီး folder ထဲဝင်ပါ',
                )}
                code={`git clone https://github.com/AmRo045/OutlineAdmin.git && cd OutlineAdmin`}
              />
              <CodeBlock
                title={t('Step 2 — Start with Docker Compose', 'Step 2 — Docker Compose နဲ့ Run ချင်တယ်')}
                description={t('Run services in the background.', 'Service တွေကို background မှာ run လုပ်ပါ')}
                code={`docker compose up -d`}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/40">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                  {t('Screenshot / Preview', 'Screenshot / Preview')}
                </p>
                <div className="mt-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {adminPreviews.map((img) => (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => {
                          setPreviewActive(img.id)
                          setPreviewOpen(true)
                        }}
                        className={cn(
                          'rounded-2xl border bg-white/40 p-2 text-left transition hover:bg-white/60 dark:bg-black/20 dark:hover:bg-black/30',
                          previewActive === img.id
                            ? 'border-zinc-300 dark:border-zinc-700'
                            : 'border-zinc-200/70 dark:border-zinc-800/70',
                        )}
                        aria-label={img.alt}
                      >
                        <img
                          src={img.src}
                          alt={img.alt}
                          className="h-28 w-full rounded-lg object-cover shadow-lg"
                          loading="lazy"
                        />
                        <p className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                          {t(img.captionEn, img.captionMy)}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs leading-5 text-zinc-600 dark:text-zinc-300">
                    {t(
                      'Tap an image to expand.',
                      'ပုံကိုနှိပ်ပြီး အကြီးကြည့်နိုင်ပါတယ်။',
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                    {t('Step 3 — Accessing the Admin Panel', 'Step 3 — Accessing the Admin Panel')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                    {t('URL: ', 'ဝင်ရောက်ရန် URL မှာ ')}
                    <span className="font-semibold">http://your_server_ip:3000</span>
                    {t('', ' ဖြစ်ပါသည်။')}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white/70 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                    {t('Step 4 — Login Information', 'Step 4 — Login Information')}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                    {t('Default password: ', 'Default password မှာ ')}
                    <span className="font-semibold">"123456"</span>
                    {t('', ' ဖြစ်ပါသည်။')}
                  </p>
                </div>

                <Callout
                  variant="warning"
                  title={t('Change the default password immediately', 'Default password ကို ချက်ချင်းပြောင်းပါ')}
                >
                  {lang === 'my' ? (
                    <>
                      Default password (<span className="font-semibold">123456</span>) နဲ့ထားရင် လုံခြုံမှုမရှိပါ။
                      ဝင်ပြီးတာနဲ့ ချက်ချင်း strong password ပြောင်းရန် အကြံပြုပါသည်။
                    </>
                  ) : (
                    <>
                      The default password (<span className="font-semibold">123456</span>) is not secure. Change it
                      immediately after logging in.
                    </>
                  )}
                </Callout>
              </div>
            </div>
          </TimelineSection>

          <TimelineSection
            id="sec7-dynamic-keys"
            step={7}
            icon={<Zap className="h-5 w-5 text-emerald-500 dark:text-emerald-300" />}
            title={t('Advanced: Dynamic Access Keys', 'Advanced: Dynamic Access Keys (Dynamic Keys)')}
            subtitle={t(
              'Data limits, time windows, and centralized control (advanced).',
              'Data limit (GB) / Time limit (ရက်) / Centralized control (Advanced)',
            )}
          >
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-3xl border border-zinc-200/80 bg-zinc-950/5 p-5 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/40 sm:p-6">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                  {t('Part 1 — What is it?', 'အပိုင်း(၁) — ဘာလဲ? (What is it?)')}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  {t(
                    'Dynamic Keys let you set per-user data limits, time-limited access, and control keys centrally (great for resellers/teams).',
                    'Dynamic Keys တွေက Data limit (GB), Time limit (ရက်) နဲ့ Centralized control (စနစ်တကျ ထိန်းချုပ်မှု) ကို အသုံးပြုနိုင်ပါတယ် — reseller/team အတွက်အဆင်ပြေပါတယ်။',
                  )}
                </p>
                {lang === 'my' ? (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-800 dark:text-zinc-200 sm:text-base">
                    <li>User တစ်ဦးချင်းစီအလိုက် Data Limit (GB) သတ်မှတ်နိုင်ခြင်း</li>
                    <li>ရက်အကန့်အသတ်ဖြင့် သုံးစွဲခွင့်ပေးနိုင်ခြင်း (ဥပမာ - ၃၀ ရက်)</li>
                    <li>Key တစ်ခုချင်းစီကို Real-time စောင့်ကြည့် ထိန်းချုပ်နိုင်ခြင်း</li>
                  </ul>
                ) : (
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-zinc-800 dark:text-zinc-200 sm:text-base">
                    <li>Set a per-user data limit in GB</li>
                    <li>Grant time-limited access (example: 30 days)</li>
                    <li>Monitor and control each key in near real time</li>
                  </ul>
                )}
                <div className="mt-4">
                  <Callout
                    variant="info"
                    title={t('Info', 'မှတ်သားရန်')}
                  >
                    {lang === 'my' ? (
                      'ဤ Feature သည် VPN ကို စနစ်တကျ ပြန်လည်ရောင်းချလိုသူများ သို့မဟုတ် User များပြားသူများအတွက် အထူးသင့်လျော်ပါသည်။'
                    ) : (
                      'This feature is best suited for people who resell VPN access at scale, or who manage many users with tight controls.'
                    )}
                  </Callout>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200/80 bg-zinc-950/5 p-5 shadow-sm backdrop-blur dark:border-zinc-800/60 dark:bg-zinc-950/40 sm:p-6">
                <p className="text-sm font-semibold text-zinc-900 dark:text-white sm:text-base">
                  {t('Part 2 — How to use it?', 'အပိုင်း(၂) — ဘယ်လိုသုံးမလဲ? (How to)')}
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-700 dark:text-zinc-200 sm:text-base">
                  {t(
                    'To use Dynamic Keys in practice, you typically manage them via Outline Admin Web UI, or via automation APIs (e.g. Shadowbox API) depending on your stack.',
                    'Dynamic Key ကို အသုံးပြုရန် Outline Admin Web UI သို့မဟုတ် Shadowbox API ကို အသုံးပြုရပါမည်။',
                  )}
                </p>

                <div className="mt-4">
                  <CodeBlock
                    title={t('Concept: limit rule (JSON example)', 'Concept: limit rule (JSON example)')}
                    description={t('Illustration only (not a full API request).', 'ဥပမာ concept ပါ (API request အပြည့်အစုံ မဟုတ်ပါ)။')}
                    code={`{
  "limit": {"bytes": 5000000000},
  "description": "5GB Monthly Limit"
}`}
                  />
                </div>
              </div>
            </div>
          </TimelineSection>

          <TimelineSection
            id="sec8-command-cards"
            step={8}
            icon={<Terminal className="h-5 w-5 text-zinc-900 dark:text-zinc-100" />}
            title={t('Command Quick Reference', 'Command များ (Quick Reference)')}
            subtitle={t(
              'One-click copy: Docker / Outline / BBR / Firewall / Outline Admin',
              'Command တချို့များကို copy လုပ်လွယ်အောင် စုစည်းထားသည်။',
            )}
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <CodeBlock
                title={t('Docker installation (get.docker.com)', 'Docker တပ်ဆင်ခြင်း')}
                description={t('Install the official Docker engine on Ubuntu.', 'Ubuntu ပေါ်မှာ official Docker install လုပ်ရန်။')}
                code={`curl -sS https://get.docker.com/ | sh`}
              />
              <CodeBlock
                title={t('Outline server install (official script)', 'Outline Server တပ်ဆင်ခြင်း')}
                description={t('Run the official installation script to deploy Outline server.', 'Official script သုံးပြီး Outline server install လုပ်ရန်။')}
                code={`sudo bash -c "$(wget -qO- https://raw.githubusercontent.com/Jigsaw-Code/outline-server/master/src/server_manager/install_scripts/install_server.sh)"`}
              />
              <CodeBlock
                title={t('BBR optimization (fq + bbr)', 'BBR ဖြင့် လိုင်းမြန်အောင်')}
                description={t(
                  'Enable BBR (fq + bbr) via sysctl.',
                  'sysctl ကနေ BBR enable လုပ်ပြီး network ကို ချောမွနေအောင်။',
                )}
                code={`echo "net.core.default_qdisc=fq" | sudo tee -a /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p`}
              />
              <CodeBlock
                title={t('Firewall setup (UFW allow required ports)', 'Firewall (UFW) — လိုအပ်သောနေရာတက်မလာအောင်')}
                description={t('Allow SSH + Outline-related ports, then enable UFW.', 'SSH/Outline port တွေကိုခွင့် ပေးပြီး UFW enable လုပ်ပါ။')}
                code={`sudo ufw allow 22/tcp
sudo ufw allow 4642/tcp
sudo ufw allow 43405/tcp
sudo ufw allow 43405/udp
sudo ufw enable`}
              />
              <CodeBlock
                className="sm:col-span-2"
                title={t('Outline Admin setup (clone + docker compose)', 'Outline Admin တပ်ဆင်ခြင်း')}
                description={t('Clone OutlineAdmin, then start it with docker compose.', 'Repo clone လုပ်ပြီး docker compose ဖြင့် run ပါ။')}
                code={`git clone https://github.com/AmRo045/OutlineAdmin.git && cd OutlineAdmin
docker compose up -d`}
              />
            </div>
          </TimelineSection>
        </div>
      </main>
    </div>
  )
}

export default App
