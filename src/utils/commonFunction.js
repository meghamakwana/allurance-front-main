import { query } from "./database";

// Fetch Single ID
export const getQueryParamId = (url) => new URL(url).searchParams.get('id');

// Fetch Multiple IDs
export const getQueryParamIds = (url) => {
    const idsString = url.searchParams.get('ids');
    return idsString ? idsString.split(',').map(id => parseInt(id, 10)) : [];
};

export const getRecordById = async (id, tableName, orderBy) => {
    try {
        const condition = id != null ? 'AND id = ?' : '';
        return await query(`SELECT * FROM ${tableName} WHERE status = 1 ${condition} ORDER BY ${orderBy} DESC`, id ? [id] : []);
    } catch (error) {
        throw new Error(`Error fetching record by ID: ${error.message}`);
    }
};

const fetchReviews = async (url, token) => {
    const response = await ManageAPIsData(url, "GET", {}, token);
    if (!response || response.error) {
        throw new Error("Failed to fetch reviews");
    }
    return response.data;
};

// Manange API Operations
export const ManageAPIsData = async (apiUrl, fetchMethod, data = {}, accessToken = '') => {
    const requestOptions = {
        method: fetchMethod,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}` // Add the Authorization header
        },
    };

    // Only include the body for non-GET and non-DELETE requests
    if (fetchMethod !== 'GET' && fetchMethod !== 'DELETE') {
        requestOptions.body = JSON.stringify(data);
    }

    const response = await fetch(apiUrl, requestOptions);
    return response;
}

export const createFileOptions = async (file) => {

    try {
        const response = await fetch(file.preview); // Fetch file data
        const blob = await response.blob(); // Convert response to Blob
        const base64FileData = await blobToBase64(blob); // Convert Blob to base64
        return {
            imageData: base64FileData,
            path: file.path,
            preview: file.preview
        };
    } catch (error) {
        console.error("Error in createFileOptions:", error);
        return {}; // or handle the error in an appropriate way
    }
};

const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => {
            // Ensure the reader result is a data URL
            if (typeof reader.result === 'string' && reader.result.startsWith('data')) {
                resolve(reader.result);
            } else {
                reject(new Error('Failed to convert blob to base64: invalid result.'));
            }
        };

        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// Validate the date while fetching 
export const fetchFormatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const timezoneOffset = date.getTimezoneOffset() * 60000; // Get the timezone offset in milliseconds
    const localDate = new Date(date.getTime() - timezoneOffset); // Adjust the date
    return localDate.toISOString().split('T')[0]; // Get the date part in YYYY-MM-DD format
};
