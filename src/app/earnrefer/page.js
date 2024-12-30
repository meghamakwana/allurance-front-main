'use client';
import React, { useState, useEffect, useCallback } from 'react';
import data from "../../jsondata/EarnRefer.json";
import Link from 'next/link';
import Header from 'src/component/Header';
import ProfileListView from 'src/component/ProfileListView';
import Footer from 'src/component/Footer';
import "../../../public/css/style.css";
import "../../../public/css/responsive.css";
import { getDecodedToken, formatDateFn, getUserLoginInfo, getReferralListData } from "../../utils/frontendCommonFunction";
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

function EarnRefer() {
  const router = useRouter();
  const [earnReferData, setEarnReferData] = useState([]);
  const [decodedToken, setDecodedToken] = useState(null);
  const [getreferralLink, setReferralLink] = useState('');

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

  const fetchData = useCallback(async () => {
    if (isUserLoggedIn) {
      try {
        const userInfoData = await getUserLoginInfo(isUserLoggedIn);
        setReferralLink(userInfoData);

        const referralListData = await getReferralListData(isUserLoggedIn);
        setEarnReferData(referralListData);

      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const copyToClipboard = () => {
      const referralLink = document.getElementById('referralLink');
      referralLink.select();
      document.execCommand('copy');
    };

    const copyButton = document.getElementById('copyButton');
    copyButton?.addEventListener('click', copyToClipboard);

    return () => {
      copyButton?.removeEventListener('click', copyToClipboard);
    };
  }, []);

  return (
    <div id="home">
      <Header />
      {data?.EarnRefer?.map((item, index) => (
        <div id="myProfile" key={index}>
          <div className="container">
            <div className="row">
              <ProfileListView />
              <div className="col-md-9">
                <div id="referEarn">
                  <h3>{item.ReferText} &amp; {item.EarnText}</h3>
                  <div className="banner-section">
                    <img
                      src={item.ReferEarnImg}
                      alt=""
                      className="refer-earn-img"
                    />
                    <h4>{item.TotalAmountText}</h4>
                    <h5>₹ {earnReferData?.total_amt || 0}</h5>
                    <p>{item.NoteText}</p>
                  </div>
                  <div className="share-link">
                    <h6>{item.ShareLinkTitleText}</h6>
                    <p>{item.ShareLinkDetailText}</p>
                  </div>
                  <div className="earn-refer-link-section">
                    <div className="refer-earn-links">
                      <div className="input-group mb-3">
                        <input
                          type="text"
                          className="form-control"
                          id="referralLink"
                          value={`http://98.70.76.169:3032/register?referral=${getreferralLink?.my_referral_code}`}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          id="copyButton"
                        >
                          {item.CopyLinkText}
                        </button>
                      </div>
                    </div>
                    {/* {item.Or} */}
                    <div className="refer-earn-social-links">
                      {/* <Link href="#"><i className="fa-brands fa-linkedin" /></Link>
                      <Link href="#"><i className="fa-brands fa-instagram" /></Link>
                      <Link href="#"><i className="fa-brands fa-youtube" /></Link>
                      <Link href="#"><i className="fa-brands fa-facebook-f" /></Link> */}
                    </div>
                  </div>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>User Name</th>
                        <th>Email</th>
                        <th>Refer Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {earnReferData?.data?.length ? (
                        earnReferData.data.map((earnReferDatas) => (
                          <tr key={earnReferDatas.id}>
                            <td>{formatDateFn(earnReferDatas.created_at)}</td>
                            <td>{earnReferDatas.fname} {earnReferDatas.lname}</td>
                            <td>{earnReferDatas.email}</td>
                            <td>₹ {earnReferDatas.amount}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="4"><center>Sorry, Records Not Found.</center></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      <Footer />
    </div>
  );
}

export default EarnRefer;
