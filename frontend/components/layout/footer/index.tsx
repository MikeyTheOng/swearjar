export default function Footer() {
    const year = new Date().getFullYear();
    return (
        <footer className="bg-background-300 py-6 flex justify-center z-50">
            <div className="bg-background-300 text-sm text-muted-foreground">&copy; {year} SwearJar | Developed by Michael Ong</div>
        </footer>
    )
}