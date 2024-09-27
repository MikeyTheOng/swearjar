"use client";
import { fetcher } from '@/lib/utils';
import { FormData } from './SwearJarForm';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFieldArray, useFormContext } from "react-hook-form";
import { useQuery } from '@tanstack/react-query';
import { User } from '@/lib/types';

import { Label } from '@/components/ui/shadcn/label';
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions, Field } from '@headlessui/react';
import { FaChevronDown, FaTimes } from "react-icons/fa";
import { FaCheck } from "react-icons/fa6";


export default function AddUserComboBox() {
    const { control } = useFormContext<FormData>();
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'additionalOwners',
    });

    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState(query);
    const [displayMessage, setDisplayMessage] = useState('Loading...');
    const containerRef = useRef<HTMLDivElement>(null);
    const [dropdownWidth, setDropdownWidth] = useState<string | number>("auto");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 500); // 0.5s debounce

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    const { data: results, isFetching, isError, error } = useQuery<User[]>({
        queryKey: ['frontend/app/api/search/user', debouncedQuery],
        queryFn: () => fetcher<User[]>('/api/search/user', { query: debouncedQuery }),
        enabled: !!debouncedQuery,
        retry: false,
    });

    const filteredResults = debouncedQuery === ''
        ? results || []
        : (results || []).filter((result) => {
            return result.Email.toLowerCase().includes(debouncedQuery.toLowerCase());
        });

    useEffect(() => {
        if (isError) {
            console.log("Error fetching users:", error);
            setDisplayMessage('An error occurred, please try again');
        } else if (isFetching || query !== debouncedQuery) {
            setDisplayMessage('Loading...');
        } else if (filteredResults.length === 0) {
            setDisplayMessage('No results found');
        }
    }, [isFetching, query, debouncedQuery, isError]);

    const removeUser = (index: number) => {
        remove(index);
    };

    useLayoutEffect(() => {
        if (containerRef.current) {
            setDropdownWidth(containerRef.current.offsetWidth);
        }
    }, [fields, query]);

    return (
        <Field>
            <Label htmlFor="other-owners">
                Add other owners <span className="text-xs text-foreground/30 tracking-tighter italic font-normal">(optional)</span>
            </Label>
            <Combobox
                multiple
                value={fields.map(field => field.Email)}
                onChange={(selectedEmails) => {
                    console.log("Selected Emails:", selectedEmails);
                    // 1. Map selectedEmails to corresponding User objects
                    const selectedUsers = results?.filter(user => selectedEmails.includes(user.Email)) || [];

                    // 2. Handle adding new selections
                    selectedUsers.forEach(user => {
                        if (!fields.some(field => field.Email === user.Email)) {
                            append(user);
                        }
                    });

                    // 3. Handle removing deselections
                    fields.forEach((field, index) => {
                        if (!selectedEmails.includes(field.Email)) {
                            remove(index);
                        }
                    });
                }}
                onClose={() => setQuery('')}
            >
                <div ref={containerRef} className="relative group mt-1">
                    <label htmlFor="other-owners">
                        <div className="flex flex-wrap items-center gap-1 border border-input/10 bg-white px-3 py-2 rounded-md text-sm placeholder:text-input/50 disabled:cursor-not-allowed disabled:opacity-50 transition ease-in-out duration-150 hover:border-primary focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary focus-within:border-primary">
                            {fields.map((field, index) => (
                                <button
                                    key={field.id}
                                    className='group/button px-2 py-0.5 text-xs bg-primary rounded-full hover:bg-primary/60 flex items-center justify-between gap-1 transition duration-150 ease-in-out'
                                    onClick={() => removeUser(index)}
                                >
                                    <p>{field.Email}</p>
                                    <span className='group-hover/button:text-error transition duration-150 ease-in-out'><FaTimes /></span>
                                </button>
                            ))}
                            <ComboboxInput
                                id="other-owners"
                                aria-label="Assignees"
                                onChange={(event) => setQuery(event.target.value)}
                                className="w-max bg-transparent text-sm placeholder:text-input/50 focus-visible:outline-none selection:bg-secondary selection:text-white"
                                placeholder={fields.length === 0 ? 'Search by email' : ''}
                                autoComplete='off'
                                value={query}
                            />
                        </div>
                    </label>
                    <ComboboxButton className="hidden absolute inset-y-0 right-0 px-2.5">
                        <FaChevronDown className="size-4 fill-input/10 group-hover:fill-primary transition ease-in-out duration-150" />
                    </ComboboxButton>
                    <ComboboxOptions className={`absolute my-1 border rounded-lg py-2 shadow-md empty:invisible ${isError ? "bg-red-300 border-red-300 text-error-content" : "bg-white"}`} style={{ width: dropdownWidth }}>
                        {filteredResults.length > 0 ? (
                            filteredResults.map((result) => (
                                <ComboboxOption
                                    key={result.UserId}
                                    value={result.Email}
                                    className="group px-2 py-1 text-foreground/70 data-[focus]:bg-primary/50 flex gap-2 items-center"
                                >
                                    <p className='text-foreground'>{result.Email} <span className='italic text-xs text-input/50'>({result.Name})</span></p>
                                    <FaCheck className={`size-4 fill-secondary ${fields.some(field => field.Email === result.Email) ? "visible" : "invisible"}`} />
                                </ComboboxOption>
                            ))
                        ) : (
                            <div className="px-2 py-1 text-foreground/70">{displayMessage}</div>
                        )}
                    </ComboboxOptions>
                </div>
            </Combobox>
        </Field >
    );
}
