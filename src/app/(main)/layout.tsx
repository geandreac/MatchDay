import { Header } from "@/components/header";
import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col bg-background">
      <Header />
      <main className="flex-1 px-5 pb-28 pt-5">{children}</main>
      <BottomNav />
    </div>
  );
}
