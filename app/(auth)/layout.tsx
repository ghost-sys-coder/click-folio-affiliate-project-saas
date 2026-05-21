import React from 'react';
import AuthImageRotator from '@/components/shared/AuthImageRotator';

interface AuthLayoutProps {
    children: React.ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {

    return (
        <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
            {/* auth image */}
            <div className="hidden md:block relative sticky top-0 h-screen">
                <AuthImageRotator />

                <div className="absolute inset-0 flex items-end p-10">
                    <div className="max-w-md rounded bg-black/30 p-6 text-white backdrop-blur-md space-y-5">
                        <p className='tracking-[0.25rem] text-emerald-300 font-medium text-sm'>ClickFolio</p>
                        <h1 className='text-2xl leading-tight mt-4 font-bold'>Organize your affiliate links. Track every click. Promote with clarity.</h1>
                        <p className="mt-4 text-sm leading-6 text-white/80">
                            Create a clean affiliate profile, manage your product links, measure what gets attention, and generate platform ready content from one focused dashboard
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4 justify-center items-center px-4 py-8 overflow-hidden relative">
                <AuthImageRotator className='block md:hidden absolute inset-0 -z-10 opacity-50'/>
                {children}
            </div>
        </div>
    )
}


export default AuthLayout