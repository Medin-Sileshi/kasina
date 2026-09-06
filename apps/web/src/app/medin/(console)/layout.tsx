import { AdminShell } from "../../admin/admin-shell";

export default function MedinConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell basePath="/medin" loginHref="/medin/login">
      {children}
    </AdminShell>
  );
}
