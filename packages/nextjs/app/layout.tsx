export const metadata = {
  title: "Payment Contract DApp",
  description: "Децентрализованное приложение для приёма платежей",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <main className="container mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}