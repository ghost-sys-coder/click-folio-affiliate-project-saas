import React from 'react'
import { SignUp } from '@clerk/nextjs'
import { signalPurpleClerkAppearance } from '@/lib/themes'

const SignUpPage = () => {
  return (
    <SignUp
      appearance={signalPurpleClerkAppearance}
      forceRedirectUrl="/onboarding"
      fallbackRedirectUrl="/onboarding"
    />
  )
}

export default SignUpPage
