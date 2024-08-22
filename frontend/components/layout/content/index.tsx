import { ReactNode } from 'react';

interface DefaultContentLayoutProps {
    children: ReactNode;
}

export default function DefaultContentLayout({ children }: DefaultContentLayoutProps) {
    return (
        <main className="">
            {children}
        </main>
    );
}