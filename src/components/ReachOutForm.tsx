import { useState, useEffect, type FormEvent } from "react"
import "../styles/globals.css"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { CheckIcon, ChevronDownIcon } from "lucide-react"

const REASONS = ["Branding", "Logo", "Landing Page", "Other"]
const BUDGETS = ["$2.5k-$3.5k", "$3.5k-$5k", "$5k-$10k", ">$10k"]
const SOURCES = ["X (Twitter)", "A referral", "Google", "Telegram", "Other"]

declare global {
  interface Window {
    db?: { track: (event: string, props?: Record<string, unknown>) => Promise<void> }
    databuddy?: { track: (event: string, props?: Record<string, unknown>) => Promise<void> }
  }
}

export default function ReachOutForm() {
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
      alert("Please select at least one option for 'What are you looking for?'")
      return
    }
    if (!budget) {
      alert("Please select a budget.")
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
        setSubmitted(true)
      } else {
        alert("Something went wrong. Please try emailing me directly at mail@deniz.studio.")
      }
    } catch {
      alert("Something went wrong. Please try emailing me directly at mail@deniz.studio.")
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
          Thank you!
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-[#737373]">
          Your message has been sent. I'll reach out to you with further
          information so we can explore working together.
        </p>
        <button
          type="button"
          onClick={goBack}
          className="mt-1 inline-flex items-center justify-center gap-2 rounded-full border border-[#1e1e1e24] bg-white px-4 py-2 text-sm font-medium text-[#1e1e1e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fafafa]"
        >
          Go back
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
        Reach Out
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
        <input type="hidden" name="access_key" value="b2d4cb9e-1b2f-4b9b-8166-9007e7be7e40" />
        <input type="hidden" name="subject" value="New inquiry from deniz.studio" />
        <input type="text" name="_honey" className="hidden" />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reachout-name">
              Name <span className="text-[#1e1e1e]">*</span>
            </Label>
            <Input id="reachout-name" name="name" className="h-9.5 px-3" placeholder="Your name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reachout-company">Company/Project name</Label>
            <Input id="reachout-company" name="company" className="h-9.5 px-3" placeholder="Your company or project name" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="reachout-email">
              Email <span className="text-[#1e1e1e]">*</span>
            </Label>
            <Input id="reachout-email" name="email" type="email" className="h-9.5 px-3" placeholder="your@email.com" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reachout-description">
              Describe what you do in one sentence <span className="text-[#1e1e1e]">*</span>
            </Label>
            <Input id="reachout-description" name="description" className="h-9.5 px-3" placeholder="We help X do Y by Z" required />
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>
              What are you looking for? <span className="text-[#1e1e1e]">*</span>
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
              Budget <span className="text-[#1e1e1e]">*</span>
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
            <Label htmlFor="reachout-source">How did you find me?</Label>
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
                <option value="" disabled>Select an option</option>
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
            Tell me more{" "}
            <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="reachout-more"
            name="tell_me_more"
            className="px-3"
            placeholder="Share any details, references, deadlines, or ideas you have in mind"
          />
        </div>

        <div className="flex flex-col gap-3.5">
          <p className="text-sm leading-relaxed text-[#737373]">
            I'll reach out to you with further information so we can explore
            working together.
          </p>
          <div className="flex items-center gap-1.5">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[rgba(0,0,0,0.05)] bg-[#1e1e1e] px-4 py-1.5 text-sm font-medium text-white shadow-[inset_0_-1px_12.4px_-4px_rgba(255,255,255,0.75)] transition-colors hover:bg-[#333333] disabled:opacity-60"
            >
              {loading ? "Sending…" : "Submit"}
            </button>
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#1e1e1e24] bg-white px-4 py-2 text-sm font-medium text-[#1e1e1e] shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:bg-[#fafafa]"
            >
              Go back
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
