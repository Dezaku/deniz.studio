import { useState, useEffect, type FormEvent } from "react"
import "../styles/globals.css"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckIcon, ChevronDownIcon } from "lucide-react"
import { getCalApi } from "@calcom/embed-react"

// The "Discovery Call" event (titled that in Cal, but its URL slug is still "intro").
const CAL_LINK = "denizkumral/intro"
const CAL_NS = "intro"

// What the Cal popup is prefilled with on submit — flip this one line to switch:
//   "email-only"   → just name + email. Answers reach you only via the form email. (Option A)
//   "with-answers" → maps each answer into its matching Cal booking question. (Option B)
const CAL_PREFILL_MODE: "email-only" | "with-answers" = "email-only"

// Cal booking-question identifiers, read from the setup video. `company` was not shown —
// confirm it in Cal (event → Booking form → Company → Edit → Identifier).
const CAL_FIELDS = {
  service: "service",    // "What are you looking for?" (MultiSelect)
  budget: "budget",      // "Budget" (Select)
  howFound: "how-found", // "How did you find me?" (Select)
  company: "company",    // "Company" (Short Text) — CONFIRM
  notes: "notes",        // "Additional notes" (Long Text)
}

// A Cal Select/MultiSelect only prefills when the value matches one of its options exactly.
// These are aligned by index with the form's option lists (below), so both the EN and DE
// forms submit the exact Cal strings no matter what their own labels say.
const CAL_SERVICE_VALUES = ["Brand Identity", "Logo", "Website", "Other"] // ↔ reasons: Branding, Logo, Landing Page, Other
const CAL_BUDGET_VALUES = ["$2,5k-$3,5k", "$3,5k-$5k", "$5k-$10k", ">$10k"] // ↔ BUDGETS
const CAL_SOURCE_VALUES = ["X (Twitter)", "Word of mouth", "Google (Search Engine)", "Telegram", "Other"] // ↔ sources: X, referral, Google, Telegram, Other

const BUDGETS = ["$2,5k-$3,5k", "$3,5k-$5k", "$5k-$10k", ">$10k"]

// All visible form text per language. The German homepage (/de/) passes lang="de".
const STRINGS = {
  en: {
    reasons: ["Brand Identity", "Logo", "Website", "Other"],
    sources: ["X (Twitter)", "Word of mouth", "Google (Search Engine)", "Telegram", "Other"],
    alertReason: "Please select at least one option for 'What are you looking for?'",
    alertBudget: "Please select a budget.",
    alertError: "Something went wrong. Please try emailing me directly at mail@deniz.studio.",
    scheduleTitle: "One last step",
    scheduleText: "Your details are in. Pick a time for a quick intro call and we're all set.",
    pickTime: "Pick a time",
    bookedTitle: "You're booked!",
    bookedText: "Talk soon — a calendar invite is on its way to your inbox. You can close this now.",
    goBack: "Go back",
    formTitle: "Book a call",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    companyLabel: "Company/Project name",
    companyPlaceholder: "Your company or project name",
    emailLabel: "Email",
    lookingForLabel: "What are you looking for?",
    budgetLabel: "Budget",
    sourceLabel: "How did you find me?",
    sourcePlaceholder: "Select an option",
    note: "I'll reach out to you with further information so we can explore working together.",
    noteSecond: "Most of the time I will just ask you if you would prefer a Slack chat or an Intro call.",
    sending: "Sending…",
    submit: "Submit",
  },
  de: {
    reasons: ["Brand Identity", "Logo", "Website", "Sonstiges"],
    sources: ["X (Twitter)", "Empfehlung", "Google", "Telegram", "Sonstiges"],
    alertReason: "Bitte wähle mindestens eine Option bei „Was suchst du?“ aus.",
    alertBudget: "Bitte wähle ein Budget aus.",
    alertError: "Etwas ist schiefgelaufen. Bitte schreib mir direkt an mail@deniz.studio.",
    scheduleTitle: "Ein letzter Schritt",
    scheduleText: "Deine Angaben sind da. Wähle eine Zeit für einen kurzen Intro-Call, dann sind wir startklar.",
    pickTime: "Zeit auswählen",
    bookedTitle: "Gebucht!",
    bookedText: "Bis bald — die Kalendereinladung ist unterwegs in dein Postfach. Du kannst dieses Fenster jetzt schließen.",
    goBack: "Zurück",
    formTitle: "Call buchen",
    nameLabel: "Name",
    namePlaceholder: "Dein Name",
    companyLabel: "Firma/Projekt",
    companyPlaceholder: "Name deiner Firma oder deines Projekts",
    emailLabel: "E-Mail",
    lookingForLabel: "Was suchst du?",
    budgetLabel: "Budget",
    sourceLabel: "Wie hast du mich gefunden?",
    sourcePlaceholder: "Bitte auswählen",
    note: "Ich melde mich mit weiteren Infos, damit wir eine Zusammenarbeit besprechen können.",
    noteSecond: "Meistens frage ich nur, ob dir ein Slack-Chat oder ein kurzer Intro-Call lieber ist.",
    sending: "Wird gesendet…",
    submit: "Absenden",
  },
} as const

