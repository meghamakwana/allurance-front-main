'use client';
import React, { useEffect } from 'react';
import '../../../../public/css/style.css';
import '../../../../public/css/responsive.css';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

function PaymentStatus() {
    const { status } = useParams();
    const searchParams = useSearchParams();
    const txnid = searchParams.get('txnid');
    const router = useRouter();

    useEffect(() => {
        const handlePopstate = (event) => {
            // Redirect to the home page on back button press
            router.push('/');
        };

        // Add popstate event listener to detect back button press
        window.addEventListener('popstate', handlePopstate);

        // Push a new state to history to prevent going back to this page
        if (typeof window !== 'undefined') {
            window.history.pushState(null, '', window.location.href);
        }

        return () => {
            // Cleanup the event listener on component unmount
            window.removeEventListener('popstate', handlePopstate);
        };
    }, [router]);

    return (
        <>
            <div id="home">
                <Header />
                <div id="productListBanner">
                    <div className="row">
                        <div className="col-md-12">
                            <img src="/img/product-list banner.png" alt="Product List Banner" />
                        </div>
                    </div>
                </div>

                <div className="privacyPolicy">
                    <div className="container">
                        {status === 'success' && txnid && (
                            <>
                                <h1>Payment Success</h1>
                                <p>
                                    Thank you for shopping. Your payment has been successful. Your transaction ID is
                                    #{txnid}. The invoice will be sent to your email shortly.
                                </p>
                            </>
                        )}
                        {status === 'failed' && txnid && (
                            <>
                                <h1>Payment Failed</h1>
                                <p>Your payment has failed. Please try again. Transaction ID: #{txnid}</p>
                            </>
                        )}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default PaymentStatus;
