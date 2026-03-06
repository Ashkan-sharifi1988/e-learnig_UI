import React, { createContext, useState, useEffect } from 'react';

// Create Basket context
export const Basket = createContext();

export const BasketProvider = ({ children }) => {
    const [basket, setBasket] = useState([]);
    const [userId, setUserId] = useState(null);

    // Load basket from session storage when userId changes
    useEffect(() => {
        if (userId) {
            const userBasketKey = `basket_${userId}`;
            const storedBasket = sessionStorage.getItem(userBasketKey);
            setBasket(storedBasket ? JSON.parse(storedBasket) : []);
        } else {
            setBasket([]); // Clear basket if userId is null
        }
    }, [userId]);

    // Add a course to the basket
    const addToBasket = (courseID) => {
        if (!userId) {
            console.warn('Cannot add to basket: User not logged in');
            return;
        }
        if (!courseID) {
            console.warn('Cannot add to basket: Invalid course ID');
            return;
        }

        const userBasketKey = `basket_${userId}`;
        const existingBasket = JSON.parse(sessionStorage.getItem(userBasketKey)) || [];

        if (existingBasket.includes(courseID)) {
            console.log(`Course ${courseID} is already in the basket`);
            return; // Prevent duplicates
        }

        const updatedBasket = [...existingBasket, courseID];
        setBasket(updatedBasket); // Update basket state
        sessionStorage.setItem(userBasketKey, JSON.stringify(updatedBasket)); // Persist to session storage
        console.log(`Course ${courseID} added to basket`);
    };

    // Remove a course from the basket
    const removeFromBasket = (courseID) => {
        if (!userId) {
            console.warn('Cannot remove from basket: User not logged in');
            return;
        }
        if (!courseID) {
            console.warn('Cannot remove from basket: Invalid course ID');
            return;
        }

        const userBasketKey = `basket_${userId}`;
        const updatedBasket = basket.filter((id) => id !== courseID);
        setBasket(updatedBasket); // Update basket state
        sessionStorage.setItem(userBasketKey, JSON.stringify(updatedBasket)); // Persist to session storage
        console.log(`Course ${courseID} removed from basket`);
    };

    // Clear the basket for the current user
    const clearBasket = () => {
        if (!userId) {
            console.warn('Cannot clear basket: User not logged in');
            return;
        }

        const userBasketKey = `basket_${userId}`;
        setBasket([]); // Clear basket state
        sessionStorage.removeItem(userBasketKey); // Remove from session storage
        console.log('Basket cleared');
    };
    

    return (
        <Basket.Provider
            value={{
                basket,
                addToBasket,
                removeFromBasket,
                clearBasket,
                setUserId, // Allow setting userId externally
            }}
        >
            {children}
        </Basket.Provider>
    );
};
