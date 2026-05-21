import React from 'react'
import Link from "next/link";

const HomepageFooterSection = () => {
    return (
        <footer className="border-t border-white/10 bg-[#070711] px-6 py-8 text-white/55 lg:px-8">
            <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
                <p>© {new Date().getFullYear()} Clickfolio. All rights reserved.</p>
                <div className="flex gap-5">
                    <Link href="/privacy" className="hover:text-white">
                        Privacy
                    </Link>
                    <Link href="/terms" className="hover:text-white">
                        Terms
                    </Link>
                    <Link href="/sign-in" className="hover:text-white">
                        Sign in
                    </Link>
                </div>
            </div>
        </footer>
    )
}

export default HomepageFooterSection