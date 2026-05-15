export default function DiscussionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-[calc(100dvh-5rem)] min-h-0 overflow-hidden lg:h-[calc(100dvh-2rem)] -mx-4 lg:-mx-6">
      {children}
    </div>
  );
}
