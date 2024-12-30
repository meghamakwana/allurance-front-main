// Import necessary modules and components
'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { useRouter } from 'next/navigation'; // Import useRouter hook for navigation
import { FRONTEND_CART_ENDPOINT, FRONTEND_USER_ADDRESSES_ENDPOINT, FRONTEND_CHECKOUT_ENDPOINT, FRONTEND_MYADDRESS } from 'src/utils/frontendAPIEndPoints';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { useSession } from 'next-auth/react';
import { useCart } from 'src/utils/CartContext';
import CircularProgress from '@mui/material/CircularProgress';
import { INE_ADMIN_CHECK_COUPON_ENDPOINT, INE_ADMIN_CHECK_COUPON_ENDPOINT_CHECK } from 'src/utils/apiEndPoints';
import { enqueueSnackbar } from 'notistack';
import { Box, Button, Card, CardContent, FormControlLabel, Radio, RadioGroup, TextField, Typography } from '@mui/material';
// Define any methods to update context data
import { getDecodedToken, productsHandleImageError, addToCartFn, formatCartCheckoutNo, getAddressData, getStateData, getDistrictData, getPincodeData, getOnlyToken, updateDefaultAddressData, getCategories } from '../../utils/frontendCommonFunction';
import Cookies from 'js-cookie';

