// src/utils/frontendCommonFunction.js
import { useSession } from 'next-auth/react';
import Cookies from 'js-cookie';
import { FRONTEND_PRODUCT_REVIEW, FRONTEND_USERS, FRONTEND_SOCIAL, FRONTEND_CONTACTUS, FRONTEND_SAVEPYAMENT, FRONTEND_REFERRAL, FRONTEND_NOTIFICATIONS, FRONTEND_REVIEW, FRONTEND_WISHLIST, FRONTEND_GIFTCARD, FRONTEND_CATEGORY, FRONTEND_BLOG, FRONTEND_PAGESDATA, FRONTEND_FAQ, FRONTEND_CART_ENDPOINT, FRONTEND_COLLECTIONS, FRONTEND_COUNTRY, FRONTEND_STATE, FRONTEND_DISTRICT, FRONTEND_PINCODE, FRONTEND_TICKET_SUBJECT, FRONTEND_TICKET, FRONTEND_TICKET_VERIFY, FRONTEND_TICKET_RESPONSE, FRONTEND_USER_ADDRESSES_ENDPOINT, FRONTEND_CHECKOUT_ENDPOINT, FRONTEND_MYADDRESS, FRONTEND_PLACE_ORDERS, FRONTEND_ORDERS_ENDPOINT, FRONTEND_ORDERS_DETAIL_ENDPOINT, FRONTEND_SITE_SETTING, FRONTEND_EMAIL } from 'src/utils/frontendAPIEndPoints';
import { fetchFromAPI } from './apiUtils';
import { enqueueSnackbar } from 'notistack';

// Login: Details
export function getUserLoginSession() {
    const { data: loginSession } = useSession();
    return loginSession?.user;
}

// Login: Token
export function getUserLoginTokenSession() {
    const { data: loginSession } = useSession();
    return loginSession?.accessToken;
}

export function formatDateFn(dateString) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}



// Login - Logout New Code Start //
export const getDecodedToken = () => {
    try {
        const token = Cookies.get('logtk')
        if (!token) return '';

        return decodeJwtPayload(token);
    } catch (error) {
        console.error("Error retrieving or decoding token:", error);
        return '';
    }
};

const decodeJwtPayload = (token) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT payload:", error);
        return {};
    }
};

export function getOnlyToken() {
    if (typeof window !== 'undefined') {
        const token = Cookies.get('logtk')
        if (!token) return '';
        return token;
    }
    return '';
}

export function signOutFn() {
    const token = Cookies.get('logtk');
    if (token) {
        Cookies.remove('logtk');
        if (localStorage.getItem('Alluranceorder')) {
            localStorage.removeItem('Alluranceorder');
        }
    }
    if (localStorage.getItem('selectedAddress')) {
        localStorage.removeItem('selectedAddress');
    }
}
// Login - Logout New Code End //


// Common Functions Start // 

// Render stars based on rating
export const renderStars = (rating) => {
    const totalStars = 5;
    return Array.from({ length: totalStars }, (_, i) => (
        i < rating
            ? <i key={i} className="fa-solid fa-star" />
            : <i key={i} className="fa fa-star-o" />
    ));
};

// Placeholder - Blog
export const blogHandleImageError = (event) => { event.target.src = '/img/placeholder/640x490.png'; };

// Placeholder - Categories
export const categoriesHandleImageError = (event) => { event.target.src = '/img/placeholder/200x200.png'; };

// Placeholder - New Launches
export const newLaunchesHandleImageError = (event) => { event.target.src = '/img/placeholder/308x399.png'; };

// Placeholder - Products
export const productsHandleImageError = (event) => { event.target.src = '/img/placeholder/800x800.png'; };

// Set Wishlist Class
export const setWishlistClass = async (pid) => {
    const decodedlogtkn = getDecodedToken();
    const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';
    var wdata = await getMyWishlistData(UserLoggedInID);
    return wdata.some(wd => wd.id === pid) ? 'fas' : 'far';
};

// Calculate Discount Percentage
export function calculateDiscountPercentage(originalPrice, discountedPrice) {
    if (originalPrice === 0 || discountedPrice === 0) { return 0; }
    const discountAmount = originalPrice - discountedPrice;
    const discountPercentage = (discountAmount / originalPrice) * 100;
    return discountPercentage;
}

// Cart, Checkout Number Format
export const formatCartCheckoutNo = (number) => {
    return new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
};

export function generateDummyTxnId() {
    return 'TXN' + Math.random().toString(36).slice(2, 18).toUpperCase();
}

// Order Status
export function orderStatus(status) {
    switch (status) {
        case 1:
            return <span className="badge text-bg-primary">Pending</span>;
        case 2:
            return <span className="badge text-bg-warning">Placed</span>;
        case 3:
            return <span className="badge text-bg-info">Packed</span>;
        case 4:
            return <span className="badge text-bg-light">Shipped</span>;
        case 5:
            return <span className="badge text-bg-success">Delivered</span>;
        case 6:
            return <span className="badge text-bg-danger">Cancelled</span>;
        default:
            return <span className="badge text-bg-secondary">Unknown</span>;
    }
}

