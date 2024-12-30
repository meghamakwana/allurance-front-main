'use client'; // Required for components using next/navigation in App Router

import React, { createContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie'; // Import js-cookie
import { FRONTEND_USERS } from "../utils/frontendAPIEndPoints";
import { getDecodedToken, getOnlyToken } from '../utils/frontendCommonFunction';
import { ManageAPIsData } from '../utils/commonFunction';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const user_token_data = getOnlyToken();
    const decodedlogtkn = getDecodedToken();
    const isUserLoggedIn = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

    const [user, setUser] = useState(null);
    const searchParams = useSearchParams(); // Use useSearchParams for query parameters

    const getMyProfileData = async () => {
        try {
            const response = await ManageAPIsData(`${FRONTEND_USERS}?id=${isUserLoggedIn}`, 'GET', '', user_token_data);
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData) {
                setUser(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        // Check for affiliate_id in the query parameters
        const affiliate_id = searchParams.get('affiliate');

        if (affiliate_id) {
            // Save affiliate_id in cookies
            Cookies.set('affiliate', affiliate_id, { expires: 7 }); // Set cookie with a 7-day expiry
        }

        if (isUserLoggedIn && user_token_data) {
            getMyProfileData();
        }
    }, [isUserLoggedIn, user_token_data, searchParams]); // Add searchParams to the dependency array

    const updateUser = (updatedUser) => {
        setUser(updatedUser);
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};
