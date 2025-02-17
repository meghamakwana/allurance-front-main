// src/utils/frontendAPIEndPoints.js

// .env variables
const apiUrl = 'http://localhost:3000/api'; // process.env.NEXT_PUBLIC_API_URL;

// Home Page <PageName_SectionName>
export const FRONTEND_DESKTOPMASTHEAD = `${apiUrl}/desktopmasthead`;
export const FRONTEND_CATEGORY = `${apiUrl}/categories`;
export const FRONTEND_FAQ = `${apiUrl}/faqs`;
export const FRONTEND_SOCIAL = `${apiUrl}/sociallink`;
export const FRONTEND_BLOG = `${apiUrl}/blog`;
export const FRONTEND_CONTACT_INQUIRY = `${apiUrl}/contactus/inquiry`;
export const FRONTEND_PRODUCTS = `${apiUrl}/frontendproducts`;
export const FRONTEND_CART_ENDPOINT = `${apiUrl}/cart`;
export const FRONTEND_CART_SYNC_ENDPOINT = `${apiUrl}/cart/sync`;
export const FRONTEND_CHECKOUT_ENDPOINT = `${apiUrl}/checkout`;
export const FRONTEND_CHECKOUT_SYNC_ENDPOINT = `${apiUrl}/checkout/sync`;
export const FRONTEND_USER_ADDRESSES_ENDPOINT = `${apiUrl}/offlinesales/invoice/searchaddress`;
export const FRONTEND_GET_BY_PINCODE = `${apiUrl}/myaddress/getByPinCode`;
export const FRONTEND_CONTACTUS = `${apiUrl}/contactus`;
export const FRONTEND_REVIEW = `${apiUrl}/rating`;
export const FRONTEND_PRODUCT_REVIEW = `${apiUrl}/rating/product`;
export const FRONTEND_PAGESDATA = `${apiUrl}/pagesdata`;
export const FRONTEND_MYADDRESS = `${apiUrl}/myaddress`;
export const FRONTEND_SAVEPYAMENT = `${apiUrl}/savecards`;
export const FRONTEND_NOTIFICATIONS = `${apiUrl}/users/notifications`;
export const FRONTEND_REFERRAL = `${apiUrl}/myreferral`;
export const FRONTEND_GIFTCARD = `${apiUrl}/mygiftcard`;
export const FRONTEND_USERS = `${apiUrl}/users`;
export const FRONTEND_VERIFY_OTP_AND_SIGNUP = `${apiUrl}/users/verifyOtpAndSignup`;
export const FRONTEND_SENDOTP = `${apiUrl}/users/sendotp`;
export const FRONTEND_PROFILE = `${apiUrl}/users/frontendprofile`;
export const FRONTEND_LOGIN = `${apiUrl}/users/login/frontuserslogin`;
export const FRONTEND_FORGOTPASSWORD = `${apiUrl}/users/forgotpassword`;
export const FRONTEND_OTP = `${apiUrl}/users/otp`;
export const FRONTEND_NEWPASSWORD = `${apiUrl}/users/newpassword`;
export const FRONTEND_CHANGEPASSWORD = `${apiUrl}/users/changepassword`;
export const FRONTEND_DEACTIVATEUSER = `${apiUrl}/users/deactivate`;
export const FRONTEND_WISHLIST = `${apiUrl}/mywishlist`;
export const FRONTEND_ORDERS_ENDPOINT = `${apiUrl}/orders`;
export const FRONTEND_ORDERS_DETAIL_ENDPOINT = `${apiUrl}/orders/detail`;
export const FRONTEND_CREATE_ORDERS = `${apiUrl}/orders/createorder`;
export const FRONTEND_PLACE_ORDERS = `${apiUrl}/orders/placeorder`;
export const FRONTEND_RETURN_ORDERS = `${apiUrl}/supportchannel/orderreturn`;
export const FRONTEND_CAMPAIGN_ENDPOINT = `${apiUrl}/frontendcampaignlist/`;
export const FRONTEND_AUTHPORTAL = `${apiUrl}/authportal`;
export const FRONTEND_TICKET = `${apiUrl}/ticket`;
export const FRONTEND_TICKET_SUBJECT = `${apiUrl}/ticket/subject`;
export const FRONTEND_TICKET_VERIFY = `${apiUrl}/ticket/verify`;
export const FRONTEND_TICKET_RESPONSE = `${apiUrl}/ticket/response`;
export const FRONTEND_TICKET_CLOSE = `${apiUrl}/ticket/ticket-close`;
export const FRONTEND_COLLECTIONS = `${apiUrl}/collections`;
export const FRONTEND_COUNTRY = `${apiUrl}/others/country`;
export const FRONTEND_STATE = `${apiUrl}/others/state_district/endpoint1`;
export const FRONTEND_DISTRICT = `${apiUrl}/others/state_district/endpoint2`;
export const FRONTEND_PINCODE = `${apiUrl}/others/state_district/endpoint3`;
export const FRONTEND_SITE_SETTING = `${apiUrl}/others/sitesetting`;
export const FRONTEND_EMAIL = `${apiUrl}/email`;