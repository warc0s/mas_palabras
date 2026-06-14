"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type SubmitButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
  children: ReactNode;
  icon?: string;
  pendingLabel?: ReactNode;
};

export function SubmitButton({
  children,
  className,
  disabled,
  icon,
  pendingLabel,
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      className={`${className ?? ""} disabled:cursor-not-allowed disabled:opacity-70`}
      disabled={isDisabled}
      type="submit"
      {...rest}
    >
      {icon ? <i className={icon} /> : null}
      <span>{pending && pendingLabel ? pendingLabel : children}</span>
    </button>
  );
}
