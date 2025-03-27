'use client';
import React, { useState, useEffect } from 'react';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { unsubscribePromotionalCommunication } from "../../utils/frontendCommonFunction";
import { isError } from 'lodash';

function Unsubscribe() {

  const [isUnsubscribed, setUnsubscribed] = useState(false);
  const [error, setError] = useState(false);

  const unsubscribeCall = async () => {
    try {
      const queryParams = new URLSearchParams(window.location.search);
      const userhash = queryParams.get('userhash');
      const data = await unsubscribePromotionalCommunication(userhash);
      if(data.status) {
        setUnsubscribed(true);
      } else {
        setError(true)
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }

  };

  useEffect(() => {
    unsubscribeCall();
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <div className="row" style={{ marginTop: '10%', textAlign: 'center' }}>
            <h1>{error ? 'Your are already unsubscribed' : isUnsubscribed ? 'Your are unsubscribed from promotional communication successfully.' : 'Unsubscribing...'}</h1>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Unsubscribe;
