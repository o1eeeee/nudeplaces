import { createContext, useContext } from 'react';
import { useState } from 'react';

const HistoryContext = createContext();

export function HistoryProvider({ previousPath, children }) {
    const [previousCountry, setPreviousCountry] = useState(null);

    return (
        <HistoryContext.Provider value={{
            previousCountry, setPreviousCountry, previousPath,
        }}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistoryContext() {
    return useContext(HistoryContext);
}