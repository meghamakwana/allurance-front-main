"use client"
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import data from "../../jsondata/Login.json";
import "../../../public/css/style.css";
import "../../../public/css/responsive.css";
import { FRONTEND_CART_SYNC_ENDPOINT, FRONTEND_CHECKOUT_SYNC_ENDPOINT, FRONTEND_SENDOTP, FRONTEND_VERIFY_OTP_AND_SIGNUP } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hooks'
import Cookies from 'js-cookie';
import { getDecodedToken } from '../../utils/frontendCommonFunction';

function Login() {



  const [gotOTP, setGotOTP] = useState(false);
    const [showOTP, setShowOTP] = useState(false);

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const initialFormData = {
    phone: '',
    otp: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormData);

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

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

  const cartSync = async (e) => {
    try {
      const decodedlogtkn = getDecodedToken();
      const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';
      
      var formData1 = {
        userID: UserLoggedInID,
        mockID: localStorage.getItem('Alluranceorder')
      }
      // CART
      const response = await ManageAPIsData(FRONTEND_CART_SYNC_ENDPOINT, 'PUT', formData1);
      const responseData = await response.json();
      if (responseData.message) {
        localStorage.removeItem('Alluranceorder');
        enqueueSnackbar(responseData.message, { variant: 'success' });
      }
      // CHECKOUT
      const response1 = await ManageAPIsData(FRONTEND_CHECKOUT_SYNC_ENDPOINT, 'PUT', formData1);
      const responseData1 = await response1.json();
      if (responseData1.message) {
        enqueueSnackbar(responseData.message, { variant: 'success' });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handlegetOTP = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData.phone.trim()) {
      errors.phone = 'Please enter phone';
    } else if (formData.phone.length != 10) {
      alert(formData.phone.length);
      errors.phone = 'Please enter a valid phone no.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_SENDOTP, 'POST', formData);
        // console.log("Response:", response);

        const responseData = await response.json(); // Parse JSON response
        // console.log("Parsed Response Data:", responseData);
        
        if (responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        } else {
          setGotOTP(true);
          enqueueSnackbar(responseData.message, { variant: 'success' });
        }
        setSubmitting(false);}
        catch (error) {
          console.error("Error fetching data:", error);
          setSubmitting(false);
        }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData.phone.trim()) {
      errors.phone = 'Please enter phone';
    } else if (formData.phone.length !== 10) {
      errors.phone = 'Please enter a valid phone no.';
    }

    if (!formData.otp) {
      errors.otp = 'Please enter otp';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_VERIFY_OTP_AND_SIGNUP, 'POST', formData);
        // console.log("Response:", response);

        const responseData = await response.json(); // Parse JSON response
        // console.log("Parsed Response Data:", responseData);
        
        if (responseData.error) {
          enqueueSnackbar(responseData.error, { variant: 'error' });
        } else {

          // sessionStorage.setItem('logtk', responseData.accessToken);
          console.log(responseData)
          Cookies.set('logtk', responseData.accessToken, { expires: 1/3 }); 
          console.log(Cookies.get('logtk'))// Set cookie to expire after 8 hours
          if(localStorage.getItem('Alluranceorder')) {
            cartSync();
          }
          enqueueSnackbar(responseData.message, { variant: 'success' });
        }
        setSubmitting(false);


        if (!response.ok) {
          setErrorMessage(responseData.error);
          enqueueSnackbar(responseData.error, { variant: 'error' });
          setShowError(true);
          setSubmitting(false);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          return;
        }

        if (responseData.message) {
          setFormData(initialFormData);
          setSubmitSuccess(true);
          setSubmitting(false);
          enqueueSnackbar(responseData.message, { variant: 'success' });
          router.push('/'); // Update the path if needed
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      {data?.Login?.map((item, index) => {
        return (
          <div id="loginPage" key={index}>
            <div className="row">
              <div className="col-md-8 responsive-display-none">
                <img src={item.LoginImg} alt="" />
              </div>
              <div className="col-md-4 col-sm-12">
                <form onSubmit={gotOTP ? (formData.otp.length === 0 ? handlegetOTP : handleSubmit) : handlegetOTP} className="needs-validation" noValidate>
                  <h1>{item.WelcomeBack}</h1>
                  <p>{item.Title}</p>
                  <div className="login-form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-envelope" />
                        </span>
                      </div>
                      <input type="text" name="phone" placeholder='Enter Phone' value={formData.phone} onChange={handleChange} className={`form-control ${formErrors.phone && 'is-invalid'}`} id="phone" required />
                      <div className="invalid-feedback">
                        {formErrors.phone}
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-lock" />
                        </span>
                      </div>
                      <input type="text" name="otp" placeholder='Enter OTP' value={formData.otp} onChange={handleChange} className={`form-control ${formErrors.otp && 'is-invalid'}`} id="otp" required />
                      <div className="invalid-feedback">
                        {formErrors.otp}
                      </div>
                      {/* <div className="input-group-append">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          id="togglePassword"
                          onClick={togglePasswordVisibility}
                        >
                          <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} id="togglePasswordIcon" />
                        </button>
                      </div> */}
                    </div>
                  </div>
                  <Link href="/forgotpassword">{item.ForgotPassword}</Link>
                  <button type="submit" className="btn login-page-submit-btn" disabled={submitting}>{submitting ? 'Sending...' : (gotOTP ? (formData.otp.length === 0 ? 'Resend OTP': 'Verify and Register') : 'Get OTP')}</button>
                  <div className=''>{showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}</div>
                  <Link className="login-registration" href="/register">
                    {item.Register}
                  </Link>
                </form>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default Login;
