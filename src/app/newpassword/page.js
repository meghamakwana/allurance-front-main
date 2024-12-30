'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import data from "../../jsondata/NewPassword.json";
import Link from 'next/link';
import "../../../public/css/style.css";
import "../../../public/css/responsive.css";
import { FRONTEND_NEWPASSWORD } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';

function NewPassword() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const initialFormData = {
    paramsID: '',
    email: '',
    new_password: '',
    confirm_password: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
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

    if (!formData.new_password.trim()) {
      errors.new_password = 'Please enter new password';
    } else if (formData.new_password.length < 8) {
      errors.new_password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirm_password.trim()) {
      errors.confirm_password = 'Please enter confirm password';
    } else if (formData.confirm_password.length < 8) {
      errors.confirm_password = 'Password must be at least 8 characters long';
    }

    if (formData.new_password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {

        const encodedEmail1 = sessionStorage.getItem('params1');
        const decodedEmail1 = encodedEmail1 ? atob(encodedEmail1) : '';
        const encodedParams2 = sessionStorage.getItem('params2');
        const decodedParams2 = encodedParams2 ? atob(encodedParams2) : '';
        const updatedFormData = {
          ...formData,
          email: decodedEmail1,
          paramsID: decodedParams2,
        };

        const response = await ManageAPIsData(FRONTEND_NEWPASSWORD, 'POST', updatedFormData);
        if (!response.ok) {
          const responseData1 = await response.json();
          setErrorMessage(responseData1.error);
          setShowError(true);
          setSubmitting(false);
          setFormData(prevState => ({ ...prevState, new_password: '', confirm_password: '' }));
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
          sessionStorage.removeItem('params2');
          sessionStorage.removeItem('params1');
          router.push(`/login`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  return (
    <>
      {data?.NewPassword?.map((item, index) => {
        return (
          <div key={index} id="newloginPage">
            <div className="row">
              <div className="col-md-8 responsive-display-none">
                <img src={item.LoginImg} alt="" />
              </div>
              <div className="col-md-4 col-sm-12 col-xs-12">
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                  <h1>{item.NewPassword}</h1>
                  <p>{item.Title}</p>
                  <div className="form-group">
                    <div className="input-group">
                      <div className="input-group-prepend">
                        <span className="input-group-text">
                          <i className="fas fa-lock" />
                        </span>
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="new_password"
                        placeholder='Enter New Password'
                        value={formData.new_password}
                        onChange={handleChange}
                        className={`form-control ${formErrors.new_password && 'is-invalid'}`}
                        id="new_password"
                        required
                      />
                      <div className="invalid-feedback">
                        {formErrors.new_password}
                      </div>
                      <div className="input-group-append">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          id="togglePassword"
                          onClick={togglePasswordVisibility}
                        >
                          <i className={showPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} id="togglePasswordIcon" />
                        </button>
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
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirm_password"
                        placeholder='Enter Confirm Password'
                        value={formData.confirm_password}
                        onChange={handleChange}
                        className={`form-control ${formErrors.confirm_password && 'is-invalid'}`}
                        id="confirm_password"
                        required
                      />
                      <div className="invalid-feedback">
                        {formErrors.confirm_password}
                      </div>
                      <div className="input-group-append">
                        <button
                          className="btn btn-outline-secondary"
                          type="button"
                          id="togglePassword"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          <i className={showConfirmPassword ? 'fa fa-eye-slash' : 'fa fa-eye'} id="togglePasswordIcon" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <button type="submit" className="btn newpassword-submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit'}
                  </button>
                  <Link href="/login">{item.ReturnToSignIn} &gt;</Link>
                  <div className=''>
                    {submitSuccess && <p className="text-success mt-3">Password Successfully Updated</p>}
                  </div>
                  <div className=''>
                    {showError && (
                      <p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export default NewPassword;
