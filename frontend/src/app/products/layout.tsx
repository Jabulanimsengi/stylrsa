import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Beauty & Hair Products Marketplace | Stylr SA',
    description:
        'Shop quality beauty and hair products from trusted South African sellers. Find hair care, skincare, makeup, nail art supplies and more at great prices.',
    keywords: [
        'beauty products',
        'hair products',
        'South African beauty',
        'beauty marketplace',
        'hair care products',
        'skincare products',
        'nail art',
        'makeup products',
        'buy beauty products online',
        'Stylr SA',
        'hair extensions',
        'wigs',
        'braiding hair',
    ],
    openGraph: {
        title: 'Beauty & Hair Products Marketplace | Stylr SA',
        description:
            'Shop quality beauty and hair products from trusted South African sellers.',
        type: 'website',
        url: 'https://stylrsa.co.za/products',
    },
};

export default function ProductsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
