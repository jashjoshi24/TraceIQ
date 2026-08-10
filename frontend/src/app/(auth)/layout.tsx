// Public auth pages (login/register/forgot-password/reset-password) render
// with no dashboard chrome and no auth requirement - each page component
// (Login, Register, ...) already renders its own full-page centered layout.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
