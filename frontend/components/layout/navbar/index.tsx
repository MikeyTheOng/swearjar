import { Session } from "next-auth";

import { Button } from "@/components/ui/shadcn/button";
import { FaBars } from "react-icons/fa6";
import Link from 'next/link'
import {
    Sheet,
    SheetContent,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/shadcn/sheet"
import SignOutButton from "@/components/shared/SignOutButton";

export default function Navbar({ session }: { session: Session | null }) {
    return (
        <>
            <DesktopNavbar session={session} />
            <MobileNavbar session={session} />
        </>
    );
}

const DesktopNavbar = ({ session }: { session: Session | null }) => {
    return (
        <nav className="hidden sm:flex justify-between items-center px-6 py-[10px] border-b border-foreground/30">
            <div>
                <Brand />
            </div>
            <NavigationLinks name={session?.user?.Name || undefined} />
        </nav>
    );
};

const MobileNavbar = ({ session }: { session: Session | null }) => {
    return (
        <nav className="flex sm:hidden justify-between items-center px-6 py-[10px] border-b border-foreground/30">
            <div>
                <UserAuthLink name={session?.user?.Name || ''} />
            </div>
            <Sheet>
                <SheetTrigger>
                    <FaBars size={24} />
                </SheetTrigger>
                <SheetContent className="w-1/2 bg-white p-0">
                    <SheetTitle className="font-normal px-4 mt-6">
                        <Brand />
                    </SheetTitle>
                    <div className="mt-2 p-4 pt-0">
                        <NavigationLinks name={session?.user?.Name || undefined} />
                    </div>
                </SheetContent>
            </Sheet>
        </nav>
    );
};

const NavigationLinks = ({ name }: { name?: string }) => {
    return (
        <ul
            className="
                flex flex-col gap-1 text-xl tracking-tight
                sm:flex-row sm:items-center sm:gap-4 sm:text-base sm:tracking-normal 
                [&_a]:rounded-md [&_a]:ring-transparent [&_a]:transition-colors [&_a]:duration-300
                [&_a:focus]:outline-none
                [&_a:focus-visible]:ring-2 [&_a:focus-visible]:ring-primary [&_a:focus-visible]:ring-offset-2
            "
        >
            <li>
                <Link href="/">Home</Link>
            </li>
            <li>
                <Link href="/swearjar/list">Swear Jars</Link>
            </li>
            <li className="hidden sm:block">
                <UserAuthLink name={name} />
            </li>
        </ul>
    );
}

const Brand = () => {
    return (
        <div className="w-fit flex flex-col items-center select-none">
            <h3 className="w-full text-[22px] font-bold leading-[30px]">SwearJar</h3>
            <p className="w-full -mt-2 text-center text-[10px] text-foreground/50 uppercase tracking-widest leading-5">
                <span className="text-xs">J</span>ar{' '}
                <span className="text-xs">Y</span>our{' '}
                <span className="text-xs">H</span>abits
            </p>
        </div>
    )
}

const UserAvatar = ({ name }: { name: string }) => {
    return (
        <div className="daisy-dropdown daisy-dropdown-hover daisy-dropdown-bottom daisy-dropdown-start sm:daisy-dropdown-end">
            <div tabIndex={0} role="button" className="w-10 aspect-square flex items-center justify-center rounded-full bg-primary text-lg font-bold cursor-pointer select-none">
                {name.charAt(0).toUpperCase()}
            </div>
            <ul tabIndex={0} className="daisy-menu daisy-dropdown-content p-0 bg-base-100 rounded-lg border border-neutral-200 z-[1] w-52
                [&>li]:min-h-10 [&>li]:rounded-md [&>li]:hover:bg-neutral-100 [&>li]:text-lg [&>li]:sm:text-base 
                [&_li>*:not(ul):not(.menu-title):not(details):active]:bg-primary [&_li>*:not(ul):not(.menu-title):not(details):active]:text-foreground">
                <li>
                    <SignOutButton />
                </li>
            </ul>
        </div>
    )
}

const UserAuthLink = ({ name }: { name?: string }) => {
    if (name) {
        return <UserAvatar name={name} />
    }
    return (
        <Link href="/auth/login">
            <Button className="px-5">
                Login
            </Button >
        </Link>
    )
}