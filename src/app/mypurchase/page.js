'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { fDate, fTime } from 'src/utils/format-time';
import {
  fetchOrderData,
  getDecodedToken,
  productsHandleImageError,
  formatCartCheckoutNo,
  orderStatus,
  paymentStatus,
} from '../../utils/frontendCommonFunction';
import { useRouter } from 'src/routes/hooks';
import { enqueueSnackbar } from 'notistack';

function MyPurchase() {
  const router = useRouter();
  const [onlineOrders, setOnlineOrders] = useState([]);
  const [offlineOrders, setOfflineOrders] = useState([]);
  const [decodedToken, setDecodedToken] = useState(null);


  useEffect(() => {
    const decodedlogtkn = getDecodedToken();
    if (!decodedlogtkn || !decodedlogtkn.data || !decodedlogtkn.data.id) {
      enqueueSnackbar('Something Wrong! Please login to continue access', { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedlogtkn);
  }, []);

  const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;

  useEffect(() => {
    const fetchData = async () => {
      if (isUserLoggedIn) {
        try {
          // Online Orders
          const data1 = await fetchOrderData(isUserLoggedIn, 1);
          if (data1.data.length) {
            setOnlineOrders(data1.data);
          }
          // Offline Orders
          const data2 = await fetchOrderData(isUserLoggedIn, 2);
          if (data2.data.length) {
            setOfflineOrders(data2.data);
          }
        } catch (error) {
          console.error('Error fetching ticket data:', error);
        }
      }
    };

    fetchData();
  }, [isUserLoggedIn]);

  return (
    <>
      <Header />
      <div id="myProfile">
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <div>
                <Link href="/profile" id="myAccountLink">
                  My Account
                </Link>{' '}
                &gt; My Purchases
              </div>

              <ul className="nav nav-tabs" id="myTab" role="tablist">
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link active"
                    id="online-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#online"
                    type="button"
                    role="tab"
                    aria-controls="online"
                    aria-selected="false"
                  >
                    Online Order
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button
                    className="nav-link"
                    id="offline-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#offline"
                    type="button"
                    role="tab"
                    aria-controls="offline"
                    aria-selected="true"
                  >
                    Offline Purchase
                  </button>
                </li>
              </ul>

              <div className="tab-content" id="myTabContent">
                <div
                  className="tab-pane fade show active"
                  id="online"
                  role="tabpanel"
                  aria-labelledby="online-tab"
                >
                  {onlineOrders && onlineOrders.length > 0 ? (
                    onlineOrders.map((order) => {
                      if (order.channel_mode === 1) {
                        return (
                          <div key={order.id} className="myPurchase">
                            <Link href={`/ordertrack/${order.id}`}>
                              <div className="order-detail d-flex justify-content-between">
                                <div style={{ width: '100px' }}>
                                  <img src="#" alt="Product" onError={productsHandleImageError} />
                                </div>

                                <div>
                                  <h5>Order ID: {order.order_id}</h5>
                                  <h6>Invoice ID: {order.invoice_id}</h6>
                                  <h6>
                                    Date: {fDate(order.created_at)}, {fTime(order.created_at)}
                                  </h6>
                                </div>

                                <div>
                                  <div className="rate">
                                    <h5>
                                      <i className="fa fa-inr" />{' '}
                                      {formatCartCheckoutNo(order.total_amount)}
                                    </h5>

                                  </div>
                                </div>

                                <div>
                                  <p>Order Status: {orderStatus(order.order_status)}</p>
                                </div>

                                <div>
                                  <p>Payment Status: {paymentStatus(order.payment_status)}</p>
                                </div>
                              </div>
                            </Link>

                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <div style={{ padding: '50px 0px' }}>
                      Sorry, You have not placed any online orders!
                    </div>
                  )}
                </div>
                <div
                  className="tab-pane fade"
                  id="offline"
                  role="tabpanel"
                  aria-labelledby="offline-tab"
                >
                  {offlineOrders && offlineOrders.length > 0 ? (
                    offlineOrders.map((order) => {
                      if (order.channel_mode === 2) {
                        return (
                          <div key={order.id} className="myPurchase">
                            <Link href={`/ordertrack/${order.id}`}>
                              <div className="order-detail d-flex justify-content-between">
                                <div style={{ width: '100px' }}>
                                  <img src="#" alt="Product" onError={productsHandleImageError} />
                                </div>

                                <div>
                                  <h5>Order ID: {order.order_id}</h5>
                                  <h6>Invoice ID: {order.invoice_id}</h6>
                                  <h6>
                                    Date: {fDate(order.created_at)}, {fTime(order.created_at)}
                                  </h6>
                                </div>

                                <div>
                                  <div className="rate">
                                    <h5>
                                      <i className="fa fa-inr" />{' '}
                                      {formatCartCheckoutNo(order.total_amount)}
                                    </h5>
                                  </div>
                                </div>

                                <div>
                                  <p>Order Status: {orderStatus(order.order_status)}</p>
                                </div>

                                <div>
                                  <p>Payment Status: {paymentStatus(order.payment_status)}</p>
                                </div>
                              </div>
                            </Link>
                          </div>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <div style={{ padding: '50px 0px' }}>
                      Sorry, You have not placed any offline orders!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default MyPurchase;
