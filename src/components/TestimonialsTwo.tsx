import { useState, useEffect } from "react";
import { Image } from 'astro:assets';
import januPFP from "../images/janu_pfp.jpg";
import emirPFP from "../images/emir_pfp.jpg";
import type { CSSProperties } from "react";

export default function Testimonials() {
  const testimonials = [
    {
      text: "Deniz helped us fixing our website. He really thought things through, made good recommendations and did it all in a very short space of time. We had a tight deadline and he delivered. Thank you, Deniz!",
      author: "Janu Lingeswaran @ FeatherFlow.com",
      img: januPFP,
    },
    {
      text: "Deniz is super talented and wonderful Person",
      author: "Emir @ witharc.co",
      img: emirPFP,
    },
  ];

  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 7000;
    const step = 70;
    let elapsed = 0;

    const timer = setInterval(() => {
      elapsed += step;
      setProgress((elapsed / duration) * 100);

      if (elapsed >= duration) {
        clearInterval(timer);
        setProgress(0);
        setIndex((prev) => (prev + 1) % testimonials.length);
      }
    }, step);

    return () => clearInterval(timer);
  }, [index]);

  const t = testimonials[index];

  // ✅ All properly typed
  const styles: Record<string, CSSProperties> = {
    container: {
      maxWidth: 650,
      width: "100%",
    },
    h2: {
      fontSize: "16.875px",
      fontFamily: '"Inter Variable", "Inter", sans-serif',
      fontWeight: 450,
      marginBottom: "14px",
      marginTop: 0,
    },
    h3: {
      fontSize: "15px",
      color: "#1e1e1e",
      fontWeight: 400,
      marginTop: 0,
      marginBottom: "18px", // Further reduced from 4px to 2px
      textWrap: "balance",
      lineHeight: "1.4", // Consistent line height for better spacing
    },
    p: {
      color: "#1e1e1e",
      fontSize: "15px",
      marginTop: 0,
      marginBottom: 0,
      textWrap: "pretty",
    },
    testAndPerson: {
      display: "flex",
      flexDirection: "column" as const,
      // animation: "fadeIn 0.6s ease",
      minHeight: "100px", // Fixed minimum height to prevent layout shifts
      justifyContent: "space-between", // Changed from flex-start to space-between
    },
    personAndPic: {
      display: "flex",
      alignItems: "center",
      gap: "6px",
      marginTop: "0px", // Reduced from 4px to 0px to bring closer to progress bar
    },
    pfp: {
      borderRadius: "100%",
      width: "24px",
      height: "24px",
      objectFit: "cover" as const,
    },
    progressBar: {
      width: "100%",
      height: "3px",
      background: "#eee",
      borderRadius: "2px",
      overflow: "hidden",
      marginTop: "8px", // Further reduced from 4px to 2px
    },
    progress: {
      height: "100%",
      background: "#1e1e1e",
      width: `${progress}%`,
      transition: "width 0.04s linear",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.h2}>Testimonials</h2>
      <div style={styles.testAndPerson}>
        <h3 style={styles.h3}>"{t.text}"</h3>
        <div style={styles.personAndPic}>
          <img
            src={typeof t.img === "string" ? t.img : t.img.src}
            alt={`Image of ${t.author}`}
            style={styles.pfp}
            width={400}
            height={400}
          />
          <p style={styles.p}>{t.author}</p>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div style={styles.progress} />
      </div>

      {/* <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style> */}
    </div>
  );
}