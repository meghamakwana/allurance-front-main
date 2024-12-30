'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import '../../../public/css/style.css';
import '../../../public/css/responsive.css';
import { useCart } from 'src/utils/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'src/routes/hooks';
import { payment } from 'src/action/ServerActions';
import { getDecodedToken, formatCartCheckoutNo, deleteCheckoutData, getOnlyToken, getAddressData, getStateData, getDistrictData, getPincodeData, updateDefaultAddressData, placeorderData, generateDummyTxnId } from '../../utils/frontendCommonFunction';
import { enqueueSnackbar } from 'notistack';
import { FRONTEND_MYADDRESS } from 'src/utils/frontendAPIEndPoints';
import Link from 'next/link';
import { ManageAPIsData } from 'src/utils/commonFunction';
import Cookies from 'js-cookie';

function Checkout() {
  const router = useRouter();
  const { data: session } = useSession();
  const [modalShow, setModalShow] = useState(false);
  const [discountAmount, setDiscountAmount] = useState()
  const { cartProducts, selectedAddress, discountedAmount, FinalAmount, FinalTax, updateFinalTax, CGST, IGST, SGST, getRowID } = useCart();

  const decodedlogtkn = getDecodedToken();
  const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

  useEffect(() => {
    const discount = Cookies.get('discount');
    setDiscountAmount(discount);
  }, []);

  // Remove Checkout Data If Cart Is Empty 
  useEffect(() => {
    const checkCart = async () => {
      if (cartProducts && cartProducts.length === 0) {
        try {
          await deleteCheckoutData(getRowID);
          enqueueSnackbar(`Sorry, Your cart is empty you can't move ahead`, { variant: 'error' });
          router.push('/');
        } catch (error) {
          console.error('Error deleting checkout data:', error);
          enqueueSnackbar('An error occurred while processing your request.', { variant: 'error' });
        }
      }
    };
    setTimeout(() => {
      checkCart();
    }, 3000);
  }, [cartProducts, getRowID]);

  const initialFormData = {
    a_type: 1,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    addressId: '',
    address_1: '',
    landmark: '',
    district: '',
    state: '',
    pincode: '',
    notes: '',
    is_default: 1
  };
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState(initialFormData);


  useEffect(() => {
    if (selectedAddress && typeof selectedAddress === 'object' && !Array.isArray(selectedAddress)) {
      setFormData({
        ...formData,
        first_name: selectedAddress.first_name || '',
        last_name: selectedAddress.last_name || '',
        email: selectedAddress.email || '',
        phone: selectedAddress.phone || '',
        addressId: selectedAddress.id || '',
        address_1: selectedAddress.address_1 || '',
        landmark: selectedAddress.landmark || '',
        district: selectedAddress.district || '',
        state: selectedAddress.state || '',
        pincode: selectedAddress.pincode || '',
        a_type: selectedAddress.a_type
      });
      setSelectedType(selectedAddress.a_type);

    }
  }, [selectedAddress]);

  const handleInputChange = async (e) => {
    const { name, value, checked, type } = e.target;
    let newValue = value;

    if (type === 'checkbox') {
      newValue = checked ? 1 : 0;
    } else if (name === 'phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      newValue = numericValue.length <= 10 ? numericValue : numericValue.slice(0, 10);
    } else if (name === 'pincode') {
      const numericValue = value.replace(/[^0-9]/g, '');
      newValue = numericValue.length <= 6 ? numericValue : numericValue.slice(0, 6);
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

  // Place Orders
  const makePayment = async (e) => {
    e.preventDefault();

    let errors = {};

    if (!formData.first_name.trim()) {
      errors.first_name = 'Please enter First name';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Please enter Last name';
    }
    if (!formData.email.trim()) {
      errors.email = 'Please enter email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Please enter phone number';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!UserLoggedInID) {
      if (!formData.password || !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{9,}$/.test(formData.password)) {
        errors.password = 'Password must be at least 9 characters long and contain at least one uppercase letter, one lowercase letter, and one special character';
      }
    }
    if (!formData.address_1.trim()) {
      errors.address_1 = 'Please enter address';
    }
    if (!formData.landmark.trim()) {
      errors.landmark = 'Please enter landmark';
    }
    if (!formData.state.trim()) {
      errors.state = 'Please enter state';
    }
    if (!formData.district.trim()) {
      errors.district = 'Please enter district';
    }
    if (!formData.pincode) {
      errors.pincode = 'Please enter pincode';
    }
    const affiliate_id = Cookies.get('affiliate') || ''

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
    } else {
      const orderDetails = {
        cartproducts: cartProducts,
        user_id: UserLoggedInID,
        user_prefix_id: decodedlogtkn.data ? decodedlogtkn.data.prefix_id : '',
        addressId: formData.addressId,
        discountedAmount: discountedAmount < 599 ? discountedAmount : FinalAmount,
        finalamount: discountedAmount < 599 ? FinalAmount : discountedAmount,
        tax: FinalTax,
        channel_mode: 1,
        name: `${formData.first_name} ${formData.last_name}`,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || '',
        address: formData.address_1,
        landmark: formData.landmark,
        country: 'India',
        district: formData.district,
        state: formData.state,
        pincode: formData.pincode,
        notes: formData.notes,
        a_type: formData.a_type,
        mockid: parseInt(localStorage.getItem('Alluranceorder'), 10) || 0,
        affiliate: affiliate_id,
        delivery_charge: discountedAmount < 599 ? 49 : 0
      };

      const data1 = await placeorderData(orderDetails);
      if (data1.status) {
        enqueueSnackbar(data1.message, { variant: 'success' });
        setFormData(initialFormData);
        setFormData1(initialFormData1);
        // handleRemoveCookie();
        Cookies.remove('discount');
        Cookies.remove('coupon');
        if (data1.accessToken) {
          Cookies.set('logtk', data1.accessToken, { expires: 1 });
        }
        localStorage.removeItem('Alluranceorder');
        const transactionId = generateDummyTxnId();
        router.push(`/paymentstatus/success?txnid=${transactionId}`);
      } else {
        const errorMessage = data1?.error || 'Something Went Wrong';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      }


      // const FinalAmountInPaisa = Math.round(FinalAmount * 100);
      // const redirect = await payment(FinalAmountInPaisa, orderDetails);
      // router.push(redirect.url);
    }

  };

  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress1, setSelectedAddress] = useState(null);

  const [stateData, setStateData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [pincodeData, setPincodeData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState(1);
  const user_token_data = getOnlyToken();

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

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

  const handleAddNewAddress = async () => {
    setIsEditing(false);
    setDistrictData([]);
    setPincodeData([]);
  };

  const handleChangeRadio = (event) => {
    const newType = parseInt(event.target.value);
    setSelectedType(newType);

    setFormData((prevData) => ({
      ...prevData,
      a_type: newType,
    }));

    setFormData1((prevData) => ({
      ...prevData,
      new_a_type: newType,
    }));
  };

  const initialFormData1 = {
    new_a_type: 1,
    user_id: UserLoggedInID,
    new_first_name: '',
    new_last_name: '',
    new_email: '',
    new_phone: '',
    new_address_1: '',
    new_landmark: '',
    new_country: 'India',
    new_state: '',
    new_district: '',
    new_pincode: '',
    new_is_default: 1
  };

  const [formData1, setFormData1] = useState(initialFormData1);
  const [formErrors1, setFormErrors1] = useState(initialFormData1);

  const [submitting, setSubmitting] = useState(false);


  const handleRemoveCookie = () => {
    // Remove the 'affiliate_id' cookie
    Cookies.remove('affiliate');
    console.log('affiliate_id cookie removed');
  };

  const handleChange = async (e) => {
    const { name, value, checked, type } = e.target;
    let newValue = value;

    if (type === 'checkbox') {
      newValue = checked ? 1 : 0;
    } else if (name === 'new_phone') {
      const numericValue = value.replace(/[^0-9]/g, '');
      newValue = numericValue.length <= 10 ? numericValue : numericValue.slice(0, 10);
    }

    try {
      if (name === 'new_state') {
        // Fetch district data based on selected state
        const response = await getDistrictData({ 'StateName': value });
        if (response.data.length) {
          setDistrictData(response.data);
          setPincodeData([]);
        } else {
          setDistrictData([]);
          setPincodeData([]);
        }
      } else if (name === 'new_district') {
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
      if (name === 'new_state') {
        setDistrictData([]);
        setPincodeData([]);
      } else if (name === 'new_district') {
        setPincodeData([]);
      }
    }

    setFormData1(prevState => ({
      ...prevState,
      [name]: newValue,
    }));

    setFormErrors1(prevErrors => ({
      ...prevErrors,
      [name]: ''
    }));
  };

  const closeModalButton = async () => {
    setFormData1(initialFormData1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setShowError(false);

    let errors = {};

    if (!formData1.new_first_name.trim()) {
      errors.new_first_name = 'Please enter First name';
    }
    if (!formData1.new_last_name.trim()) {
      errors.new_last_name = 'Please enter Last name';
    }
    if (!formData1.new_email.trim()) {
      errors.new_email = 'Please enter email';
    } else if (!/^\S+@\S+\.\S+$/.test(formData1.new_email)) {
      errors.new_email = 'Please enter a valid email address';
    }
    if (!formData1.new_phone.trim()) {
      errors.new_phone = 'Please enter phone number';
    } else if (!/^\d{10}$/.test(formData1.new_phone)) {
      errors.new_phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData1.new_address_1.trim()) {
      errors.new_address_1 = 'Please enter address';
    }
    if (!formData1.new_landmark.trim()) {
      errors.new_landmark = 'Please enter landmark';
    }
    if (!formData1.new_state.trim()) {
      errors.new_state = 'Please enter state';
    }
    if (!formData1.new_district.trim()) {
      errors.new_district = 'Please enter district';
    }
    if (!formData1.new_pincode) {
      errors.new_pincode = 'Please enter pincode';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors1(errors);
      setSubmitting(false);
    } else {
      try {

        var payload = {
          a_type: 1,
          user_id: UserLoggedInID,
          first_name: formData1.new_first_name,
          last_name: formData1.new_last_name,
          email: formData1.new_email,
          phone: formData1.new_phone,
          address_1: formData1.new_address_1,
          landmark: formData1.new_landmark,
          country: 'India',
          state: formData1.new_state,
          district: formData1.new_district,
          pincode: formData1.new_pincode,
          is_default: 1
        };

        let response = await ManageAPIsData(FRONTEND_MYADDRESS, 'POST', payload, user_token_data);
        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          const responseData1 = await response.json();
          setErrorMessage(responseData1.error);
          setSubmitting(false);
          setShowError(true);
          setTimeout(() => {
            setShowError(false);
          }, 3000);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          localStorage.setItem('selectedAddress', JSON.stringify(responseData.data));
          await fetchData();
          setSelectedAddress(responseData.data);
          setFormData1(initialFormData1);

          setFormData({
            ...formData,
            first_name: payload.first_name || '',
            last_name: payload.last_name || '',
            email: payload.email || '',
            phone: payload.phone || '',
            address_1: payload.address_1 || '',
            landmark: payload.landmark || '',
            district: payload.district || '',
            state: payload.state || '',
            pincode: payload.pincode || '',
          });


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

  // Handle selection of address
  const handleAddressSelection = async (address) => {
    setSelectedAddress(address);
    localStorage.setItem('selectedAddress', JSON.stringify(address));
    await updateDefaultAddressData({ user_id: UserLoggedInID }, address.id);

    setFormData({
      ...formData,
      first_name: address.first_name || '',
      last_name: address.last_name || '',
      email: address.email || '',
      phone: address.phone || '',
      addressId: address.id || '',
      address_1: address.address_1 || '',
      landmark: address.landmark || '',
      district: address.district || '',
      state: address.state || '',
      pincode: address.pincode || '',
      a_type: address.a_type,
    });
    setSelectedType(address.a_type);

  };

  return (
    <>
      <Header />
      <section className="pt-5">
        <div className="details py-2">
          <div className="container pt-5">
            <div className="row pt-5">
              <div className="col-xl-8 py-3">
                <div className="details-head d-flex justify-content-between">
                  <h1>Billing Details</h1>

                  {!UserLoggedInID && (<div>If you have an account, please <Link href={`/login`}>Login</Link></div>)}

                  {UserLoggedInID && (
                    <button className="px-4 py-1 align-items-center d-flex rounded-3" data-bs-toggle="modal" data-bs-target="#myModal" >Change Or Add New</button>
                  )}

                </div>

                <div className='col-12'><h6>Account Details:</h6></div>
                <div className="col-12 d-flex py-3">
                  <div className="col-md-6 fname w-33">
                    <input
                      type="text"
                      className={`form-control border-0 input-bg ${formErrors.first_name && 'is-invalid'}`}
                      placeholder="Enter First Name"
                      name="first_name"
                      onChange={handleInputChange}
                      value={formData.first_name}
                      readOnly={!!UserLoggedInID}
                    />
                    <div className="invalid-feedback">
                      {formErrors.first_name}
                    </div>
                  </div>
                  <div className="col-md-6 fname w-33 ps-3">
                    <input
                      type="text"
                      className={`form-control border-0 input-bg ${formErrors.last_name && 'is-invalid'}`}
                      placeholder="Enter Last Name"
                      name="last_name"
                      onChange={handleInputChange}
                      value={formData.last_name}
                      readOnly={!!UserLoggedInID}
                    />
                    <div className="invalid-feedback">
                      {formErrors.last_name}
                    </div>
                  </div>
                </div>

                <div className="col-12 d-flex py-3">
                  <div className={`col-md-${UserLoggedInID ? '6' : '4'} lname`}>
                    <input
                      type="email"
                      className={`form-control border-0 input-bg ${formErrors.email && 'is-invalid'}`}
                      placeholder="Enter Email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly={!!UserLoggedInID}
                    />
                    <div className="invalid-feedback">
                      {formErrors.email}
                    </div>
                  </div>
                  <div className={`col-md-${UserLoggedInID ? '6' : '4'} phone ps-3`}>
                    <input
                      type="number"
                      maxLength="10"
                      className={`form-control border-0 input-bg ${formErrors.phone && 'is-invalid'}`}
                      placeholder="Enter Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      readOnly={!!UserLoggedInID}
                    />
                    <div className="invalid-feedback">
                      {formErrors.phone}
                    </div>
                  </div>
                  {!UserLoggedInID && (
                    <div className="col-md-4 phone ps-3">
                      <input
                        type="password"
                        className={`form-control border-0 input-bg ${formErrors.password && 'is-invalid'}`}
                        placeholder="Enter Password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        autoComplete='off'
                        readOnly={!!UserLoggedInID}
                      />
                      <div className="invalid-feedback">
                        {formErrors.password}
                      </div>
                    </div>
                  )}
                </div>

                <div className='col-12'><h6>Billing Details:</h6></div>

                <div className="col-12 d-flex py-3">
                  <div className="Address w-100">
                    <input
                      type="text"
                      className={`form-control border-0 input-bg ${formErrors.address_1 && 'is-invalid'}`}
                      placeholder="Enter Address"
                      name="address_1"
                      value={formData.address_1}
                      onChange={handleInputChange}
                      readOnly={!!UserLoggedInID}
                    />
                    <div className="invalid-feedback">
                      {formErrors.address_1}
                    </div>
                  </div>
                </div>
                <div className="col-12 d-flex py-3">
                  <div className="Address w-100">
                    <input
                      type="text"
                      className={`form-control border-0 input-bg ${formErrors.landmark && 'is-invalid'}`}
                      placeholder="Enter Landmark"
                      name="landmark"
                      value={formData.landmark}
                      onChange={handleInputChange}
                      readOnly={!!UserLoggedInID}
                    />
                    <div className="invalid-feedback">
                      {formErrors.landmark}
                    </div>
                  </div>
                </div>

                <div className="col-12 d-flex py-3">
                  <div className="col-md-4 phone w-33">
                    {UserLoggedInID ? (
                      <input
                        type="text"
                        className="form-control border-0 input-bg"
                        placeholder="Enter State"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        readOnly={!!UserLoggedInID}
                      />
                    ) : (
                      <select
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`form-control border-0 input-bg ${formErrors.state && 'is-invalid'}`}
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

                    )}
                  </div>
                  <div className="col-md-4 zip-code w-33 ps-3">
                    {UserLoggedInID ? (
                      <input
                        type="text"
                        className="form-control border-0 input-bg"
                        placeholder="Enter District"
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        readOnly={!!UserLoggedInID}
                      />
                    ) : (
                      <select
                        name="district"
                        value={formData.district}
                        onChange={handleInputChange}
                        className={`form-control border-0 input-bg ${formErrors.district && 'is-invalid'}`}
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
                    )}
                  </div>

                  <div className="col-md-4 zip-code w-33 ps-3">
                    {UserLoggedInID ? (
                      <input
                        type="number"
                        className="form-control border-0 input-bg"
                        placeholder="Enter Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        readOnly={!!UserLoggedInID}
                      />
                    ) : (
                      <select
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className={`form-control border-0 input-bg ${formErrors.pincode && 'is-invalid'}`}
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
                    )}
                  </div>

                </div>

                <div className="col-12">
                  <div className="address-popup-radio-btns">
                    <div className="form-check form-check-inline">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="a_type"
                        id="home"
                        value="1"
                        checked={selectedType === 1}
                        disabled={!!UserLoggedInID}
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
                        disabled={!!UserLoggedInID}
                        onChange={handleChangeRadio}
                      />
                      <label className="form-check-label" htmlFor="work">
                        Work
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-12 py-4 mb-5">
                  <div className="additional-info">
                    <div className="head">
                      <h1 className="display-6">Additional Information</h1>
                    </div>
                    <div>
                      <label htmlFor="text-notes" className="form-label">
                        Order Notes
                      </label>
                      <textarea
                        className="form-control"
                        id="notes-text"
                        rows={4}
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>


              </div>

              <div className="col-xl-4 py-3">
                {cartProducts && cartProducts.length > 0 && (
                  <div>
                    <div className="your-order">
                      <div className="head">
                        <h1>Your Order</h1>
                      </div>
                      <div className="order-details py-4">
                        <div className="product px-5 pb-3 pt-1">
                          <div className="title btm-border d-flex justify-content-between">
                            <h6 className="align-items-center d-flex py-3">Product</h6>
                            <h6 className="align-items-center d-flex py-3">Total</h6>
                          </div>
                          {cartProducts.map((product) => (
                            <div key={product.id} className="p-name btm-border d-flex justify-content-between py-1">
                              <p className="align-items-center d-flex pt-3">{product.product_name || product.name}</p>
                              {/* <p className="align-items-center d-flex pt-3">
                          <i className='fa fa-inr'></i> {formatCartCheckoutNo(product.price)} X {product.quantity}
                          </p> */}
                              <p className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i> {(formatCartCheckoutNo(((product?.discount_price > 0 ? product.discount_price : product.price) * product.quantity)))}</p>
                            </div>
                          ))}


                          <div className="discount btm-border d-flex justify-content-between py-1">
                            <p className="align-items-center d-flex pt-3">Sub Total</p>
                            <p className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i> {formatCartCheckoutNo(discountedAmount)}</p>
                          </div>

                          {discountAmount && (
                            <div className="shipping btm-border d-flex justify-content-between py-1">
                              <p className="align-items-center d-flex pt-3">Discount</p>
                              <p className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i>- {formatCartCheckoutNo(discountAmount)}</p>
                            </div>
                          )}


                          <div className="discount btm-border d-flex justify-content-between py-1">
                            <p className="align-items-center d-flex pt-3">Delivery Charges</p>
                            <p className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i> {discountedAmount < 599 ? 49 : "Free"}</p>
                          </div>
                          {/* <div className="shipping btm-border d-flex justify-content-between py-1">
                            <p className="align-items-center d-flex pt-3">CGST</p>
                            <p className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i> {formatCartCheckoutNo(CGST)}</p>
                          </div>
                          <div className="shipping btm-border d-flex justify-content-between py-1">
                            <p className="align-items-center d-flex pt-3">SGST</p>
                            <p className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i> {formatCartCheckoutNo(SGST)}</p>
                          </div>
                          <div className="shipping btm-border d-flex justify-content-between py-1">
                            <p className="align-items-center d-flex pt-3">IGST</p>
                            <p className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i> {formatCartCheckoutNo(IGST)}</p>
                          </div> */}

                          {/* <div className="shipping btm-border d-flex justify-content-between py-1">
                        <p className="align-items-center d-flex pt-3">Tax</p>
                        <p className="align-items-center d-flex pt-3">{FinalTax}</p>
                      </div> */}
                          <div className="total d-flex justify-content-between py-1">
                            <h6 className="align-items-center d-flex pt-3">Total</h6>
                            <h6 className="align-items-center d-flex pt-3"><i className='fa fa-inr'></i> {formatCartCheckoutNo(FinalAmount)}</h6>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="place-order-btn pb-4">
                      {/* <div className="button_slide slide_down w-100 text-center" onClick={handleConfirmOrder}> */}
                      <div className="button_slide slide_down w-100 text-center" onClick={makePayment}>
                        Place Order
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </section>
      <Footer />


      <div className="modal" id="myModal">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="container" />
            <div className="modal-body">

              <div className="head d-flex justify-content-between align-items-center pt-3">
                <h1 className="display-6">Select Address</h1>
                <button
                  type="button"
                  id="addAddressModalButton"
                  className="btn new-address-btn"
                  data-bs-toggle="modal"
                  data-bs-target="#addAddressModal"
                  onClick={() => handleAddNewAddress()}
                >+ Add New</button>
              </div>
              {userAddresses.map((address) => (
                <div className="form-check mb-3" key={address.id}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="addressRadio"
                    id={`addressRadio${address.id}`}
                    checked={selectedAddress1?.id === address.id}
                    onChange={() => handleAddressSelection(address)}
                  />
                  <label
                    className="form-check-label"
                    htmlFor={`addressRadio${address.id}`}
                  >
                    <div>
                      <span><b>{address.first_name} {address.last_name}</b></span>
                      <span className='addressnameplace'>{address.a_type === 1 ? 'Home' : address.a_type === 2 ? 'Work' : ''}</span>
                    </div>
                    {address?.address_1},
                    {address?.landmark},
                    {address?.state},
                    {address?.district},
                    {address?.pincode}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

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
                        name="new_a_type"
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
                        name="new_a_type"
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

                <div className='row'>
                  <div className="col-md-6 mb-3">
                    <label htmlFor="new_first_name" className="form-label">First Name:</label>
                    <input placeholder='Enter ...' type="text" name="new_first_name" value={formData1.new_first_name} onChange={handleChange} className={`form-control ${formErrors1.new_first_name && 'is-invalid'}`} id="new_first_name" required />
                    <div className="invalid-feedback">
                      {formErrors1.new_first_name}
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="new_last_name" className="form-label">Last Name:</label>
                    <input placeholder='Enter ...' type="text" name="new_last_name" value={formData1.new_last_name} onChange={handleChange} className={`form-control ${formErrors1.new_last_name && 'is-invalid'}`} id="new_last_name" required />
                    <div className="invalid-feedback">
                      {formErrors1.new_last_name}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="new_email" className="form-label">Email:</label>
                  <input placeholder='Enter ...' type="email" name="new_email" value={formData1.new_email} onChange={handleChange} className={`form-control ${formErrors1.new_email && 'is-invalid'}`} id="new_email" required />
                  <div className="invalid-feedback">
                    {formErrors1.new_email}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="phone1" className="form-label">Phone Number:</label>
                  <input placeholder='Enter ...' type="number" maxLength="10" name="new_phone" value={formData1.new_phone} onChange={handleChange} className={`form-control ${formErrors1.new_phone && 'is-invalid'}`} id="phone1" required />
                  <div className="invalid-feedback">
                    {formErrors1.new_phone}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="new_address_1" className="form-label">Address:</label>
                  <textarea placeholder='Enter ...' name="new_address_1" value={formData1.new_address_1} onChange={handleChange} className={`form-control ${formErrors1.new_address_1 && 'is-invalid'}`} id="new_address_1" required />
                  <div className="invalid-feedback">
                    {formErrors1.new_address_1}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="new_landmark" className="form-label">Landmark:</label>
                  <input placeholder='Enter ...' type="text" name="new_landmark" value={formData1.new_landmark} onChange={handleChange} className={`form-control ${formErrors1.new_landmark && 'is-invalid'}`} id="new_landmark" required />
                  <div className="invalid-feedback">
                    {formErrors1.new_landmark}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="new_state" className="form-label">State:</label>
                  <select
                    name="new_state"
                    value={formData1.new_state}
                    onChange={handleChange}
                    className={`form-control ${formErrors1.new_state && 'is-invalid'}`}
                    id="new_state"
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
                    {formErrors1.new_state}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="new_district" className="form-label">District:</label>
                  <select
                    name="new_district"
                    value={formData1.new_district}
                    onChange={handleChange}
                    className={`form-control ${formErrors1.new_district && 'is-invalid'}`}
                    id="new_district"
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
                    {formErrors1.new_district}
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="new_pincode" className="form-label">Pincode:</label>
                  <select
                    name="new_pincode"
                    value={formData1.new_pincode}
                    onChange={handleChange}
                    className={`form-control ${formErrors1.new_pincode && 'is-invalid'}`}
                    id="new_pincode"
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
                    {formErrors1.new_pincode}
                  </div>
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}</button>
                <div className=''>{showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}</div>
              </form>
            </div>
          </div>
        </div>
      </div>



    </>
  );
}

export default Checkout;
