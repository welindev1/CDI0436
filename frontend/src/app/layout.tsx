import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CDI0436",
  description: "Centro de desarrollo caminando con jesus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
}
