import React from 'react'
import { SignIn } from '@clerk/nextjs'
import { signalPurpleClerkAppearance } from '@/lib/themes'

const SignInPage = () => {
  return (
    <SignIn appearance={signalPurpleClerkAppearance} />
  )
}

export default SignInPage
