'use client';
import { useState, useEffect, useCallback } from 'react';
import data from "../../jsondata/GiftCard.json"
import Header from 'src/component/Header'
import ProfileListView from 'src/component/ProfileListView'
import Footer from 'src/component/Footer'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { FRONTEND_GIFTCARD } from "../../utils/frontendAPIEndPoints";
import { formatDateFn, getUserLoginSession, getMyGiftcardData, getDecodedToken } from "../../utils/frontendCommonFunction";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

function GiftCard() {
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);
  const [myGiftCardData, setGiftCardData] = useState([]);

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

  // Fetch Gift Card Data
  const fetchData = useCallback(async () => {
    if (isUserLoggedIn) {
      try {
        const data1 = await getMyGiftcardData(isUserLoggedIn);
        setGiftCardData(data1);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const initialFormData = {
    user_id: isUserLoggedIn,
    gift_card_number: '',
    pin_number: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormData);

  useEffect(() => {
    if (isUserLoggedIn) {
      setFormData(prevData => ({
        ...prevData,
        user_id: isUserLoggedIn
      }));
    }
  }, [isUserLoggedIn]);

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));

    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData.gift_card_number) {
      errors.gift_card_number = 'Please enter gift card number';
    }
    if (!formData.pin_number) {
      errors.pin_number = 'Please enter pin number';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_GIFTCARD, 'POST', formData);
        if (!response.ok) {
          const responseData1 = await response.json();
          setErrorMessage(responseData1.error);
          setShowError(true);
          setSubmitting(false);
          setTimeout(() => {
            setFormData(initialFormData);
            setShowError(false);
          }, 3000);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          document.getElementById('closeModalButton').click();
          enqueueSnackbar(responseData.message, { variant: 'success' });
          setFormData(initialFormData);
          setSubmitting(false);
          fetchData();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  
  

  return (
    <>
      <Header />

      <div id="myProfile">
        <div className="container">
          <div className="row">
            {data?.GiftCard?.map((item) => {
              return (
                <>
                  <ProfileListView />

                  <div className="col-md-9">
                    <div id="giftCard">
                      <div className="flex">
                        <h3>{item.AlluranceGiftCard}</h3>
                        <div className="gift-btns">
                          <button
                            className="buy-giftcard m-2"
                            data-bs-toggle="modal"
                            data-bs-target="#giftCardModal"
                          >
                            {item.BuyGiftCard}
                          </button>
                          <button
                            className="giftcard-balance"
                            data-bs-toggle="modal"
                            data-bs-target="#checkBalanceModal"
                          >
                            {item.CheckGiftCardBalance}
                          </button>
                        </div>
                      </div>
                      <button
                        className="add-gift-card"
                        data-bs-toggle="modal"
                        data-bs-target="#checkBalanceModal"
                      >
                        {item.AddGiftCard}
                      </button>
                      <div className="gift-card-section">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Gift Card Number</th>
                              <th>Pin Number</th>
                              <th>Amount</th>
                              <th>Expiry Date</th>
                            </tr>
                          </thead>
                          <tbody>

                            {myGiftCardData && myGiftCardData.data && myGiftCardData.data.length > 0 ? (
                              myGiftCardData.data.map((myGiftCardDatas, index) => {
                                return (
                                  <tr key={myGiftCardDatas.id}>
                                    <td>{myGiftCardDatas.gift_card_number}</td>
                                    <td>{myGiftCardDatas.pin_number}</td>
                                    <td>₹ {myGiftCardDatas.amount}</td>
                                    <td>{formatDateFn(myGiftCardDatas.created_at)}</td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr><td colSpan="4"><center>Sorry, Records Not Found.</center></td></tr>
                            )}



                          </tbody>
                        </table>
                        <img src={item.GiftCardImg} alt="" />
                      </div>
                    </div>
                  </div>

                  <div
                    className="modal fade"
                    id="giftCardModal"
                    tabIndex={-1}
                    aria-labelledby="giftCardModalLabel"
                    aria-hidden="true"
                  >
                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="giftCardModalLabel">
                            Buy Gift Card
                          </h5>
                          <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          />
                        </div>
                        <div className="modal-body gift-card-modal-body">
                          <form>
                            <label htmlFor="recipientEmail" />
                            <input
                              type="email"
                              id="recipientEmail"
                              name="recipientEmail"
                              className="form-control"
                              placeholder="Reciever's Email"
                            />
                            <label htmlFor="recipientName" />
                            <input
                              type="text"
                              id="recipientName"
                              name="recipientName"
                              className="form-control"
                              placeholder="Recievers's Name"
                            />
                            <label htmlFor="cardValue" />
                            <select
                              id="cardValue"
                              name="cardValue"
                              className="form-control"
                              placeholder="Card Value"
                            >
                              <option value={500}>500 Rs</option>
                              <option value={1000}>1000 Rs</option>
                              <option value={2000}>2000 Rs</option>
                              {/* Add more options as needed */}
                            </select>
                            <label htmlFor="numberOfCards" />
                            <input
                              type="number"
                              id="numberOfCards"
                              name="numberOfCards"
                              min={1}
                              className="form-control"
                              placeholder="Number of Cards"
                            />
                            <label htmlFor="giftMessage" />
                            <textarea
                              id="giftMessage"
                              name="giftMessage"
                              className="form-control"
                              placeholder="Write Message"
                              defaultValue={""}
                            />
                            <button type="submit" className="btn gift-card-submit-btn">
                              Submit
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="modal fade"
                    id="checkBalanceModal"
                    tabIndex={-1}
                    aria-labelledby="checkBalanceModalLabel"
                    aria-hidden="true"
                  >

                    <div className="modal-dialog modal-dialog-centered">
                      <div className="modal-content">
                        <div className="modal-header">
                          <h5 className="modal-title" id="checkBalanceModalLabel">
                            Add Gift Card
                          </h5>
                          <button
                            id="closeModalButton"
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                          />
                        </div>
                        <div className="modal-body gift-card-balance-modal-body">


                          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <div className="mb-3">
                              <label htmlFor="gift_card_number" className="form-label">Gift Card Number:</label>
                              <input type="text" name="gift_card_number" value={formData.gift_card_number} maxLength="19" onChange={handleChange} className={`form-control ${formErrors.gift_card_number && 'is-invalid'}`} id="gift_card_number" required />
                              <div className="invalid-feedback">
                                {formErrors.gift_card_number}
                              </div>
                            </div>
                            <div className="mb-3">
                              <label htmlFor="pin_number" className="form-label">Pin Number:</label>
                              <input type="text" name="pin_number" value={formData.pin_number} maxLength="6" onChange={handleChange} className={`form-control ${formErrors.pin_number && 'is-invalid'}`} id="pin_number" required />
                              <div className="invalid-feedback">
                                {formErrors.pin_number}
                              </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                          </form>
                          {showError && (<p className="text-danger mt-3">{errorMessage}</p>)}

                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )
            })}
          </div>
        </div>
      </div>

      <Footer />



    </>
  )
}

export default GiftCard