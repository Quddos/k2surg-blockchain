export const metadata = {
  title: "K2Surg Dashboard",
  description: "K2Surg blockchain dashboard",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
