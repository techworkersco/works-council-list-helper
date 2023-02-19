import React, { useState } from "react";
import "./AppRoot.css";
import { App } from "../App";
import * as locales from "../../locales";
import { IntlProvider } from "react-intl";

export function AppRoot() {
  const [locale, setLocale] = useState<"en" | "de">("en");
  return (
    <IntlProvider defaultLocale="en" locale={locale} messages={locales[locale]}>
      <App setLocale={setLocale} />
    </IntlProvider>
  );
}
