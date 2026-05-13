export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="min-h-screen pt-16">{children}</main>
    </>
  );
}
