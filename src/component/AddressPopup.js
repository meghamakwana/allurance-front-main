'use client';
import React, { useState, useEffect, useCallback } from 'react';
import '../../public/css/style.css';
import '../../public/css/responsive.css';
import { getDecodedToken, getAddressData, getStateData, getDistrictData, getPincodeData, getOnlyToken } from '../utils/frontendCommonFunction';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { FRONTEND_MYADDRESS } from 'src/utils/frontendAPIEndPoints';
import { enqueueSnackbar } from 'notistack';

function AddressPopup() {

    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);

    const [stateData, setStateData] = useState([]);
    const [districtData, setDistrictData] = useState([]);
    const [pincodeData, setPincodeData] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedType, setSelectedType] = useState(1);
    const user_token_data = getOnlyToken();

    const decodedlogtkn = getDecodedToken();
    const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

    // Fetch Address
    const fetchData = useCallback(async () => {
        try {
            const responseData = await getAddressData(UserLoggedInID);
            if (responseData.data && responseData.data.length) {
                setUserAddresses(responseData.data);
                const defaultAddress = responseData.data.find(address => address.is_default === 1);
                setSelectedAddress(defaultAddress);
            }

            // State Data
            const data1 = await getStateData();
            if (data1.data.length) {
                setStateData(data1.data);
            }

            // Initially set empty district data
            setDistrictData([]);
            setPincodeData([]);

        } catch (error) {
            console.error("Error fetching user info:", error);
        }

    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData, UserLoggedInID]);

    /* Add New Address Start */

    const handleChangeRadio = (event) => {
        const newType = parseInt(event.target.value);
        setSelectedType(newType);

        setFormData((prevData) => ({
            ...prevData,
            a_type: newType,
        }));
    };

    const initialFormData = {
        a_type: 1,
        user_id: UserLoggedInID,
        name: '',
        email: '',
        phone: '',
        address_1: '',
        landmark: '',
        country: 'India',
        state: '',
        district: '',
        pincode: '',
        is_default: 1
    };

    const [formData, setFormData] = useState(initialFormData);

    const [formErrors, setFormErrors] = useState(initialFormData);
    const [submitting, setSubmitting] = useState(false);

    const handleChange = async (e) => {
        const { name, value, checked, type } = e.target;

        let newValue = value;

        if (type === 'checkbox') {
            newValue = checked ? 1 : 0;
        } else if (name === 'phone') {
            const numericValue = value.replace(/[^0-9]/g, '');
            newValue = numericValue.length <= 10 ? numericValue : numericValue.slice(0, 10);
        }

        try {
            if (name === 'state') {
                // Fetch district data based on selected state
                const response = await getDistrictData({ 'StateName': value });
                if (response.data.length) {
                    setDistrictData(response.data);
                    setPincodeData([]);
                } else {
                    setDistrictData([]);
                    setPincodeData([]);
                }
            } else if (name === 'district') {
                // Fetch pincode data based on selected district
                const response = await getPincodeData({ 'District': value });
                if (response.data.length) {
                    setPincodeData(response.data);
                } else {
                    setPincodeData([]);
                }
            }
        } catch (error) {
            console.error(`Error fetching ${name} data:`, error);
            if (name === 'state') {
                setDistrictData([]);
                setPincodeData([]);
            } else if (name === 'district') {
                setPincodeData([]);
            }
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: newValue,
        }));

        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: ''
        }));
    };

    const closeModalButton = async () => {
        setFormData(initialFormData);
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
        if (!formData.address_1.trim()) {
            errors.address_1 = 'Please enter your address';
        }
        if (!formData.landmark.trim()) {
            errors.landmark = 'Please enter your landmark';
        }
        if (!formData.state.trim()) {
            errors.state = 'Please enter your state';
        }
        if (!formData.district.trim()) {
            errors.district = 'Please enter your district';
        }
        if (!formData.pincode) {
            errors.pincode = 'Please enter your pincode';
        }

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            setSubmitting(false);
        } else {
            try {
                let response = await ManageAPIsData(FRONTEND_MYADDRESS, 'POST', formData, user_token_data);
                if (!response.ok) {
                    console.error("Error fetching data:", response.statusText);
                    setSubmitting(false);
                    return;
                }
                const responseData = await response.json();
                if (responseData.message) {
                    localStorage.setItem('selectedAddress', JSON.stringify(responseData.data[0]));
                    await fetchData();
                    setSelectedAddress(responseData.data[0]);

                    setFormData(initialFormData);

                    setDistrictData([]);
                    setPincodeData([]);

                    enqueueSnackbar(responseData.message, { variant: 'success' });
                    document.getElementById('closeModalButton').click();
                    setSubmitting(false);
                    setTimeout(() => {
                        setIsEditing(false);
                    }, 100);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
                setSubmitting(false);
            }
        }
    };

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    useEffect(() => {
        if (isClient) {
            const closeModal = () => {
                const modalElement = document.getElementById('addAddressModal');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.hide();
                }
            };
            document.getElementById('closeModalButton')?.addEventListener('click', closeModal);
            return () => {
                document.getElementById('closeModalButton')?.removeEventListener('click', closeModal);
            };
        }
    }, [isClient]);

    /* Add New Address End */

    return (
        <>
            <div>
                <div
                    className="modal fade"
                    id="addAddressModal"
                    tabIndex={-1}
                    aria-labelledby="addAddressModalLabel"
                    aria-hidden="true"
                    data-bs-backdrop="static"
                    data-bs-keyboard="false"

                >
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5
                                    className="modal-title"
                                    id="addAddressModalLabel"
                                >
                                    {isEditing ? 'Edit Address' : 'Add New Address'}
                                </h5>
                                <button
                                    onClick={() => closeModalButton()}
                                    id="closeModalButton"
                                    type="button"
                                    className="btn-close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                />
                            </div>
                            <div className="modal-body">
                                <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                                    <div className="mb-3">
                                        <div className="address-popup-radio-btns">
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="a_type"
                                                    id="home"
                                                    value="1"
                                                    checked={selectedType === 1}
                                                    onChange={handleChangeRadio}
                                                />
                                                <label className="form-check-label" htmlFor="home">
                                                    Home
                                                </label>
                                            </div>
                                            <div className="form-check form-check-inline">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    name="a_type"
                                                    id="work"
                                                    value="2"
                                                    checked={selectedType === 2}
                                                    onChange={handleChangeRadio}
                                                />
                                                <label className="form-check-label" htmlFor="work">
                                                    Work
                                                </label>
                                            </div>
                                        </div>
                                    </div>
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
                                        <input type="number" maxLength="10" name="phone" value={formData.phone} onChange={handleChange} className={`form-control ${formErrors.phone && 'is-invalid'}`} id="phone1" required />
                                        <div className="invalid-feedback">
                                            {formErrors.phone}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="address_1" className="form-label">Address:</label>
                                        <textarea name="address_1" value={formData.address_1} onChange={handleChange} className={`form-control ${formErrors.address_1 && 'is-invalid'}`} id="address_1" required />
                                        <div className="invalid-feedback">
                                            {formErrors.address_1}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="landmark" className="form-label">Landmark:</label>
                                        <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className={`form-control ${formErrors.landmark && 'is-invalid'}`} id="landmark" required />
                                        <div className="invalid-feedback">
                                            {formErrors.landmark}
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label htmlFor="state" className="form-label">State:</label>
                                        <select
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            className={`form-control ${formErrors.state && 'is-invalid'}`}
                                            id="state"
                                        >
                                            <option value="">Select State</option>
                                            {stateData && stateData.length > 0 ? (
                                                stateData.map((cdata) => (
                                                    <option key={cdata.id} value={cdata.id}>
                                                        {cdata.StateName}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No states available</option>
                                            )}
                                        </select>
                                        <div className="invalid-feedback">
                                            {formErrors.state}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="district" className="form-label">District:</label>
                                        <select
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            className={`form-control ${formErrors.district && 'is-invalid'}`}
                                            id="district"
                                        >
                                            <option value="">Select District</option>
                                            {districtData && districtData.length > 0 ? (
                                                districtData.map((ddata) => (
                                                    <option key={ddata.id} value={ddata.District}>
                                                        {ddata.District}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No districts available</option>
                                            )}
                                        </select>
                                        <div className="invalid-feedback">
                                            {formErrors.district}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="pincode" className="form-label">Pincode:</label>
                                        <select
                                            name="pincode"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className={`form-control ${formErrors.pincode && 'is-invalid'}`}
                                            id="pincode"
                                        >
                                            <option value="">Select Pincode</option>
                                            {pincodeData && pincodeData.length > 0 ? (
                                                pincodeData.map((ddata) => (
                                                    <option key={ddata.id} value={ddata.Pincode}>
                                                        {ddata.Pincode}
                                                    </option>
                                                ))
                                            ) : (
                                                <option value="" disabled>No pincode available</option>
                                            )}
                                        </select>
                                        <div className="invalid-feedback">
                                            {formErrors.pincode}
                                        </div>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddressPopup;
