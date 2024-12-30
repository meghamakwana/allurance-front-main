'use client';
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ProfileListView from "src/component/ProfileListView";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "src/component/Header";
import Footer from "src/component/Footer";
import "../../../../public/css/style.css"
import "../../../../public/css/responsive.css"
import { FRONTEND_TICKET_VERIFY, FRONTEND_TICKET_RESPONSE, FRONTEND_TICKET_CLOSE } from "../../../utils/frontendAPIEndPoints";
import { getUserLoginSession, formatDateFn, getTicketVerifyData, getTicketResponseData, getDecodedToken, getOnlyToken } from "../../../utils/frontendCommonFunction";
import { ManageAPIsData } from '../../../utils/commonFunction';
import { useParams } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';

function TicketDetail() {
  const userToken = getOnlyToken();
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);
  const [ticketData, setTicketVerifyData] = useState([]);
  let { id } = useParams();
  const [ticketResponseData, setTicketResponseData] = useState([]);

  const chatBodyRef = useRef();



  useEffect(() => {
    const decodedlogtkn = getDecodedToken();
    if (!decodedlogtkn || !decodedlogtkn.data || !decodedlogtkn.data.id) {
      enqueueSnackbar("Something Wrong! Please login to continue access", { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedlogtkn);
  }, []);

  const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;

  useEffect(() => {
    const fetchData = async () => {
      if (isUserLoggedIn) {
        try {
          // Ticket Verify
          const data1 = await getTicketVerifyData(id, isUserLoggedIn);
          if (data1.data.length) {
            setTicketVerifyData(data1.data);
          }

          // Ticket Response
          getResponseData();

        } catch (error) {
          console.error("Error fetching ticket data:", error);
        }
      }
    };

    fetchData();
  }, [isUserLoggedIn]);

  const getResponseData = async () => {
    const data2 = await getTicketResponseData(id, isUserLoggedIn);
    setTicketResponseData(data2.data);
    console.log("Responsee", data2.data);
  }

  const scrollToBottom = () => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({
        top: chatBodyRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useLayoutEffect(() => {
    if (chatBodyRef.current) {
      // Scroll to the bottom after new messages are rendered
      scrollToBottom();
    }
  }, [ticketResponseData]); // This ensures scroll stays at bottom whenever ticketResponseData changes

  useEffect(() => {
    getResponseData();
  }, [id, isUserLoggedIn]);

  const initialFormData = {
    ticket_id: id,
    response_from: '',
    response_to: '',
    response_type: 1,
    message: '',
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    if (isUserLoggedIn && ticketData && ticketData.length > 0) {
      setFormData(prevData => ({
        ...prevData,
        response_from: isUserLoggedIn,
        response_to: ticketData[0].operate_by,
      }));
    }
  }, [isUserLoggedIn, ticketData]);


  const [formErrors, setFormErrors] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));

    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    let errors = {};

    const trimmedMessage = formData.message.trim();

    if (!trimmedMessage) {
      errors.message = 'Please enter a message';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {

        let response;
        response = await ManageAPIsData(FRONTEND_TICKET_RESPONSE, 'POST', formData, userToken);

        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          setSubmitting(false);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          getResponseData();
          setSubmitSuccess(true);
          setFormData(prevFormData => ({
            ...prevFormData,
            message: ''
          }));
          setSubmitting(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  const handleCloseTicket = async () => {
    const data = {
      ticket_id: id,
      user_id: decodedToken.data.id
    }

    const res = await ManageAPIsData(FRONTEND_TICKET_CLOSE, 'POST', data, userToken);
    if (!res.ok) {
      console.error("Error fetching data:", res.statusText);
      return;
    }
    router.push('/ticket')

  }


  const handleBackButton = () => {
    router.push('/ticket')
  }

  return (
    <>
      <Header />
      <div id="myProfile" key="TicketAdd">
        <div className="container">
          <div className="row">
            <ProfileListView />
            <div className="col-md-9">
              <div id="addressSection">
                <div className="address-title">
                  <h3>Ticket Detail</h3>
                  <Link href="/ticket" className="btn new-address-btn">List</Link>
                </div>

                {ticketData && ticketData.length > 0 ? (
                  <div className="modal-body">
                    <div>Ticket ID: {ticketData[0].ticket_id}</div>
                    <div>Title: {ticketData[0].title}</div>
                    <div>Created: {formatDateFn(ticketData[0].created_at)}</div>
                    <div>Ticket Status: {ticketData[0].ticket_status === 1 ? 'Open' : 'Closed'}</div>
                    <div>Description: {ticketData[0].description}</div>
                  </div>
                ) : (
                  <div><center>Sorry, Records Not Found.</center></div>
                )}

                <div
                  style={{
                    maxHeight: "550px",
                    overflowY: "auto",
                    padding: "16px",
                    background: "#fff",
                    borderRadius: "8px",
                    boxShadow: "4px 4px 6px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                  ref={chatBodyRef}
                >
                  {ticketData && ticketData.length > 0 && (
                    <>
                      {/* <div
                        style={{
                          fontSize: "20px",
                          fontWeight: "bold",
                          marginBottom: "16px",
                          textAlign: "center",
                        } }
                      >
                        Communication
                      </div> */}
                      <div
                        style={{
                          maxHeight: "400px",
                          overflowY: "auto",
                          padding: "16px",
                          background: "#fff",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                        id="chatBody"
                      >
                        {ticketResponseData && ticketResponseData.length > 0 ? (
                          ticketResponseData.map((responseData, index) => {
                            return (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  marginBottom: "16px",
                                }}
                              >
                                {/* Profile Icon */}
                                {/* <div
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    backgroundColor: "#e0e0e0",
                                    borderRadius: "50%",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: "10px",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    color: "#555",
                                  }}
                                >
                                  {responseData.response_from_first_name[0].toUpperCase()}
                                </div> */}
                                {/* Message Content */}
                                <div
                                  style={{
                                    backgroundColor: "#e0f7fa",
                                    padding: "10px",
                                    borderRadius: "8px",
                                    minWidth: "100%",
                                    wordWrap: "break-word",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "12px",
                                      color: "#666",
                                      marginBottom: "4px",
                                    }}
                                  >
                                    <span style={{ fontWeight: "bold" }}>
                                      {`${responseData.response_from_first_name} ${responseData.response_from_last_name}`}
                                    </span>
                                    <span style={{ marginLeft: "8px", fontStyle: "italic" }}>
                                      {formatDateFn(responseData.created_at)}
                                    </span>
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "14px",
                                      color: "#333",
                                    }}
                                  >
                                    {responseData.message}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div>
                            <center>Sorry, No Conversations Found! Start Conversation</center>
                          </div>
                        )}
                      </div>
                      <div style={{ marginTop: "16px" }}>
                        {ticketData[0]?.ticket_status === 1 ? (
                          <form onSubmit={handleSubmit} className="needs-validation">
                            <div style={{ marginBottom: "16px" }}>
                              <input
                                type="text"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Enter your message..."
                                name="message"
                                style={{
                                  width: "100%",
                                  padding: "10px",
                                  fontSize: "14px",
                                  borderRadius: "4px",
                                  border: "1px solid #ccc",
                                }}
                                required
                              />
                            </div>
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between"
                            }}>
                              <button
                                type="submit"
                                style={{
                                  padding: "10px 20px",
                                  fontSize: "14px",
                                  borderRadius: "4px",
                                  backgroundColor: "#007bff",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                                disabled={submitting}
                              >
                                {submitting ? "Submitting..." : "Submit"}
                              </button>
                              <button
                                style={{
                                  padding: "10px 20px",
                                  fontSize: "14px",
                                  borderRadius: "4px",
                                  backgroundColor: "#781028",
                                  color: "#fff",
                                  border: "none",
                                  cursor: "pointer",
                                }}
                                onClick={handleCloseTicket}
                              >
                                Close Ticket
                              </button>
                            </div>
                          </form>
                        ) : (
                          <div>
                            <center>You have Closed This Ticket <br /> <button
                              style={{
                                padding: "8px 16px",
                                fontSize: "14px",
                                borderRadius: "4px",
                                backgroundColor: "#781028",
                                color: "#fff",
                                border: "none",
                                cursor: "pointer",
                              }}
                              onClick={handleBackButton}
                            >
                              Back
                            </button></center>
                          </div>
                        )}
                      </div>
                    </>
                  )}
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

export default TicketDetail;