// Payment Status
export function paymentStatus(status) {
    switch (status) {
        case 1:
            return <span className="badge text-bg-primary">Pending</span>;
        case 2:
            return <span className="badge text-bg-success">Success</span>;
        case 3:
            return <span className="badge text-bg-danger">Cancelled</span>;
        default:
            return <span className="badge text-bg-secondary">Unknown</span>;
    }
}

// Function to convert image URL to Base64
export const convertImageToBase64 = (url) => {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(xhr.response);
        };
        xhr.onerror = reject;
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    });
};

// Common Functions End // 









// API Section Start //

// Add To Cart
export const addToCartFn = async (pstock, pid, qty) => {

    const decodedlogtkn = getDecodedToken();
    const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';
    if (qty == 0) { qty = 1; }

    try {
        if (pstock > 0) {
            // With User ID
            if (UserLoggedInID) {
                const payload = { user_id: UserLoggedInID, product_id: pid, quantity: qty };
                const responseData = await fetchFromAPI(`${FRONTEND_CART_ENDPOINT}`, 'POST', payload);
                if (responseData.status) {
                    enqueueSnackbar(responseData.message, { variant: 'success' });
                } else {
                    enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
                }
            } else {
                // With Mock ID (Without Login)
                const generateMockId = () => {
                    const randomNum = Math.floor(Math.random() * 1000000);
                    return randomNum.toString();
                };
                let mock_id = localStorage.getItem('Alluranceorder');
                if (!mock_id) {
                    mock_id = generateMockId();
                }
                const payload = { mock_id: mock_id, product_id: pid, quantity: qty };

                const responseData = await fetchFromAPI(`${FRONTEND_CART_ENDPOINT}`, 'POST', payload);
                if (responseData.status) {
                    localStorage.setItem('Alluranceorder', responseData.data.mock_id);
                    enqueueSnackbar(responseData.message, { variant: 'success' });
                } else {
                    enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
                }
            }
        } else {
            enqueueSnackbar('Product is out of stock', { variant: 'warning' });
        }
    } catch (error) {
        enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
    }
};

// Add To Wishlist
export const addToWishlistFn = async (pid) => {

    const decodedlogtkn = getDecodedToken();
    const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';
    const token = getOnlyToken();

    try {
        if (UserLoggedInID) {
            const payload = { user_id: UserLoggedInID, product_id: pid };
            const responseData = await fetchFromAPI(`${FRONTEND_WISHLIST}`, 'POST', payload, token);
            if (responseData.status) {
                enqueueSnackbar(responseData.message, { variant: 'success' });
                return responseData.data; // For Icon set
            } else {
                enqueueSnackbar(responseData.error, { variant: 'error' });
            }
        } else {
            enqueueSnackbar('Login to add to wishlist', { variant: 'warning' });
        }
    } catch (error) {
        enqueueSnackbar('Failed to add product to wishlist', { variant: 'error' });
    }
};

// Product Rating Code
export const productRating = async (pid) => {
    const responseData = await fetchFromAPI(`${FRONTEND_PRODUCT_REVIEW}?id=${pid}`);
    return responseData?.data?.avgrating || 0;
};

// Fetch User Info
export const getUserLoginInfo = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_USERS}?id=${uid}`, 'GET', null, token);
    return responseData?.data;
};

// Fetch Social Data
export const getSocialData = async () => {
    const responseData = await fetchFromAPI(FRONTEND_SOCIAL);
    return responseData?.data;
};

// Fetch Contact Info
export const getContactData = async () => {
    const responseData = await fetchFromAPI(FRONTEND_CONTACTUS);
    return responseData?.data;
};

// Fetch Save Cards Data
export const getSavedCardData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_SAVEPYAMENT}?user_id=${uid}`, 'GET', null, token);
    return responseData?.data;
};

// Delete Save Cards Data
export const deleteSavedCardData = async (rowID) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_SAVEPYAMENT}?id=${rowID}`, 'DELETE', null, token);
    return responseData;
};

// My Referral List
export const getReferralListData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_REFERRAL}?user_id=${uid}`, 'GET', null, token);
    return responseData;
};

// Fetch Notification Data
export const getNotificationData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_NOTIFICATIONS}?user_id=${uid}`, 'GET', null, token);
    return responseData?.data;
};

// Update Notification Data
export const updateNotificationData = async (uid, payload) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_NOTIFICATIONS}?user_id=${uid}`, 'POST', payload, token);
    return responseData;
};

