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

    return () => {
      window.removeEventListener("scroll", onScroll);
      burger?.removeEventListener("click", toggleMenu);
      linkEls.forEach((a) => a.removeEventListener("click", closeMenu));
      obsActive.disconnect();
      revObs.disconnect();
    };
  }, []);

  return null;
}
