'use client';
import { useState, useEffect, useCallback } from 'react';
import data from "../../jsondata/Address.json";
import ProfileListView from "src/component/ProfileListView";
import Link from "next/link";
import Header from "src/component/Header";
import Footer from "src/component/Footer";
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { FRONTEND_MYADDRESS } from "../../utils/frontendAPIEndPoints";
import { getDecodedToken, getOnlyToken, getStateData, getDistrictData, getPincodeData } from "../../utils/frontendCommonFunction";
import { ManageAPIsData } from '../../utils/commonFunction';
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';

function Address() {
  const router = useRouter();
  const [listAddressData, getAddressData] = useState([]);
  const [selectedType, setSelectedType] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editAddressId, setEditAddressId] = useState(null);

  const [decodedToken, setDecodedToken] = useState(null);
  const user_token_data = getOnlyToken();

  const [stateData, setStateData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [pincodeData, setPincodeData] = useState([]);


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


  // Fetch Address Data
  const getMyAddressData = async () => {
    try {
      const response = await ManageAPIsData(`${FRONTEND_MYADDRESS}?user_id=${isUserLoggedIn}`, 'GET', '', user_token_data);
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        getAddressData(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Delete Address Data
  const handleDeleteAddress = async (addressId) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        const response = await ManageAPIsData(`${FRONTEND_MYADDRESS}?id=${addressId}`, 'DELETE', '', user_token_data);
        if (!response.ok) {
          console.error("Error deleting address:", response.statusText);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          getAddressData(prevData => prevData.filter(item => item.id !== addressId));
          enqueueSnackbar(responseData.message, { variant: 'success' });
          getMyAddressData();
        }
      } catch (error) {
        console.error("Error deleting address:", error);
      }
    }
  };

  const handleAddNewAddress = async () => {
    setIsEditing(false);
    setDistrictData([]);
    setPincodeData([]);
  };

  const handleEditAddress = async (address) => {
    setEditAddressId(address.id);
    setFormData({
      user_id: address.user_id,
      first_name: address.first_name,
      last_name: address.last_name,
      email: address.email,
      phone: address.phone,
      address_1: address.address_1,
      landmark: address.landmark,
      state: address.state,
      district: address.district,
      pincode: address.pincode,
      is_default: address.is_default,
      a_type: address.a_type
    });
    setSelectedType(address.a_type);


    setTimeout(async () => {
      setIsEditing(true);
      const districtResponse = await getDistrictData({ 'StateName': address.state });
      if (districtResponse?.data?.length) {
        setDistrictData(districtResponse.data);
        const pincodeResponse = await getPincodeData({ 'District': address.district });
        if (pincodeResponse.data.length) {
          setPincodeData(pincodeResponse.data);
        }
      }
    }, 100);

    setTimeout(() => {
      const modalButton = document.querySelector('#addAddressModalButton');
      modalButton.click();
    }, 0);

  };

  const handleChangeRadio = (event) => {
    const newType = parseInt(event.target.value);
    setSelectedType(newType);

    setFormData((prevData) => ({
      ...prevData,
      a_type: newType,
    }));
  };

  useEffect(() => {
    if (isUserLoggedIn && user_token_data) {
      getMyAddressData();
      setFormData(prevData => ({
        ...prevData,
        user_id: isUserLoggedIn
      }));
    }
  }, [isUserLoggedIn, user_token_data]);

  const initialFormData = {
    a_type: 1,
    user_id: isUserLoggedIn,
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_1: '',
    landmark: '',
    country: 'India',
    state: '',
    district: '',
    pincode: '',
    is_default: 0
  };

  const [formData, setFormData] = useState(initialFormData);

  const [formErrors, setFormErrors] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

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
    setShowError(false);

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

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {

        let response;
        if (isEditing) {
          response = await ManageAPIsData(`${FRONTEND_MYADDRESS}?id=${editAddressId}`, 'PUT', formData, user_token_data);
        } else {
          response = await ManageAPIsData(FRONTEND_MYADDRESS, 'POST', formData, user_token_data);
        }

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
          setFormData(initialFormData);

          setDistrictData([]);
          setPincodeData([]);

          enqueueSnackbar(responseData.message, { variant: 'success' });
          document.getElementById('closeModalButton').click();
          setSubmitting(false);
          getMyAddressData();
          setTimeout(() => {
            setIsEditing(false);
          }, 100);
          setEditAddressId(null);
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


  const fetchData = useCallback(async () => {
    try {

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
  }, [fetchData]);


  return (
    <>
      <>
        <Header />
        {data?.Address?.map((item) => {
          return (
            <div id="myProfile" key={item.ManageAddress}>
              <div className="container">
                <div className="row">
                  <ProfileListView />
                  <div className="col-md-9">
                    <div id="addressSection">
                      <div className="address-title">
                        <h3>{item.ManageAddress}</h3>
                        <button
                          type="button"
                          id="addAddressModalButton"
                          className="btn new-address-btn"
                          data-bs-toggle="modal"
                          data-bs-target="#addAddressModal"
                          onClick={() => handleAddNewAddress()}
                        >
                          <i className={item.PlusIcon} />
                          Add New
                        </button>
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
                                <div className='row'>
                                  <div className="mb-3 col-md-6">
                                    <label htmlFor="first_name" className="form-label">First Name:</label>
                                    <input placeholder="Enter ...." type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={`form-control ${formErrors.first_name && 'is-invalid'}`} id="name" required />
                                    <div className="invalid-feedback">
                                      {formErrors.first_name}
                                    </div>
                                  </div>
                                  <div className="mb-3 col-md-6">
                                    <label htmlFor="last_name" className="form-label">Last Name:</label>
                                    <input placeholder="Enter ...." type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={`form-control ${formErrors.last_name && 'is-invalid'}`} id="last_name" required />
                                    <div className="invalid-feedback">
                                      {formErrors.last_name}
                                    </div>
                                  </div>
                                </div>

                                <div className="mb-3">
                                  <label htmlFor="email" className="form-label">Email:</label>
                                  <input placeholder="Enter ...." type="email" name="email" value={formData.email} onChange={handleChange} className={`form-control ${formErrors.email && 'is-invalid'}`} id="email" required />
                                  <div className="invalid-feedback">
                                    {formErrors.email}
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label htmlFor="phone1" className="form-label">Phone Number:</label>
                                  <input placeholder="Enter ...." type="number" maxLength="10" name="phone" value={formData.phone} onChange={handleChange} className={`form-control ${formErrors.phone && 'is-invalid'}`} id="phone1" required />
                                  <div className="invalid-feedback">
                                    {formErrors.phone}
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label htmlFor="address_1" className="form-label">Address:</label>
                                  <textarea placeholder="Enter ...." name="address_1" value={formData.address_1} onChange={handleChange} className={`form-control ${formErrors.address_1 && 'is-invalid'}`} id="address_1" required />
                                  <div className="invalid-feedback">
                                    {formErrors.address_1}
                                  </div>
                                </div>
                                <div className="mb-3">
                                  <label htmlFor="landmark" className="form-label">Landmark:</label>
                                  <input placeholder="Enter ...." type="text" name="landmark" value={formData.landmark} onChange={handleChange} className={`form-control ${formErrors.landmark && 'is-invalid'}`} id="landmark" required />
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
                                <div className="mb-3">
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      id="flexCheckDefault"
                                      name="is_default"
                                      checked={formData.is_default === 1}
                                      onChange={handleChange}
                                    />
                                    <label className="form-check-label" htmlFor="flexCheckDefault">
                                      Make It Default
                                    </label>
                                  </div>
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}</button>
                                <div className=''>{showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}</div>
                              </form>
                            </div>
                          </div>
                        </div>
                      </div>

                      {listAddressData && listAddressData.length > 0 ? (
                        listAddressData.map((listAddressDatas, index) => {
                          return (
                            <div key={listAddressDatas.id}>
                              <div className="default-address-section">
                                <div className="default-address-edit">
                                  <div className="name-place">
                                    <h4>{listAddressDatas.first_name} {listAddressDatas.last_name}</h4>
                                    <h5>{listAddressDatas.a_type === 1 ? 'Home' : listAddressDatas.a_type === 2 ? 'Work' : ''}</h5>
                                    {listAddressDatas.is_default === 1 && <h5>Default</h5>}
                                  </div>
                                  <div className="dropdown">
                                    <button
                                      className="btn btn-secondary dropdown-toggle"
                                      type=""
                                      id="dropdownMenuButton"
                                      data-bs-toggle="dropdown"
                                      aria-expanded="false"
                                    >
                                      <i className={item.IconEllipsisVertical} />
                                    </button>
                                    <ul
                                      className="dropdown-menu edit-dlt-btn"
                                      aria-labelledby="dropdownMenuButton"
                                    >
                                      <li>
                                        <Link
                                          className="dropdown-item-edit"
                                          href="#"
                                          id="editAddress"
                                          onClick={() => handleEditAddress(listAddressDatas)}
                                        >
                                          Edit
                                        </Link>
                                      </li>
                                      <li>
                                        <Link className="dropdown-item-dlt" href="#" onClick={() => handleDeleteAddress(listAddressDatas.id)}>
                                          Delete
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                                <p>{listAddressDatas.address_1}, {listAddressDatas.country}, {listAddressDatas.state}, {listAddressDatas.district}, {listAddressDatas.landmark}, {listAddressDatas.pincode}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div><center>Sorry, Records Not Found.</center></div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <Footer />
      </>
    </>
  );
}

export default Address;
