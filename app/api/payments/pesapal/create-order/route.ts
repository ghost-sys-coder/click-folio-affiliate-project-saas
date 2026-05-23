import { NextRequest, NextResponse } from "next/server";
import { pesapal } from "@/utils/pesapal";

export async function POST(req: NextRequest) {
  try {
    const order = await pesapal.orders.submitOrder({
      id: `order-${Date.now()}`,
      amount: 100,
      currency: "UGX",
      description: "Test order",
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/pesapal/callback`,
      notification_id: `notif-${Date.now()}`,
      billing_address: {
        email_address: "franktamalejr@gmail.com",
        phone_number: "0700000000",
        first_name: "John",
        last_name: "Doe",
      },
    });
      
      console.log("Pesapal order created", order.redirect_url);

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error creating Pesapal order", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to create Pesapal order",
      },
      { status: 500 },
    );
  }
}
