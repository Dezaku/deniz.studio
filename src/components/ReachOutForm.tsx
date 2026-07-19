import { useState, useEffect, type FormEvent } from "react"
import "../styles/globals.css"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const BUDGETS = ["$2.5k-$3.5k", "$3.5k-$5k", "$5k-$10k", ">$10k"]

// All visible form text per language. The German homepage (/de/) passes lang="de".
const STRINGS = {
  en: {
    reasons: ["Branding", "Logo", "Landing Page", "Other"],
    sources: ["X (Twitter)", "A referral", "Google", "Telegram", "Other"],
    alertReason: "Please select at least one option for 'What are you looking for?'",
    alertBudget: "Please select a budget.",
    alertError: "Something went wrong. Please try emailing me directly at mail@deniz.studio.",
    thanksTitle: "Thank you!",
    thanksText: "Your message has been sent. I'll reach out to you with further information so we can explore working together.",
    goBack: "Go back",
    formTitle: "Reach Out",
    nameLabel: "Name",
    namePlaceholder: "Your name",
    companyLabel: "Company/Project name",
    companyPlaceholder: "Your company or project name",
    emailLabel: "Email",
    descriptionLabel: "Describe what you do in one sentence",
    descriptionPlaceholder: "We help X do Y by Z",
    lookingForLabel: "What are you looking for?",
    budgetLabel: "Budget",
    sourceLabel: "How did you find me?",
    sourcePlaceholder: "Select an option",
    moreLabel: "Tell me more",
    moreOptional: "(optional)",
    morePlaceholder: "Share any details, references, deadlines, or ideas you have in mind",
    note: "I'll reach out to you with further information so we can explore working together.",
    noteSecond: "Most of the time I will just ask you if you would prefer a Slack chat or an Intro call.",
    sending: "Sending…",
    submit: "Submit",
  },
  de: {
    reasons: ["Branding", "Logo", "Landing Page", "Sonstiges"],
    sources: ["X (Twitter)", "Empfehlung", "Google", "Telegram", "Sonstiges"],
    alertReason: "Bitte wähle mindestens eine Option bei „Was suchst du?“ aus.",
    alertBudget: "Bitte wähle ein Budget aus.",
    alertError: "Etwas ist schiefgelaufen. Bitte schreib mir direkt an mail@deniz.studio.",
    thanksTitle: "Danke!",
    thanksText: "Deine Nachricht wurde gesendet. Ich melde mich mit weiteren Infos, damit wir eine Zusammenarbeit besprechen können.",
    goBack: "Zurück",
    formTitle: "Anfrage senden",
    nameLabel: "Name",
    namePlaceholder: "Dein Name",
    companyLabel: "Firma/Projekt",
    companyPlaceholder: "Name deiner Firma oder deines Projekts",
    emailLabel: "E-Mail",
    descriptionLabel: "Beschreibe in einem Satz, was ihr macht",
    descriptionPlaceholder: "Wir helfen X, Y zu erreichen, indem Z",
    lookingForLabel: "Was suchst du?",
    budgetLabel: "Budget",
    sourceLabel: "Wie hast du mich gefunden?",
    sourcePlaceholder: "Bitte auswählen",
    moreLabel: "Erzähl mir mehr",
    moreOptional: "(optional)",
    morePlaceholder: "Details, Referenzen, Deadlines oder Ideen — alles, was dir wichtig ist",
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

export default function ReachOutForm({ lang = "en" }: { lang?: "en" | "de" }) {
  const s = STRINGS[lang]
  const REASONS = s.reasons
  const SOURCES = s.sources
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [budget, setBudget] = useState("")
  const [source, setSource] = useState("")

  const track = async (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window === "undefined") return
    const tracker = window.db?.track || window.databuddy?.track
    if (!tracker) return
    try { await tracker(eventName, properties) } catch {}
  }

  // Open the inline form when the hero "Reach Out" CTA is clicked.
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest(".cta")) {
        e.preventDefault()
        track("reachout_clicked", {
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
    }
  }, [open])

  const reset = () => {
    setSubmitted(false)
    setLoading(false)
    setSelectedReasons([])
    setBudget("")
    setSource("")
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
        setSubmitted(true)
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
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckIcon className="h-5 w-5" />
        </div>
        <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#1e1e1e]">
          {s.thanksTitle}
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[#737373]">
          {s.thanksText}
        </p>
        <button
          type="button"
          onClick={goBack}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#1e1e1e24] bg-white px-4 py-2 text-sm font-medium text-[#1e1e1e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fafafa]"
        >
          {s.goBack}
        </button>
      </div>
    )
  }

  return (
    <div className="reachout-inline flex w-full flex-col gap-[18px]">
      <style>{`
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
`}</style>

      <h2 className="text-[24px] font-semibold leading-[1.3] tracking-[-0.02em] text-[#1e1e1e]">
        {s.formTitle}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <input type="hidden" name="access_key" value="b2d4cb9e-1b2f-4b9b-8166-9007e7be7e40" />
        <input type="hidden" name="subject" value={lang === "de" ? "New inquiry from deniz.studio (via /de/)" : "New inquiry from deniz.studio"} />
        <input type="text" name="_honey" className="hidden" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reachout-name">
              {s.nameLabel} <span className="text-[#1e1e1e]">*</span>
            </Label>
            <Input id="reachout-name" name="name" className="h-9.5 px-3" placeholder={s.namePlaceholder} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reachout-company">{s.companyLabel}</Label>
            <Input id="reachout-company" name="company" className="h-9.5 px-3" placeholder={s.companyPlaceholder} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reachout-email">
              {s.emailLabel} <span className="text-[#1e1e1e]">*</span>
            </Label>
            <Input id="reachout-email" name="email" type="email" className="h-9.5 px-3" placeholder="your@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reachout-description">
              {s.descriptionLabel} <span className="text-[#1e1e1e]">*</span>
            </Label>
            <Input id="reachout-description" name="description" className="h-9.5 px-3" placeholder={s.descriptionPlaceholder} required />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          <div className="space-y-2">
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
          <div className="space-y-2">
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
          <div className="space-y-1.5">
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

        <div className="space-y-1.5">
          <Label htmlFor="reachout-more">
            {s.moreLabel}{" "}
            <span className="font-normal text-muted-foreground">{s.moreOptional}</span>
          </Label>
          <Textarea
            id="reachout-more"
            name="tell_me_more"
            className="px-3"
            placeholder={s.morePlaceholder}
          />
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
