import '../globals.css';

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="bg-white">{children}</body>
    </html>
  );
}
