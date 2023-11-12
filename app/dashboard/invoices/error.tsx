'use client';

import { useEffect } from "react";

export default function Error({
    error,
    reset
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    // error logging. may be any stdout
    useEffect(() => {
        console.error(error)
    }, [error]);

    return (
        <main className="flex h-full flex-col items-center justify-center">
            <div className="flex items-center flex-col">
                <h2 className="text-lg w-fit">Something went wrong!</h2>
                <h3 className="mt-1 text-2xl w-fit">{error.message}</h3>
            </div>
            <button
                className="mt-4 rounded-md bg-blue-500 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-400"
                onClick={
                    // Attempt to recover by trying to re-render the invoices route
                    () => reset()
                }
            >
                Try again
            </button>
        </main>
    );
}