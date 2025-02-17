'use client';
import React, { useState, useEffect } from 'react';
import data from '../../jsondata/Register.json';
import Link from 'next/link';
import '../../../public/css/style.css';
import '../../../public/css/responsive.css';
import { FRONTEND_SENDOTP, FRONTEND_VERIFY_OTP_AND_SIGNUP } from '../../utils/frontendAPIEndPoints';
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hooks';
import { useSearchParams } from 'next/navigation';

function Register() {
  const router = useRouter();
  const [gotOTP, setGotOTP] = useState(false);
  const [showOTP, setShowOTP] = useState(false);

  const searchParams = useSearchParams();
  const referralCode = searchParams.get('referral');

  useEffect(() => {
    if (referralCode) {
      setFormData((prevState) => ({
        ...prevState,
        referral_code: referralCode,
      }));
    }
  }, [referralCode]);

  const toggleOTPVisibility = () => {
    setShowOTP(!showOTP);
  };

  const initialFormData = {
    role_id: 9,
    first_name: '',
    last_name: '',
    phone: '',
    otp: '',
    referral_code: '',
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
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    setFormErrors((prevErrors) => ({
      ...prevErrors,
      [name]: '',
    }));
  };

  const handlegetOTP = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'Please enter your first name';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Please enter your last name';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter your phone no.';
    } else if (formData.phone.length != 10) {
      errors.phone = 'Please enter a valid phone no.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_SENDOTP, 'POST', formData);
        if (!response.ok) {
          const responseData1 = await response.json();
          setErrorMessage(responseData1.error);
          enqueueSnackbar(responseData1.error, { variant: 'error' });
          setShowError(true);
          setGotOTP(false);
          setSubmitting(false);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          enqueueSnackbar(responseData.message, { variant: 'success' });
          // setFormData(initialFormData);
          setSubmitSuccess(true);
          setGotOTP(true);
          setSubmitting(false);
          // router.push('/login');
        }
      } catch (error) {
        enqueueSnackbar(error, { variant: 'error' });
        console.error('Error fetching data:', error);
        setGotOTP(false);
        setSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'Please enter your first name';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Please enter your last name';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter your phone no.';
    } else if (formData.phone.length != 10) {
      errors.phone = 'Please enter a valid phone no.';
    }

    // if (!formData.otp.trim()) {
    //   errors.otp = 'Please enter OTP';
    // } else if (formData.otp.length < 6) {
    //   errors.otp = 'OTP must be of minimum 6 characters';
    // }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_VERIFY_OTP_AND_SIGNUP, 'POST', formData);
        if (!response.ok) {
          const responseData1 = await response.json();
          setErrorMessage(responseData1.error);
          enqueueSnackbar(responseData1.error, { variant: 'error' });
          setShowError(true);
          setSubmitting(false);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          enqueueSnackbar(responseData.message, { variant: 'success' });
          setFormData(initialFormData);
          setSubmitSuccess(true);
          setSubmitting(false);
          router.push('/login');
        }
      } catch (error) {
        enqueueSnackbar(error, { variant: 'error' });
        console.error('Error fetching data:', error);
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      {data?.Register?.map((item, index) => {
        return (
          <div id="registerPage" key={index}>
            <div className="row">
              <div className="col-md-8 responsive-display-none">
                <img src={item.LoginImg} alt="" />
              </div>
              <div className="col-md-4 col-sm-12 col-xs-12">
                <form onSubmit={gotOTP ? (formData.otp.length === 0 ? handlegetOTP : handleSubmit) : handlegetOTP} className="needs-validation" noValidate>
                  <h1>{item.CreateAnAccount}</h1>
                  <p>{item.Title} </p>
                  <div className="firstLastname">
                    <div className="login-form-group">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="fas fa-user" />
                          </span>
                        </div>
                        <input
                          type="text"
                          name="first_name"
                          placeholder="Enter First Name"
                          value={formData.first_name}
                          onChange={handleChange}
                          className={`form-control ${formErrors.first_name && 'is-invalid'}`}
                          id="first_name"
                          required
                        />
                        <div className="invalid-feedback">{formErrors.first_name}</div>
                      </div>
                    </div>
                    <div className="login-form-group">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="fas fa-user" />
                          </span>
                        </div>
                        <input
                          type="text"
                          name="last_name"
                          placeholder="Enter Last Name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className={`form-control ${formErrors.last_name && 'is-invalid'}`}
                          id="last_name"
                          required
                        />
                        <div className="invalid-feedback">{formErrors.last_name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="login-form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-envelope" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="phone"
                        placeholder="Enter Phone No."
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-control ${formErrors.phone && 'is-invalid'}`}
                        id="phone"
                        required
                      />
                      <div className="invalid-feedback">{formErrors.phone}</div>
                    </div>
                  </div>
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-lock" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="otp"
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={handleChange}
                        className={`form-control ${formErrors.otp && 'is-invalid'}`}
                        id="otp"
                        required
                      />
                      <div className="invalid-feedback">{formErrors.otp}</div>
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
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-gift" />
                        </span>
                      </div>
                      <input
                        type="text"
                        name="referral_code"
                        placeholder="Enter Referral Code (Optional)"
                        value={formData.referral_code}
                        onChange={handleChange}
                        className={`form-control`}
                        id="referral_code"
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn login-page-submit-btn" disabled={submitting}>
                    {submitting ? 'Sending...' : (gotOTP ? (formData.otp.length === 0 ? 'Resend OTP': 'Verify and Register') : 'Get OTP')}
                  </button>
                  <Link className="login-registration" href="/login">
                    {item.Login}
                  </Link>
                </form>
                {/* <div className=''>{submitSuccess && <p className="text-success mt-3">Registration Successfully Completed</p>}</div> */}
                <div className="">
                  {showError && (
                    <p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>
                      {errorMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default Register;
