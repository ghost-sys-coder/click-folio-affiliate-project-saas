import React from 'react'
import BenefitCard from '../shared/BenefitCard'

const BuiltForPromotion = () => {
  return (
    <section className="bg-white px-6 py-24 text-slate-950 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-slate-950 p-8 text-white md:p-12">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25rem] text-emerald-300">
                  Built for promotion
                </p>
                <h2 className="mt-4 text-4xl font-bold tracking-tight">
                  Stop guessing which links deserve your attention.
                </h2>
                <p className="mt-4 text-lg leading-8 text-white/65">
                  Clickfolio gives affiliate marketers a cleaner way to manage
                  links and a practical way to understand what content is
                  driving clicks.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <BenefitCard title="Cleaner sharing" />
                <BenefitCard title="Better tracking" />
                <BenefitCard title="Faster content output" />
                <BenefitCard title="Clearer affiliate disclosures" />
              </div>
            </div>
          </div>
        </div>
      </section>
  )
}

export default BuiltForPromotion