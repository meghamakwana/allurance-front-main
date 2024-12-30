'use client';
import React from 'react';
import { useState } from 'react';
import data from '../../../jsondata/productlist.json';
import { Italiana } from 'next/font/google';
import Link from 'next/link';
import { useEffect } from 'react';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import '../../../../public/css/style.css';
import '../../../../public/css/responsive.css';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { FRONTEND_CAMPAIGN_ENDPOINT, FRONTEND_CART_ENDPOINT, FRONTEND_CATEGORY, FRONTEND_PRODUCTS } from 'src/utils/frontendAPIEndPoints';
import { ConstructionOutlined } from '@mui/icons-material';
import { enqueueSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import CircularProgress from '@mui/material/CircularProgress';
import { BEZELMATERIAL_ENDPOINT, COLORSHADE_ENDPOINT, FLOWER_ENDPOINT, RESINTYPE_ENDPOINT } from 'src/utils/apiEndPoints';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@mui/material';
import { fDate } from 'src/utils/format-time';
function productlist() {
    const { data: session } = useSession()
    let { id } = useParams();
    const [filterCriteria, setFilterCriteria] = useState('Best Matches');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [products, setProducts] = useState([]);
    const [count, setCount] = useState(1);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [FilteredProducts, setFilteredProducts] = useState([]);
    const [activeTab, setActiveTab] = useState(1);
    const [categories, setCategories] = useState([]);
    const [colors, setColors] = useState([]);
    const [ResinType, setResinType] = useState([]);
    const [Flower, setFlower] = useState([]);
    const [Material, setMaterial] = useState([]);
    const [campaignDetails, setcampaignDetails] = useState({});
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedColors, setSelectedColors] = useState([]);
    const [selectedResinTypes, setSelectedResinTypes] = useState([]);
    const [selectedFlowerTypes, setSelectedFlowerTypes] = useState([]);
    const [selectedMaterials, setSelectedMaterials] = useState([]);

    const increment = () => {
        setCount(count + 1);
    };

    const decrement = () => {
        if (count > 1) {

            setCount(count - 1);
        }
    };
    let slideIndex = 1; // Define slideIndex globally within the component

    function currentSlide(n) {
        showSlides((slideIndex = n));
    }

    const handleQuickView = (product) => {
        setSelectedProduct(product);
    };

    const fetchCategories = async () => {
        try {
            const response = await ManageAPIsData(FRONTEND_CATEGORY, 'GET');
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data.length) {
                setCategories(responseData.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Listing data
    const fetchColorShades = async () => {

        try {
            const response = await ManageAPIsData(COLORSHADE_ENDPOINT, 'GET');
            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data.length) {
                setColors(responseData.data);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Listing data
    const fetchResinTypes = async () => {
        try {

            const response = await ManageAPIsData(RESINTYPE_ENDPOINT, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }

            const responseData = await response.json();

            if (responseData.data.length) {
                setResinType(responseData.data);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Listing data
    const fetchFlowerTypes = async () => {
        try {

            const response = await ManageAPIsData(FLOWER_ENDPOINT, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }

            const responseData = await response.json();

            if (responseData.data.length) {
                setFlower(responseData.data);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    // Listing data
    const fetchMaterials = async () => {
        try {

            const response = await ManageAPIsData(BEZELMATERIAL_ENDPOINT, 'GET');

            if (!response.ok) {
                console.error("Error fetching data:", response.statusText);
                return;
            }

            const responseData = await response.json();

            if (responseData.data.length) {
                setMaterial(responseData.data);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    const fetchInitialData = async () => {
        try {
            await Promise.all([
                fetchCategories(),
                fetchColorShades(),
                fetchResinTypes(),
                fetchFlowerTypes(),
                fetchMaterials(),
            ]);
        } catch (error) {
            console.error('Error fetching initial data:', error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        const filterBtn = document.querySelector('.filterBtn');
        const closeIcon = document.querySelector('.close-icon');
        const sidebar = document.getElementById('sidebar');

        const toggleSidebar = () => {
            sidebar.classList.toggle('closed');
            document.body.classList.toggle('no-scroll');
        };

        const closeSidebar = () => {
            sidebar.classList.add('closed');
            document.body.classList.remove('no-scroll');
        };

        if (filterBtn) {
            filterBtn.addEventListener('click', toggleSidebar);
        }

        if (closeIcon) {
            closeIcon.addEventListener('click', closeSidebar);
        }

        // Cleanup event listeners on component unmount
        return () => {
            if (filterBtn) {
                filterBtn.removeEventListener('click', toggleSidebar);
            }
            if (closeIcon) {
                closeIcon.removeEventListener('click', closeSidebar);
            }
        };
    }, []);

    const handleShowResults = () => {
        let filteredProducts = [...products];
        if (selectedCategories.length > 0) {
            filteredProducts = [...products].filter((product) =>
                selectedCategories.includes(product.category_id)
            );
        }
        if (selectedColors.length > 0) {
            filteredProducts = [...products].filter((product) =>
                selectedColors.includes(product.color_id)
            );
        }
        if (selectedResinTypes.length > 0) {
            filteredProducts = [...products].filter((product) =>
                selectedResinTypes.includes(product.resin_id)
            );
        }
        if (selectedFlowerTypes.length > 0) {
            filteredProducts = [...products].filter((product) =>
                selectedFlowerTypes.includes(product.flower_id)
            );
        }
        if (selectedMaterials.length > 0) {
            filteredProducts = [...products].filter((product) =>
                selectedMaterials.includes(product.bezel_material_id)
            );
        }
        setFilteredProducts(filteredProducts);

    };

    const handleTabClick = (tabNumber) => {
        setActiveTab(tabNumber);
        // Additional logic to fetch and set data based on tab clicked
        switch (tabNumber) {
            case 2:
                fetchColorShades();
                break;
            case 3:
                fetchResinTypes();
                break;
            case 4:
                fetchFlowerTypes();
                break;
            case 5:
                fetchMaterials();
                break;
            default:
                break;
        }
    };

    const handleCategorySelection = (categoryId) => {
        if (selectedCategories.includes(categoryId)) {
            setSelectedCategories(prev => prev.filter(id => id !== categoryId));
        } else {
            setSelectedCategories(prev => [...prev, categoryId]);
        }
    };

    const handleColorSelection = (ColorId) => {
        if (selectedColors.includes(ColorId)) {
            setSelectedColors(prev => prev.filter(id => id !== ColorId));
        } else {
            setSelectedColors(prev => [...prev, ColorId]);
        }
    };

    const handleResinTypeSelection = (ResinType) => {
        if (selectedResinTypes.includes(ResinType)) {
            setSelectedResinTypes(prev => prev.filter(id => id !== ResinType));
        } else {
            setSelectedResinTypes(prev => [...prev, ResinType]);
        }
    };

    const handleFlowerTypeSelection = (ResinType) => {
        if (selectedFlowerTypes.includes(ResinType)) {
            setSelectedFlowerTypes(prev => prev.filter(id => id !== ResinType));
        } else {
            setSelectedFlowerTypes(prev => [...prev, ResinType]);
        }
    };

    const handleMaterialSelection = (selectedMaterial) => {
        if (selectedMaterials.includes(selectedMaterial)) {
            setSelectedMaterials(prev => prev.filter(id => id !== selectedMaterial));
        } else {
            setSelectedMaterials(prev => [...prev, selectedMaterial]);
        }
    };

    function showSlides(n) {
        let i;
        let slides = document.getElementsByClassName('mySlides');
        let dots = document.getElementsByClassName('demo');
        let captionText = document.getElementById('caption');
        if (n > slides.length) {
            slideIndex = 1;
        }
        if (n < 1) {
            slideIndex = slides.length;
        }
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = 'none';
        }
        for (i = 0; i < dots.length; i++) {
            dots[i].className = dots[i].className.replace(' active', '');
        }
        slides[slideIndex - 1].style.display = 'block';
        dots[slideIndex - 1].className += ' active';
        captionText.innerHTML = dots[slideIndex - 1].alt;
    }

    const closeModal = () => {
        setSelectedProduct(null);
    };

    const FetchProducts = async () => {
        setIsLoadingProducts(true);
        try {

            var response;
            if (id) {
                response = await ManageAPIsData(`${FRONTEND_PRODUCTS}`, 'GET');
            } else {
                response = await ManageAPIsData(FRONTEND_PRODUCTS, 'GET');
            }
            if (!response.ok) {
                console.error('Error fetching data:', response.statusText);
                return;
            }
            const responseData = await response.json();
            if (responseData.data.length) {
                setProducts(responseData.data);
                setFilteredProducts(responseData.data);
                setIsLoadingProducts(false);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setIsLoadingProducts(false);
        }
    };

    useEffect(() => {
        if (id) {
            FetchProducts();
        }
        // showSlides(slideIndex);
        let thumbnails = document.querySelectorAll('.demo');
        thumbnails.forEach(function (thumbnail, index) {
            thumbnail.addEventListener('click', function () {
                currentSlide(index + 1);
            });
        });
    }, [id]);

    const AddToCart = async (productDetails) => {
        try {
            if (session?.user?.id) {
                const payload = {
                    user_id: session.user.id,
                    product_id: productDetails?.id,
                    quantity: count,
                    affiliate_id: id ? id : ""
                };

                const response = await fetch(FRONTEND_CART_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    enqueueSnackbar('Product added to cart successfully!');
                } else {
                    enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
                }
            } else {
                // Not logged in, manage cart using localStorage
                let cartProducts = JSON.parse(localStorage.getItem('cartProducts')) || [];
                const existingIndex = cartProducts.findIndex(item => item.product.id === productDetails?.id);

                if (existingIndex !== -1) {
                    // Product already exists in cart, update quantity
                    cartProducts[existingIndex].quantity += count;
                } else {
                    // Product does not exist in cart, add new item
                    const newItem = {
                        ...productDetails,
                        quantity: count
                    };
                    cartProducts.push(newItem);
                }

                localStorage.setItem('cartProducts', JSON.stringify(cartProducts));
                enqueueSnackbar('Product added to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            enqueueSnackbar('Failed to add product to cart', { variant: 'error' });
        }
    };

    function calculateDiscountPercentage(originalPrice, discountedPrice) {
        if (originalPrice === 0 || discountedPrice === 0) {
            return 0; // Handle cases where original price or discounted price is zero
        }

        const discountAmount = originalPrice - discountedPrice;
        const discountPercentage = (discountAmount / originalPrice) * 100;
        return discountPercentage;
    }

    const handleFilterChange = (event) => {
        setFilterCriteria(event.target.value);
    };

    const filteredAndSortedProducts = React.useMemo(() => {
        const filteredProducts = FilteredProducts?.filter((product) => {
            if (filterCriteria === 'New Arrivals') {
                return product.coming_soon === 1;
            }
            return true;
        });

        const sortedProducts = filteredProducts.sort((a, b) => {
            switch (filterCriteria) {
                case 'All':
                    return true;
                case 'New Arrivals':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'Price: High to Low':
                    return b.price - a.price;
                case 'Price: Low to High':
                    return a.price - b.price;
                default:
                    return 0;
            }
        }); return sortedProducts;
    }, [FilteredProducts, filterCriteria]);

    return (
        <>
            <div id="home">
                <Header />
                {/* banner section */}
                {data?.productlist?.map((item, index) => {
                    return (
                        <React.Fragment key={`item-${index}`}>
                            {/* filter product ends */}
                            <div id="filterProduct">
                                <div className="container">
                                    <div className="row">
                                        <div v="" className="col-md-6 col-sm-4 col-xs-4">
                                            <button className="filterBtn">
                                                <img
                                                    src="/img/filter-btn-product-list.png"
                                                    alt="Filter Button Icon"
                                                />
                                                Filter By
                                                <img src="/img/down-chevron.png" alt="Down Chevron Icon" />
                                            </button>
                                        </div>
                                        <div id="sidebar" className="closed">
                                            <div className="row">
                                                <div className="sidebar-header">
                                                    <div>
                                                        <img
                                                            src="/img/filter-btn-product-list.png"
                                                            alt="Filter Button Icon"
                                                        />
                                                        Filter By
                                                    </div>
                                                    <div className="close-icon">
                                                        <i className="fa-solid fa-xmark" />
                                                    </div>
                                                </div>
                                                <div className="col-md-6 filter-list">
                                                    {/* Tabs for Category, Color, Price, etc. */}
                                                    <div className={`tab ${activeTab === 1 ? 'active' : ''}`} data-tab={1} onClick={() => handleTabClick(1)}>
                                                        Category
                                                    </div>
                                                    <div className={`tab ${activeTab === 2 ? 'active' : ''}`} data-tab={2} onClick={() => handleTabClick(2)}>
                                                        Color
                                                    </div>
                                                    <div className={`tab ${activeTab === 3 ? 'active' : ''}`} data-tab={3} onClick={() => handleTabClick(3)}>
                                                        Resin Colour
                                                    </div>
                                                    <div className={`tab ${activeTab === 4 ? 'active' : ''}`} data-tab={4} onClick={() => handleTabClick(4)}>
                                                        Flower Type
                                                    </div>
                                                    <div className={`tab ${activeTab === 5 ? 'active' : ''}`} data-tab={5} onClick={() => handleTabClick(5)}>
                                                        Material
                                                    </div>
                                                </div>
                                                <div className="col-md-6 filtered-content">
                                                    {activeTab === 1 && (
                                                        <div className="content">
                                                            {categories?.map((category, index) => (
                                                                <ul className="flex" key={index}>
                                                                    <input id={`category_${index}`} type="checkbox" checked={selectedCategories.includes(category.id)}
                                                                        onChange={() => handleCategorySelection(category.id)} />
                                                                    <label htmlFor={`category_${index}`}>
                                                                        <span />
                                                                        <li>{category.name}</li>
                                                                    </label>
                                                                </ul>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {activeTab === 2 && (
                                                        <div className="content">
                                                            {colors.map((color, index) => (
                                                                <ul className="flex" key={index}>
                                                                    <input id={`color_${index}`} type="checkbox" checked={selectedColors.includes(color.id)}
                                                                        onChange={() => handleColorSelection(color.id)} />
                                                                    <label htmlFor={`color_${index}`}>
                                                                        <span />
                                                                        <li>{color.name}</li> {/* Accessing 'name' property */}
                                                                    </label>
                                                                </ul>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {activeTab === 3 && (
                                                        <div className="content">
                                                            {ResinType.map((resin, index) => (
                                                                <ul className="flex" key={index}>
                                                                    <input id={`resin_${index}`} type="checkbox" checked={selectedResinTypes.includes(resin.id)}
                                                                        onChange={() => handleResinTypeSelection(resin.id)} />
                                                                    <label htmlFor={`resin_${index}`}>
                                                                        <span />
                                                                        <li>{resin.name}</li> {/* Accessing 'name' property */}
                                                                    </label>
                                                                </ul>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {activeTab === 4 && (
                                                        <div className="content">
                                                            {Flower.map((flower, index) => (
                                                                <ul className="flex" key={index}>
                                                                    <input id={`flower_${index}`} type="checkbox" checked={selectedFlowerTypes.includes(flower.id)}
                                                                        onChange={() => handleFlowerTypeSelection(flower.id)} />
                                                                    <label htmlFor={`flower_${index}`}>
                                                                        <span />
                                                                        <li>{flower.name}</li> {/* Accessing 'name' property */}
                                                                    </label>
                                                                </ul>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {activeTab === 5 && (
                                                        <div className="content">
                                                            {Material.map((material, index) => (
                                                                <ul className="flex" key={index}>
                                                                    <input id={`material_${index}`} type="checkbox" checked={selectedMaterials.includes(material.id)}
                                                                        onChange={() => handleMaterialSelection(material.id)} />
                                                                    <label htmlFor={`material_${index}`}>
                                                                        <span />
                                                                        <li>{material.name}</li> {/* Accessing 'name' property */}
                                                                    </label>
                                                                </ul>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {/* Add content for other tabs as needed */}
                                                </div>
                                            </div>
                                            <div className="product-clear-btns">
                                                <button className="clear-btn" onClick={() => handleShowResults()}>Clear All</button>
                                                <button className="result-btn" onClick={() => handleShowResults()}>show result </button>
                                            </div>
                                        </div>
                                        <div className="col-md-6 col-sm-8 col-xs-8 dropdown-list">
                                            <select className="form-select" aria-label="Default select example" value={filterCriteria} onChange={handleFilterChange} >
                                                <option value="All">All</option>
                                                <option value="New Arrivals">New Arrivals</option>
                                                <option value="Price: High to Low">Price: High to Low</option>
                                                <option value="Price: Low to High">Price: Low to High</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bootstrap Modal */}
                            <div className={`modal fade ${selectedProduct ? 'show' : ''}`} id="productModal" tabIndex="-1" role="dialog" aria-labelledby="productModalLabel" aria-hidden={!selectedProduct}>
                                <div className="modal-dialog modal-lg" role="document">
                                    <div className="modal-content">
                                        <div className="modal-body">
                                            {selectedProduct && (
                                                <>
                                                    <div id="poupProductimgs">
                                                        <div className="col-md-6">
                                                            <div className="two-columns-container">
                                                                <div className="left-slide">
                                                                    {selectedProduct.images.map((image, index) => (
                                                                        <div key={index} className={`mySlides ${index === 0 ? 'active' : ''}`}>
                                                                            <img src={`${image.url}`} alt="" />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="thumbs">
                                                                    <div className="row">
                                                                        {selectedProduct.images.map((image, index) => (
                                                                            <div key={index} className="column">
                                                                                <img
                                                                                    className="demo cursor"
                                                                                    src={`${image.url}`}
                                                                                    onClick={() => { }}
                                                                                    alt=""
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6 poup-product-view">
                                                            <div className="popup-product-name">
                                                                <h4 className="product-name">{selectedProduct.product_name}</h4>
                                                            </div>
                                                            <div className="popup-price">
                                                                <h4>{selectedProduct.price}</h4>
                                                            </div>
                                                            <p>{selectedProduct.short_description}</p>
                                                            <div className="popup-quantity-btn">
                                                                <div className="number">
                                                                    <span className="minus" onClick={decrement}>-</span>
                                                                    <input type="text" value={count} readOnly />
                                                                    <span className="plus" onClick={increment}>+</span>
                                                                </div>
                                                            </div>
                                                            <h5 className="popup-categories">{selectedProduct.category}</h5>
                                                            <Link href="/productdetails" className="popup-view-more-btn">
                                                                View More
                                                            </Link>
                                                            <button className="add-cart-btn">Add to Cart</button>
                                                        </div>
                                                    </div>
                                                    <button type="button" className="btn-close" aria-label="Close" onClick={closeModal}></button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* product list start */}
                            <div className="container">

                                <div className="productList">
                                    {filteredAndSortedProducts.length === 0 ? (
                                        <div className="loading-products-container modal-body text-center p-5">
                                            {isLoadingProducts ? <CircularProgress /> : 'Sorry, Product Not Found!'}
                                        </div>
                                    ) : (
                                        <div className="row">
                                            {filteredAndSortedProducts?.map((prdct) => {
                                                return (
                                                    <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12 product-container mt-4">
                                                        <div className="product-img-section">
                                                            <Link href={`/productdetails/${prdct.id}`}>
                                                                <img src={`${prdct?.images[0]?.url}`} alt="" className="product-img" height="320" />
                                                            </Link>
                                                            <img src={item.HeartImg} alt="" className="wishlist" />
                                                            <img src={item.ShoppBagImg} alt="" className="prodcut-cart" onClick={() => AddToCart(prdct)} />
                                                            <div className="view-btn">
                                                                <button
                                                                    onClick={() => handleQuickView(prdct)}
                                                                    className="quick-view "
                                                                    data-bs-toggle="modal"
                                                                    data-bs-target="#productModal"
                                                                >
                                                                    <i className={item.EyeIcon} /> {item.QuickViewText}
                                                                </button>
                                                            </div>
                                                            <div className="product-description">
                                                                <div className="customer-review">
                                                                    <i className={item.StarIcon} />
                                                                    <i className={item.StarIcon} />
                                                                    <i className={item.StarIcon} />
                                                                    <i className={item.StarIcon} />
                                                                    <i className={item.StarIcon} />
                                                                </div>
                                                                <Link href="/productdetails">
                                                                    <h4>{prdct?.product_name || prdct?.name}</h4>
                                                                </Link>
                                                                <div className="price">
                                                                    <h4>
                                                                        <i className={item.RupeeSignIcon} />
                                                                        {prdct?.discount_price || prdct?.price}
                                                                    </h4>
                                                                    {prdct?.discount_price && prdct?.price && (
                                                                        <del>
                                                                            <i className={item.RupeeSignIcon} />
                                                                            {prdct?.price}
                                                                        </del>
                                                                    )}
                                                                    {prdct?.discount_price && prdct?.price && (
                                                                        <h6>
                                                                            {/* Calculate discount percentage with proper rounding */}
                                                                            {calculateDiscountPercentage(prdct.price, prdct.discount_price).toFixed(2)}% off
                                                                        </h6>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>
            {/* product list ends */}
            {/* footer starts*/}
            <Footer />
            {/* lower footer ends */}
            {/* footer ends */}
        </>

    );
}

export default productlist;
