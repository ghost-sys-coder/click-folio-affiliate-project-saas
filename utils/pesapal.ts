import { Pesapal } from "pesapal-v3-node";

export const pesapal = new Pesapal({
    consumerKey: process.env.PESAPAL_CONSUMER_KEY!,
    consumerSecret: process.env.PESAPAL_CONSUMER_SECRET!,
    environment: "sandbox"
});

