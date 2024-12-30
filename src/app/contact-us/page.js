'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { FRONTEND_CONTACT_INQUIRY, FRONTEND_CONTACTUS } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import Link from 'next/link'
import { getSocialData, getContactData } from "../../utils/frontendCommonFunction";
import { enqueueSnackbar } from 'notistack';

function ContactUs() {

  const initialFormData = {
    name: '',
    email: '',
    phone: '',
    description: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      newValue = numericValue.length <= 10 ? numericValue : numericValue.slice(0, 10);
    }

    setFormData(prevState => ({
      ...prevState,
      [name]: newValue
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

    if (!formData.name.trim()) {
      errors.name = 'Please enter your name';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please enter your email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter your phone number';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.description.trim()) {
      errors.description = 'Please enter your message';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_CONTACT_INQUIRY, 'POST', formData);
        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          setSubmitting(false);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          enqueueSnackbar("Thank you for your enquiry. It has been successfully submitted. Our representative will connect with you shortly.", { variant: 'success' });
          setFormData(initialFormData);
          setSubmitting(false);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  const getInitialFormData = {
    getaddress: '',
    getemail: '',
    getcontact1: '',
    getcontact2: '',
    getcin: '',
  };

  const [socialData, setSocialData] = useState([]);
  const [fetchFormData, getFetchFormData] = useState(getInitialFormData);

  const fetchData = useCallback(async () => {
    try {
      const data1 = await getSocialData();
      setSocialData(data1);

      const data2 = await getContactData();
      getFetchFormData({
        getaddress: data2.address,
        getemail: data2.email,
        getcontact1: data2.contact1,
        getcontact2: data2.contact2,
        getcin: data2.cin,
      });

    } catch (error) {
      console.error("Error fetching user info:", error);
    }

  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <Header />
      <div className="container">
        <div className="row" style={{ marginTop: '10%' }}>
          <div className="col-md-6">
            <h1>Get In Touch</h1>
            <div><i className='fa fa-envelope'></i> Email: <Link href={`mailto:${fetchFormData?.getemail}`}>{fetchFormData?.getemail}</Link></div>
            {fetchFormData?.getcontact1 && (<div><i className='fa fa-phone'></i>  Contact1: <Link href={`tel:${fetchFormData?.getcontact1}`}>{fetchFormData?.getcontact1}</Link></div>)}
            {fetchFormData?.getcontact2 && (<div><i className='fa fa-phone'></i>  Contact2: <Link href={`tel:${fetchFormData?.getcontact2}`}>{fetchFormData?.getcontact2}</Link></div>)}
            {fetchFormData?.getaddress && (<div><i className='fa fa-home'></i>Address1: {fetchFormData?.getaddress}</div>)}
            <div>
              <>
                <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
                  {socialData && socialData.length > 0 ? (
                    socialData.map((sdata) => {
                      if (sdata.social_link) {
                        return (
                          <span key={sdata.id}  >
                            <Link href={sdata.social_link} target="_blank" rel="noopener noreferrer">
                              <i className={`fa-brands fa-${sdata.title.toLowerCase()}`} />
                            </Link>
                          </span>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <div>No social links available</div>
                  )}
                </div>
              </>
            </div>
          </div>

          <div className="col-md-6">
            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Name:</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className={`form-control ${formErrors.name && 'is-invalid'}`} id="name" required />
                <div className="invalid-feedback">
                  {formErrors.name}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email:</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-control ${formErrors.email && 'is-invalid'}`} id="email" required />
                <div className="invalid-feedback">
                  {formErrors.email}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="phone1" className="form-label">Phone Number:</label>
                <input type="text" maxLength="10" name="phone" value={formData.phone} onChange={handleChange} className={`form-control ${formErrors.phone && 'is-invalid'}`} id="phone1" required />
                <div className="invalid-feedback">
                  {formErrors.phone}
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="message" className="form-label">Message:</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className={`form-control ${formErrors.description && 'is-invalid'}`} id="description" required />
                <div className="invalid-feedback">
                  {formErrors.description}
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ContactUs;
