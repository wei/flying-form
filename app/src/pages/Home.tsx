import { Link } from "react-router-dom";
import { useLang } from "../lib/lang";
import { t } from "../lib/i18n";

export default function Home() {
  const { lang, toggle } = useLang();

  const steps = [
    { title: t("stepShoot", lang), sub: t("stepShootSub", lang) },
    { title: t("stepFill", lang), sub: t("stepFillSub", lang) },
    { title: t("stepReceive", lang), sub: t("stepReceiveSub", lang), stamp: true },
  ];

  return (
    <div className="home">
      <header className="home-top">
        <img src="/horizontal-logo.png" alt="Flying Form" className="brand-logo" />
        <button className="lang-toggle" onClick={toggle} aria-label="Switch language">
          {lang === "ja" ? "English" : "日本語"}
        </button>
      </header>

      <main className="home-hero">
        <div className="home-mark viewfinder">
          <span className="vf" aria-hidden="true" />
          <img src="/favicon.png" alt="" className="home-mark-img" aria-hidden="true" />
        </div>
        <h1 className="home-title">{t("heroTitle", lang)}</h1>
        <p className="home-sub">{t("heroSub", lang)}</p>
        <Link className="btn primary btn-lg" to="/admin">
          {t("heroCta", lang)}
        </Link>

        <ol className="home-steps">
          {steps.map((s, i) => (
            <li key={s.title} className="home-step">
              <span className={`home-step-no${s.stamp ? " is-stamp" : ""}`} aria-hidden="true">
                {i + 1}
              </span>
              <span className="home-step-title">{s.title}</span>
              <span className="home-step-sub">{s.sub}</span>
            </li>
          ))}
        </ol>
      </main>

      <footer className="home-foot">
        <p>{t("sovereignty", lang)}</p>
      </footer>
    </div>
  );
}