declare global {
  interface Window {
    db?: { track: (event: string, props?: Record<string, unknown>) => Promise<void> }
    databuddy?: { track: (event: string, props?: Record<string, unknown>) => Promise<void> }
  }
}

// Scoped styles for the form AND the confirmation screen. Kept in one constant so
// both React return branches render it (the reset `button { font: inherit }` in the
// page's global CSS otherwise wins, flattening size/weight back to 16px/400).
const FORM_STYLES = `
.reachout-inline [data-slot="checkbox"][data-checked],
.reachout-inline [data-slot="radio-group-item"][data-checked] {
  background-color: #1e1e1e !important;
  border-color: #1e1e1e !important;
}
.reachout-inline [data-slot="checkbox"]:focus-visible,
.reachout-inline [data-slot="radio-group-item"]:focus-visible,
.reachout-inline [data-slot="input"]:focus-visible,
.reachout-inline [data-slot="textarea"]:focus-visible,
.reachout-inline .reachout-select:focus-visible {
  border-color: #1e1e1e !important;
  box-shadow: 0 0 0 3px rgba(30, 30, 30, 0.2) !important;
}
.reachout-inline [data-slot="input"],
.reachout-inline [data-slot="input"]::placeholder,
.reachout-inline [data-slot="textarea"],
.reachout-inline [data-slot="textarea"]::placeholder,
.reachout-inline .reachout-select,
.reachout-inline button {
  font-size: 14px;
}
.reachout-inline button {
  font-weight: 500;
}
`

