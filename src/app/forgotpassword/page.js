// src/app/forgotpassword/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import data from "../../jsondata/ForgotPassword.json"
import Link from 'next/link'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { FRONTEND_FORGOTPASSWORD } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';

function ForgotPassword() {

  const router = useRouter();

  const initialFormData = {
    email: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData.email.trim()) {
      errors.email = 'Please enter your email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_FORGOTPASSWORD, 'PUT', formData);
        if (!response.ok) {
          const responseData1 = await response.json();
          setErrorMessage(responseData1.error);
          setShowError(true);
          setSubmitting(false);
          setFormData(initialFormData);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          setFormData(initialFormData);
          enqueueSnackbar(responseData.message, { variant: 'success' });
          setSubmitSuccess(true);
          setSubmitting(false);
          sessionStorage.setItem('params1', btoa(formData.email));
          router.push(`/otp`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };



  return (
    <>
      
      {data?.ForgotPassword?.map((item, index) => {
        return (
          <div key={index} id="home">
            <div id="loginPage">
              <div className="row">
                <div className="col-md-8 responsive-display-none">
                  <img src={item.LoginImg} alt="" />
                </div>
                <div className="col-md-4 col-sm-12">
                  <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                    <h1>{item.ForgotYourPassword} </h1>
                    <p>
                      {item.Title}
                    </p>
                    <div className="login-form-group">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="fas fa-envelope" />
                          </span>
                        </div>
                        <input type="email" name="email" placeholder='Enter Email' value={formData.email} onChange={handleChange} className={`form-control ${formErrors.email && 'is-invalid'}`} id="email" required />
                        <div className="invalid-feedback">
                          {formErrors.email}
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="btn login-page-submit-btn" disabled={submitting}>{submitting ? 'Checking...' : 'Submit'}</button>
                    <div className=''>{submitSuccess && <p className="text-success mt-3">OTP has been sent to your email</p>}</div>
                    <div className=''>{showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}</div>
                    <Link className="login-registration" href="/login">
                      {item.Login}
                    </Link>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )
      })}

    </>
  )
}

export default ForgotPassword