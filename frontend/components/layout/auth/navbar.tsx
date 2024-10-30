import Link from "next/link"

export default function AuthNavbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 
            px-6 py-[10px] bg-primary text-black/70 flex flex-col gap-1 text-sm tracking-tight sm:flex-row sm:items-center sm:gap-4 sm:text-base sm:tracking-normal 
            [&_a]:font-semibold [&_a]:rounded-md [&_a]:ring-transparent [&_a]:transition-colors [&_a]:duration-150 
            [&_a:hover]:text-white [&_a:hover]:underline
            [&_a:focus]:outline-none [&_a:focus-visible]:underline [&_a:focus-visible]:text-primary">
            <ul className="flex flex-row gap-4">
                <li>
                    <Link href="/auth/signup">Sign Up</Link>
                </li>
                <li>
                    <Link href="/auth/login">Login</Link>
                </li>
            </ul>
        </nav>
    )
}
