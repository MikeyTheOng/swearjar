import React from 'react';
import { FieldError } from 'react-hook-form';

interface ErrorMessageProps {
    error?: FieldError;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
    if (!error) return null;

    return (
        <p className="mt-0.5 text-sm text-error">
            {error.message}
        </p>
    );
};

export default ErrorMessage;
