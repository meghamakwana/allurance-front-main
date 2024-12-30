'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from 'src/component/Header'
import ProfileListView from 'src/component/ProfileListView'
import Footer from 'src/component/Footer'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { getDecodedToken, getNotificationData, updateNotificationData } from "../../utils/frontendCommonFunction";
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

function Notifications() {
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);
  const [notificationData, setNotificationData] = useState([]);
  const [formData, setFormData] = useState({
    notification_order_delivery_email: 'off',
    notification_order_shipping_email: 'off',
    notification_new_order_email: 'off',
  });

  useEffect(() => {
    const decodedToken = getDecodedToken();
    if (!decodedToken || !decodedToken.data || !decodedToken.data.id) {
      enqueueSnackbar("Something Wrong! Please login to continue access", { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedToken);
  }, [router]);
  const isUserLoggedIn = decodedToken?.data?.id;

  // Fetch Notification Data
  const fetchData = useCallback(async () => {
    if (isUserLoggedIn) {
      try {
        const data1 = await getNotificationData(isUserLoggedIn);
        setNotificationData(data1);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (notificationData.length) {
      const updatedFormData = {
        notification_order_delivery_email: getMetaValue('notification_order_delivery_email'),
        notification_order_shipping_email: getMetaValue('notification_order_shipping_email'),
        notification_new_order_email: getMetaValue('notification_new_order_email'),
      };
      setFormData(updatedFormData);
    }
  }, [notificationData]);

  const getMetaValue = (metaKey) => {
    const item = notificationData.find(item => item.meta_key === metaKey);
    return item ? item.meta_value : 'off';
  };

  const handleCheckboxChange = async (event, key) => {
    const updatedFormData = {
      ...formData,
      [key]: event.target.checked ? 'on' : 'off',
    };
    // Update Notification Data
    setFormData(updatedFormData);
    const data1 = await updateNotificationData(isUserLoggedIn, updatedFormData);
    enqueueSnackbar(data1.message, { variant: 'success' });
  };

  return (
    <>
      <Header />
      <div id="myProfile">
        <div className="container">
          <div className="row">
            <ProfileListView />
            <div className="col-md-9">
              <div id="notificationsSetting">
                <h3>Manage Notifications</h3>
                <div className="notifications">
                  <div className="notify">
                    <label className="switch flat">
                      <input
                        type="checkbox"
                        checked={formData.notification_new_order_email === 'on'}
                        onChange={(event) => handleCheckboxChange(event, 'notification_new_order_email')}
                      />
                      <span className="slider" />
                    </label>
                    New Order Email
                  </div>
                  <div className="notify">
                    <label className="switch flat">
                      <input
                        type="checkbox"
                        checked={formData.notification_order_shipping_email === 'on'}
                        onChange={(event) => handleCheckboxChange(event, 'notification_order_shipping_email')}
                      />
                      <span className="slider" />
                    </label>
                    Order Shipping Email
                  </div>
                  <div className="notify">
                    <label className="switch flat">
                      <input
                        type="checkbox"
                        checked={formData.notification_order_delivery_email === 'on'}
                        onChange={(event) => handleCheckboxChange(event, 'notification_order_delivery_email')}
                      />
                      <span className="slider" />
                    </label>
                    Order Delivery Email
                  </div>
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

export default Notifications;
