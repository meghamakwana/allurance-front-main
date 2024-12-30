'use client';
import React, { useState, useEffect, useCallback } from 'react';
import '../../../public/css/style.css'
import '../../../public/css/responsive.css'
import Header from 'src/component/Header'
import Footer from 'src/component/Footer'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { getPagesData } from '../../utils/frontendCommonFunction';

function TermsConditions() {

  const [pagesData, setPagesData] = useState([]);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      const data1 = await getPagesData(2);
      setPagesData(data1);
    } catch (error) {
      console.error("Error fetching user info:", error);
    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div id="home">

        <Header />
        <div id="productListBanner">
          <div className="row">
            <div className="col-md-12">
              <img src="/img/product-list banner.png" alt="" />
            </div>
          </div>
        </div>
        <div className="privacyPolicy">
          <div className="container">
            <h1>Terms Of Services</h1>
            <div dangerouslySetInnerHTML={{ __html: pagesData?.description || '' }} />
          </div>
        </div>
        <Footer />

      </div>

    </>
  )
}

export default TermsConditions