// src/app/otp/page.js
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import data from "../../jsondata/Otp.json"
import Link from 'next/link'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { FRONTEND_OTP } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';

function Otp() {

  const router = useRouter();
  
  const initialFormData = {
    email: '',
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
  
    const numericValue = value.replace(/[^0-9]/g, '');
    const limitedValue = numericValue.slice(0, 6);
    setFormData(prevState => ({
      ...prevState,
      [name]: limitedValue
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

    if (!formData.otp) {
      errors.otp = 'Please enter OTP';
    } else if (formData.otp.length < 5) {
      errors.otp = 'Please enter valid OTP';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {

        const encodedEmail = sessionStorage.getItem('params1');
        const decodedEmail = encodedEmail ? atob(encodedEmail) : '';
        const updatedFormData = {
          ...formData,
          email: decodedEmail,
        };

        const response = await ManageAPIsData(FRONTEND_OTP, 'POST', updatedFormData);
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
          sessionStorage.setItem('params2', btoa(responseData.paramsID));
          router.push(`/newpassword`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      {data?.Otp?.map((item, index) => {
        return (
          <div id="otpPage" key={index}>
            <div className="row">
              <div className="col-md-8 responsive-display-none">
                <img src={item.LoginImg} alt="" />
              </div>
              <div className="col-md-4 col-sm-12 col-xs-12">
                <h1>{item.Otp}</h1>
                <p>{item.Title}</p>
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-lock" />
                        </span>
                      </div>
                      <input type="text" maxLength="6" name="otp" placeholder='Enter OTP' value={formData.otp} onChange={handleChange} className={`form-control ${formErrors.otp && 'is-invalid'}`} id="otp" required />
                      <div className="invalid-feedback">
                        {formErrors.otp}
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn otp-page-submit-btn" disabled={submitting}>{submitting ? 'Checking...' : 'Submit'}</button>
                  <div className=''>{submitSuccess && <p className="text-success mt-3">OTP verified successfully</p>}</div>
                  <div className=''>{showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}</div>
                  <Link href="/login">{item.BackToLogin}</Link>
                </form>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}

export default Otp