// Fetch My Review
export const getMyReviewData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_REVIEW}?user_id=${uid}`, 'GET', null, token);
    return responseData?.data;
};

// Fetch My Wishlist
export const getMyWishlistData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_WISHLIST}?user_id=${uid}`, 'GET', null, token);
    return responseData?.data;
};

// Delete My Wishlist
export const deleteMyWishlistData = async (rowID) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_WISHLIST}?id=${rowID}`, 'DELETE', null, token);
    return responseData;
};

// Fetch My Giftcard
export const getMyGiftcardData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_GIFTCARD}?user_id=${uid}`, 'GET', null, token);
    return responseData;
};

// Fetch Categories
export const getCategories = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_CATEGORY}`);
    return responseData;
};

// Fetch Blogs
export const getBlogs = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_BLOG}`);
    return responseData;
};

// Fetch Blog Details
export const getBlogDetails = async (slug) => {
    const responseData = await fetchFromAPI(`${FRONTEND_BLOG}?slug=${slug}`);
    return responseData;
};

// Fetch Recent Blogs
export const getRecentBlogs = async (slug) => {
    const responseData = await fetchFromAPI(`${FRONTEND_BLOG}?notslug=${slug}`);
    return responseData;
};

// Fetch Pages
export const getPagesData = async (rowID) => {
    const responseData = await fetchFromAPI(`${FRONTEND_PAGESDATA}?id=${rowID}`);
    return responseData?.data;
};

// Fetch FAQs
export const getFaqsData = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_FAQ}`);
    return responseData;
};

// Fetch Collections
export const getCollectionData = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_COLLECTIONS}`);
    return responseData;
};

// Fetch Country
export const getCountryData = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_COUNTRY}`);
    return responseData;
};

// Fetch State
export const getStateData = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_STATE}`);
    return responseData;
};

// Fetch District
export const getDistrictData = async (payload) => {
    const responseData = await fetchFromAPI(`${FRONTEND_DISTRICT}`, 'POST', payload);
    return responseData;
};

// Fetch Pincode
export const getPincodeData = async (payload) => {
    const responseData = await fetchFromAPI(`${FRONTEND_PINCODE}`, 'POST', payload);
    return responseData;
};

// Fetch Ticket Subject
export const getTicketSubjectData = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_TICKET_SUBJECT}`, 'GET');
    return responseData;
};

// Fetch Ticket List
export const getTicketListData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_TICKET}?user_id=${uid}`, 'GET', null, token);
    return responseData;
};

// Ticket Verify
export const getTicketVerifyData = async (tid, uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_TICKET_VERIFY}?ticket_id=${tid}&user_id=${uid}`, 'GET', null, token);
    return responseData;
};

// Fetch Ticket Response
export const getTicketResponseData = async (tid, uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_TICKET_RESPONSE}?ticket_id=${tid}&user_id=${uid}`, 'GET', null, token);
    return responseData;
};

// Fetch User Address
export const getUserAddresstData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_USER_ADDRESSES_ENDPOINT}?id=${uid}`, 'GET', null, token);
    return responseData;
};

// Checkout Delete
export const deleteCheckoutData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_CHECKOUT_ENDPOINT}?id=${uid}`, 'DELETE', null, token);
    return responseData;
};

// Fetch Address
export const getAddressData = async (uid) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_MYADDRESS}?user_id=${uid}`, 'GET', null, token);
    return responseData;
};

// Update Default Address
export const updateDefaultAddressData = async (payload, rowID) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_MYADDRESS}/default?id=${rowID}`, 'PUT', payload, token);
    return responseData;
};

// Place Order
export const placeorderData = async (payload) => {
    const responseData = await fetchFromAPI(`${FRONTEND_PLACE_ORDERS}`, 'POST', payload);
    return responseData;
};

// Fetch Orders
export const fetchOrderData = async (uid, channelMode) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_ORDERS_ENDPOINT}?user_id=${uid}&channel_mode=${channelMode}`, 'GET', null, token);
    return responseData;
};

// Fetch Orders Details
export const fetchOrderDetailsData = async (uid, orderID) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_ORDERS_ENDPOINT}?user_id=${uid}&id=${orderID}`, 'GET', null, token);
    return responseData;
};

// Fetch More Orders Details
export const fetchOrderDetailsProductData = async (uid, orderID) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_ORDERS_DETAIL_ENDPOINT}?user_id=${uid}&id=${orderID}`, 'POST', null, token);
    return responseData;
};

// Fetch Site Setting
export const getSiteSettingData = async () => {
    const responseData = await fetchFromAPI(`${FRONTEND_SITE_SETTING}`, 'GET');
    return responseData;
};

// Send Email
export const sendEmailData = async (endpoint, payload) => {
    const token = getOnlyToken();
    const responseData = await fetchFromAPI(`${FRONTEND_EMAIL}/${endpoint}`, 'POST', payload, token);
    return responseData;
};

// API Section End //



