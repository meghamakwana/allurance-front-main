'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link'
import data from "../../jsondata/Coupons.json"
import Header from 'src/component/Header'
import ProfileListView from 'src/component/ProfileListView'
import Footer from 'src/component/Footer'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { FRONTEND_GIFTCARD } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { getUserLoginSession } from "../../utils/frontendCommonFunction";

function Coupons() {

  const user_data = getUserLoginSession();

  const [myCouponData, setMyCouponData] = useState([]);

  // My Coupons
  const getMyCouponData = async () => {
    try {
      const response = await ManageAPIsData(`${FRONTEND_GIFTCARD}?user_id=${user_data.id}`, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData) {
        setMyCouponData(responseData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (user_data && user_data.id) {
      getMyCouponData();
    }
  }, [user_data]);


  return (
    <>

      <Header />
      {data?.Coupons?.map((item, index) => {
        return (
          <>
            <div id="myProfile" key={`profile-${index}`}>
              <div className="container">
                <div className="row">
                  <ProfileListView />
                  <div className="col-md-9">

                    <div className="couponsSection">
                      <h3>Upcoming Coupons</h3>

                      {myCouponData && myCouponData.length > 0 ? (
                        myCouponData.map((myCouponDatas, index) => {
                          return (
                            <div className="coupon" key={`upcoming-${i}`}>
                              <div className="coupon-item">
                                <h4
                                  className="coupon-heading"
                                  data-bs-toggle="modal"
                                  data-bs-target="#couponModal"
                                >
                                  {item.GetExtraOffTitle}
                                </h4>
                                <p>
                                  {item.GetExtraOffText}
                                  &amp; {item.GetExtraOffTextTwo}
                                </p>
                              </div>
                              <div className="coupon-item-2">
                                <Link className="teams" href="/termsconditions">
                                  {item.T}&amp;{item.C}
                                </Link>
                                <h6 className="valid-date">{item.ValidTillDate}</h6>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div><center>Sorry, Records Not Found.</center></div>
                      )}

                    </div>

                    <div className="couponsSection">
                      <h3>Expired</h3>

                      {myCouponData && myCouponData.length > 0 ? (
                        myCouponData.map((myCouponDatas, index) => {
                          return (
                            <div className="coupon" key={`expired-${i}`}>
                              <div className="coupon-item">
                                <h4
                                  className="coupon-heading"
                                  data-bs-toggle="modal"
                                  data-bs-target="#couponModal"
                                >
                                  {item.GetExtraOffTitle}
                                </h4>
                                <p>
                                  {item.GetExtraOffText}
                                  &amp; {item.GetExtraOffTextTwo}
                                </p>
                              </div>
                              <div className="coupon-item-2">
                                <Link className="teams" href="/termsconditions">
                                  {item.T}&amp;{item.C}
                                </Link>
                                <h6 className="valid-date">{item.ValidTillDate}</h6>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div><center>Sorry, Records Not Found.</center></div>
                      )}

                    </div>
                  </div>

                </div>
              </div>
            </div>

            <div
              className="modal fade"
              id="couponModal"
              tabIndex={-1}
              aria-labelledby="couponModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog modal-sm">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="couponModalLabel">
                      {item.CouponCode}
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    />
                  </div>
                  <div className="modal-body coupon-modal-body">
                    <h2>{item.GetOff}</h2>
                    <p>{item.CopyTheCouponCode} &amp; {item.UseIt}</p>
                    <h5 className="coupon-code">{item.CouponCode}</h5>
                    <span id="couponCode">{item.Off}</span>
                    <p />
                    {/* <div className="continue-btn">
                      <button className="">{item.Continue}</button>
                    </div> */}
                  </div>
                </div>
              </div>
            </div>
          </>
        )
      })}
      <Footer />
    </>


  )
}

export default Coupons