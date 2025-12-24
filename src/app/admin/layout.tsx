import type { Metadata } from 'next';
import ClientAdminLayout from './ClientAdminLayout';

export const metadata: Metadata = {
    title: 'CAPTURA Admin',
    description: 'Admin dashboard for CAPTURA camera rental management.',
    manifest: '/mobile-admin.webmanifest',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'CAPTURA Admin',
    },
};

export const viewport = {
    themeColor: '#000000',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function AdminLayoutServer({
    children,
}: {
    children: React.ReactNode;
}) {
    return <ClientAdminLayout>{children}</ClientAdminLayout>;
}
