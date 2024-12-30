// src/utils/apiUtils.js
export const fetchFromAPI = async (url, method = 'GET', body = null, token = '') => {
    try {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }

        const options = {
            method,
            headers,
        };

        // Only add the body if the method is not GET or HEAD
        if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(error);
        return { data: null };
    }
};
