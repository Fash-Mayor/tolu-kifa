import type { Metadata } from "next";
import { NewProductForm } from "./NewProductForm";

export const metadata: Metadata = { title: "Add a Product" };

export default function NewProductPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-olive-dark">Add a product</h1>
      <div className="mt-6">
        <NewProductForm />
      </div>
    </div>
  );
}