export default function ReachOutForm({ lang = "en" }: { lang?: "en" | "de" }) {
  const s = STRINGS[lang]
  const REASONS = s.reasons
  const SOURCES = s.sources
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [booked, setBooked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [source, setSource] = useState("")
  const [prefill, setPrefill] = useState<{
    name: string
    email: string
    extra?: Record<string, string | string[]>
  }>({ name: "", email: "" })

  // Load the Cal.com embed once, theme it to match the site, and flip to the
  // "booked" confirmation when a booking completes inside the popup.
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const cal = await getCalApi({ namespace: CAL_NS })
      if (cancelled) return
      cal("ui", {
        theme: "light",
        hideEventTypeDetails: false,
        layout: "month_view",
        cssVarsPerTheme: {
          light: { "cal-brand": "#1e1e1e" },
          dark: { "cal-brand": "#1e1e1e" },
        },
      })
      cal("on", { action: "bookingSuccessful", callback: () => setBooked(true) })
    })()
    return () => { cancelled = true }
  }, [])

  // Open the Cal.com scheduling popup, prefilled with what they just entered.
  const openCal = async (
    name: string,
    email: string,
    extra?: Record<string, string | string[]>,
  ) => {
    const cal = await getCalApi({ namespace: CAL_NS })
    const config: Record<string, string | string[]> = {
      name,
      email,
      layout: "month_view",
      ...(extra ?? {}),
    }
    cal("modal", { calLink: CAL_LINK, config })
  }

  // Option B: map each submitted answer to its matching Cal booking question.
  const buildCalPrefill = (formData: FormData): Record<string, string | string[]> => {
    const fields: Record<string, string | string[]> = {}
    const company = String(formData.get("company") ?? "").trim()
    const tellMore = String(formData.get("tell_me_more") ?? "").trim()
    const services = selectedReasons
      .map((r) => CAL_SERVICE_VALUES[REASONS.indexOf(r)])
      .filter(Boolean) as string[]
    if (services.length) fields[CAL_FIELDS.service] = services
    const bIdx = BUDGETS.indexOf(budget)
    if (bIdx >= 0) fields[CAL_FIELDS.budget] = CAL_BUDGET_VALUES[bIdx]
    const sIdx = SOURCES.indexOf(source)
    if (sIdx >= 0) fields[CAL_FIELDS.howFound] = CAL_SOURCE_VALUES[sIdx]
    if (company) fields[CAL_FIELDS.company] = company
    if (tellMore) fields[CAL_FIELDS.notes] = tellMore
    return fields
  }

  const track = async (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window === "undefined") return
    const tracker = window.db?.track || window.databuddy?.track
    if (!tracker) return
    try { await tracker(eventName, properties) } catch {}
  }

  // Open the inline form from any CTA. Each trigger carries its own
  // data-reachout-location, which rides along on the event so a single funnel
  // still works while the Events view can break down which CTA pulled.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const trigger = target.closest<HTMLElement>("[data-reachout-location]")
      if (trigger) {
        e.preventDefault()
        track("reachout_clicked", {
          location: trigger.dataset.reachoutLocation ?? "unknown",
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
        })
        setOpen(true)
      }
    }
    document.addEventListener("click", handler)
    return () => document.removeEventListener("click", handler)
  }, [])

  // Swap the left column between the hero and this form.
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".title-cta")
    if (hero) hero.style.display = open ? "none" : ""
    document.querySelector<HTMLElement>(".main")?.classList.toggle("reachout-open", open)
    if (open) {
      document.querySelector<HTMLElement>(".left-column")?.scrollTo({ top: 0 })
      // On the stacked layout the form sits above the project column, so opening
      // it from the CTA at the bottom of the projects would leave it off-screen.
      // On desktop the left column is sticky and always visible, so don't scroll.
      if (window.matchMedia("(max-width: 1023px)").matches) {
        document
          .querySelector<HTMLElement>(".reachout-slot")
          ?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
    }
  }, [open])

  const reset = () => {
    setSubmitted(false)
    setBooked(false)
    setLoading(false)
    setSelectedReasons([])
    setBudget("")
    setSource("")
    setPrefill({ name: "", email: "" })
  }

  const goBack = () => {
    reset()
    setOpen(false)
  }

  const toggleReason = (r: string) => {
    setSelectedReasons((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    )
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (selectedReasons.length === 0) {
      alert(s.alertReason)
      return
    }
    if (!budget) {
      alert(s.alertBudget)
      return
    }
    setLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      selectedReasons.forEach((r) => formData.append("looking_for[]", r))
      formData.set("budget", budget)
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        // Deliberately no name/email/message here — analytics must stay free of
        // personal data. Only the qualifying answers, which is what makes the
        // event useful (which budgets and services actually convert).
        track("reachout_submitted", {
          budget,
          looking_for: selectedReasons.join(", "),
          source: source || "not specified",
          lang,
          timestamp: new Date().toISOString(),
          page: window.location.pathname,
        })
        const name = String(formData.get("name") ?? "")
        const email = String(formData.get("email") ?? "")
        const extra = CAL_PREFILL_MODE === "with-answers" ? buildCalPrefill(formData) : undefined
        setPrefill({ name, email, extra })
        setSubmitted(true)
        // Hand the time-slot step off to Cal's popup, prefilled.
        void openCal(name, email, extra)
      } else {
        alert(s.alertError)
      }
    } catch {
      alert(s.alertError)
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  if (submitted) {
    return (
      <div className="reachout-inline flex w-full flex-col items-center gap-3 text-center">
        <style>{FORM_STYLES}</style>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckIcon className="h-5 w-5" />
        </div>
        <h2 className="text-[24px] font-medium leading-[1.3] tracking-[-0.02em] text-[#1e1e1e]">
          {booked ? s.bookedTitle : s.scheduleTitle}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[#737373]">
          {booked ? s.bookedText : s.scheduleText}
        </p>
        <div className="mt-1 flex items-center gap-1.5">
          {!booked && (
            <button
              type="button"
              onClick={() => { void openCal(prefill.name, prefill.email, prefill.extra) }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(0,0,0,0.05)] bg-[#1e1e1e] px-4 py-2 text-xs font-medium text-white shadow-[inset_0_-1px_12.4px_-4px_rgba(255,255,255,0.75)] transition-colors hover:bg-[#333333]"
            >
              {s.pickTime}
            </button>
          )}
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1e1e1e24] bg-white px-4 py-2 text-xs font-medium text-[#1e1e1e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fafafa]"
          >
            {s.goBack}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="reachout-inline flex w-full flex-col gap-[18px]">
      <style>{FORM_STYLES}</style>

      <h2 className="text-[24px] font-medium leading-[1.3] tracking-[-0.02em] text-[#1e1e1e]">
        {s.formTitle}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <input type="hidden" name="access_key" value="b2d4cb9e-1b2f-4b9b-8166-9007e7be7e40" />
        <input type="hidden" name="subject" value={lang === "de" ? "New inquiry from deniz.studio (via /de/)" : "New inquiry from deniz.studio"} />
        <input type="text" name="_honey" className="hidden" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reachout-name">
              {s.nameLabel} <span className="text-[#1e1e1e]">*</span>
            </Label>
            <Input id="reachout-name" name="name" className="h-9.5 px-3" placeholder={s.namePlaceholder} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="reachout-company">{s.companyLabel}</Label>
            <Input id="reachout-company" name="company" className="h-9.5 px-3" placeholder={s.companyPlaceholder} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="reachout-email">
            {s.emailLabel} <span className="text-[#1e1e1e]">*</span>
          </Label>
          <Input id="reachout-email" name="email" type="email" className="h-9.5 px-3" placeholder="your@email.com" required />
        </div>

        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>
              {s.lookingForLabel} <span className="text-[#1e1e1e]">*</span>
            </Label>
            <div className="flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <label
                  key={r}
                  className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-input px-2.75 py-1.5 text-sm transition-colors has-[[data-checked]]:border-[#1e1e1e] has-[[data-checked]]:bg-[#1e1e1e]/10"
                >
                  <Checkbox
                    checked={selectedReasons.includes(r)}
                    onCheckedChange={() => toggleReason(r)}
                  />
                  {r}
                </label>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label>
              {s.budgetLabel} <span className="text-[#1e1e1e]">*</span>
            </Label>
            <RadioGroup
              value={budget}
              onValueChange={(v) => setBudget(v)}
              className="flex flex-wrap gap-2"
            >
              {BUDGETS.map((b) => (
                <label
                  key={b}
                  className="flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-input px-2.75 py-1.5 text-sm transition-colors has-[[data-checked]]:border-[#1e1e1e] has-[[data-checked]]:bg-[#1e1e1e]/10"
                >
                  <RadioGroupItem value={b} />
                  {b}
                </label>
              ))}
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reachout-source">{s.sourceLabel}</Label>
            <div className="relative">
              <select
                id="reachout-source"
                name="how_did_you_find_me"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className={`reachout-select h-9.5 w-full appearance-none rounded-lg border border-input bg-transparent px-3 pr-9 text-sm outline-none transition-colors ${
                  source ? "text-[#1e1e1e]" : "text-muted-foreground"
                }`}
              >
                <option value="" disabled>{s.sourcePlaceholder}</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s} className="text-[#1e1e1e]">{s}</option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#737373]" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          <p className="text-sm leading-relaxed text-[#737373]">
            {s.note} <br /> {s.noteSecond}
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(0,0,0,0.05)] bg-[#1e1e1e] px-4 py-1.5 text-sm font-medium text-white shadow-[inset_0_-1px_12.4px_-4px_rgba(255,255,255,0.75)] transition-colors hover:bg-[#333333] disabled:opacity-60"
            >
              {loading ? s.sending : s.submit}
            </button>
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1e1e1e24] bg-white px-4 py-2 text-sm font-medium text-[#1e1e1e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fafafa]"
            >
              {s.goBack}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
