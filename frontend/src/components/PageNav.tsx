"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { FaArrowLeft, FaCompass } from "react-icons/fa";
import styles from "./PageNav.module.css";
import { useNavigationLoading } from "@/context/NavigationLoadingContext";

type PageNavContext = {
  section: string;
  browseHref: string;
  browseLabel: string;
};

const ROOT_PAGE_LABELS: Record<string, string> = {
  "/about": "About Us",
  "/contact": "Contact",
  "/faq": "FAQ",
  "/how-it-works": "How It Works",
  "/prices": "Pricing",
  "/privacy": "Privacy Policy",
  "/terms": "Terms & Conditions",
  "/cookie-policy": "Cookie Policy",
  "/support": "Support",
  "/accessibility": "Accessibility",
  "/community": "Community",
  "/press": "Press",
  "/partner-guidelines": "Partner Guidelines",
  "/safety-security": "Safety & Security",
  "/testimonials": "Testimonials",
  "/trends": "Trends",
  "/promotions": "Promotions",
  "/performance-lab": "Performance Lab",
};

const COMPANY_PREFIXES = [
  "/about",
  "/contact",
  "/faq",
  "/how-it-works",
  "/prices",
  "/privacy",
  "/terms",
  "/cookie-policy",
  "/support",
  "/accessibility",
  "/community",
  "/press",
  "/partner-guidelines",
  "/safety-security",
  "/testimonials",
];

const ACCOUNT_PREFIXES = [
  "/dashboard",
  "/my-",
  "/create-salon",
];

const EXPLORE_PREFIXES = ["/trends", "/promotions", "/performance-lab"];

const HIDE_PAGE_NAV_PREFIXES = [
  "/salons",
  "/trends",
  "/promotions",
  "/performance-lab",
  "/dashboard",
  "/my-",
  "/create-salon",
];

function startsWithAny(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function toTitleCase(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function resolveContext(pathname: string): PageNavContext {
  if (pathname.startsWith("/salons") || pathname.startsWith("/services")) {
    return {
      section: "Services",
      browseHref: "/salons",
      browseLabel: "Browse salons",
    };
  }

  if (startsWithAny(pathname, ACCOUNT_PREFIXES)) {
    return {
      section: "Account",
      browseHref: "/my-profile",
      browseLabel: "Your account",
    };
  }

  if (startsWithAny(pathname, COMPANY_PREFIXES) || pathname.startsWith("/blog")) {
    return {
      section: "Company",
      browseHref: "/about",
      browseLabel: "About Stylr SA",
    };
  }

  if (startsWithAny(pathname, EXPLORE_PREFIXES)) {
    return {
      section: "Explore",
      browseHref: "/trends",
      browseLabel: "Beauty inspiration",
    };
  }

  return {
    section: "Home",
    browseHref: "/",
    browseLabel: "Back home",
  };
}

function resolveCurrentLabel(pathname: string, context: PageNavContext) {
  if (pathname === "/") {
    return context.section;
  }

  if (pathname === context.browseHref || (pathname === "/services" && context.browseHref === "/salons")) {
    return ROOT_PAGE_LABELS[pathname] ?? context.section;
  }

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = decodeURIComponent(segments[segments.length - 1] || "");

  if (!lastSegment) {
    return context.section;
  }

  if (/^[0-9a-f-]{8,}$/i.test(lastSegment)) {
    return "Details";
  }

  return toTitleCase(lastSegment);
}

function shouldHidePageNav(pathname: string, context: PageNavContext) {
  if (context.section === "Company") {
    return true;
  }

  if (startsWithAny(pathname, HIDE_PAGE_NAV_PREFIXES)) {
    return true;
  }

  return false;
}

export default function PageNav() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const { showPageLoader } = useNavigationLoading();

  const context = useMemo(() => resolveContext(pathname), [pathname]);
  const currentLabel = useMemo(() => resolveCurrentLabel(pathname, context), [pathname, context]);
  const isAtBrowseRoot = pathname === context.browseHref || (pathname === "/services" && context.browseHref === "/salons");
  const isCompanyPage = context.section === "Company";
  const shouldShowActions = !isCompanyPage;

  if (shouldHidePageNav(pathname, context)) {
    return null;
  }

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    showPageLoader();
    router.push(isAtBrowseRoot ? "/" : context.browseHref);
  };

  return (
    <nav className={styles.pageNav} aria-label="Page context">
      <div className={styles.contextBlock}>
        <div className={styles.trail}>
          <Link href="/" className={styles.trailLink} onClick={() => showPageLoader()}>
            Home
          </Link>
          <span className={styles.separator}>/</span>
          {isCompanyPage || isAtBrowseRoot ? (
            <span className={styles.current}>{currentLabel}</span>
          ) : (
            <>
              <Link href={context.browseHref} className={styles.trailLink} onClick={() => showPageLoader()}>
                {context.section}
              </Link>
              <span className={styles.separator}>/</span>
              <span className={styles.current}>{currentLabel}</span>
            </>
          )}
        </div>
      </div>

      {shouldShowActions && (
        <div className={styles.actions}>
          <button type="button" onClick={handleBack} className={styles.backButton}>
            <FaArrowLeft />
            <span>Back</span>
          </button>

          <Link
            href={isAtBrowseRoot ? "/" : context.browseHref}
            className={styles.jumpLink}
            onClick={() => showPageLoader()}
          >
            <FaCompass />
            <span>{isAtBrowseRoot ? "Home" : context.browseLabel}</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
