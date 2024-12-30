'use client';
import React, { useState, useEffect } from 'react';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { FRONTEND_AUTHPORTAL } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';

function AuthPortal() {

    const initialFormData = {
        serial_number: '',
        model_number: '',
        batch_number: '',
    };

    const [formData, setFormData] = useState(initialFormData);
    const [formErrors, setFormErrors] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState('');

    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (submitSuccess) {
            const timer = setTimeout(() => {
                setSubmitSuccess(false);
                setResponseMessage('');
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

        if (!formData.serial_number.trim()) {
            errors.serial_number = 'Please enter valid serial number';
        }
        if (!formData.model_number.trim()) {
            errors.model_number = 'Please enter valid model number';
        }
        if (!formData.batch_number.trim()) {
            errors.batch_number = 'Please enter valid batch number';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setSubmitting(false);
        } else {
            try {
                const response = await ManageAPIsData(FRONTEND_AUTHPORTAL, 'POST', formData);
                if (!response.ok) {
                    const responseData1 = await response.json();
                    console.error("Error fetching data:", response.statusText);
                    setErrorMessage(responseData1.error);
                    setFormData(initialFormData);
                    setSubmitting(false);
                    setShowError(true);
                    setTimeout(() => {
                        setShowError(false);
                      }, 3000);
                    return;
                }
                const responseData = await response.json();
                if (responseData.message) {
                    setFormData(initialFormData);
                    setSubmitSuccess(true);
                    setResponseMessage(responseData.message);
                    setSubmitting(false);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setSubmitting(false);
            }
        }
    };

    return (
        <>
            <Header />
            <div className="container">
                <div className="row" style={{ marginTop: '10%' }}>
                    <div className="col-md-4">
                    </div>
                    <div className="col-md-4">
                        <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <div className="mb-3">
                                <label htmlFor="serial_number" className="form-label">serial number:</label>
                                <input type="text" name="serial_number" value={formData.serial_number} onChange={handleChange} className={`form-control ${formErrors.serial_number && 'is-invalid'}`} id="serial_number" required />
                                <div className="invalid-feedback">
                                    {formErrors.serial_number}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="model_number" className="form-label">model number:</label>
                                <input type="text" name="model_number" value={formData.model_number} onChange={handleChange} className={`form-control ${formErrors.model_number && 'is-invalid'}`} id="model_number" required />
                                <div className="invalid-feedback">
                                    {formErrors.model_number}
                                </div>
                            </div>
                            <div className="mb-3">
                                <label htmlFor="batch_number" className="form-label">batch number:</label>
                                <input type="text" name="batch_number" value={formData.batch_number} onChange={handleChange} className={`form-control ${formErrors.batch_number && 'is-invalid'}`} id="batch_number" required />
                                <div className="invalid-feedback">
                                    {formErrors.batch_number}
                                </div>
                            </div>
                            
                            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Checking...' : 'Submit'}</button>
                        </form>
                        <div className=''>{submitSuccess && <p className="text-success mt-3">{responseMessage}</p>}</div>
                        <div className=''>{showError && ( <p className="text-danger mt-3">{errorMessage}</p> )}</div>
                    </div>
                    <div className="col-md-4">
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default AuthPortal;
