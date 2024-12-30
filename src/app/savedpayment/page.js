'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'
import Header from 'src/component/Header'
import ProfileListView from 'src/component/ProfileListView'
import Footer from 'src/component/Footer'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { getDecodedToken, getSavedCardData, deleteSavedCardData } from "../../utils/frontendCommonFunction";
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

function SavedPayment() {
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);
  const [savePaymentData, setSavePaymentData] = useState([]);

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

  // Fetch Save Card Data
  const fetchData = useCallback(async () => {
    if (isUserLoggedIn) {
      try {
        const data1 = await getSavedCardData(isUserLoggedIn);
        setSavePaymentData(data1);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete Save Card Data
  const handleDeleteAddress = async (cardId) => {
    if (window.confirm("Are you sure you want to delete this Record?")) {
      try {
        const data1 = await deleteSavedCardData(cardId);
        if (data1) {
          setSavePaymentData(prevData => prevData.filter(item => item.id !== cardId));
          enqueueSnackbar(data1, { variant: 'success' });
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting Record:", error);
      }
    }
  };


  return (
    <>
      <>
        <Header />
        <div id="myProfile">
          <div className="container">
            <div className="row">
              <ProfileListView />

              <div className="col-md-9">
                <div id="savedPaymentCard">
                  <h3>Manage Saved Cards</h3>

                  {savePaymentData && savePaymentData.length > 0 ? (
                    savePaymentData.map((savePaymentDatas, index) => {
                      return (
                        <div key={savePaymentDatas.id} className='mb-5'>
                          <div className="card-info">
                            <div className="flex">
                              <h4>{savePaymentDatas.card_name}</h4>
                              <h5>* * * * * * * * * * * * {savePaymentDatas.card_number}</h5>
                            </div>
                            <div className="">
                              <Link className="dropdown-item-dlt" href="#" onClick={() => handleDeleteAddress(savePaymentDatas.id)}>
                                <i className="fa-solid fa-trash" />
                              </Link>
                            </div>
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
        <Footer />
      </>

    </>
  )
}

export default SavedPayment