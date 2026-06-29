"use client";

import { useEffect } from "react";

// Ports the inline <script> from V16: sticky nav shadow, mobile burger toggle,
// scroll-spy active nav link, and reveal-on-scroll animations.
export default function SiteScripts() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () => {
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const burger = document.getElementById("burger");
    const navLinks = document.getElementById("navLinks");
    const toggleMenu = () => {
      burger?.classList.toggle("open");
      navLinks?.classList.toggle("open");
    };
    burger?.addEventListener("click", toggleMenu);

    const linkEls = navLinks
      ? Array.from(navLinks.querySelectorAll("a"))
      : [];
    const closeMenu = () => {
      burger?.classList.remove("open");
      navLinks?.classList.remove("open");
    };
    linkEls.forEach((a) => a.addEventListener("click", closeMenu));

    const linkMap: Record<string, Element> = {};
    linkEls.forEach((a) => {
      const href = a.getAttribute("href");
      if (href) linkMap[href.slice(1)] = a;
    });
    const obsActive = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            linkEls.forEach((a) => a.classList.remove("active"));
            const el = linkMap[e.target.id];
            if (el) el.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    ["utama", "akses", "galeri", "makluman", "hubungi"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) obsActive.observe(el);
    });

    const revObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            revObs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".reveal").forEach((el) => revObs.observe(el));

    // Count-up animation for hero stats. Only pure-number values animate
    // (e.g. "1940", "20"); mixed values like "A+" / "XBA4007" stay as-is.
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const animateCount = (el: HTMLElement, target: number, suffix: string) => {
      const dur = 1400;
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const p = Math.min((ts - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        // No thousands separators — keep raw digits so years (e.g. 1940) and
        // codes don't gain a stray comma ("1,940").
        el.textContent = String(Math.round(eased * target)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = String(target) + suffix;
      };
      requestAnimationFrame(step);
    };
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          countObs.unobserve(el);
          const raw = (el.textContent ?? "").trim();
          const m = /^(\d[\d,]*)(\D*)$/.exec(raw); // leading number + optional suffix (e.g. "+")
          if (!m || prefersReduced) return;
          const target = Number(m[1].replace(/,/g, ""));
          if (!Number.isFinite(target) || target === 0) return;
          animateCount(el, target, m[2] ?? "");
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll(".stat .num").forEach((el) => countObs.observe(el));

    return () => {
      window.removeEventListener("scroll", onScroll);
      burger?.removeEventListener("click", toggleMenu);
      linkEls.forEach((a) => a.removeEventListener("click", closeMenu));
      obsActive.disconnect();
      revObs.disconnect();
      countObs.disconnect();
    };
  }, []);

  return null;
}
