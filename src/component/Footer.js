import React, { useState, useEffect, useCallback } from 'react';
import data from '../jsondata/Footer.json';
import Link from 'next/link';
import '../../public/css/style.css';
import '../../public/css/responsive.css';
import { getSocialData, getContactData, getCategories, getDecodedToken } from "../../src/utils/frontendCommonFunction";

function Footer() {
  const getInitialFormData = {
    getaddress: '',
    getemail: '',
    getcontact1: '',
    getcontact2: '',
    getcin: '',
  };

  const [socialData, setSocialData] = useState([]);
  const [fetchFormData, getFetchFormData] = useState(getInitialFormData);
  const [fetchcategories, setCategories] = useState([]);
  const [decodedToken, setDecodedToken] = useState(null);

  const fetchData = useCallback(async () => {
    try {

      // Social Data
      const data1 = await getSocialData();
      setSocialData(data1);

      // Contact Data
      const data2 = await getContactData();
      getFetchFormData({
        getaddress: data2.address,
        getemail: data2.email,
        getcontact1: data2.contact1,
        getcontact2: data2.contact2,
        getcin: data2.cin,
      });

      // Categories Data
      const data3 = await getCategories();
      if (data3.data.length) {
        setCategories(data3.data);
      }

      const decodedlogtkn = getDecodedToken();
      setDecodedToken(decodedlogtkn);

    } catch (error) {
      console.error("Error fetching user info:", error);
    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;

  return (
    <>
      <footer>
        {data?.Footer?.map((item, index) => {
          return (
            <div id="footer" key={index}>

              <div className="top-footer">
                <div className="container">
                  <div className="row">
                    <div className="col-md-3">
                      <Link href="/">
                        <img src={item.Logo} alt="" className="footer-logo" />
                      </Link>
                      <h4>{item.BrandText}</h4>
                      <h2>{item.PrivateLimitedText}</h2>
                      <p>{fetchFormData?.getaddress}</p>
                      {fetchFormData?.getcin && (<h5>CIN: {fetchFormData?.getcin}</h5>)}
                      <h5>Email: <Link href={`mailto:${fetchFormData?.getemail}`}>{fetchFormData?.getemail}</Link></h5>
                      {fetchFormData?.getcontact1 && (<h5>Contact1: <Link href={`mailto:${fetchFormData?.getcontact1}`}>{fetchFormData?.getcontact1}</Link></h5>)}
                      {fetchFormData?.getcontact2 && (<h5>Contact2: <Link href={`mailto:${fetchFormData?.getcontact2}`}>{fetchFormData?.getcontact2}</Link></h5>)}
                    </div>
                    <div className="col-md-3 links">
                      <h3>{item.ShopBy}</h3>

                      {fetchcategories && fetchcategories.length > 0 ? (
                        fetchcategories.map((categoriesData, index) => (
                          <Link href={`/productlist/${categoriesData.id}`} key={index}>
                            <h5>{categoriesData.name}</h5>
                          </Link>
                        ))
                      ) : (
                        <p>No categories available</p>
                      )}

                      {fetchcategories && fetchcategories.length > 0 && (
                        <Link href="/categories" className="underline-link">
                          <h6>{item.ExploreAllCategories}</h6>
                        </Link>
                      )}

                      <h3>{item.ExploreCollections}</h3>
                      <Link href="#">
                        <h5>{item.AnanyaBirlas}</h5>
                      </Link>
                      <Link href="#">
                        <h5>{item.BlossomRedRose}</h5>
                      </Link>
                      <Link href="#">
                        <h5>{item.EnergyBlue}</h5>
                      </Link>
                      <Link href="#" className="underline-link">
                        <h6>{item.ExploreAllCollections}</h6>
                      </Link>
                    </div>

                    <div className="col-md-3 links">
                      <h3>{item.ManageAccount}</h3>

                      <Link href={isUserLoggedIn ? "/profile" : "/login"}><h5>My Profile</h5></Link>
                      <Link href={isUserLoggedIn ? "/mypurchase" : "/login"}><h5>My Orders</h5></Link>
                      <Link href={isUserLoggedIn ? "/wishlist" : "/login"}><h5>My Wishlist</h5></Link>
                      <Link href={isUserLoggedIn ? "/address" : "/login"}><h5>My Address</h5></Link>
                      <Link href={isUserLoggedIn ? "/reviews" : "/login"}><h5>My Reviews</h5></Link>
                      <Link href={isUserLoggedIn ? "/giftcard" : "/login"}><h5>Gift Card</h5></Link>
                      <Link href={isUserLoggedIn ? "/profile" : "/login"} className="underline-link"><h6>Go to accounts section</h6></Link>

                      <h3>Help & FAQ</h3>
                      <Link href="/contact-us">
                        <h5>{item.ContactUs}</h5>
                      </Link>
                      <Link href="/faqs">
                        <h5>{item.Faq}</h5>
                      </Link>
                      <Link href="/cancellation-return">
                        <h5>Cancellation & Return</h5>
                      </Link>
                      <Link href="#">
                        <h5>{item.reportcounterfeit}</h5>
                      </Link>
                    </div>
                    <div className="col-md-3 about-links links">
                      <h3>{item.AboutUs}</h3>
                      <Link href="#">
                        <h5>{item.Press}</h5>
                      </Link>
                      <Link href="#">
                        <h5>{item.Careers}</h5>
                      </Link>
                      <Link href={isUserLoggedIn ? "/ticket" : "/login"}><h5>Grievance Redressal</h5></Link>
                      <Link href="/blog">
                        <h5>{item.OurBlogs}</h5>
                      </Link>


                      <div className="social-links">
                        <h3>{item.KeepUpdated}</h3>
                        <>
                          {socialData && socialData.length > 0 ? (
                            socialData.map((sdata) => {
                              if (sdata.social_link) {
                                return (
                                  <span key={sdata.id}>
                                    <Link href={sdata.social_link} target="_blank" rel="noopener noreferrer">
                                      <i className={`fa-brands fa-${sdata.title.toLowerCase()}`} />
                                    </Link>
                                  </span>
                                );
                              }
                              return null;
                            })
                          ) : (
                            <div>No social links available</div>
                          )}
                        </>
                      </div>
                      <Link href="/blog">
                        <h3>{item.VisitBlogsSection}</h3>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="middle-footer">
                <div className="container">
                  <div className="row">
                    <div className="col-md-12">
                      <Link href="/privacypolicy">{item.PrivacyPolicy}</Link>
                      <Link href="/termsconditions">{item.TermsOfService}</Link>
                      <Link href="/shippingpolicy">{item.ShippingPolicy}</Link>
                      <Link href="/refundpolicy">{item.RefundPolicy}</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lower-footer">
                <div className="container">
                  <div className="row">
                    <div className="col-md-12">
                      <p>{item.CopyRight}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </footer>
    </>
  );
}

export default Footer;
