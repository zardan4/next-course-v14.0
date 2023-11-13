import '@/app/ui/global.css'
import { inter } from './ui/fonts';
import { Metadata } from 'next';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} antialiased`}>{children}</body>
		</html>
	);
}

export const metadata: Metadata = {
	title: {
		template: '%s | Acme Dashboard',
		default: 'idk'
	},
	description: `I just wanna kms.`,
	metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
};