import { useState, useEffect, type FormEvent } from "react";

const REASONS = ["Branding", "Logo", "Landing Page", "Other"];
const BUDGETS = ["Under $500", "Under $1,000", "Under $2,500"];

export default function ReachOutForm() {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest(".cta")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      setSubmitted(false);
      setLoading(false);
      setSelectedReasons([]);
    }
  }, [open]);

  const toggleReason = (r: string) => {
    setSelectedReasons((prev) =>
      prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r],
    );
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedReasons.length === 0) {
      alert("Please select at least one option for 'What are you looking for?'");
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      selectedReasons.forEach((r) => formData.append("looking_for[]", r));
      const res = await fetch("https://formsubmit.co/ajax/mail@deniz.studio", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please try emailing me directly at mail@deniz.studio.");
      }
    } catch {
      alert("Something went wrong. Please try emailing me directly at mail@deniz.studio.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  if (submitted) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: "16px" }} onClick={() => setOpen(false)}>
        <div style={{ position: "relative", width: "100%", maxWidth: 480, borderRadius: 12, backgroundColor: "#fff", padding: "24px", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)" }} onClick={(e) => e.stopPropagation()}>
          <button style={{ position: "absolute", right: 12, top: 12, cursor: "pointer", border: "none", background: "transparent", padding: 4, fontSize: 16, lineHeight: 1, color: "#a1a1aa" }} onClick={() => setOpen(false)} aria-label="Close">&times;</button>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 24px", textAlign: "center" }}>
            <div style={{ marginBottom: 12, width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", backgroundColor: "#dcfce7", fontSize: 24, color: "#16a34a" }}>&#10003;</div>
            <h2 style={{ marginBottom: 8, fontSize: 20, fontWeight: 600, letterSpacing: "-0.025em", color: "#18181b" }}>Thank you!</h2>
            <p style={{ maxWidth: 336, fontSize: 14, lineHeight: 1.5, color: "#71717a" }}>
              Your message has been sent. I'll reach out to you with further information so we can explore working together.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)", padding: "16px" }} onClick={() => setOpen(false)}>
      <div style={{ position: "relative", width: "100%", maxWidth: 800, maxHeight: "85vh", overflowY: "auto", borderRadius: 12, backgroundColor: "#fff", padding: 28, boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)" }} onClick={(e) => e.stopPropagation()}>
        <button style={{ position: "absolute", right: 16, top: 16, cursor: "pointer", border: "none", background: "transparent", padding: 4, fontSize: 20, lineHeight: 1, color: "#a1a1aa" }} onClick={() => setOpen(false)} aria-label="Close">&times;</button>

        <h1 style={{ marginBottom: 4, marginTop: 0, fontSize: 20, fontWeight: 600, letterSpacing: "-0.025em", color: "#18181b" }}>Reach Out</h1>

        <p style={{ marginBottom: 4, fontSize: 12, fontStyle: "italic", lineHeight: 1.5, color: "#71717a" }}>
          &ldquo;Deniz helped turn an open ended logo brief into a clear visual direction. I came in without a strong idea of what I wanted, and his explorations helped us land on something distinctive that I'm really happy with.&rdquo;
        </p>
        <p style={{ marginBottom: 20, marginTop: 0, fontSize: 12, color: "#18181b" }}>&mdash; Adam Smielewski, Scalerail</p>

        <form onSubmit={handleSubmit}>
          <input type="hidden" name="_subject" value="New inquiry from deniz.studio" />
          <input type="hidden" name="_template" value="table" />

          <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <label style={{ marginBottom: 4, display: "block", fontSize: 14, fontWeight: 500, color: "#18181b" }}>
                Name <span style={{ color: "#732dff" }}>*</span>
              </label>
              <input id="name" type="text" name="name" placeholder="Your name" required style={{ width: "100%", minWidth: 0, borderRadius: 8, border: "1px solid #d4d4d8", backgroundColor: "#fff", padding: "4px 10px", fontSize: 14, height: 32, boxSizing: "border-box" }} />
            </div>
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <label style={{ marginBottom: 4, display: "block", fontSize: 14, fontWeight: 500, color: "#18181b" }}>
                Company name <span style={{ fontWeight: 400, color: "#a1a1aa" }}>(optional)</span>
              </label>
              <input id="company" type="text" name="company" placeholder="Your company or project name" style={{ width: "100%", minWidth: 0, borderRadius: 8, border: "1px solid #d4d4d8", backgroundColor: "#fff", padding: "4px 10px", fontSize: 14, height: 32, boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <label style={{ marginBottom: 4, display: "block", fontSize: 14, fontWeight: 500, color: "#18181b" }}>
                Email <span style={{ color: "#732dff" }}>*</span>
              </label>
              <input id="email" type="email" name="email" placeholder="your@email.com" required style={{ width: "100%", minWidth: 0, borderRadius: 8, border: "1px solid #d4d4d8", backgroundColor: "#fff", padding: "4px 10px", fontSize: 14, height: 32, boxSizing: "border-box" }} />
            </div>
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <label style={{ marginBottom: 4, display: "block", fontSize: 14, fontWeight: 500, color: "#18181b" }}>
                Describe what you do in one sentence <span style={{ color: "#732dff" }}>*</span>
              </label>
              <input id="description" type="text" name="description" placeholder="We help X do Y by Z" required style={{ width: "100%", minWidth: 0, borderRadius: 8, border: "1px solid #d4d4d8", backgroundColor: "#fff", padding: "4px 10px", fontSize: 14, height: 32, boxSizing: "border-box" }} />
            </div>
          </div>

          <div style={{ marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <label style={{ marginBottom: 4, display: "block", fontSize: 14, fontWeight: 500, color: "#18181b" }}>
                What are you looking for? <span style={{ color: "#732dff" }}>*</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {REASONS.map((r) => (
                  <div
                    key={r}
                    role="checkbox"
                    aria-checked={selectedReasons.includes(r)}
                    tabIndex={0}
                    onClick={() => toggleReason(r)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleReason(r); } }}
                    style={{
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 6, borderRadius: 6, border: "1px solid",
                      padding: "6px 12px", fontSize: 12, fontWeight: 500, transition: "colors 0.2s",
                      borderColor: selectedReasons.includes(r) ? "#732dff" : "#e4e4e7",
                      backgroundColor: selectedReasons.includes(r) ? "#732dff" : "#fff",
                      color: selectedReasons.includes(r) ? "#fff" : "#27272a",
                    }}
                  >
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ minWidth: 0, flex: "1 1 200px" }}>
              <label style={{ marginBottom: 4, display: "block", fontSize: 14, fontWeight: 500, color: "#18181b" }}>
                Budget <span style={{ color: "#732dff" }}>*</span>
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
                {BUDGETS.map((b) => (
                  <label key={b} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "#27272a" }}>
                    <input type="radio" name="budget" value={b} required />
                    {b}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ marginBottom: 4, display: "block", fontSize: 14, fontWeight: 500, color: "#18181b" }}>
              Tell me more <span style={{ fontWeight: 400, color: "#a1a1aa" }}>(optional)</span>
            </label>
            <textarea id="tell_me_more" name="tell_me_more" placeholder="Share any details, references, deadlines, or ideas you have in mind\u2026" style={{ display: "flex", minHeight: 64, width: "100%", borderRadius: 8, border: "1px solid #d4d4d8", backgroundColor: "#fff", padding: "8px 10px", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit" }} />
          </div>

          <p style={{ marginBottom: 16, marginTop: 0, fontSize: 12, color: "#71717a" }}>
            I'll reach out to you with further information so we can explore working together.
          </p>

          <button type="submit" disabled={loading} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: "1px solid transparent", backgroundColor: "#18181b", padding: "6px 10px", fontSize: 14, fontWeight: 500, color: "#fff", cursor: "pointer", gap: 4, opacity: loading ? 0.5 : 1 }}>
            {loading ? "Sending\u2026" : <><span>Send</span><span>&rarr;</span></>}
          </button>
        </form>
      </div>
    </div>
  );
}
