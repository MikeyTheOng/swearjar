interface BreadcrumbHeaderProps {
    title: string;
    subtitle?: string;
}

export default function BreadcrumbHeader({ title, subtitle }: BreadcrumbHeaderProps) {
    return (
        <header>
            {/* <div className="mt-2">
                <p>Home / SwearJars</p>
            </div> */}
            <div className="mt-4">
                <h1 className="text-4xl md:text-4xl font-bold tracking-tight">{title}</h1>
                {subtitle && <p className="text-foreground/50 tracking-tighter">{subtitle}</p>}
            </div>
        </header>
    )
}