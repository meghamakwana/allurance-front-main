'use client';
import React, { useState, useEffect, useContext } from 'react';
import ProfileListView from 'src/component/ProfileListView';
import data from "../../jsondata/profile.json";
import Link from 'next/link';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import "../../../public/css/style.css";
import "../../../public/css/responsive.css";
import { FRONTEND_USERS, FRONTEND_DEACTIVATEUSER, FRONTEND_PROFILE } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData, fetchFormatDate } from '../../utils/commonFunction';
import { getDecodedToken, getOnlyToken, signOutFn } from "../../utils/frontendCommonFunction";
import { useRouter } from 'next/navigation';
import { enqueueSnackbar } from 'notistack';
import { UserContext } from '../../context/UserContext';

function Profile() {
  const { user, updateUser } = useContext(UserContext);
  const router = useRouter();
  const user_token_data = getOnlyToken();

  const initialFormData = {
    // user_id: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    anniversary: '',
    date_of_birth: '',
  };

  const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const decodedlogtkn = getDecodedToken();
    if (!decodedlogtkn || !decodedlogtkn.data || !decodedlogtkn.data[0].id) {
      enqueueSnackbar("Something Wrong! Please login to continue access", { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedlogtkn);
  }, []);

  const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data[0].id;

  const [formData, setFormData] = useState(initialFormData);

  // useEffect(() => {
  //   if (isUserLoggedIn) {
  //     setFormData(prevData => ({
  //       ...prevData,
  //       user_id: isUserLoggedIn
  //     }));
  //   }
  // }, [isUserLoggedIn]);

  const [formErrors, setFormErrors] = useState({});

  // Fetch Profile Data
  const getMyProfileData = async () => {
    try {
      const response = await ManageAPIsData(`${FRONTEND_USERS}?id=${isUserLoggedIn}`, 'GET', '', user_token_data);
      console.log(response);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      updateUser(responseData.data);
      if (responseData) {
        const formattedAnniversary = responseData.data.anniversary ? fetchFormatDate(responseData.data.anniversary) : null;
        const formattedDateOfBirth = responseData.data.date_of_birth ? fetchFormatDate(responseData.data.date_of_birth) : null;
        setFormData({
          // user_id: '',
          first_name: responseData.data.first_name,
          last_name: responseData.data.last_name,
          phone: responseData.data.phone,
          email: responseData.data.email,
          gender: responseData.data.gender,
          anniversary: formattedAnniversary,
          date_of_birth: formattedDateOfBirth,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (isUserLoggedIn && user_token_data) {
      getMyProfileData();
    }
  }, [isUserLoggedIn, user_token_data]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "radio") {
      // Handling radio input for gender
      newValue = value === "male" ? 1 : 2;
      setFormData(prevState => ({
        ...prevState,
        gender: newValue
      }));
    } else if (name === 'phone') {
      // Handling numeric input for phone number with a max length of 10 digits
      const numericValue = value.replace(/[^0-9]/g, '');
      newValue = numericValue.length <= 10 ? numericValue : numericValue.slice(0, 10);
      setFormData(prevState => ({
        ...prevState,
        [name]: newValue
      }));
    } else {
      // Handling other input types
      newValue = type === "checkbox" ? checked : value;
      setFormData(prevState => ({
        ...prevState,
        [name]: newValue
      }));
    }

    // Clear any previous error messages related to this field
    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };


  const handleChange1 = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "radio") {
      setFormData(prevState => ({
        ...prevState,
        gender: value === "male" ? 1 : 2
      }));
    } else {
      setFormData(prevState => ({
        ...prevState,
        [name]: value
      }));
    }

    setFormErrors(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData.first_name) {
      errors.first_name = 'Please enter first name';
    }
    if (!formData.last_name) {
      errors.last_name = 'Please enter last name';
    }
    if (!formData.phone) {
      errors.phone = 'Please enter phone';
    }

    if (!formData.email.trim()) {
      errors.email = 'Please enter email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(`${FRONTEND_PROFILE}?id=${isUserLoggedIn}`, 'PUT', formData, user_token_data);
        console.log(response)
        if (!response.ok) {
          const responseData1 = await response.json();
          setErrorMessage(responseData1.error);
          setShowError(true);
          setSubmitting(false);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          updateUser(responseData.data[0]);
          enqueueSnackbar(responseData.message, { variant: 'success' });
          setSubmitting(false);
          getMyProfileData();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  // Deactive Account
  const handleDeactiveAccount = async () => {
    if (window.confirm("Are you sure you want to deactivate your account? Once you deactivate it, you won't be able to log in or access the account.")) {
      try {
        const response = await ManageAPIsData(`${FRONTEND_DEACTIVATEUSER}?id=${isUserLoggedIn}`, 'DELETE', '', user_token_data);
        if (!response.ok) {
          console.error("Error deleting address:", response.statusText);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          enqueueSnackbar(responseData.message, { variant: 'success' });
          signOutFn();
          router.push('/login');
        }
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };


  return (
    <>
      <div id="home">
        <Header />
        <div id="myProfile">
          <div className="container">
            <div className="row">
              <ProfileListView />
              {data?.Profile?.map((item, index) => (
                <div className="col-lg-9 col-md-12" key={index}>
                  <div className="profile-info-column">
                    <div className="profile-information">
                      <h3 className="underline underline-title">
                        {item.PersonalInformation}
                      </h3>
                      <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                        <div className="personal-information">
                          <div className="gender-selection">
                            <div className="avatar">
                              <img
                                src={formData.gender === 1 ? "/img/men-avatar.png" : formData.gender === 2 ? "/img/women-avatar.png" : '/img/noimg.png'}
                                alt="Avatar"
                              />
                            </div>
                            <div className="gender">
                              <div className="male-radio-btn">
                                <input
                                  type="radio"
                                  id="male"
                                  name="gender"
                                  value="male"
                                  checked={formData.gender === 1}
                                  onChange={handleChange}
                                />
                                <label htmlFor="male">{item.MaleText}</label>
                              </div>
                              <div className="female-radio-btn">
                                <input
                                  type="radio"
                                  id="female"
                                  name="gender"
                                  value="female"
                                  checked={formData.gender === 2}
                                  onChange={handleChange}
                                />
                                <label htmlFor="female">{item.FemaleText}</label>
                              </div>
                            </div>
                          </div>
                          <div className="date-section">
                            <div className="firstLastname">
                              <div className="login-form-group">
                                <div className="input-group">
                                  <div className="input-group-prepend"></div>
                                  <input
                                    type="text"
                                    name="first_name"
                                    placeholder="First Name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={`form-control ${formErrors.first_name && 'is-invalid'}`}
                                    id="first_name"
                                    required
                                  />
                                  <div className="invalid-feedback">
                                    {formErrors.first_name}
                                  </div>
                                </div>
                              </div>
                              <div className="login-form-group">
                                <div className="input-group">
                                  <div className="input-group-prepend"></div>
                                  <input
                                    type="text"
                                    name="last_name"
                                    placeholder="Last Name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={`form-control ${formErrors.last_name && 'is-invalid'}`}
                                    id="last_name"
                                    required
                                  />
                                  <div className="invalid-feedback">
                                    {formErrors.last_name}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="dates">
                              <div className="dob">
                                <div className="login-form-group">
                                  <div className="input-group">
                                    <div>Anniversary Date:</div>
                                    <div className="input-group-prepend"></div>
                                    <div>
                                      <input
                                        type="date"
                                        className="form-control"
                                        id="inputDob"
                                        name="date_of_birth"
                                        value={formData.date_of_birth}
                                        onChange={handleChange}
                                        placeholder="Date of Birth"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="anniversary">
                                <div className="login-form-group">
                                  <div className="input-group">
                                    <div className="input-group-prepend"></div>
                                    <div>Birth Date:</div>
                                    <div>
                                      <input
                                        type="date"
                                        className="form-control"
                                        id="inputAnniversary"
                                        name="anniversary"
                                        value={formData.anniversary}
                                        onChange={handleChange}
                                        placeholder="Anniversary Date"
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="contact-info-section">
                          <h3>{item.ContactDetailsText}</h3>
                          <div className="contact-info">
                            <div className="mobile-number">
                              <div className="login-form-group">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`form-control ${formErrors.phone && 'is-invalid'}`}
                                    id="phone"
                                    maxLength={10}
                                    required
                                  />
                                  <div className="invalid-feedback">
                                    {formErrors.phone}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="email">
                              <div className="login-form-group">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`form-control ${formErrors.email && 'is-invalid'}`}
                                    id="email"
                                    required
                                  />
                                  <div className="invalid-feedback">
                                    {formErrors.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="profile-footer-btns">
                          <h6>
                            <Link className="dropdown-item-dlt" href="#" onClick={() => handleDeactiveAccount()}>
                              {item.DeactivateAccountText}
                            </Link>
                          </h6>
                          <div className="footer-btns">
                            <button type="submit" className="save-btn" disabled={submitting}>{submitting ? 'Updating...' : 'Update'}</button>
                          </div>
                        </div>
                      </form>
                      {showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;
