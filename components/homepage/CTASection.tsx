import React from 'react';
import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";

const CTASection = () => {
    return (
        <section className="bg-background px-6 py-24 text-foreground lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
                <TrendingUp className="mx-auto h-10 w-10 text-secondary" />
                <h2 className="mt-6 text-4xl font-bold tracking-tight">
                    Turn your next affiliate product into a trackable landing page
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
                    Generate a focused landing page, edit the copy with AI, share it with
                    campaign tracking, and see which clicks are worth your attention.
                </p>
                <div className="mt-8">
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        Start 7 day trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default CTASection
