'use client';
import React, { useState, useEffect } from 'react';
import data from "../../jsondata/Register.json"
import Link from 'next/link'
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { FRONTEND_USERS } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hooks'
import { useSearchParams } from 'next/navigation';

function Register() {

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const searchParams = useSearchParams();
  const referralCode = searchParams.get('referral');

  useEffect(() => {
    if (referralCode) {
      setFormData(prevState => ({
        ...prevState,
        referral_code: referralCode
      }));
    }
  }, [referralCode]);


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const initialFormData = {
    role_id: 9,
    first_name: '',
    last_name: '',
    email: '',
    password: '',
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

    if (!formData.first_name.trim()) {
      errors.first_name = 'Please enter your first name';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Please enter your last name';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password.trim()) {
      errors.password = 'Please enter password';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_USERS, 'POST', formData);
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
        console.error("Error fetching data:", error);
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
                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
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
                        <input type="text" name="first_name" placeholder='Enter First Name' value={formData.first_name} onChange={handleChange} className={`form-control ${formErrors.first_name && 'is-invalid'}`} id="first_name" required />
                        <div className="invalid-feedback">
                          {formErrors.first_name}
                        </div>
                      </div>
                    </div>
                    <div className="login-form-group">
                      <div className="input-group">
                        <div className="input-group-prepend">
                          <span className="input-group-text">
                            <i className="fas fa-user" />
                          </span>
                        </div>
                        <input type="text" name="last_name" placeholder='Enter Last Name' value={formData.last_name} onChange={handleChange} className={`form-control ${formErrors.last_name && 'is-invalid'}`} id="last_name" required />
                        <div className="invalid-feedback">
                          {formErrors.last_name}
                        </div>
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
                      <input type="email" name="email" placeholder='Enter Email' value={formData.email} onChange={handleChange} className={`form-control ${formErrors.email && 'is-invalid'}`} id="email" required />
                      <div className="invalid-feedback">
                        {formErrors.email}
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
                      <input type={showPassword ? 'text' : 'password'} name="password" placeholder='Enter Password' value={formData.password} onChange={handleChange} className={`form-control ${formErrors.password && 'is-invalid'}`} id="password" required />
                      <div className="invalid-feedback">
                        {formErrors.password}
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
                          <i className="fas fa-gift" />
                        </span>
                      </div>
                      <input type="text" name="referral_code" placeholder='Enter Referral Code (Optional)' value={formData.referral_code} onChange={handleChange} className={`form-control`} id="referral_code" />
                    </div>
                  </div>
                  <button type="submit" className="btn login-page-submit-btn" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                  <Link className="login-registration" href="/login">
                    {item.Login}
                  </Link>
                </form>
                {/* <div className=''>{submitSuccess && <p className="text-success mt-3">Registration Successfully Completed</p>}</div> */}
                <div className=''>{showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}</div>
              </div>
            </div>
          </div>
        )
      })}

    </>
  )
}

export default Register