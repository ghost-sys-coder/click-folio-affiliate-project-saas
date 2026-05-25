import React from 'react'
import BenefitCard from '../shared/BenefitCard'
import page from '@/app/admin/links/[id]/edit/page'

const BuiltForPromotion = () => {
  const benefits = [
    "AI generated landing pages",
    "Campaign URL tracking",
    "Affiliate link management",
    "Content and page editing"
  ]
  return (
    <section className="bg-surface px-6 py-24 text-foreground lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] border border-border bg-background p-8 text-foreground md:p-12">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-secondary">
                Built for affiliate campaigns
              </p>
              <h2 className="mt-4 text-4xl font-bold tracking-tight">
                Build focused pages for the products you promote.
              </h2>
              <p className="mt-4 text-lg leading-8 text-muted-foreground">
                Affiliate marketers can turn product links into campaign ready pages, then track what works.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {benefits.map((benefit, index) => <BenefitCard key={index} title={benefit} />)}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default BuiltForPromotion
