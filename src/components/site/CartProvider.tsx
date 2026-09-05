"use client";

// -----------------------------------------------------------------------------
// Shopping cart — lives only in the visitor's browser.
// -----------------------------------------------------------------------------
// Shoppers never create accounts (see README), so there is no "cart" table
// in the database. Instead this is a small React Context that keeps the
// cart in memory + localStorage, so it survives page navigations and even
// closing/reopening the browser tab.
//
// "use client" at the top of this file marks it (and everything it renders)
// as a Client Component — it needs to run in the browser because it uses
// React state and localStorage, neither of which exist on the server. Most
// other files in this app are plain Server Components by default; this is
// one of the few places that needs the opposite.
//
// How to use it elsewhere:
//   const { items, addItem, itemCount } = useCart();
// -----------------------------------------------------------------------------

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  size: string;
  priceInMinorUnits: number;
  quantity: number;
  imageUrl: string;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotalInMinorUnits: number;
};

const CartContext = createContext<CartContextValue | null>(null);

// The localStorage key everything is saved under. Bump this (e.g. to
// "tolu-kifa-cart-v2") if you ever change the CartItem shape in a way that
// would break reading old saved carts.
const STORAGE_KEY = "tolu-kifa-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  // Tracks whether we've finished reading any previously-saved cart, so we
  // don't accidentally overwrite it with an empty array before that read
  // has happened (see the two effects below).
  const [hasLoadedFromStorage, setHasLoadedFromStorage] = useState(false);

  // Why this reads localStorage in an effect instead of a lazy useState
  // initializer (`useState(() => ...)`, which is normally the better way to
  // compute initial state): this component is server-rendered first (for
  // the page's initial HTML) and then "hydrated" in the browser — and
  // localStorage doesn't exist on the server. If we read it during the
  // initial render, the server's output (always an empty cart) and the
  // client's first render (whatever was actually saved) would disagree,
  // which React treats as a hydration error. Deferring the read to an
  // effect guarantees both the server render AND the client's first render
  // show an empty cart, and only the render *after* that (once the effect
  // has run) shows what was really saved — no mismatch.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: avoids a localStorage/SSR hydration mismatch, see comment above
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // localStorage can be unavailable (private browsing, disabled
      // storage) or hold corrupted JSON — either way, just start empty.
    } finally {
      setHasLoadedFromStorage(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedFromStorage) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore write failures (e.g. storage disabled) — the cart still
      // works for the rest of this browser session, it just won't persist.
    }
  }, [items, hasLoadedFromStorage]);

  function addItem(newItem: CartItem) {
    setItems((current) => {
      const existingIndex = current.findIndex(
        (item) =>
          item.productId === newItem.productId && item.size === newItem.size
      );
      if (existingIndex === -1) return [...current, newItem];

      const updated = [...current];
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: updated[existingIndex].quantity + newItem.quantity,
      };
      return updated;
    });
  }

  function removeItem(productId: string, size: string) {
    setItems((current) =>
      current.filter(
        (item) => !(item.productId === productId && item.size === size)
      )
    );
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    if (quantity < 1) {
      removeItem(productId, size);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalInMinorUnits = items.reduce(
    (sum, item) => sum + item.priceInMinorUnits * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotalInMinorUnits,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/** Read/update the cart from any Client Component nested under <CartProvider>. */
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart() must be used inside a <CartProvider>");
  }
  return context;
}
