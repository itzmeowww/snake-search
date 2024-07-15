import createMiddleware from "next-intl/middleware";

export default createMiddleware({
  locales: ["ja", "en"],
  defaultLocale: "ja",
});

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(ja|en)/:path*"],
};
