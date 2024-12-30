'use client';
import React, { useState, useEffect } from 'react';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { FRONTEND_AFFILIATE_ENDPOINT } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
// import 'bootstrap/dist/css/bootstrap.min.css';
import { useSnackbar } from 'notistack';

function Affiliate() {
    const initialFormData = {
        user_id: '',
        affiliate_name: '',
        user_name: '',
        insta_username: '',
        insta_followers: '',
        insta_profile_url: '',
        aadhar_card_image: null,
        pan_card_image: null,
        aadhar_card_number: '',
        pan_card_number: '',
        affiliate_start_date: '',
        affiliate_end_date: '',
        email: '',
        description: ''
    };
    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (submitSuccess) {
            const timer = setTimeout(() => {
                setSubmitSuccess(false);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [submitSuccess]);

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            // Handle file inputs
            setFormData(prevState => ({
                ...prevState,
                [name]: files[0]
            }));
        } else {
            // Handle regular inputs
            setFormData(prevState => ({
                ...prevState,
                [name]: value
            }));
        }

        // Clear any previous errors for this field
        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setSubmitting(true);
        let errors = {};
        if (!formData.user_name.trim()) {
            errors.user_name = 'Please enter your name';
        }
        if (!formData.description.trim()) {
            errors.description = 'Please enter your message';
        }
        if (Object.keys(errors).length > 0) {
            // If there are errors, set them and stop submitting
            setFormErrors(errors);
            setSubmitting(false);
        } else {
            try {

                // Make API call using ManageAPIsData function
                const response = await ManageAPIsData(FRONTEND_AFFILIATE_ENDPOINT, 'POST', formData);

                // Check if response is okay
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    setSubmitting(false);
                    enqueueSnackbar(response.error, { variant: 'error' });
                    return;
                }

                // Parse response data
                const responseData = await response.json();

                // If API responds with a message
                if (responseData.message) {
                    // Reset form after successful submission
                    enqueueSnackbar('Applied to Affiliate successfully!');
                    setFormData(initialFormData);
                    setSubmitSuccess(true);
                    setSubmitting(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                enqueueSnackbar(response.error, { variant: 'error' });
                setSubmitting(false);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="container" style={{ marginTop: '5%' }}>
                <div className="row">
                    <div className="col-md-8 offset-md-2 mt-5">
                        <h2 className="text-center">Apply for Affiliation</h2>
                    </div>
                    <div className="col-md-8 offset-md-2 mt-5">
                        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="user_name" className="form-label">User Name:</label>
                                    <input type="text" name="user_name" value={formData.user_name} onChange={handleChange} className={`form-control ${formErrors.user_name && 'is-invalid'}`} id="user_name" required />
                                    <div className="invalid-feedback">
                                        {formErrors.user_name}
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="insta_username" className="form-label">Instagram Username:</label>
                                    <input type="text" name="insta_username" value={formData.insta_username} onChange={handleChange} className={`form-control ${formErrors.insta_username && 'is-invalid'}`} id="insta_username" />
                                    <div className="invalid-feedback">
                                        {formErrors.insta_username}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="insta_followers" className="form-label">Instagram Followers:</label>
                                    <input type="number" name="insta_followers" value={formData.insta_followers} onChange={handleChange} className={`form-control ${formErrors.insta_followers && 'is-invalid'}`} id="insta_followers" />
                                    <div className="invalid-feedback">
                                        {formErrors.insta_followers}
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="insta_profile_url" className="form-label">Instagram Profile URL:</label>
                                    <input type="url" name="insta_profile_url" value={formData.insta_profile_url} onChange={handleChange} className={`form-control ${formErrors.insta_profile_url && 'is-invalid'}`} id="insta_profile_url" required />
                                    <div className="invalid-feedback">
                                        {formErrors.insta_profile_url}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="aadhar_card_number" className="form-label">Aadhar Card Number:</label>
                                    <input type="text" name="aadhar_card_number" value={formData.aadhar_card_number} onChange={handleChange} className={`form-control ${formErrors.aadhar_card_number && 'is-invalid'}`} id="aadhar_card_number" />
                                    <div className="invalid-feedback">
                                        {formErrors.aadhar_card_number}
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="pan_card_number" className="form-label">PAN Card Number:</label>
                                    <input type="text" name="pan_card_number" value={formData.pan_card_number} onChange={handleChange} className={`form-control ${formErrors.pan_card_number && 'is-invalid'}`} id="pan_card_number" />
                                    <div className="invalid-feedback">
                                        {formErrors.pan_card_number}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="aadhar_card_image" className="form-label">Aadhar Card Image:</label>
                                    <input type="file" name="aadhar_card_image" onChange={handleChange} className={`form-control ${formErrors.aadhar_card_image && 'is-invalid'}`} id="aadhar_card_image" />
                                    <div className="invalid-feedback">
                                        {formErrors.aadhar_card_image}
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="pan_card_image" className="form-label">PAN Card Image:</label>
                                    <input type="file" name="pan_card_image" onChange={handleChange} className={`form-control ${formErrors.pan_card_image && 'is-invalid'}`} id="pan_card_image" />
                                    <div className="invalid-feedback">
                                        {formErrors.pan_card_image}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="affiliate_start_date" className="form-label">Affiliate Start Date:</label>
                                    <input type="date" name="affiliate_start_date" value={formData.affiliate_start_date} onChange={handleChange} className={`form-control ${formErrors.affiliate_start_date && 'is-invalid'}`} id="affiliate_start_date" />
                                    <div className="invalid-feedback">
                                        {formErrors.affiliate_start_date}
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label htmlFor="affiliate_end_date" className="form-label">Affiliate End Date:</label>
                                    <input type="date" name="affiliate_end_date" value={formData.affiliate_end_date} onChange={handleChange} className={`form-control ${formErrors.affiliate_end_date && 'is-invalid'}`} id="affiliate_end_date" />
                                    <div className="invalid-feedback">
                                        {formErrors.affiliate_end_date}
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-md-12 mb-3">
                                    <label htmlFor="email" className="form-label">Email:</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} className={`form-control ${formErrors.email && 'is-invalid'}`} id="email" required />
                                    <div className="invalid-feedback">
                                        {formErrors.email}
                                    </div>
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="description" className="form-label">Message:</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} className={`form-control ${formErrors.description && 'is-invalid'}`} id="description" required />
                                <div className="invalid-feedback">
                                    {formErrors.description}
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </form>
                        {submitSuccess && <p className="text-success mt-3">Form successfully submitted</p>}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Affiliate;
