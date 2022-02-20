import { createContext, useContext, useEffect } from 'react';
import { useState } from 'react';

const GeolocationContext = createContext();

export function GeolocationProvider({ children }) {
    const [currentPosition, setCurrentPosition] = useState(null);

    return (
        <GeolocationContext.Provider value={{
            currentPosition, setCurrentPosition
        }}>
            {children}
        </GeolocationContext.Provider>
    );
}

export function useGeolocationContext() {
    return useContext(GeolocationContext);
}