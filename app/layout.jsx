import './globals.css';

export const metadata = {
  title: 'Arrangeur Kabyle',
  description:
    "Generateur interactif d'arrangements pour chansons kabyles melant tradition et modernite.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