function Cart() {
  const { data: session } = useSession();
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [cartProducts, setCartProducts] = useState([]);
  const [userAddresses, setUserAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);
  const [couponCode, setCouponCode] = useState(''); // State for coupon code input
  const [discountedAmount, setDiscountedAmount] = useState(0); // State for discount amount
  const router = useRouter();
  const { updateCartProducts, handleDeleteAllProducts, updateSelectedAddress, updateCGST, updateIGST, updateSGST, updateDiscountedAmount, updateFinalAmount, updateFinalTax } = useCart();
  const [selectedCoupon, setSelectedCoupon] = useState({});
  const [coupons, setAllCoupons] = useState([]);

  const decodedlogtkn = getDecodedToken();
  const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

  const [categories, setCategories] = useState([]);
  const [stateData, setStateData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [pincodeData, setPincodeData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState(1);
  const [finalCharge, setFinalCharge] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const user_token_data = getOnlyToken();
  const [isHovered, setIsHovered] = useState(false);

  // Hover style conditionally set
  const style = {
    color: isHovered ? 'white' : 'black', // Change color on hover
    cursor: 'pointer', // Optional: changes cursor to pointer
  };




  // Categories Data
  const fetchCategories = useCallback(async () => {
    try {
      const data1 = await getCategories();
      if (data1.data.length) {
        if (data1.data.length) {
          const limitedData = data1.data.slice(0, 20);
          setCategories(limitedData);
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function FetchCoupons() {
    try {
      const response = await ManageAPIsData(`${INE_ADMIN_CHECK_COUPON_ENDPOINT}`, 'POST', {
        "channel_mode": "1"
      }, user_token_data);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      if (responseData?.data) {
        setAllCoupons(responseData.data);
        console.log("Coupon", responseData.data)
        setIsLoadingProducts(false);
      } else {

        setIsLoadingProducts(false);
      }
    } catch (error) {
      setIsLoadingProducts(false);
      console.error('Error fetching data:', error);
    }
  }

  const handleDeleteAllProductsFromCart = async () => {
    const checkDelete = await handleDeleteAllProducts()
    if (checkDelete) {
      setCartProducts([]);
      FetchProducts();
    }

  }

  useEffect(() => {
    FetchProducts();
  }, [UserLoggedInID]);

  const FetchProducts = async () => {
    FetchCoupons();
    if (UserLoggedInID) {
      fetchCartProductsFromAPI();
    } else {
      FetchCartProductsWithoutSession();
    }
  }

  const fetchCartProductsFromAPI = async () => {
    setIsLoadingProducts(true);
    try {
      const userid = UserLoggedInID;
      const response = await ManageAPIsData(`${FRONTEND_CART_ENDPOINT}?user_id=${userid}`, 'GET');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      if (responseData?.data?.products?.length > 0) {
        setCartProducts(responseData.data.products);
        setIsLoadingProducts(false);
      } else {
        setIsLoadingProducts(false);
      }
    } catch (error) {
      setIsLoadingProducts(false);
      console.error('Error fetching data:', error);
    }
  };

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

  // Fetch cart products from local storage when user is not logged in
  const FetchCartProductsWithoutSession = async () => {
    setIsLoadingProducts(true);
    try {
      const mockid = localStorage.getItem('Alluranceorder');
      const response = await ManageAPIsData(`${FRONTEND_CART_ENDPOINT}?mock_id=${mockid}`, 'GET');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const responseData = await response.json();
      if (responseData?.data?.products?.length > 0) {
        setCartProducts(responseData.data.products);
        setIsLoadingProducts(false);
      } else {
        setIsLoadingProducts(false);
      }
    } catch (error) {
      setIsLoadingProducts(false);
      console.error('Error fetching data:', error);
    }
  };

  // Update To Cart
  const updateToCartProcess = async (productDetails, qty) => {
    var pstock = productDetails?.stock;
    var pid = productDetails?.id;
    addToCartFn(pstock, pid, qty);
  };

  // useEffect(() => {
  //   if (finalCharge < 599) {
  //     delivery = 49
  //     // setFinalCharge((prev) => (prev + 49))
  //   }
  // }, [])

  // Increment quantity of a product in the cart
  const incrementQuantity = async (index, product) => {
    const updatedProducts = [...cartProducts];
    if (updatedProducts[index].quantity < updatedProducts[index].stock) {
      await updateToCartProcess(product, updatedProducts[index].quantity + 1)
      updatedProducts[index].quantity += 1;
      setCartProducts(updatedProducts);
      updateCartProducts(updatedProducts);
      // updateLocalStorage(updatedProducts); // Update local storage after state change
    }
  };

  // Decrement quantity of a product in the cart
  const decrementQuantity = async (index, product) => {
    const updatedProducts = [...cartProducts];
    if (updatedProducts[index].quantity > 1) {
      await updateToCartProcess(product, updatedProducts[index].quantity - 1)
      updatedProducts[index].quantity -= 1;
      setCartProducts(updatedProducts);
      updateCartProducts(updatedProducts);
      // updateLocalStorage(updatedProducts); // Update local storage after state change
    }
  };

  // Handle quantity change for a product in the cart
  const handleQuantityChange = async (index, value, product) => {
    await updateToCartProcess(product, value)
    if (value == 0) { value = 1; }
    const updatedProducts = [...cartProducts];
    const newValue = parseInt(value);
    if (newValue >= 1 && newValue <= updatedProducts[index].stock) {
      updatedProducts[index].quantity = newValue;
      setCartProducts(updatedProducts);
      updateCartProducts(updatedProducts);
      // updateLocalStorage(updatedProducts); // Update local storage after state change
    }
  };

  // Handle selection of address
  const handleAddressSelection = async (address) => {
    setSelectedAddress(address);
    localStorage.setItem('selectedAddress', JSON.stringify(address));
    await updateDefaultAddressData({ user_id: UserLoggedInID }, address.id);
  };

  const truncateText = (text, wordLimit) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  // Remove Product
  // async function removeCartProduct(product) {
  //   const updatedCartProducts = cartProducts.filter(p => p.id !== product.id);
  //   setCartProducts(updatedCartProducts);
  //   try {
  //     const response = await fetch(`${FRONTEND_CART_ENDPOINT}?id=${product.cartid}`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Content-Type': 'application/json'
  //       },
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Error: ${response.statusText}`);
  //     }

  //     const responseData = await response.json();

  //     if (responseData && responseData.message) {
  //       enqueueSnackbar('Product removed from cart', { variant: 'success' });
  //     } else {
  //       setCartProducts(cartProducts);
  //       enqueueSnackbar('Failed to remove product from cart1', { variant: 'error' });
  //     }
  //   } catch (error) {
  //     setCartProducts(cartProducts);
  //     enqueueSnackbar('Failed to remove product from cart2', { variant: 'error' });
  //   }
  // }

  const removeCartProduct = useCallback(
    async (product) => {
      // Optimistically update the cart state
      const previousCartProducts = [...cartProducts];
      const updatedCartProducts = cartProducts.filter((p) => p.id !== product.id);
      setCartProducts(updatedCartProducts);

      try {
        const response = await fetch(`${FRONTEND_CART_ENDPOINT}?id=${product.cartid}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const responseData = await response.json();

        if (responseData?.message) {
          enqueueSnackbar('Product removed from cart', { variant: 'success' });
        } else {
          throw new Error('Failed to remove product from cart1');
        }
      } catch (error) {
        // Revert state on error
        setCartProducts(previousCartProducts);
        enqueueSnackbar('Failed to remove product from cart', { variant: 'error' });
      }
    },
    [cartProducts, enqueueSnackbar, FRONTEND_CART_ENDPOINT]
  );

  // Calculate subtotal, tax, and total amount
  const calculateSubTotal = () => {
    const subtotal = cartProducts.reduce((total, product) => total + ((product?.discount_price > 0 ? product.discount_price : product.price) * product.quantity), 0);
    const discountedTotal = subtotal;
    const totalAmount = discountedTotal;
    return totalAmount.toFixed(2);
  };

  // Calculate tax based on subtotal
  const calculateTax = (amount) => {
    const taxRate = 0.18;
    return (amount * taxRate)?.toFixed(2);
  };
  const calculateSGST = (amount) => {
    const taxRate = 0.18;
    return (amount * taxRate)?.toFixed(2);
  };
  const calculateIGST = (amount) => {
    const taxRate = 0.18;
    return (amount * taxRate)?.toFixed(2);
  };
  const calculateCGST = (amount) => {
    const taxRate = 0.18;
    return (amount * taxRate)?.toFixed(2);
  };

  // Calculate subtotal, tax, and total amount
  const subtotal = calculateSubTotal();
  const tax = calculateTax(subtotal);
  const CGST = calculateCGST(subtotal);
  const SGST = calculateSGST(subtotal);
  const IGST = calculateIGST(subtotal);
  let delivery = finalCharge < 599 ? 49 : 0
  // const totalAmount = (parseFloat(subtotal) + parseFloat(CGST) + parseFloat(SGST) + parseFloat(IGST)).toFixed(2);
  const totalAmount = (parseFloat(subtotal) + parseFloat(delivery)).toFixed(2);
  const affiliate_id = cartProducts?.find(item => item.affiliate_id)?.affiliate_id || '';

  useEffect(() => {
    if (!isCouponApplied) {
      setFinalCharge(totalAmount);
    }
  }, [totalAmount, isCouponApplied]);

  const handleProceedToCheckout = async () => {
    if (cartProducts.length === 0) {
      enqueueSnackbar('Cart is empty!', { variant: 'error' });
      return;
    }
    updateSelectedAddress(selectedAddress)
    updateDiscountedAmount(subtotal);
    updateFinalAmount(finalCharge);
    updateCGST(CGST);
    updateSGST(SGST);
    updateIGST(IGST);
    updateCartProducts(cartProducts);
    let payload = {
      subtotal: subtotal,
      totalamount: finalCharge,
      taxamount: tax,
      CGST: CGST,
      SGST: SGST,
      IGST: IGST
    };

    if (UserLoggedInID) {
      payload.user_id = UserLoggedInID;
      payload.affiliate_id = affiliate_id;
    } else {
      const mock_Id = await localStorage.getItem('Alluranceorder');
      payload.mock_Id = mock_Id;
    }

    if (UserLoggedInID) {
      let selectedAddress1 = localStorage.getItem('selectedAddress');
      if (selectedAddress1 === null || selectedAddress1 === undefined || selectedAddress1 === 'undefined' || selectedAddress1.trim() === '' || selectedAddress1 === 'null') {
        enqueueSnackbar('Please select or add new address', { variant: 'error' });
        return;
      }
    }

    try {
      const response = await fetch(FRONTEND_CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // setTimeout(() => {
        router.push('/checkout');
        // }, 5000);
      } else {
        enqueueSnackbar('Failed to proceed to checkout. Please try again.', { variant: 'error' });
      }
    } catch (err) {
      console.log('Error during checkout:', err);
      enqueueSnackbar('Error during checkout. Please try again later.', { variant: 'error' });
    }
  };

  const allCoupons = useMemo(
    () =>
      coupons
        .filter((campaign) => campaign.show_on_channel === 1) // Filter campaigns with show_on_channel: 1
        .flatMap((campaign) =>
          campaign.coupon_code_data.map((coupon) => ({
            ...coupon,
            campaign_name: campaign.name, // Attach the campaign name to each coupon
          }))
        ),
    [coupons]
  );

  // console.log("idd All Coupans", allCoupons)
  // console.log("idd All Coupans1", coupons)

  const handleCouponChange = (event) => {
    const selectedValue = event.target.value;

    if (!selectedValue) {
      enqueueSnackbar('Invalid Coupon', { variant: 'error' });
      return;
    }

    // Extract the coupon_code and id from the selected value
    const [selectedCode, selectedId] = selectedValue.split('-');

    // Find the coupon with the corresponding coupon_code and id
    const coupon = allCoupons.find(
      (c) => c.coupon_code === selectedCode && c.id === parseInt(selectedId)
    );

    if (coupon) {
      setSelectedCoupon(coupon); // Update selected coupon
    } else {
      enqueueSnackbar('Coupon not found', { variant: 'error' });
    }
  };



  const handleTextFieldChange = (event) => {
    const manualCode = event.target.value;
    if (!manualCode) {
      enqueueSnackbar('Invalid Coupon', { variant: 'error' });
      return;
    }
    const coupon = coupons
      .flatMap((campaign) => campaign.coupon_code_data)
      .find((c) => c.coupon_code === manualCode);
    setSelectedCoupon(coupon || { coupon_code: manualCode }); // Update or fallback

    if (!coupon) {
      enqueueSnackbar('Invalid Coupon', { variant: 'error' });
      return;
    }
  };

  const applyCoupon = async () => {

    const cookie = Cookies.get('coupon')

    if (!cookie) {
      if (Object.keys(selectedCoupon).length === 0) {
        enqueueSnackbar('Invalid Coupon', { variant: 'error' });
        return;
      }
    }

    try {
      if (cartProducts.length === 0) {
        enqueueSnackbar('Cart is empty!', { variant: 'error' });
        setSelectedCoupon({});
        setIsCouponApplied(false);
        const newTotalAmount = totalAmount - discountedAmount;
        setFinalCharge(() => newTotalAmount);
        setDiscountedAmount(0);
        Cookies.remove('discount');
        Cookies.remove('coupon');
        return;
      }

      if (!selectedCoupon) {
        enqueueSnackbar('No coupon is selected.', { variant: 'error' });
        return;
      }


      const selectedCouponData = coupons.find((coupon) => coupon.id === selectedCoupon.campaign_id);
      // console.log('idd selectedCouponData:', selectedCouponData);
      if (!selectedCouponData) {
        console.error('Selected coupon data not found!');
        return;
      }

      // Filter cart products that match the selected coupon's product_data
      const matchedProducts = cartProducts.filter((cartProduct) =>
        selectedCouponData.product_data.some((couponProduct) => couponProduct.product_id === cartProduct.product_id)
      );

      console.log('Matched Products:', matchedProducts);

      // console.log('idd Matching Products:', matchedProducts);
      // console.log('idd Cart Products:', cartProducts);
      // console.log('idd selected coupon:', selectedCoupon);
      // console.log('idd Coupons:', coupons);

      if (matchedProducts.length === 0) {
        enqueueSnackbar('No product in the cart is eligible for this coupon.', { variant: 'error' });
        setSelectedCoupon({});
        setIsCouponApplied(false);
        const newTotalAmount = totalAmount - discountedAmount;
        setFinalCharge(() => newTotalAmount);
        setDiscountedAmount(0);
        Cookies.remove('discount');
        Cookies.remove('coupon');
        return;
      }

      // Calculate total value of matching products
      const matchingProductsValue = matchedProducts.reduce((total, product) => {
        const productValue = product.discount_price * product.quantity;
        return total + productValue;
      }, 0);

      // console.log('idd Matching Products Value:', matchingProductsValue);

      // Validate the minimum cart value
      const matchedData = coupons.find((coupon) => coupon.id === selectedCoupon.campaign_id);
      console.log("idd", matchedData);


      if (matchedData && matchingProductsValue < matchedData.min_cart_value) {
        enqueueSnackbar(
          `Your cart must have a minimum order value of ₹ ${matchedData.min_cart_value}.`,
          { variant: 'error' }
        );
        setSelectedCoupon({});
        setIsCouponApplied(false);
        setFinalCharge(totalAmount);
        setDiscountedAmount(0);
        Cookies.remove('discount');
        Cookies.remove('coupon');
        return;
      }

      if (matchedData && matchingProductsValue > matchedData.max_discount_value) {
        setDiscountedAmount(matchedData?.max_discount_value);
      }

      // Check category eligibility
      const applicableCategories = matchedData.categories_data || [];
      const result = cartProducts.map(product => {
        const matchedCategory = categories.find(cat => cat.name === product.category);
        return matchedCategory ? { ...product, categoryId: matchedCategory.id } : product;
      });
      const cartCategoryIds = result.map((product) => product.categoryId);
      // console.log("idd", applicableCategories)
      // console.log("idd1", cartCategoryIds)
      const isCategoryEligible = cartCategoryIds.some((id) =>
        applicableCategories.includes(id)
      );

      if (!isCategoryEligible) {
        enqueueSnackbar('No product category is eligible for this coupon.', { variant: 'error' });
        return;
      }

      // Apply the coupon
      const discount =
        matchedData.off_type === 1
          ? matchedData.off_type_flat
          : (totalAmount * matchedData.off_type_percentage) / 100;

      setDiscountedAmount(discount);
      const newTotalAmount = totalAmount - discount;
      setFinalCharge(() => newTotalAmount);
      Cookies.set('coupon', selectedCoupon.coupon_code, { expires: 7 });
      Cookies.set('discount', discount, { expires: 7 });
      enqueueSnackbar('Coupon applied successfully', { variant: 'success' });
      setIsCouponApplied(true);
    } catch (error) {
      console.error('Error applying coupon:', error);
      enqueueSnackbar('Failed to apply the coupon. Please try again.', { variant: 'error' });
    }
  };


  const handleCouponRemoved = () => {
    Cookies.remove('coupon');
    Cookies.remove('discount');
    setFinalCharge(totalAmount);
    setDiscountedAmount(0);
    setIsCouponApplied(false);
    setSelectedCoupon({})
    enqueueSnackbar('Coupon removed successfully', { variant: 'success' });

  }



  useEffect(() => {
    const initialize = async () => {
      if (!coupons || coupons.length === 0 || allCoupons.length === 0) {
        // Exit if coupons or allCoupons are not ready
        return;
      }

      const couponData = Cookies.get('coupon');
      if (couponData) {
        const couponDefault = allCoupons.find((c) => c.coupon_code === couponData);

        if (couponDefault) {
          setSelectedCoupon(couponDefault); // Set coupon first
          setTimeout(() => applyCoupon(), 0); // Delay `applyCoupon` call to allow state to update
        }
      }

      const discountData = Cookies.get('discount');
      if (discountData) {
        setIsCouponApplied(true)
        setDiscountedAmount(Number(discountData)); // Ensure discount is a number
      }
    };

    initialize();
  }, [coupons, allCoupons, updateCartProducts, removeCartProduct, isCouponApplied]);

  useEffect(() => {
    if (allCoupons.length > 0) {
      const couponData = Cookies.get('coupon');
      if (couponData) {
        const couponDefault = allCoupons.find((c) => c.coupon_code === couponData);
        if (couponDefault) {
          setSelectedCoupon(couponDefault);
        }
      }
    }
  }, [allCoupons]);


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
  };

  const initialFormData = {
    a_type: 1,
    user_id: UserLoggedInID,
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
    is_default: 1
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
        let response = await ManageAPIsData(FRONTEND_MYADDRESS, 'POST', formData, user_token_data);
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
    <div id="home">
      <Header />
      <section className="pt-5">
        <div className="my-bag py-5 mt-5 w-100">
          <div className="my-bag-bg">
            <img src="/img/my-bag-bg-2.png" alt="My Bag" />
          </div>
          <div className="container-fluid p-0">
            <div className="bag-head text-center">
              <h1 className="display-6">My Bag</h1>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="product-detail-section mb-5">
          <div className="container max-width-class">
            <div className="row">
              <div className="col-xl-8 product-detail-desktop">
                <div className="table-responsive">
                  <table style={{ width: '100%', border: '1px solid #f8f8f8' }}>
                    <tbody>
                      <tr className="head-bg">
                        <th colSpan={2}>Product</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th>Total</th>
                      </tr>
                      {isLoadingProducts ? (
                        <tr>
                          <td colSpan={5} className="text-center p-5">
                            <CircularProgress />
                          </td>
                        </tr>
                      ) : cartProducts?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center p-5">
                            No products in the cart
                          </td>
                        </tr>
                      ) : (
                        cartProducts?.map((product, index) => (
                          <tr key={product.id}>
                            <td>
                              <Link href={`/productdetails/${product?.id}`} className="text-decoration-none">
                                <img src={`${product.images[0].url}`} alt={product.name} height={100} width={100} onError={productsHandleImageError} />
                              </Link>
                            </td>
                            <td className="cart-detail">
                              <Link href={`/productdetails/${product?.id}`} className="text-decoration-none">
                                <Typography variant="h6" component="span">
                                  {product?.product_name || product?.name}
                                </Typography>
                              </Link>
                              <br />
                              {product?.model_number && (
                                <Typography variant="body2" color="textSecondary">
                                  model number :- {product?.model_number}
                                </Typography>
                              )}
                              {product?.category && (
                                <Typography variant="body2" color="textSecondary">
                                  Category :- {product?.category}
                                </Typography>
                              )}
                            </td>
                            <td><i className="fa fa-inr" />{product?.discount_price > 0 ? formatCartCheckoutNo(product.discount_price) : formatCartCheckoutNo(product.price)}</td>
                            <td>
                              <div className="wrapper">
                                <div className="cart-box d-flex justify-content-center">
                                  <div className="qnt-box py-2">
                                    <div className="qty qty-minus px-2" onClick={() => decrementQuantity(index, product)}>
                                      -
                                    </div>
                                    <input
                                      id="cartQty"
                                      className="qty"
                                      type="number"
                                      value={product?.quantity}
                                      min={1}
                                      max={product?.stock}
                                      size={1}
                                      readOnly
                                      onChange={(e) => handleQuantityChange(index, e.target.value, product)}
                                    />
                                    <div className="qty qty-plus px-2" onClick={() => incrementQuantity(index, product)}>
                                      +
                                    </div>
                                  </div>
                                  <Link
                                    href="#"
                                    className="text-decoration-none text-dark px-3 delete-icon d-flex align-items-center"
                                    onClick={() => removeCartProduct(product)}
                                  >
                                    <i className="fa fa-trash-o" aria-hidden="true" />
                                  </Link>
                                </div>
                              </div>
                            </td>
                            <td><i className="fa fa-inr"></i> {formatCartCheckoutNo((product?.discount_price > 0 ? product.discount_price : product.price) * product.quantity)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>

                  </table>

                  <div className="shopping-btns d-flex justify-content-between py-4">
                    <div className="conti-shopping-btn">
                      <Link href="/">
                        <button className="border-0 p-3 rounded-3">Continue Shopping</button>
                      </Link>
                    </div>

                    {/*                     
                    {cartProducts && cartProducts.length > 0 && (
                    <div className="clear-shopping-cart">
                      <button className="border-0 p-3 rounded-3" onClick={() => handleDeleteAllProductsFromCart()}>Clear Shopping Cart</button>
                    </div>
                    )} 
                     */}

                  </div>
                </div>
              </div>
              <div className="col-xl-4">

                {UserLoggedInID && cartProducts && cartProducts.length > 0 && (
                  <div className="address p-2">
                    <div className="add-show">
                      {selectedAddress ? (
                        <>
                          <div>Name: {selectedAddress.first_name} {selectedAddress.last_name},</div>
                          <div><span>Deliver to: </span><b>{selectedAddress.address_1},</b> {selectedAddress.landmark}, {selectedAddress.state}, {selectedAddress.district}, Pincode - {selectedAddress.pincode}</div>
                        </>
                      ) : (
                        'No address selected or added'
                      )}
                    </div>
                    <div className="add-change-btn d-flex justify-content-between align-items-center">
                      <button
                        className="px-4 py-1 align-items-center d-flex rounded-3"
                        data-bs-toggle="modal"
                        data-bs-target="#myModal"
                      >
                        {selectedAddress ? 'Change' : 'Add'}
                      </button>
                    </div>
                  </div>
                )}

                <div className="coupan mt-2">
                  <div className="head d-flex justify-content-between align-items-center">
                    <h1 className="display-6 px-2 py-3 mt-1 enter-code">Enter Coupon Code</h1>
                    <Link href="" className="text-decoration-none text-dark">
                      <h1 className="display-6 px-2 pt-2 check-offer">Check Offers</h1>
                    </Link>
                  </div>

                  <div className="code-box py-3 px-2 w-100 d-flex">
                    <div className="text-box w-75 me-3 py-3">
                      <input
                        id="coupan"
                        className="form-control"
                        type="text"
                        placeholder="Enter ..."
                        value={selectedCoupon?.coupon_code || ""}
                        onChange={handleTextFieldChange}
                      />
                    </div>
                    <div className="apply-btn w-25 py-3">
                      <Button className="coupan-btn py-2 rounded-3 w-100 " variant="contained" onClick={applyCoupon} style={style}
                        onMouseEnter={() => setIsHovered(true)}  // Hover ke time state change
                        onMouseLeave={() => setIsHovered(false)} // Mouse leave pe revert
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                  {allCoupons.length > 0 && (
                    <Card
                      sx={{
                        boxShadow: 3,
                        borderRadius: 2,
                        // background: "linear-gradient(135deg, #e3f2fd, #fce4ec)",
                        background: "#f5f5f5",
                        p: 2,
                      }}
                    >
                      <CardContent>
                        <Box
                          sx={{
                            maxHeight: 200, // Restrict height to show only ~3 coupons
                            overflowY: "auto", // Add vertical scroll if needed
                            pr: 1, // Add padding to avoid scroll overlap
                          }}
                        >
                          <RadioGroup value={selectedCoupon ? `${selectedCoupon.coupon_code}-${selectedCoupon.id}` : ''} onChange={handleCouponChange}>
                            {allCoupons.map((coupon) => (
                              <Box
                                key={coupon.id}
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  p: 1.5,
                                  borderRadius: 1,
                                  border: "1px solid #ddd",
                                  backgroundColor: "#fafafa",
                                  mb: 1,
                                  "&:hover": {
                                    backgroundColor: "#f0f4f8",
                                    boxShadow: "0 0 5px rgba(0,0,0,0.1)",
                                  },
                                }}
                              >
                                {/* Coupon Radio Button */}
                                <FormControlLabel
                                  value={`${coupon.coupon_code}-${coupon.id}`} // Unique value based on coupon_code and id
                                  control={<Radio checked={selectedCoupon?.coupon_code === coupon.coupon_code && selectedCoupon?.id === coupon.id} />}
                                  label={
                                    <Typography
                                      sx={{
                                        fontWeight: "500",
                                        color: "#333",
                                        fontSize: "0.9rem",
                                      }}
                                    >
                                      {coupon.coupon_code}
                                    </Typography>
                                  }
                                />
                                {/* Campaign Name */}
                                <Typography
                                  sx={{
                                    fontSize: "0.8rem",
                                    color: "#666",
                                    fontStyle: "italic",
                                  }}
                                >
                                  {coupon.campaign_name}
                                </Typography>
                              </Box>
                            ))}
                          </RadioGroup>


                        </Box>
                      </CardContent>
                    </Card>
                  )}
                </div>
                <div className="order-summary py-3 mt-2">
                  {cartProducts && cartProducts.length > 0 && (
                    <>
                      <div className="summary-head">
                        <h1 className="display-6 p-2 py-3">Order Summary</h1>
                      </div>



                      {isCouponApplied && (
                        <div
                          className="order-details px-4 py-3 bg-light rounded shadow-sm d-flex justify-content-between align-items-center position-relative"
                          style={{
                            border: "1px solid #28a745",
                            borderRadius: "8px",
                            // background: "linear-gradient(135deg, #e0ffe0, #fafffa)",
                            background: "linear-gradient(135deg, #ad0016, #ffccd5)",
                          }}
                        >
                          <div className="coupon-info d-flex flex-column">
                            <p
                              style={{
                                margin: 0,
                                fontSize: "14px",
                                fontWeight: "bold",
                                color: "#28a745",
                              }}
                            >
                              🎉 Coupon Applied
                            </p>
                            <p
                              style={{
                                margin: 0,
                                fontSize: "16px",
                                fontWeight: "bold",
                                color: "white",
                              }}
                            >
                              Discount: <i className="fa fa-inr"></i> {formatCartCheckoutNo(discountedAmount)}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCouponRemoved()}
                            className="close-btn btn btn-danger btn-sm"
                            style={{
                              background: "#dc3545",
                              color: "#fff",
                              border: "none",
                              borderRadius: "50%",
                              height: "30px",
                              width: "30px",
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              cursor: "pointer",
                            }}
                          >
                            ✖
                          </button>
                        </div>
                      )}






                      <div className="order-details px-4 py-1">
                        <div className="subtotal d-flex justify-content-between pt-2">
                          <p>Sub Total</p>
                          <p><i className='fa fa-inr'></i> {formatCartCheckoutNo(subtotal)}</p>
                        </div>
                      </div>

                      <div className="order-details px-4 py-1">
                        <div className="subtotal d-flex justify-content-between pt-2">
                          <p>Delivery Charge</p>
                          <p><i className='fa fa-inr'></i> {finalCharge < 599 ? formatCartCheckoutNo(delivery) : "Free"}</p>
                        </div>
                      </div>


                      {/* {session && (
                    <> */}
                      {/* <div className="order-details px-4 py-1">
                        <div className="subtotal d-flex justify-content-between pt-2">
                          <p>CGST</p>
                          <p><i className='fa fa-inr'></i> {formatCartCheckoutNo(CGST)}</p>
                        </div>
                      </div>
                      <div className="order-details px-4 py-1">
                        <div className="subtotal d-flex justify-content-between pt-2">
                          <p>IGST</p>
                          <p><i className='fa fa-inr'></i> {formatCartCheckoutNo(IGST)}</p>
                        </div>
                      </div>
                      <div className="order-details px-4 py-1">
                        <div className="subtotal d-flex justify-content-between pt-2">
                          <p>SGST</p>
                          <p><i className='fa fa-inr'></i> {formatCartCheckoutNo(SGST)}</p>
                        </div>
                      </div> */}

                      {/* {isCouponApplied && (
                        <div className="order-details px-4 py-1">
                          <div className="subtotal d-flex justify-content-between pt-2">
                            <p>Coupon applied</p>
                            <p><i className='fa fa-inr'></i>- {formatCartCheckoutNo(discountedAmount)}</p>
                          </div>
                        </div>
                      )
                      } */}


                      {/* <div className="order-details px-4 py-1">
                    <div className="subtotal d-flex justify-content-between pt-2">
                      <p>Discount</p> 
                      <p>{discountedAmount}</p>
                    </div>
                  </div> */}
                      <div className="total-details px-4 py-2">
                        <div className="total d-flex justify-content-between pt-2">
                          <p>Total</p>
                          <p><i className='fa fa-inr'></i> {formatCartCheckoutNo(finalCharge)}</p>
                        </div>
                      </div>
                      {/* <div className="proceed py-3">
                    <button
                      className="proceed-btn w-100 py-3 rounded-3"
                      onClick={() => handleProceedToCheckout()}
                    >
                      Proceed to Checkout
                    </button>
                  </div> */}


                      <div className="proceed py-3">
                        <button
                          className="proceed-btn w-100 py-3 rounded-3"
                          onClick={() => handleProceedToCheckout()}
                        >
                          Proceed to Checkout
                        </button>
                      </div>
                    </>
                  )}

                  <div className="queries py-2 mb-5">
                    <div className="have-querry pt-3 px-4">
                      <p>Have any queries?</p>
                      <p>
                        Call us at{' '}
                        <Link href="#" className="call-us-color px-2">
                          123-456-7890
                        </Link>{' '}
                        or{' '}
                        <Link href="/ticket" className="call-us-color px-2">
                          Chat with us
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* The Modal */}
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
                            checked={selectedAddress?.id === address.id}
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
                          <div className="col-md-6 mb-3">
                            <label htmlFor="first_name" className="form-label">First Name:</label>
                            <input placeholder="Enter ..." type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={`form-control ${formErrors.first_name && 'is-invalid'}`} id="first_name" required />
                            <div className="invalid-feedback">
                              {formErrors.first_name}
                            </div>
                          </div>
                          <div className="col-md-6 mb-3">
                            <label htmlFor="last_name" className="form-label">Last Name:</label>
                            <input placeholder="Enter ..." type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={`form-control ${formErrors.last_name && 'is-invalid'}`} id="last_name" required />
                            <div className="invalid-feedback">
                              {formErrors.last_name}
                            </div>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label htmlFor="email" className="form-label">Email:</label>
                          <input placeholder="Enter ..." type="email" name="email" value={formData.email} onChange={handleChange} className={`form-control ${formErrors.email && 'is-invalid'}`} id="email" required />
                          <div className="invalid-feedback">
                            {formErrors.email}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="phone1" className="form-label">Phone Number:</label>
                          <input placeholder="Enter ..." type="number" maxLength="10" name="phone" value={formData.phone} onChange={handleChange} className={`form-control ${formErrors.phone && 'is-invalid'}`} id="phone1" required />
                          <div className="invalid-feedback">
                            {formErrors.phone}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="address_1" className="form-label">Address:</label>
                          <textarea placeholder="Enter ..." name="address_1" value={formData.address_1} onChange={handleChange} className={`form-control ${formErrors.address_1 && 'is-invalid'}`} id="address_1" required />
                          <div className="invalid-feedback">
                            {formErrors.address_1}
                          </div>
                        </div>
                        <div className="mb-3">
                          <label htmlFor="landmark" className="form-label">Landmark:</label>
                          <input placeholder="Enter ..." type="text" name="landmark" value={formData.landmark} onChange={handleChange} className={`form-control ${formErrors.landmark && 'is-invalid'}`} id="landmark" required />
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
                        {/* <div className="mb-3">
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
                        </div> */}
                        <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : isEditing ? 'Update' : 'Submit'}</button>
                        <div className=''>{showError && (<p className="text-danger mt-3" style={{ padding: '0px 20px 10px' }}>{errorMessage}</p>)}</div>
                      </form>
                    </div>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default Cart;

