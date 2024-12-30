// src/utils/apiEndPoint.js

// .env variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // 'http://localhost:3032/api';

// RESIN TYPE MODULE
export const RESINTYPE_ENDPOINT = `${apiUrl}/resintype`; // Endpoint to manage resin type data

// BEZEL MATERIAL MODULE
export const BEZELMATERIAL_ENDPOINT = `${apiUrl}/bezelmaterial`; // Endpoint to manage bezel material

// INNER FLOWER MODULE
export const FLOWER_ENDPOINT = `${apiUrl}/flower`; // Endpoint to manage flower

// INNER COLOR SHADE MODULE
export const COLORSHADE_ENDPOINT = `${apiUrl}/colorshade`; // Endpoint to manage color shade

// CAMPAIGN MODULE
export const CAMPAIGN_ENDPOINT = `${apiUrl}/campaign`; // Endpoint to manage campaign

//SUPPORT CHANNEL ENDPOINT 
export const INE_ORDER_RETURN_ENDPOINT = `${apiUrl}/supportchannel/orderreturn`;

// AFFILIATE MODULE 
export const AFFILIATE_ENDPOINT = `${apiUrl}/affiliate`; // Endpoint to manage AFFILIATE

// ORDERS FOR ADMIN
export const INE_ADMIN_CHECK_COUPON_ENDPOINT = `${apiUrl}/campaign/fetch-coupon`; // Module ID

//Coupon Check
export const INE_ADMIN_CHECK_COUPON_ENDPOINT_CHECK = `${apiUrl}/campaign/apply-coupon`; // Module ID

// MY WISHLIST MODULE
export const WISHLIST_ENDPOINT = `${apiUrl}/mywishlist`; // Endpoint to manage my wishlist data

