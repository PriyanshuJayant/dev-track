import { useState, useEffect } from 'react';

/**
 * Hook to manage state synchronized with localStorage.
 * @param {string} key - The key to store the data under.
 * @param {any} initialValue - The initial value if no data exists.
 * @returns {[any, Function]} - The stored value and a setter function.
 */
export function useLocalStorage(key, initialValue) {
    // Get from local storage then ...
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error(error);
            return initialValue;
        }
    });

    // Return a wrapped version of useState's setter function that ...
    // ... persists the new value to localStorage.
    const setValue = (value) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;
            // Save state
            setStoredValue(valueToStore);
            // Save to local storage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(error);
        }
    };

    return [storedValue, setValue];
}
