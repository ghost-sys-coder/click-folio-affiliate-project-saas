import React from 'react';
import Link from 'next/link';
import { MousePointerClick, ExternalLink, Check } from 'lucide-react';

const HomepageNavbar = () => {
    return (
        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
                    <MousePointerClick className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-semibold tracking-tight">
                    Clickfolio
                </span>
            </Link>

            <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
                <Link href="#features" className="hover:text-white">
                    Features
                </Link>
                <Link href="#how-it-works" className="hover:text-white">
                    How it works
                </Link>
                <Link href="#pricing" className="hover:text-white">
                    Pricing
                </Link>
            </nav>

            <div className="flex items-center gap-3">
                <Link
                    href="/sign-in"
                    className="hidden text-sm font-medium text-white/75 hover:text-white sm:inline-flex"
                >
                    Sign in
                </Link>
                <Link
                    href="/sign-up"
                    className="inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#070711] transition hover:bg-white/90"
                >
                    Start free
                </Link>
            </div>
        </header>
    )
}

export default HomepageNavbar