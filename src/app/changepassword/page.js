'use client';
import React, { useState, useEffect } from 'react';
import ProfileListView from 'src/component/ProfileListView';
import data from "../../jsondata/profile.json";
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import "../../../public/css/style.css";
import "../../../public/css/responsive.css";
import { FRONTEND_CHANGEPASSWORD } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { getDecodedToken, getOnlyToken, signOutFn } from "../../utils/frontendCommonFunction";
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'src/routes/hooks'

function ChangePassword() {

    const user_token_data = getOnlyToken();
    const router = useRouter();
    const [decodedToken, setDecodedToken] = useState(null);

  useEffect(() => {
    const decodedlogtkn = getDecodedToken();
    if (!decodedlogtkn || !decodedlogtkn.data || !decodedlogtkn.data.id) {
      enqueueSnackbar("Something Wrong! Please login to continue access", { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedlogtkn);
   }, []);

   const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;

    const initialFormData = {
        current_password: '',
        new_password: '',
        confirm_password: '',
    };

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
        if (isUserLoggedIn) {
            setFormData(prevData => ({
                ...prevData,
                user_id: isUserLoggedIn
            }));
        }
    }, [isUserLoggedIn]);

    const [formErrors, setFormErrors] = useState({});

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

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

        if (!formData.current_password.trim()) {
            errors.current_password = 'Please enter your current password';
        }
        if (!formData.new_password.trim()) {
            errors.new_password = 'Please enter your new paaword';
        }
        if (!formData.confirm_password.trim()) {
            errors.confirm_password = 'Please enter your confirm password';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setSubmitting(false);
        } else {
            try {

                let response = await ManageAPIsData(`${FRONTEND_CHANGEPASSWORD}?id=${isUserLoggedIn}`, 'PUT', formData, user_token_data);

                if (!response.ok) {
                    const responseData1 = await response.json();
                    setErrorMessage(responseData1.error);
                    setShowError(true);
                    setSubmitting(false);
                    setTimeout(() => {
                        setShowError(false);
                    }, 3000);
                    console.error("Error fetching data:", response.statusText);
                    return;
                }
                const responseData = await response.json();
                if (responseData.message) {
                    setFormData(initialFormData);
                    setSubmitting(false);
                    enqueueSnackbar('Password successfully Updated. Please Login to Continue', { variant: 'success' });
                    signOutFn();
                    router.push('/');
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setSubmitting(false);
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
                                                Change Password
                                            </h3>
                                            <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                                <div className='underline underline-title'>

                                                    <div className="mb-3">
                                                        <label htmlFor="current_password" className="form-label">Current Password:</label>
                                                        <input placeholder='Enter ...' type="password" name="current_password" value={formData.current_password} onChange={handleChange} className={`form-control ${formErrors.current_password && 'is-invalid'}`} id="current_password" required />
                                                        <div className="invalid-feedback">
                                                            {formErrors.current_password}
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="new_password" className="form-label">New Password:</label>
                                                        <input placeholder='Enter ...' type="password" name="new_password" value={formData.new_password} onChange={handleChange} className={`form-control ${formErrors.new_password && 'is-invalid'}`} id="new_password" required />
                                                        <div className="invalid-feedback">
                                                            {formErrors.new_password}
                                                        </div>
                                                    </div>
                                                    <div className="mb-3">
                                                        <label htmlFor="confirm_password" className="form-label">Confirm Password:</label>
                                                        <input placeholder='Enter ...' type="password" name="confirm_password" value={formData.confirm_password} onChange={handleChange} className={`form-control ${formErrors.confirm_password && 'is-invalid'}`} id="confirm_password" required />
                                                        <div className="invalid-feedback">
                                                            {formErrors.confirm_password}
                                                        </div>
                                                    </div>

                                                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Updating...' : 'Update'}</button>
                                                    {showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}
                                                </div>
                                            </form>
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

export default ChangePassword;
