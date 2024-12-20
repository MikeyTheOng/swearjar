'use client'

import ErrorMessage from "@/components/shared/ErrorMessage";
import { Input } from "@/components/ui/shadcn/input"
import { IconContext } from "react-icons";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { FieldError, FieldErrors, UseFormRegister } from "react-hook-form";
import { useState } from 'react';

interface PasswordInputProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
}

export default function PasswordInput({ register, errors }: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex flex-col space-y-1.5">
            <div className="relative group transition ease-in-out duration-100">
                <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="********"
                    className="group-focus-within:border-primary"
                    {...register("Password", {
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message: "Password must be more than 8 characters"
                        },
                        maxLength: {
                            value: 32,
                            message: "Password must be less than 32 characters"
                        },
                        pattern: {
                            value: /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).+$/,
                            message: "Password must contain at least one uppercase letter and one special character"
                        }
                    })}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="group absolute right-0 top-0 h-full mr-3 z-10 focus-visible:outline-none"
                >
                    <IconContext.Provider value={{ className: "bg-transparent fill-foreground/20 hover:fill-foreground/50 group-focus-within:fill-foreground/50 transition ease-in-out duration-150" }}>
                        {showPassword ? <IoEyeOff size="20" /> : <IoEye size="20" />}
                    </IconContext.Provider>
                </button>
            </div>
            {errors.Password && <ErrorMessage error={errors.Password as FieldError} />}
        </div>
    );
};
