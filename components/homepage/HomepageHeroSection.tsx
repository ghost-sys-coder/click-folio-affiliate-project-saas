import React from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, BarChart3 } from 'lucide-react';
import MetricCard from '../shared/MetricCard';
import TopLink from '../shared/TopLink';

const HomepageHeroSection = () => {
    return (
        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-14 px-6 pb-24 pt-14 lg:grid-cols-2 lg:px-8 lg:pb-32 lg:pt-20">
            <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground backdrop-blur">
                    <Sparkles className="h-4 w-4 text-secondary" />
                    Built for affiliate marketers who need structure
                </div>

                <h1 className="max-w-3xl text-5xl font-bold tracking-tight text-foreground md:text-6xl">
                    Turn scattered affiliate links into a trackable storefront.
                </h1>

                <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                    Create a polished affiliate page, organize every offer, track
                    clicks, and generate platform ready content from one focused
                    dashboard.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                        href="/sign-up"
                        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
                    >
                        Create your Clickfolio
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>

                    <Link
                        href="#features"
                        className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-card"
                    >
                        See features
                    </Link>
                </div>

                <div className="mt-10 grid max-w-xl grid-cols-3 gap-4 border-t border-border pt-8">
                    <div>
                        <p className="text-2xl font-bold">1 page</p>
                        <p className="mt-1 text-sm text-muted-foreground">For every offer</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">Live clicks</p>
                        <p className="mt-1 text-sm text-muted-foreground">Tracked daily</p>
                    </div>
                    <div>
                        <p className="text-2xl font-bold">AI posts</p>
                        <p className="mt-1 text-sm text-muted-foreground">For promotion</p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-primary/20 blur-3xl" />

                <div className="relative rounded-[2rem] border border-border bg-card p-4 shadow-2xl backdrop-blur">
                    <div className="rounded-[1.5rem] bg-surface p-5">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Dashboard</p>
                                <h2 className="text-xl font-semibold">Overview</h2>
                            </div>
                            <div className="rounded-full bg-secondary/10 px-3 py-1 text-sm text-secondary">
                                Live
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            <MetricCard label="Total clicks" value="12,846" change="+18.6%" />
                            <MetricCard label="Active links" value="128" change="+8.5%" />
                            <MetricCard label="Top source" value="TikTok" change="42%" />
                        </div>

                        <div className="mt-4 rounded-2xl border border-border bg-card p-5">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Clicks over time</p>
                                    <h3 className="font-semibold">May performance</h3>
                                </div>
                                <BarChart3 className="h-5 w-5 text-accent" />
                            </div>

                            <div className="flex h-40 items-end gap-2">
                                {[40, 55, 48, 72, 60, 88, 70, 94, 82, 110, 96, 124].map(
                                    (height, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-1 items-end rounded-full bg-primary/15"
                                        >
                                            <div
                                                className="w-full rounded-full bg-linear-to-t from-primary to-secondary"
                                                style={{ height }}
                                            />
                                        </div>
                                    )
                                )}
                            </div>
                        </div>

                        <div className="mt-4 space-y-3">
                            <TopLink title="Smartwatch Pro" clicks="2,450" />
                            <TopLink title="Wireless Earbuds" clicks="1,987" />
                            <TopLink title="Creator Course" clicks="1,430" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomepageHeroSection
