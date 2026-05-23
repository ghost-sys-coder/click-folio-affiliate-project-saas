"use client";
import React, { useState } from 'react';
import Link from "next/link";
import { Check } from "lucide-react";
import { Plan } from './PricingSection';
import { Button } from '../ui/button';
import axios from 'axios';

const PricingCard = ({ plan }: { plan: Plan }) => {
    // test payments with pesapal
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscription = async () => {
        setIsSubscribing(true);
        try {
            const response = await axios.post("/api/payments/pesapal/create-order");
            console.log("Pesapal order response", response.data);
                if (response.data.success) {
                    const { order } = response.data;
                    // Redirect the user to the Pesapal payment page
                    window.location.href = order.redirect_url;
                } else {
                    console.error("Failed to create Pesapal order", response.data.message);
                }
        } catch (error) {
            console.error("Error creating Pesapal order", error);
        } finally {
            setIsSubscribing(false);
        }
    } 
    return (
        <div
            key={plan.name}
            className={`rounded-3xl border p-8 ${plan.highlighted
                    ? "border-primary bg-background text-foreground shadow-xl"
                    : "border-border bg-card text-foreground"
                }`}
        >
            <div className="flex items-center justify-between gap-4">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                {plan.highlighted ? (
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        Best start
                    </span>
                ) : null}
            </div>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {plan.description}
            </p>

            <div className="mt-6 flex items-end gap-1">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="pb-1 text-sm text-muted-foreground">
                    per month
                </span>
            </div>

            <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-sm">
                        <Check
                            className={`mt-0.5 h-4 w-4 flex-none ${plan.highlighted ? "text-secondary" : "text-accent"
                                }`}
                        />
                        <span className="text-muted-foreground">
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>

            <Button
                // href={plan.href}
                className={`mt-8 inline-flex w-full items-center justify-center rounded-full px-5 py-5 text-sm font-semibold transition ${plan.highlighted
                        ? "bg-foreground text-background hover:bg-foreground/90"
                        : "bg-primary text-primary-foreground hover:bg-primary-hover"
                    }`}
                onClick={handleSubscription}
                disabled={isSubscribing}
            >
                {isSubscribing ? "Processing..." : plan.cta}
            </Button>
        </div>
    )
}

export default PricingCard
