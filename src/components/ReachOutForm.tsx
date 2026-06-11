import { useState, useEffect, type FormEvent } from "react"
import "../styles/globals.css"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { CheckIcon } from "lucide-react"

const REASONS = ["Branding", "Logo", "Landing Page", "Other"]
const BUDGETS = ["Under $500", "Under $1,000", "Under $2,500"]

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

  const track = async (eventName: string, properties?: Record<string, unknown>) => {
    if (typeof window === "undefined") return
    const tracker = window.db?.track || window.databuddy?.track
    if (!tracker) return
    try { await tracker(eventName, properties) } catch {}
  }

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

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setSubmitted(false)
      setLoading(false)
      setSelectedReasons([])
      setBudget("")
    }
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
      const res = await fetch("https://formsubmit.co/ajax/mail@deniz.studio", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "p-6",
          submitted
            ? "sm:max-w-md"
            : "sm:max-w-2xl max-h-[85vh] overflow-y-auto",
        )}
      >
        {submitted ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckIcon className="h-6 w-6" />
            </div>
            <DialogTitle className="text-lg font-semibold">Thank you!</DialogTitle>
            <p className="mt-2 max-w-xs text-sm text-muted-foreground">
              Your message has been sent. I'll reach out to you with further
              information so we can explore working together.
            </p>
          </div>
        ) : (
          <>
            <style>{`
.form-purple-accent [data-slot="checkbox"][data-checked],
.form-purple-accent [data-slot="radio-group-item"][data-checked] {
  background-color: #732dff !important;
  border-color: #732dff !important;
}
.form-purple-accent [data-slot="checkbox"]:focus-visible,
.form-purple-accent [data-slot="radio-group-item"]:focus-visible,
.form-purple-accent [data-slot="input"]:focus-visible,
.form-purple-accent [data-slot="textarea"]:focus-visible {
  border-color: #732dff !important;
  box-shadow: 0 0 0 3px rgba(115, 45, 255, 0.2) !important;
}
`}</style>
            <div className="form-purple-accent flex flex-col gap-6">
            <div className="flex flex-col gap-2">
            <DialogTitle className="text-xl font-semibold">Reach Out</DialogTitle>
            <DialogDescription className="italic text-xs leading-relaxed text-muted-foreground">
              &ldquo;Deniz helped turn an open ended logo brief into a clear
              visual direction. I came in without a strong idea of what I
              wanted, and his explorations helped us land on something
              distinctive that I'm really happy with.&rdquo;
              <br />
              &mdash; Adam Smielewski, Scalerail
            </DialogDescription>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="_subject" value="New inquiry from deniz.studio" />
              <input type="hidden" name="_template" value="table" />
              <input type="text" name="_honey" className="hidden" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reachout-name">
                    Name <span className="text-[#732dff]">*</span>
                  </Label>
                  <Input id="reachout-name" name="name" placeholder="Your name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reachout-company">
                    Company name{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <Input id="reachout-company" name="company" placeholder="Your company or project name" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reachout-email">
                    Email <span className="text-[#732dff]">*</span>
                  </Label>
                  <Input id="reachout-email" name="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reachout-description">
                    Describe what you do in one sentence{" "}
                    <span className="text-[#732dff]">*</span>
                  </Label>
                  <Input id="reachout-description" name="description" placeholder="We help X do Y by Z" required />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>
                    What are you looking for?{" "}
                    <span className="text-[#732dff]">*</span>
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {REASONS.map((r) => (
                      <label
                        key={r}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm transition-colors has-[[data-checked]]:border-[#732dff] has-[[data-checked]]:bg-[#732dff]/10"
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
                    Budget <span className="text-[#732dff]">*</span>
                  </Label>
                  <RadioGroup
                    value={budget}
                    onValueChange={(v) => setBudget(v)}
                    className="flex flex-wrap gap-2"
                  >
                    {BUDGETS.map((b) => (
                      <label
                        key={b}
                        className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-input px-3 py-1.5 text-sm transition-colors has-[[data-checked]]:border-[#732dff] has-[[data-checked]]:bg-[#732dff]/10"
                      >
                        <RadioGroupItem value={b} />
                        {b}
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reachout-more">
                  Tell me more{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
                </Label>
                <Textarea
                  id="reachout-more"
                  name="tell_me_more"
                  placeholder="Share any details, references, deadlines, or ideas you have in mind\u2026"
                />
              </div>

              <p className="text-sm text-muted-foreground">
                I'll reach out to you with further information so we can explore
                working together.
              </p>

              <Button type="submit" disabled={loading} className="bg-[#732dff] text-white hover:bg-[#5a1ce0] rounded-full px-5 py-1.5 h-auto border-[rgba(0,0,0,0.05)] shadow-[inset_0_-1px_12.4px_-4px_rgba(255,255,255,0.75)]">
                {loading ? "Sending\u2026" : <><span>Send</span> <span>&rarr;</span></>}
              </Button>
            </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}