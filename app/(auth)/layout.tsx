import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DatabaseSetupRequired } from "@/components/shared/database-setup-required";
import AuthImageRotator from "@/components/shared/AuthImageRotator";
import { getOnboardingStateByClerkUserId } from "@/db/profiles";
import { appThemes } from "@/lib/themes";

interface AuthLayoutProps {
    children: React.ReactNode
}

export const dynamic = "force-dynamic";

const AuthLayout = async ({ children }: AuthLayoutProps) => {
    const { userId } = await auth();

    if (userId) {
        const onboardingStateResult = await getOnboardingStateByClerkUserId(userId);

        if (!onboardingStateResult.ok) {
            return (
                <div data-theme={appThemes.signalPurple} className="grid min-h-screen grid-cols-1 bg-background text-foreground md:grid-cols-2">
                    <div className="hidden md:block relative sticky top-0 h-screen">
                        <AuthImageRotator />
                    </div>
                    <div className="flex flex-col gap-4 justify-center items-center px-4 py-8 overflow-hidden relative bg-background">
                        <AuthImageRotator className='block md:hidden absolute inset-0 -z-10 opacity-50'/>
                        <DatabaseSetupRequired
                            title="Authentication is ready, but app setup is incomplete"
                            description="Clickfolio could not read the users and profiles tables needed to decide where to route your account. Run your migrations and confirm DATABASE_URL is configured."
                        />
                    </div>
                </div>
            )
        }

        redirect(onboardingStateResult.state.profileId ? "/admin" : "/onboarding");
    }

    return (
        <div data-theme={appThemes.signalPurple} className="grid min-h-screen grid-cols-1 bg-background text-foreground md:grid-cols-2">
            <div className="hidden md:block relative sticky top-0 h-screen">
                <AuthImageRotator />

                <div className="absolute inset-0 flex items-end p-10">
                    <div className="max-w-md space-y-5 rounded border border-border bg-card p-6 text-foreground shadow-2xl backdrop-blur-md">
                        <p className='text-sm font-medium tracking-[0.25rem] text-secondary'>ClickFolio</p>
                        <h1 className='text-2xl leading-tight mt-4 font-bold'>Organize your affiliate links. Track every click. Promote with clarity.</h1>
                        <p className="mt-4 text-sm leading-6 text-muted-foreground">
                            Create a clean affiliate profile, manage your product links, measure what gets attention, and generate platform ready content from one focused dashboard
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 justify-center items-center px-4 py-8 overflow-hidden relative bg-background">
                <AuthImageRotator className='block md:hidden absolute inset-0 -z-10 opacity-50'/>
                {children}
            </div>
        </div>
    )
}


export default AuthLayout
