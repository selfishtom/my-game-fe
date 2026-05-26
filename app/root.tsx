// frontend/app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import styles from "./app.css?url";

export function links() {
  return [{ rel: "stylesheet", href: styles }];
}

// ✅ این کامپوننت در هنگام لود اولیه صفحه نشان داده می‌شود
export function HydrateFallback() {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"
        />
        <meta name="theme-color" content="#1f2937" />
        <title>Codenames - بازی گروهی آنلاین</title>
        <Meta />
        <Links />
      </head>
      <body>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading Codenames...</div>
        </div>
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"
        />
        <meta name="theme-color" content="#1f2937" />
        <title>Codenames - بازی گروهی آنلاین</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
