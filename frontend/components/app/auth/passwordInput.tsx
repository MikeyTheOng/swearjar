'use client'

import { Input } from "@/components/ui/input"
import { useState } from 'react';
import { IoEye, IoEyeOff } from "react-icons/io5";
import { IconContext } from "react-icons";
import { FieldErrors, UseFormRegister } from "react-hook-form";

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
                    className="group absolute right-0 top-0 h-full mr-3 z-10"
                >
                    <IconContext.Provider value={{ className: "bg-transparent fill-input/20 hover:fill-input/70 group-focus-within:fill-input/70 transition ease-in-out duration-150" }}>
                        {showPassword ? <IoEyeOff size="20" /> : <IoEye size="20" />}
                    </IconContext.Provider>
                </button>
            </div>
            {errors.Password && <span className="text-error">{String(errors.Password.message)}</span>}
        </div>
    );
};
