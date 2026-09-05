"use server";

// -----------------------------------------------------------------------------
// Placing an order request (no online payment — see README "Order flow").
// -----------------------------------------------------------------------------
// Unlike consult/actions.ts, this Server Action is called directly as a
// plain async function from a click handler (see CheckoutForm.tsx), rather
// than through a <form action={...}>. Server Actions support both styles —
// use a <form> when the browser should handle the submission, and a direct
// call when you need to combine form fields with other client-side state
// first (here: the shopping cart, which lives in localStorage, not in any
// <input>). Either way, the code below still only ever runs on the server.
// -----------------------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import { checkoutSchema } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/orders";

export type CheckoutCartItemInput = {
  productId: string;
  size: string;
  quantity: number;
};

export type CheckoutContactDetails = {
  customerName: string;
  email: string;
  phone: string;
  deliveryAddress: string;
};

export type CheckoutResult =
  | { status: "success"; orderNumber: string }
  | {
      status: "error";
      message: string;
      fieldErrors?: Record<string, string[]>;
    };

export async function placeOrderRequest(
  contactDetails: CheckoutContactDetails,
  cartItems: CheckoutCartItemInput[]
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(contactDetails);
  if (!parsed.success) {
    return {
      status: "error",
      message: "Please fix the errors below and try again.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  if (cartItems.length === 0) {
    return { status: "error", message: "Your bag is empty." };
  }

  // IMPORTANT: we re-fetch each product's current name/price from the
  // database here rather than trusting whatever the browser sent us. The
  // cart in the browser only ever holds a *copy* of the price for display
  // purposes — a visitor could edit that copy before submitting (browser
  // dev tools make this trivial), so the price actually charged must always
  // come from the server's own data, never from client input.
  const productIds = [...new Set(cartItems.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  const orderNumber = generateOrderNumber();

  await prisma.orderRequest.create({
    data: {
      orderNumber,
      customerName: parsed.data.customerName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      deliveryAddress: parsed.data.deliveryAddress,
      items: {
        create: cartItems.map((item) => {
          const product = productsById.get(item.productId);
          return {
            productId: product?.id,
            // Snapshot the name/price NOW, so this order line still reads
            // correctly even if the product is later renamed or removed.
            productName: product?.name ?? "Unknown product",
            size: item.size,
            quantity: item.quantity,
            priceInMinorUnits: product?.priceInMinorUnits ?? 0,
          };
        }),
      },
    },
  });

  return { status: "success", orderNumber };
}
