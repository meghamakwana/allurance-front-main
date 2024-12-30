// src/app/ordertrack/[id]/page.js
'use client';
import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import {
    fetchOrderDetailsData,
    getDecodedToken,
    getOnlyToken,
    productsHandleImageError,
    fetchOrderDetailsProductData,
    formatCartCheckoutNo,
    orderStatus,
    paymentStatus,
    getContactData,
    getSiteSettingData,
    convertImageToBase64,
    getMyReviewData,
} from '../../../utils/frontendCommonFunction';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { FRONTEND_RETURN_ORDERS, FRONTEND_REVIEW } from 'src/utils/frontendAPIEndPoints';
import { useParams } from 'next/navigation';
import { useRouter } from 'src/routes/hooks';
import { fDate, fTime } from 'src/utils/format-time';
import html2pdf from 'html2pdf.js';
import { Box, Button, Modal, Rating, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { enqueueSnackbar } from 'notistack';

function OrderTrack() {
    const router = useRouter();
    const [orderdata, setOrderData] = useState([]);
    const [orderprodata, setOrderProdData] = useState([]);
    const [contactdata, setContactData] = useState([]);
    const [sitesettingdata, setSiteSettingData] = useState([]);
    const [reviewdata, setReviewData] = useState([]);

    const [decodedToken, setDecodedToken] = useState(null);
    let { id } = useParams();
    const user_token_data = getOnlyToken();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editButton, setEditButton] = useState(false);
    const [currentProductId, setCurrentProductId] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [error, setError] = useState({
        rating: '',
        comment: '',
    });

    const handleOpen = (id) => {
        setCurrentProductId(id); // Set the ID of the current product
        const matched = reviewdata.find((item) => item.product_id === id);
        if (matched) {
            setRating(Number(matched?.rating_no));
            setComment(matched?.description);
            setEditButton(true);
        } else {
            setComment('');
            setRating(0);
            setEditButton(false);
        }
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setCurrentProductId(null); // Reset the ID when modal is closed
        setIsModalOpen(false);
    };
    const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;

    const fetchReveiwData = useCallback(async () => {
        if (isUserLoggedIn) {
            try {
                const data1 = await getMyReviewData(isUserLoggedIn);
                setReviewData(data1);
            } catch (error) {
                console.error('Error fetching user info:', error);
            }
        }
    }, [isUserLoggedIn]);

    const handleSubmit = async (id) => {
        setError({ rating: '', comment: '' });

        if (!rating) {
            setError((prev) => ({ ...prev, rating: 'Rating is required.' }));
            return;
        }
        if (!comment.trim()) {
            setError((prev) => ({ ...prev, comment: 'Comment is required.' }));
            return;
        }

        try {
            const data = {
                rating_no: rating,
                description: comment,
                product_id: id,
                user_id: decodedToken?.data?.id,
                order_id: orderdata?.id,
            };

            const response = await ManageAPIsData(FRONTEND_REVIEW, 'POST', data, user_token_data);
            if (response) {
                enqueueSnackbar(editButton ? "Review Updated" : "Review Added", { variant: 'success' });
                await fetchReveiwData(); // Refetch data
            } else {
                enqueueSnackbar("Something Went Wrong", { variant: 'error' });
            }
        } catch (error) {
            console.error('Error submitting review:', error);
        } finally {
            handleClose();
        }
    };

    const handleDelete = async (id) => {
        const matched = reviewdata.find((item) => item.product_id === id);
        const matchedId = matched?.id;

        if (!matchedId) {
            enqueueSnackbar("Review not found for the given product ID", { variant: 'warning' });
            return;
        }

        try {
            const response = await ManageAPIsData(`${FRONTEND_REVIEW}?id=${matchedId}`, 'DELETE', {}, user_token_data);

            if (response && response.ok) {
                enqueueSnackbar("Review Deleted", { variant: 'success' });
                await fetchReveiwData(); // Refetch data
            } else {
                enqueueSnackbar(`Error: ${response.statusText}`, { variant: 'error' });
            }
        } catch (error) {
            console.error('Error deleting review:', error);
            enqueueSnackbar("Failed to delete the review", { variant: 'error' });
        } finally {
            handleClose();
        }
    };


    useEffect(() => {
        const decodedlogtkn = getDecodedToken();
        if (!decodedlogtkn || !decodedlogtkn.data || !decodedlogtkn.data.id) {
            enqueueSnackbar('Something Wrong! Please login to continue access', { variant: 'error' });
            router.push('/login');
            return;
        }
        setDecodedToken(decodedlogtkn);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            if (isUserLoggedIn) {
                try {
                    const data1 = await fetchOrderDetailsData(isUserLoggedIn, id);
                    if (data1.data) {
                        setOrderData(data1.data);
                    }
                    const data2 = await fetchOrderDetailsProductData(isUserLoggedIn, id);
                    if (data2.data) {
                        setOrderProdData(data2.data);
                    }
                    const data3 = await getContactData();
                    if (data3) {
                        setContactData(data3);
                    }
                    const data4 = await getSiteSettingData();
                    if (data4.data) {
                        setSiteSettingData(data4.data);
                    }
                } catch (error) {
                    console.error('Error fetching ticket data:', error);
                }
            }
        };

        fetchData();
        fetchReveiwData();
    }, [isUserLoggedIn, id]);
    console.log('reviewdata', reviewdata);

    // Return Flow
    const returnFlow = async (index, proid, orderid, invoiceid) => {
        const matchingData = orderprodata.filter(
            (item) =>
                item.product_id === proid && item.order_id === orderid && item.invoice_id === invoiceid
        );
        const payload = {
            order_id: orderid,
            invoice_id: invoiceid,
            returnproduct: matchingData,
        };
        console.log('payload', payload);
        try {
            const response = await ManageAPIsData(
                `${FRONTEND_RETURN_ORDERS}`,
                'POST',
                payload,
                user_token_data
            );
            if (!response.ok) {
                console.error('Error fetching data:', response.statusText);
                return;
            }
            const responseData = await response.json();
            console.log('responseData', responseData);
        } catch (error) {
            console.error('Error during return flow:', error);
        }
    };

    /* Invoice Data Start */

    const fetchTemplate = async () => {
        const response = await fetch('/html/invoices-and-labels/invoice.html');
        return response.text();
    };

    // Function to replace placeholders with actual data
    const populateTemplate = (template, data) => {
        return template.replace(/{{(\w+)}}/g, (_, key) => data[key] || '');
    };

    // Product Loop For Invoice
    const productLoopFn = async (orderprodata) => {
        return orderprodata && orderprodata.length > 0
            ? orderprodata
                .map(
                    (orderPro, index) => `
                <tr class="border-bottom-dashed" key="${orderPro.id}">
                    <td>${index + 1}</td>
                    <td>${orderPro.name} (${orderPro.weight}) <br /> HSN Code: -</td>
                    <td>${orderPro.is_delivered ? 'Delivered' : 'Preparing'}</td>
                    <td><i class="fa-solid fa-indian-rupee-sign"></i>${formatCartCheckoutNo(orderPro?.discount_price > 0 ? orderPro.discount_price : orderPro.price)}</td>
                    <td>${orderPro.quantity}</td>
                    <td><i class="fa-solid fa-indian-rupee-sign"></i>${formatCartCheckoutNo((orderPro?.discount_price > 0 ? orderPro.discount_price : orderPro.price) * orderPro.quantity)}</td>
                </tr>
            `
                )
                .join('')
            : '';
    };

    const handleGenerateBillClick = async () => {
        const template = await fetchTemplate();

        // Get the product rows as an HTML string
        const productRowsHtml = await productLoopFn(orderprodata);

        const logoBase64 = await convertImageToBase64('/img/footer-logo.png');
        const invoicebgBase64 = await convertImageToBase64('/img/invoice-bg.png');

        const data = {
            // Billing Details
            order_id: orderdata.order_id,
            invoice_date: fDate(orderdata.invoice_date),
            invoice_number: orderdata.invoice_id,

            // Customer Details
            customer_name: `${orderdata.first_name} ${orderdata.last_name}`,
            customer_id: orderdata.customer_id,
            address: orderdata.address_line_1,
            landmark: orderdata.landmark,
            country: orderdata.country,
            state: orderdata.state,
            district: orderdata.district,
            pincode: orderdata.pincode,

            // Company Details
            company_address: contactdata.address,
            company_email: contactdata.email,
            company_contact1: contactdata.contact1,
            company_contact2: contactdata.contact2,
            company_cin: contactdata.cin,
            company_name: sitesettingdata.company_name,
            company_logo: logoBase64, //sitesettingdata.site_logo,
            invoice_bg: invoicebgBase64,
            company_gstno: sitesettingdata.gstno,

            // Order Details
            products: productRowsHtml,
            subtotal: formatCartCheckoutNo(orderprodata[0]?.subtotal),
            CGST: formatCartCheckoutNo(orderprodata[0]?.CGST),
            IGST: formatCartCheckoutNo(orderprodata[0]?.IGST),
            SGST: formatCartCheckoutNo(orderprodata[0]?.SGST),
            total_amount: formatCartCheckoutNo(orderprodata[0]?.totalamount),
        };

        const populatedTemplate = populateTemplate(template, data);
        const filename = `Invoice_${orderdata.invoice_id}_${new Date().toISOString().slice(0, 10)}.pdf`;

        const options = {
            margin: [10, 0], // Customize margins if needed
            filename: filename,
            image: { type: 'png', quality: 0.98 },
            html2canvas: { scale: 2 }, // Adjusts canvas scale to improve quality
            jsPDF: {
                unit: 'px',
                format: [800, 1120], // Width and height in pixels (custom size)
                orientation: 'portrait', // 'portrait' or 'landscape'
            },
        };

        html2pdf().set(options).from(populatedTemplate).save();
    };

    /* Invoice Data End */

    return (
        <>
            <Header />
            <div className="orderTrack">
                <div className="container">
                    <div>
                        <Link href="/profile" className="myAccountLink">
                            My Account
                        </Link>{' '}
                        &gt;
                        <Link href="/mypurchase" className="myAccountLink">
                            My Orders
                        </Link>{' '}
                        &gt; My Purchases
                    </div>

                    <div className="row order-address-section">
                        <div className="col-md-4 order-detail-section">
                            <h3>User Details</h3>
                            <h4>
                                Name: {orderdata?.first_name} {orderdata?.last_name}
                            </h4>
                            <h4>Email: {orderdata?.email}</h4>
                            <h4>
                                Address: {orderdata.address_line_1}, {orderdata.landmark}, {orderdata.state},{' '}
                                {orderdata.district}, Pincode: {orderdata.pincode}
                            </h4>
                            <h4>Phone: +91 {orderdata?.phone}</h4>
                        </div>

                        <div className="col-md-4 order-detail-section">
                            <h3>Order Details</h3>
                            <h4>Order ID: {orderdata?.order_id}</h4>
                            <h4>
                                Order Date: {fDate(orderdata.created_at)}, {fTime(orderdata.created_at)}
                            </h4>
                            <h4>
                                Order Amount: <i className="fa fa-inr" />{' '}
                                {formatCartCheckoutNo(orderdata?.total_amount)}
                            </h4>
                            <h4>Total Items: {orderdata?.total_items}</h4>
                            <h4>Order Status: {orderStatus(orderdata.order_status)}</h4>
                            <div className="row d-flex justify-content-center">
                                <div className="col-12">
                                    <ul id="progressbar" className="text-center">
                                        <li className={`step0 ${orderdata.order_status === 2 ? 'active' : ''}`}>
                                            <h4 className={`step0 ${orderdata.order_status !== 2 ? 'grey-text' : ''}`}>
                                                placed
                                            </h4>
                                        </li>
                                        <li className={`step0 ${orderdata.order_status === 3 ? 'active' : ''}`}>
                                            <h4 className={`step0 ${orderdata.order_status !== 3 ? 'grey-text' : ''}`}>
                                                packed
                                            </h4>
                                        </li>
                                        <li className={`step0 ${orderdata.order_status === 4 ? 'active' : ''}`}>
                                            <h4 className={`step0 ${orderdata.order_status !== 4 ? 'grey-text' : ''}`}>
                                                shipped
                                            </h4>
                                        </li>
                                        <li className={`step0 ${orderdata.order_status === 5 ? 'active' : ''}`}>
                                            <h4 className={`step0 ${orderdata.order_status !== 5 ? 'grey-text' : ''}`}>
                                                delivered
                                            </h4>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4 order-detail-section">
                            <Link href="/ticket/add" className="order-need-help-btn">
                                Need help <i className="fa-solid fa-question" />
                            </Link>
                            <h3>Payment Details</h3>
                            <div>
                                <h4>Invoice ID: {orderdata?.invoice_id}</h4>
                                <h4>Payment ID: {orderdata?.payment_id}</h4>
                                <h4>Payment Status: {paymentStatus(orderdata?.payment_status)}</h4>
                                <h4>
                                    Pay Amount: <i className="fa fa-inr" />{' '}
                                    {formatCartCheckoutNo(orderdata?.payment_by_customer)}
                                </h4>
                            </div>
                            <div className="order-detail-btn-section">
                                {orderdata.channel_mode == 1 &&
                                    orderdata.order_status == 2 &&
                                    orderdata.payment_status == 2 && (
                                        <button className="download-invoice-btn" onClick={handleGenerateBillClick}>
                                            Download Invoice <i className="fa-solid fa-file-arrow-down" />
                                        </button>
                                    )}
                                {/* <button className="write-review-btn">Write Review<i className="fa-solid fa-pen" /></button> */}
                            </div>
                        </div>
                    </div>

                    {/* ONLINE MODE */}
                    {orderprodata && orderdata?.channel_mode == 1 && orderprodata.length > 0 && (
                        <div className="row order-track-section">
                            <div className="col-md-12">
                                <div className="container px-1 px-md-4 mx-auto">
                                    <div className="card">
                                        <div className="row d-flex justify-content-between px-3 top"></div>
                                        <div className="row d-flex justify-content-center">
                                            <div>Product Details</div>
                                            <table className="orderdettable">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Product Name</th>
                                                        <th>Weight</th>
                                                        <th>Status</th>
                                                        <th>Price</th>
                                                        <th>Quantity</th>
                                                        <th>Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderprodata && orderprodata.length > 0 ? (
                                                        orderprodata.map((orderPro, index) => (
                                                            <tr key={orderPro.id}>
                                                                <td>
                                                                    <div
                                                                        style={{
                                                                            display: 'flex',
                                                                            flexDirection: 'column',
                                                                            alignItems: 'center',
                                                                        }}
                                                                    >
                                                                        <img
                                                                            src=""
                                                                            height={100}
                                                                            width={100}
                                                                            onError={productsHandleImageError}
                                                                        />
                                                                        <Button
                                                                            variant={
                                                                                reviewdata.some((item) => item.product_id === orderPro.id)
                                                                                    ? 'outlined'
                                                                                    : 'contained'
                                                                            }
                                                                            color="primary"
                                                                            onClick={() => handleOpen(orderPro.id)}
                                                                            style={{ marginTop: '10px', width: 'auto' }}
                                                                        >
                                                                            {reviewdata.some((item) => item.product_id === orderPro.id)
                                                                                ? 'Edit Review'
                                                                                : 'Review'}
                                                                        </Button>

                                                                        <Modal open={isModalOpen} onClose={handleClose}>
                                                                            <Box
                                                                                sx={{
                                                                                    position: 'absolute',
                                                                                    top: '50%',
                                                                                    left: '50%',
                                                                                    transform: 'translate(-50%, -50%)',
                                                                                    width: 800,
                                                                                    bgcolor: 'background.paper',
                                                                                    border: 'none',
                                                                                    boxShadow: 24,
                                                                                    borderRadius: '8px',
                                                                                    display: 'flex',
                                                                                    flexDirection: 'row',
                                                                                    overflow: 'hidden',
                                                                                }}
                                                                            >
                                                                                <Box
                                                                                    sx={{
                                                                                        width: '50%',
                                                                                        backgroundColor: '#f9f9f9',
                                                                                        display: 'flex',
                                                                                        alignItems: 'center',
                                                                                        justifyContent: 'center',
                                                                                        padding: 2,
                                                                                    }}
                                                                                >
                                                                                    <img
                                                                                        src="#"
                                                                                        alt="Product"
                                                                                        style={{
                                                                                            maxWidth: '100%',
                                                                                            maxHeight: '100%',
                                                                                            objectFit: 'contain',
                                                                                        }}
                                                                                        onError={productsHandleImageError}
                                                                                    />
                                                                                </Box>

                                                                                <Box sx={{ width: '50%', padding: 3 }}>
                                                                                    <Box
                                                                                        display="flex"
                                                                                        justifyContent="space-between"
                                                                                        alignItems="center"
                                                                                    >
                                                                                        <Typography variant="h6" component="h2">
                                                                                            Add Review
                                                                                        </Typography>
                                                                                        <CloseIcon
                                                                                            onClick={handleClose}
                                                                                            style={{ cursor: 'pointer', color: 'gray' }}
                                                                                        />
                                                                                    </Box>
                                                                                    <Box mt={2}>
                                                                                        <Typography mt={2}>Rating</Typography>
                                                                                        <Rating
                                                                                            name="rating"
                                                                                            value={rating}
                                                                                            onChange={(event, newValue) => setRating(newValue)}
                                                                                            sx={{ mt: 1 }}
                                                                                        />
                                                                                        {error.rating && (
                                                                                            <Typography color="error" variant="body2">
                                                                                                {error.rating}
                                                                                            </Typography>
                                                                                        )}
                                                                                        <TextField
                                                                                            fullWidth
                                                                                            label="Comment"
                                                                                            variant="outlined"
                                                                                            multiline
                                                                                            rows={4}
                                                                                            value={comment}
                                                                                            onChange={(e) => setComment(e.target.value)}
                                                                                            margin="normal"
                                                                                        />
                                                                                        {error.comment && (
                                                                                            <Typography color="error" variant="body2">
                                                                                                {error.comment}
                                                                                            </Typography>
                                                                                        )}
                                                                                    </Box>
                                                                                    <Box mt={3} display="flex" justifyContent="flex-end">
                                                                                        {editButton ? (
                                                                                            <>
                                                                                                <Button
                                                                                                    variant="outlined"
                                                                                                    color="primary"
                                                                                                    onClick={() => handleSubmit(currentProductId)}
                                                                                                    style={{ marginRight: '10px' }}
                                                                                                >
                                                                                                    Update
                                                                                                </Button>
                                                                                                <Button variant="contained" onClick={() => { handleDelete(currentProductId) }}>
                                                                                                    Delete
                                                                                                </Button>
                                                                                            </>
                                                                                        ) : (
                                                                                            <>
                                                                                                <Button
                                                                                                    variant="contained"
                                                                                                    color="primary"
                                                                                                    onClick={() => handleSubmit(currentProductId)}
                                                                                                    style={{ marginRight: '10px' }}
                                                                                                >
                                                                                                    Submit
                                                                                                </Button>
                                                                                                <Button variant="outlined" onClick={handleClose}>
                                                                                                    Cancel
                                                                                                </Button>
                                                                                            </>
                                                                                        )}
                                                                                    </Box>
                                                                                </Box>
                                                                            </Box>
                                                                        </Modal>
                                                                    </div>
                                                                </td>
                                                                <td>{orderPro.name}</td>
                                                                <td>{orderPro.weight}</td>
                                                                <td>
                                                                    {orderPro.is_delivered ? (
                                                                        <span className="badge text-bg-success">Delivered</span>
                                                                    ) : (
                                                                        <span className="badge text-bg-primary">Preparing</span>
                                                                    )}{' '}
                                                                    <br />
                                                                    {orderPro.is_delivered ? (
                                                                        <span
                                                                            className="badge text-bg-secondary"
                                                                            onClick={() =>
                                                                                returnFlow(
                                                                                    index,
                                                                                    orderPro.id,
                                                                                    orderPro.order_id,
                                                                                    orderPro.invoice_id
                                                                                )
                                                                            }
                                                                        >
                                                                            Return
                                                                        </span>
                                                                    ) : null}
                                                                </td>
                                                                <td>
                                                                    <i className="fa fa-inr" />
                                                                    {formatCartCheckoutNo(
                                                                        orderPro?.discount_price > 0
                                                                            ? orderPro.discount_price
                                                                            : orderPro.price
                                                                    )}
                                                                </td>
                                                                <td>{orderPro.quantity}</td>
                                                                <td>
                                                                    <i className="fa fa-inr" />{' '}
                                                                    {formatCartCheckoutNo(
                                                                        (orderPro?.discount_price > 0
                                                                            ? orderPro.discount_price
                                                                            : orderPro.price) * orderPro.quantity
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr style={{ padding: '50px 0px' }}>
                                                            <td colspan="6">
                                                                <center>Something Wrong!</center>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <td colspan="5"></td>
                                                        <td>Sub Total</td>
                                                        <td>
                                                            <i className="fa fa-inr" />{' '}
                                                            {formatCartCheckoutNo(orderprodata[0]?.subtotal)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="5"></td>
                                                        <td>CGST</td>
                                                        <td>
                                                            <i className="fa fa-inr" />{' '}
                                                            {formatCartCheckoutNo(orderprodata[0]?.CGST)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="5"></td>
                                                        <td>IGST</td>
                                                        <td>
                                                            <i className="fa fa-inr" />{' '}
                                                            {formatCartCheckoutNo(orderprodata[0]?.IGST)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="5"></td>
                                                        <td>SGST</td>
                                                        <td>
                                                            <i className="fa fa-inr" />{' '}
                                                            {formatCartCheckoutNo(orderprodata[0]?.SGST)}
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td colspan="5"></td>
                                                        <td>Total Amount</td>
                                                        <td>
                                                            <i className="fa fa-inr" />{' '}
                                                            {formatCartCheckoutNo(orderprodata[0]?.totalamount)}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* OFFLINE MODE */}
                    {orderprodata && orderdata?.channel_mode == 2 && orderprodata.length > 0 && (
                        <div className="row order-track-section">
                            <div className="col-md-12">
                                <div className="container px-1 px-md-4 mx-auto">
                                    <div className="card">
                                        <div className="row d-flex justify-content-between px-3 top"></div>
                                        <div className="row d-flex justify-content-center">
                                            <div>Product Details</div>
                                            <table className="orderdettable">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Product Name</th>
                                                        <th>Category</th>
                                                        <th>Model Number</th>
                                                        <th>Serial Number</th>
                                                        <th>Price</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderprodata && orderprodata.length > 0 ? (
                                                        orderprodata.map((orderPro, index) => (
                                                            <tr key={orderPro.id}>
                                                                <td>
                                                                    <img
                                                                        src=""
                                                                        height={100}
                                                                        width={100}
                                                                        onError={productsHandleImageError}
                                                                    />
                                                                </td>
                                                                <td>{orderPro.product_name}</td>
                                                                <td>{orderPro.category_name}</td>
                                                                <td>{orderPro.model_number}</td>
                                                                <td>{orderPro.serial_number}</td>
                                                                <td>
                                                                    <i className="fa fa-inr" />
                                                                    {formatCartCheckoutNo(
                                                                        orderPro?.product_discount_price > 0
                                                                            ? orderPro.product_discount_price
                                                                            : 0
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr style={{ padding: '50px 0px' }}>
                                                            <td colspan="6">
                                                                <center>Something Wrong!</center>
                                                            </td>
                                                        </tr>
                                                    )}
                                                    <tr>
                                                        <td colspan="4"></td>
                                                        <td>Total Amount</td>
                                                        <td>
                                                            <i className="fa fa-inr" />{' '}
                                                            {formatCartCheckoutNo(
                                                                orderprodata.reduce(
                                                                    (total, item) => total + (item.product_discount_price || 0),
                                                                    0
                                                                )
                                                            )}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default OrderTrack;
