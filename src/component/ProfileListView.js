import React, { useContext } from 'react'
import data from "../jsondata/ProfileListView.json"
import Link from 'next/link'
import "../../public/css/style.css"
import "../../public/css/responsive.css"
import { signOutFn } from '../utils/frontendCommonFunction';
import { useRouter } from 'src/routes/hooks'
import { UserContext } from '../context/UserContext';

function ProfileListView() {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const logoutFn = async () => {
    signOutFn();
    router.push('/');
  }

  return (
    <>
      {data?.ProfileListView?.map((item, index) => {
        return (
          <div className="col-md-3 box-shadow" key={index}>
            <div className="my-name">
              {/* {user && (<img src={user.gender === 1 ? "/img/men-avatar.png" : user.gender === 2 ? "/img/women-avatar.png" : '/img/noimg.png'} alt="Avatar" style={{ width: '80px' }} />)} */}
              <h5 style={{ padding:'20px' }}>Welcome {user ? `${user.first_name} ${user.last_name}` : 'Guest'},</h5>
            </div>
            <div className="my-purchase">
              <img
                src={item.PurchaseImg}
                alt=""
                className="manage-img"
              />
              <Link href="/mypurchase">{item.MyPurchaseText}</Link>
            </div>
            <div className="my-account underline">
              <div className="icon-title">
                <img
                  src={item.AccountImg}
                  alt=""
                  className="manage-img"
                />
                <h5>{item.MyAccountText}</h5>
              </div>
              <ul>
                <li>
                  <Link href="/profile">{item.ProfileInformationText}</Link>
                </li>
                <li>
                  <Link href="/address">{item.ManageAddressText}</Link>
                </li>
                <li>
                  <Link href="/changepassword">Change Password</Link>
                </li>
                <li>
                  <Link href="/earnrefer">{item.ReferText} &amp; {item.EarnText}</Link>
                </li>
              </ul>
            </div>
            <div className="my-payments underline">
              <div className="icon-title">
                <img src={item.CardImg} alt="" className="manage-img" />
                <h5>{item.PaymentsText}</h5>
              </div>
              <ul>
                <li>
                  <Link href="/giftcard">{item.GiftCardText}</Link>
                </li>
                <li>
                  <Link href="/savedpayment">{item.SavePaymentOptions}</Link>
                </li>
              </ul>
            </div>
            <div className="my-stuff underline">
              <div className="icon-title">
                <img
                  src={item.StuffImg}
                  alt=""
                  className="manage-img"
                />
                <h5>{item.MyStuff}</h5>
              </div>
              <ul>
                <li>
                  <Link href="/coupons">{item.MyCoupons}</Link>
                </li>
                <li>
                  <Link href="/notifications">{item.CommunicationPreference}</Link>
                </li>
                <li>
                  <Link href="/wishlist">{item.MyWishlist}</Link>
                </li>
                <li>
                  <Link href="/ticket">My Tickets</Link>
                </li>
                <li>
                  <Link href="/reviews">My Reviews</Link>
                </li>
              </ul>
            </div>
            <div className="logout-profile">
              <div className="icon-title">
                <img src={item.LogoutImg} alt="" className="manage-img" />
                <Link href="#" onClick={(e) => { e.preventDefault(); logoutFn(); }}><h5>Logout</h5></Link>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default ProfileListView