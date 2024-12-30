import { useSession } from 'next-auth/react';
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ManageAPIsData } from './commonFunction';
import { FRONTEND_CART_ENDPOINT, FRONTEND_CHECKOUT_ENDPOINT } from './frontendAPIEndPoints';
import { getDecodedToken } from '../utils/frontendCommonFunction';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { data: session } = useSession();
    const [cartProducts, setCartProducts] = useState([]);
    const [UserData, setUserData] = useState({});
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [discountedAmount, setDiscountedAmount] = useState(0);
    const [FinalAmount, setFinalAmount] = useState(0);
    const [CGST, setCGST] = useState(0);
    const [SGST, setSGST] = useState(0);
    const [getRowID, setRowID] = useState(0);
    const [IGST, setIGST] = useState(0);
    const [FinalTax, setFinalTax] = useState(0);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);

    const decodedlogtkn = getDecodedToken();
    const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

    const loadCartData = useCallback(async () => {
        try {
            let id;
            let idtype;

            const userid = UserLoggedInID || null;
            const mock_Id = localStorage.getItem('Alluranceorder');

            if (mock_Id) {
                idtype = 'mock_id';
                id = mock_Id;
            } else if (userid) {
                idtype = 'user_id';
                id = userid;
            } else {
                throw new Error('No valid ID found.');
            }

            const response = await ManageAPIsData(`${FRONTEND_CART_ENDPOINT}?${idtype}=${id}`, 'GET');
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('Cart data not found. It may be empty or the ID is incorrect.');
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            if (responseData?.data?.products?.length > 0) {
                setCartProducts(responseData.data.products);
                loadCheckoutAmount();
            }

            const storedSelectedAddress = localStorage.getItem('selectedAddress');
            if (storedSelectedAddress) {
                setSelectedAddress(JSON.parse(storedSelectedAddress));
            }
        } catch (error) {
            console.error('Failed to load cart data', error);
        } finally {
            setIsLoadingProducts(false);
        }
    }, [UserLoggedInID]);

    useEffect(() => {
        loadCartData();
    }, []);
    useEffect(() => {
        loadCartData();
    }, [UserLoggedInID]);


    const loadCheckoutAmount = useCallback(async () => {
        try {
            const userid = UserLoggedInID || null;
            const mock_Id = localStorage.getItem('Alluranceorder');
            let idtype;
            let id;

            if (mock_Id) {
                idtype = 'mock_id';
                id = mock_Id;
            } else if (userid) {
                idtype = 'user_id';
                id = userid;
            }
            else {
                idtype = '';
                id = '';
            }

            const response = await ManageAPIsData(`${FRONTEND_CHECKOUT_ENDPOINT}?${idtype}=${id}`, 'GET');
            if (!response.ok) {
                if (response.status === 404) {
                    console.warn('Cart data not found. It may be empty or the ID is incorrect.');
                    return;
                }
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();
            if (responseData?.data) {
                setRowID(responseData.data.id);
                setDiscountedAmount(responseData.data.subtotal || 0);
                setFinalAmount(responseData.data.totalamount || 0);
                setFinalTax(responseData.data.taxamount || 0);
                setCGST(responseData.data.CGST || 0);
                setSGST(responseData.data.SGST || 0);
                setIGST(responseData.data.IGST || 0);
            } else {
                console.error('Failed to load checkout data');
            }
        } catch (error) {
            console.error('Failed to load checkout data', error);
        }
    }, [UserLoggedInID]);

    useEffect(() => {
        loadCheckoutAmount();
    }, []);

    useEffect(() => {
        loadCheckoutAmount();
    }, [UserLoggedInID]);

    const updateCartProducts = (products) => {
        setCartProducts(products);
        // localStorage.setItem('cartProducts', JSON.stringify(products));
    };

    // Handle delete product from cart
    const handleDeleteAllProducts = async () => {
        try {
            const mock_Id = localStorage.getItem('Alluranceorder');
            const userid = UserLoggedInID;
            let idtype;
            let id;
            if (mock_Id) {
                idtype = 'mock_id';
                id = mock_Id;
            } else if (userid) {
                idtype = 'user_id';
                id = userid;
            }
            const response = await ManageAPIsData(`${FRONTEND_CART_ENDPOINT}?${idtype}=${id}`, 'DELETE');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            setCartProducts([]);
            return true
        } catch (error) {
            console.error('Error deleting product:', error);
            return false
        }
    };

    const updateSelectedAddress = (address) => {
        setSelectedAddress(address);
        localStorage.setItem('selectedAddress', JSON.stringify(address));
    };

    const updateDiscountedAmount = (amount) => {
        setDiscountedAmount(amount);
    };

    const updateFinalAmount = (amount) => {
        setFinalAmount(amount);
    };

    const updateFinalTax = (amount) => {
        setFinalTax(amount);
    };
    const updateCGST = (amount) => {
        setCGST(amount);
    };
    const updateSGST = (amount) => {
        setSGST(amount);
    };
    const updateIGST = (amount) => {
        setIGST(amount);
    };



    const contextValue = {
        cartProducts,
        CGST,
        SGST,
        IGST,
        FinalTax,
        userAddresses,
        selectedAddress,
        discountedAmount,
        FinalAmount,
        updateCGST,
        updateSGST,
        updateIGST,
        updateCartProducts,
        handleDeleteAllProducts,
        updateSelectedAddress,
        updateDiscountedAmount,
        updateFinalAmount,
        updateFinalTax,
        getRowID,
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    return useContext(CartContext);
};
