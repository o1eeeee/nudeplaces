import { createContext, useContext } from 'react';
import { useState } from 'react';

const HistoryContext = createContext();

export function HistoryProvider({ previousPath, children }) {
    const [ previousZoom, setPreviousZoom ] = useState(null);
    const [ previousMapPosition, setPreviousMapPosition ] = useState(null);

    return (
        <HistoryContext.Provider value={{
            previousPath, previousZoom, setPreviousZoom, previousMapPosition, setPreviousMapPosition
        }}>
            {children}
        </HistoryContext.Provider>
    );
}

export function useHistoryContext() {
    return useContext(HistoryContext);
}