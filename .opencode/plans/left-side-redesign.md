# Left Side Redesign — Plan

All changes in `src/pages/index.astro`.

---

## 1. HTML — Replace left-column inner content

**Remove** lines 176–213 (from `<header class="hero-header">` to `</div>` closing `.main`)  
**Replace with:**

```html
<nav class="navbar">
    <a href="/" class="site-logo">deniz.studio</a>
    <div class="nav-links">
        <a href="mailto:mail@deniz.studio" class="nav-link" title="mail@deniz.studio" data-track="mail_clicked">email</a>
        <a href="#" class="nav-link" target="_blank" rel="noopener noreferrer" data-track="telegram_clicked">telegram</a>
        <a href="#" class="nav-link" target="_blank" rel="noopener noreferrer" data-track="twitter_clicked">x</a>
    </div>
</nav>
<div class="main">
    <div class="title-cta">
        <div class="titletext">
            <h1 class="hero-headline">Good design, better business</h1>
            <p class="hero-subheadline">You bring the vision.<br />I create designs that make you strive.</p>
        </div>
        <div class="buttons">
            <div class="mail-buttons">
                <div class="hero-cta-row">
                    <a class="cta" href="https://tally.so/r/placeholder" target="_blank" rel="noopener noreferrer">
                        <Image quality={100} src={mePFP} class="cta-pfp" alt="Deniz" width={200} height={200}/>
                        <span>Reach Out</span>
                    </a>
                    <a
                        class="cta-case-study"
                        href={recentCaseStudyHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        data-track="casestudy_clicked"
                    >
                        <Image quality={100} src={figmaSVG} class="figma-icon" alt="" width={54} height={80}/>
                        <span>view recent case study</span>
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## 2. JavaScript — Replace tracking code

**Remove** lines 106–168 (from `const trackCTAClick =` to closing `}` of `copyMail`)  
**Replace with:**

```javascript
// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Track Reach Out CTA clicks
    const ctaButton = document.querySelector('.cta');
    if (ctaButton) {
        ctaButton.addEventListener('click', function(e) {
            track('reachout_clicked', {
                url: this.href,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            });
        });
    }

    // Track nav link clicks
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const eventName = this.getAttribute('data-track');
            if (eventName) {
                track(eventName, {
                    url: this.href,
                    timestamp: new Date().toISOString(),
                    page: window.location.pathname
                });
            }
        });
    });

    // Track case study click
    const caseStudyBtn = document.querySelector('.cta-case-study');
    if (caseStudyBtn) {
        caseStudyBtn.addEventListener('click', function(e) {
            track('casestudy_clicked', {
                url: this.href,
                timestamp: new Date().toISOString(),
                page: window.location.pathname
            });
        });
    }
});
```

---

## 3. CSS changes

### 3a. Widen left-column (line 334)

`width: 468px;` → `width: 540px;`

### 3b. Replace `.hero-header` block (lines 567–570)

**Remove:**
```css
.hero-header {
    width: 100%;
    flex-shrink: 0;
}
```

**Add:**
```css
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    flex-shrink: 0;
    gap: 30px;
}

.nav-links {
    display: flex;
    align-items: flex-start;
    gap: 24px;
}

.nav-link {
    font-size: 15px;
    font-weight: 450;
    color: #000000;
    text-decoration: none;
    line-height: 18px;
}

.nav-link:hover {
    color: #7a7a7a;
}
```

### 3c. Update `.hero-header,` reference (line 346)

`.hero-header,` → `.navbar,`

### 3d. Clean up `.cta` CSS (lines 639–675)

**Remove** `.cta a` block (lines 639–643)  
**Remove** duplicate declarations in `.cta` (lines 662–664: `display: flex; justify-content: center; align-items: center;`)  
**Add** `text-decoration: none;` to `.cta`

Result:
```css
.cta-icon {
    width: 16px;
    height: 16px;
    margin-left: 8px;
    flex-shrink: 0;
}

.cta {
    display: flex;
    gap: 6px;
    justify-content: center;
    align-items: center;
    background-color: #732DFF;
    width: fit-content;
    color: #ffffff;
    padding: 6px 16px 6px 6px;
    border-radius: 100px;
    text-decoration: none;
    transition: all .15s ease-in-out;
    border: 1px solid rgba(0, 0, 0, 0.05);
    font-weight: 500;
    box-shadow: inset 0px -1px 12.4px -4px rgba(255, 255, 255, 0.75);
}

.cta:hover {
    color: #ffffff;
    background-color: #5a1ce0;
    border-color: rgba(0, 0, 0, 0.05);
}
```

### 3e. Mobile: `.hero-header` → `.navbar` (line 416)

`.hero-header { margin-bottom: 32px; }` → `.navbar { margin-bottom: 32px; }`

### 3f. Remove orphan copy-mail CSS

Remove: `.hero-mail-stack`, `.copy-mail-wrap`, `.second-cta`, `.copy-email-label`, `.copy-tooltip`, `.copy-tooltip.show`, and the reduced-motion `.copy-tooltip` block.
