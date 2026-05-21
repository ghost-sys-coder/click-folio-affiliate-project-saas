import React from 'react';
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

const CTASection = () => {
    return (
        <section className="bg-[#070711] px-6 py-24 text-white lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
                <TrendingUp className="mx-auto h-10 w-10 text-emerald-300" />
                <h2 className="mt-6 text-4xl font-bold tracking-tight">
                    Build your affiliate page before you build another messy campaign.
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/65">
                    Your first goal is not more tools. Your first goal is a clean page,
                    tracked links, and enough data to know what is working.
                </p>
                <div className="mt-8">
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                    >
                        Start free
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default CTASection