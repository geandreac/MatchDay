export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="main-content" className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      {/* Background effects */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-accent/5 blur-[120px]" />
      </div>
      {children}
    </main>
  );
}
