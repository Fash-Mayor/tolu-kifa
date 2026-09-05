"use client";

// A submit button that asks "are you sure?" via the browser's built-in
// confirm() popup before letting the form it's inside actually submit.
// Used for anything destructive (deleting a product, an image, etc).
export function DeleteButton({
  confirmMessage,
  children,
  className,
}: {
  confirmMessage: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
