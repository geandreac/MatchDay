import { OwnerGuard } from "@/components/owner-guard";

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return <OwnerGuard>{children}</OwnerGuard>;
}
