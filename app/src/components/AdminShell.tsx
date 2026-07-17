import { Link, useLocation } from "react-router-dom";
import { useLang } from "../lib/lang";
import { t } from "../lib/i18n";

interface Props {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function AdminShell({ title, subtitle, actions, children }: Props) {
  const { pathname } = useLocation();
  const { lang, toggle } = useLang();
  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <div className="admin-nav">
          <Link to="/admin" className="admin-brand" aria-label="Flying Form dashboard">
            <span className="admin-brand-mark" aria-hidden="true">
              ✈
            </span>
            <span>Flying Form</span>
          </Link>
          <Link to="/admin" className={pathname === "/admin" ? "active" : ""}>
            {t("navForms", lang)}
          </Link>
          <Link to="/admin/new" className={pathname === "/admin/new" ? "active" : ""}>
            {t("navNew", lang)}
          </Link>
        </div>
        <div className="admin-actions">
          {actions}
          <button className="lang-toggle" onClick={toggle} aria-label="Switch language">
            {lang === "ja" ? "English" : "日本語"}
          </button>
        </div>
      </header>

      {(title || subtitle) && (
        <div className="page-header">
          <div>
            {title && <h1>{title}</h1>}
            {subtitle && <p>{subtitle}</p>}
          </div>
        </div>
      )}

      {children}
    </div>
  );
}
