'use client';
import React from 'react';
import { useState } from 'react';
import data from '../../jsondata/productlist.json';
import Link from 'next/link';
import { useEffect } from 'react';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import '../../../public/css/style.css';
import '../../../public/css/responsive.css';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { FRONTEND_CART_ENDPOINT, FRONTEND_CATEGORY, FRONTEND_PRODUCTS } from 'src/utils/frontendAPIEndPoints';
import { enqueueSnackbar } from 'notistack';
import { useSession } from 'next-auth/react';
import CircularProgress from '@mui/material/CircularProgress';
import { BEZELMATERIAL_ENDPOINT, COLORSHADE_ENDPOINT, FLOWER_ENDPOINT, RESINTYPE_ENDPOINT, WISHLIST_ENDPOINT } from 'src/utils/apiEndPoints';
import { useParams } from 'next/navigation';
import defaultImg from "../../../public/img/new-launch-1.png"
import { getDecodedToken, productRating, addToWishlistFn, addToCartFn, productsHandleImageError, calculateDiscountPercentage, setWishlistClass } from '../../utils/frontendCommonFunction';
import styled from 'styled-components';

function productlist() {
  const { keyword } = useParams();

  const { data: session } = useSession()
  const [filterCriteria, setFilterCriteria] = useState('Best Matches');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [count, setCount] = useState(1); // Initialize count to 1
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [FilteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState(1); // State to track active tab
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [ResinType, setResinType] = useState([]);
  const [Flower, setFlower] = useState([]);
  const [Material, setMaterial] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]); // State for selected categories
  const [selectedColors, setSelectedColors] = useState([]); // State for selected colors
  const [selectedResinTypes, setSelectedResinTypes] = useState([]); // State for selected resin types
  const [selectedFlowerTypes, setSelectedFlowerTypes] = useState([]); // State for selected flower types
  const [selectedMaterials, setSelectedMaterials] = useState([]); // State for selected materials
  const [ratings, setRatings] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [wishlistClasses, setWishlistClasses] = useState({});
  const [mainImage, setMainImage] = useState("");

  const ThemeCheckbox = styled.input`
  width: 17px;
  height: 17px;
  margin-right: 8px;
  &:checked {
    accent-color: #781028;
  }
`;


  const changeImage = (newImageUrl) => {
    setMainImage(newImageUrl);
  };
  const decodedlogtkn = getDecodedToken();
  const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const keywordParam = queryParams.get('keyword');
    if (keywordParam) {
      setTimeout(() => {
        setSearchTerm(keywordParam);
        filterProducts(keywordParam);
      }, 100);
    } else {
      setFilteredProducts(products);
    }
  }, [products]);

  useEffect(() => {
    filterProducts(searchTerm);
  }, [searchTerm]);

  const filterProducts = (term) => {
    if (!term) {
      setFilteredProducts(products);
      return;
    }
    const filtered = products.filter((product) => {
      const productName = product.product_name ? product.product_name.toLowerCase() : '';
      const category = product.category ? product.category.toLowerCase() : '';
      const bezelColor = product.bezel_color ? product.bezel_color.toLowerCase() : '';

      return productName.includes(term.toLowerCase()) ||
        category.includes(term.toLowerCase()) ||
        bezelColor.includes(term.toLowerCase());
    });

    setFilteredProducts(filtered);
  };

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 1) {
      // Ensure count doesn't go below 1
      setCount(count - 1);
    }
  };
  let slideIndex = 1; // Define slideIndex globally within the component

  function currentSlide(n) {
    showSlides((slideIndex = n));
  }

  const handleQuickView = (product) => {
    setCount(1);
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
  const handleClearAll = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedResinTypes([]);
    setSelectedFlowerTypes([]);
    setSelectedMaterials([]);
    setFilteredProducts(products);
  }

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
    // Get the modal element
    const modal = document.getElementById('productModal');
    if (modal) {
      // Hide the modal
      modal.classList.remove('show');
      modal.setAttribute('aria-hidden', 'true');
      modal.style.display = 'none';
    }

    // Remove modal backdrop if exists
    const backdrops = document.getElementsByClassName('modal-backdrop');
    while (backdrops.length > 0) {
      backdrops[0].parentNode.removeChild(backdrops[0]);
    }

    // Remove `modal-open` class and reset scrolling
    document.body.classList.remove('modal-open');
    document.body.style.overflow = ''; // Reset overflow
    document.body.style.paddingRight = ''; // Reset padding-right if added for scrollbar compensation
  };




  const FetchBestSellers = async () => {
    setIsLoadingProducts(true);
    try {
      var response;
      if (keyword) {
        response = await ManageAPIsData(`${FRONTEND_PRODUCTS}?keyword=${keyword}`, 'GET');
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

        // Fetch ratings for each product
        const ratingsPromises = responseData.data.map(async (product) => {
          const rating = await productRating(product.id);
          return { id: product.id, rating };
        });
        const ratingsData = await Promise.all(ratingsPromises);
        const ratingsMap = ratingsData.reduce((acc, { id, rating }) => {
          acc[id] = rating;
          return acc;
        }, {});
        setRatings(ratingsMap);


        setFilteredProducts(responseData.data);

        // Fetch Wishlist Class
        const classes = {};
        for (const product of responseData.data) {
          classes[product.id] = await setWishlistClass(product.id);
        }
        setWishlistClasses(classes);

        setIsLoadingProducts(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    FetchBestSellers();
    // showSlides(slideIndex);

    let thumbnails = document.querySelectorAll('.demo');
    thumbnails.forEach(function (thumbnail, index) {
      thumbnail.addEventListener('click', function () {
        currentSlide(index + 1);
      });
    });
  }, [keyword]);

  // Bag To Cart
  function shoppBagCart(prdct) {
    var pstock = prdct?.stock;
    var pid = prdct?.id;
    addToCartFn(pstock, pid, 1);
  }

  // Add To Cart
  const addToCartProcess = async (productDetails, qty) => {
    var pstock = productDetails?.stock;
    var pid = productDetails?.id;
    addToCartFn(pstock, pid, qty);
  };


  // Add To Wishlist
  const addToWishlistProcess = async (productDetails) => {
    var pid = productDetails?.id;
    var cartIcon = await addToWishlistFn(pid);

    // Change Wishlist Class
    if (cartIcon === 2) {
      setWishlistClasses(prevClasses => ({ ...prevClasses, [pid]: 'far' }));
    } else if (cartIcon === 1) {
      setWishlistClasses(prevClasses => ({ ...prevClasses, [pid]: 'fas' }));
    }

  };

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

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };


  return (
    <>
      <div id="home">
        <Header />
        {data?.productlist?.map((item, index) => {
          return (
            <React.Fragment key={`item-${index}`}>
              <div id="productListBanner">
                <div className="row">
                  <div className="col-md-12">
                    <img src={item.BannerImg} alt="" />
                  </div>
                </div>
              </div>

              {/* filter product ends */}
              <div id="filterProduct">
                <div className="container">
                  <div className="row align-items-center">
                    <div className="col-md-3 col-sm-4 col-xs-4">
                      <button className="filterBtn">
                        <img src="/img/filter-btn-product-list.png" alt="Filter Button Icon" />
                        Filter By
                        <img src="/img/down-chevron.png" alt="Down Chevron Icon" />
                      </button>
                    </div>
                    <div className="col-md-9 col-sm-8 col-xs-8 dropdown-list">
                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          placeholder="Search ..."
                          value={searchTerm}
                          onChange={handleSearch}
                          className="form-control me-2"
                        />
                        <select
                          className="form-select"
                          aria-label="Default select example"
                          value={filterCriteria}
                          onChange={handleFilterChange}
                          style={{ padding: "10px" }}
                        >
                          <option value="All">All</option>
                          <option value="New Arrivals">New Arrivals</option>
                          <option value="Price: High to Low">Price: High to Low</option>
                          <option value="Price: Low to High">Price: Low to High</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div id="sidebar" className="closed">
                    <div className="row" style={{ paddingLeft: "10px" }}>
                      <div className="sidebar-header d-flex justify-content-between">
                        <div>
                          <img src="/img/filter-btn-product-list.png" alt="Filter Button Icon" />
                          Filter By
                        </div>
                        <div className="close-icon">
                          <i className="fa-solid fa-xmark" />
                        </div>
                      </div>
                      <div className="col-md-6 filter-list">
                        {['Category', 'Color', 'Resin Colour', 'Flower Type', 'Material'].map((label, inde) => (
                          <div
                            key={inde}
                            className={`tab ${activeTab === inde + 1 ? 'active' : ''}`}
                            data-tab={inde + 1}
                            onClick={() => handleTabClick(inde + 1)}
                          >
                            <span style={{ fontSize: "16px" }}>{label}</span>
                          </div>
                        ))}
                      </div>
                      <div className="col-md-6 filtered-content">
                        {activeTab === 1 && (
                          <div className="content">
                            <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {categories?.map((category, index) => (
                                <li
                                  key={category.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "15px", // Smaller text size
                                  }}
                                >
                                  <ThemeCheckbox
                                    id={`category_${index}`}
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => handleCategorySelection(category.id)}

                                  />
                                  <label htmlFor={`category_${index}`} style={{ cursor: "pointer" }}>
                                    {category.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeTab === 2 && (
                          <div className="content">
                            <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {colors.map((color, index) => (
                                <li
                                  key={color.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "15px", // Smaller text size
                                  }}
                                >
                                  <ThemeCheckbox
                                    id={`color_${index}`}
                                    type="checkbox"
                                    checked={selectedColors.includes(color.id)}
                                    onChange={() => handleColorSelection(color.id)}

                                  />
                                  <label htmlFor={`color_${index}`} style={{ cursor: "pointer" }}>
                                    {color.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeTab === 3 && (
                          <div className="content">
                            <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {ResinType.map((resin, index) => (
                                <li
                                  key={resin.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "15px", // Smaller text size
                                  }}
                                >
                                  <ThemeCheckbox
                                    id={`resin_${index}`}
                                    type="checkbox"
                                    checked={selectedResinTypes.includes(resin.id)}
                                    onChange={() => handleResinTypeSelection(resin.id)}
                                  />
                                  <label htmlFor={`resin_${index}`} style={{ cursor: "pointer" }}>
                                    {resin.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {activeTab === 4 && (
                          <div className="content">
                            <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {Flower.map((flower, index) => (
                                <li
                                  key={flower.id}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    fontSize: "15px", // Smaller text size
                                  }}
                                >
                                  <ThemeCheckbox
                                    id={`flower_${index}`}
                                    type="checkbox"
                                    checked={selectedFlowerTypes.includes(flower.id)}
                                    onChange={() => handleFlowerTypeSelection(flower.id)}
                                  />
                                  <label htmlFor={`flower_${index}`} style={{ cursor: "pointer" }}>
                                    {flower.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {activeTab === 5 && (
                          <div className="content">
                            <ul style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {Material.map((material, index) => (
                                <li key={material.id} style={{ display: "flex", alignItems: "center", fontSize: "15px" }}>
                                  <ThemeCheckbox
                                    id={`material_${index}`}
                                    type="checkbox"
                                    checked={selectedMaterials.includes(material.id)}
                                    onChange={() => handleMaterialSelection(material.id)}
                                  />
                                  <label htmlFor={`material_${index}`} style={{ cursor: "pointer" }}>
                                    {material.name}
                                  </label>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      </div>
                    </div>
                    <div className="product-clear-btns d-flex justify-content-around">
                      <button className="clear-btn" onClick={() => handleClearAll()}>
                        Clear All
                      </button>
                      <button className="result-btn" onClick={() => handleShowResults()}>
                        Show Result
                      </button>
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
                                {/* 
                                      <div className="left-slide">
                                        {selectedProduct.images.map((image, index) => (
                                          <div key={index} className={`mySlides ${index === 0 ? 'active' : ''}`}>
                                            <img src={`${image.url}`} alt="" />
                                          </div>
                                        ))}
                                      </div>
                                      */}
                                <div style={{ width: "100%" }}>
                                  <img
                                    id="mainImage2"
                                    src={mainImage || selectedProduct?.images?.[0]?.url}
                                    className="img-fluid w-100"
                                    alt="Main Product"
                                    onError={(e) => e.target.src = defaultImg}
                                    style={{ objectFit: "cover", height: "250px", width: "100px" }}
                                  />
                                </div>
                                <div className="" >
                                  <div className="row">
                                    {selectedProduct.images.length > 0 && (
                                      <div key={index} className="">
                                        {/* <img
                                                onError={productsHandleImageError}
                                                className="demo cursor"
                                                src={`${selectedProduct.images[0].url}`}
                                                onClick={() => { }}
                                                alt=""
                                                style={{
                                                  width: '100%',
                                                  height: 'auto',
                                                  opacity: 1
                                                }}
                                              /> */}


                                        <div >
                                          {(selectedProduct?.images || []).map((image, index) => (
                                            <img
                                              key={index}
                                              src={image?.url || `/img/new-launch-${index + 1}.png`}
                                              className="img-fluid thumbnail w-75"
                                              onClick={() =>
                                                changeImage(image?.url || `/img/new-launch-${index + 1}.png`)
                                              }
                                              alt={`Thumbnail ${index + 1}`}
                                              onError={(e) => e.target.src = defaultImg}
                                              style={{ objectFit: "cover", height: "80px", margin: "10px" }}
                                            />
                                          ))}
                                        </div>


                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-md-6 poup-product-view" style={{ marginLeft: "30px" }}>
                              <div className="popup-product-name">
                                <h4 className="product-name">{selectedProduct.product_name}</h4>
                                {/* <i className="far fa-heart filled-heart" id="heart" onClick={() => addToWishlistProcess(selectedProduct)}></i> */}
                                <i className={`${wishlistClasses[selectedProduct.id] || 'far'} fa-heart filled-heart`} id="heart" onClick={() => addToWishlistProcess(selectedProduct)}></i>
                              </div>
                              <div className="price">
                                <h4><i className="fa fa-inr" />{selectedProduct?.discount_price > 0 ? selectedProduct.discount_price : selectedProduct.price}</h4>
                                {(selectedProduct?.discount_price > 0) && <del><i className="fa fa-inr" />{selectedProduct?.price}</del>}
                                {selectedProduct?.discount_price > 0 && selectedProduct?.price && <h6>{calculateDiscountPercentage(selectedProduct.price, selectedProduct.discount_price).toFixed(2)}% off</h6>}
                              </div>

                              {selectedProduct.coming_soon === 1 ? (
                                <div>Availability: <span className="btn btn-warning btn-sm">Coming Soon</span></div>
                              ) : selectedProduct.coming_soon === 2 && (
                                selectedProduct.stock > selectedProduct.sell_stock ? (
                                  <div>Availability: <span className="btn btn-success btn-sm">In Stock</span></div>
                                ) : (
                                  <div>Availability: <span className="btn btn-danger btn-sm">Out Of Stock</span></div>
                                )
                              )}

                              <div className='starcolor'>
                                {ratings[selectedProduct.id] > 0 && (
                                  Array.from({ length: 5 }).map((_, i) => (
                                    <i
                                      key={i}
                                      className={i < (ratings[selectedProduct.id] || 0) ? 'fa-solid fa-star' : 'fa fa-star-o'}
                                    />
                                  ))
                                )}
                              </div>
                              <p>Descriptions: {selectedProduct.short_description}</p>

                              {selectedProduct.coming_soon === 2 && selectedProduct.stock > selectedProduct.sell_stock && (
                                <div className="popup-quantity-btn">
                                  <div className="number">
                                    <span className="minus" onClick={decrement}>-</span>
                                    <input type="text" value={count} readOnly />
                                    <span className="plus" onClick={increment}>+</span>
                                  </div>
                                </div>
                              )}

                              {selectedProduct.category && (<h6 className="popup-categories">Categories: {selectedProduct.category}</h6>)}
                              <Link href={`/productdetails/${selectedProduct.id}`} className="popup-view-more-btn" onClick={closeModal}>
                                View More
                              </Link>
                              {selectedProduct.coming_soon === 2 && selectedProduct.stock > selectedProduct.sell_stock && (
                                <button className="add-cart-btn" onClick={() => addToCartProcess(selectedProduct, count)}>Add to Cart</button>
                              )}

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
                    <div className="loading-products-container modal-body text-center">
                      {isLoadingProducts ? <CircularProgress /> : 'Sorry, Product Not Found!'}
                    </div>
                  ) : (
                    <div className="row">
                      {filteredAndSortedProducts?.map((prdct) => {
                        return (
                          <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12 product-container">
                            <div className="product-img-section">
                              {/* <Link href="/productdetails"> */}
                              <Link href={`/productdetails/${prdct.id}`}>
                                <img src={`${prdct?.images[0]?.url}`} alt="" className="product-img" height="320" onError={productsHandleImageError} />
                              </Link>
                              {/* <img src={item.HeartImg} alt="" className="wishlist" onClick={() => addToWishlistProcess(prdct)} /> */}
                              <i className={`${wishlistClasses[prdct.id] || 'far'} fa-heart filled-heart wishlist`} onClick={() => addToWishlistProcess(prdct)}></i>
                              {prdct.coming_soon === 2 && prdct.stock > prdct.sell_stock && (
                                <img src={item.ShoppBagImg} alt="" className="prodcut-cart" onClick={() => shoppBagCart(prdct)} />
                              )}

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
                                  {ratings[prdct.id] > 0 && (
                                    Array.from({ length: 5 }).map((_, i) => (
                                      <i
                                        key={i}
                                        className={i < (ratings[prdct.id] || 0) ? 'fa-solid fa-star' : 'fa fa-star-o'}
                                      />
                                    ))
                                  )}
                                </div>
                                <Link href={`/productdetails/${prdct.id}`}>
                                  <h4>{prdct?.product_name}</h4>
                                </Link>
                                {prdct.coming_soon === 2 && (
                                  <div className="price">
                                    <h4><i className="fa fa-inr" />{prdct?.discount_price > 0 ? prdct.discount_price : prdct.price}</h4>
                                    {(prdct?.discount_price > 0) && <del><i className="fa fa-inr" />{prdct?.price}</del>}
                                    {prdct?.discount_price > 0 && prdct?.price && <h6>{calculateDiscountPercentage(prdct.price, prdct.discount_price).toFixed(2)}% off</h6>}
                                  </div>
                                )}

                                {prdct.coming_soon === 1 ? (
                                  <div className='textcenter'><span className="btn btn-warning btn-sm">Coming Soon</span></div>
                                ) : prdct.coming_soon === 2 && (
                                  prdct.stock > prdct.sell_stock ? (
                                    <div className='textcenter'><span className="btn btn-success btn-sm">In Stock</span></div>
                                  ) : (
                                    <div className='textcenter'><span className="btn btn-danger btn-sm">Out Of Stock</span></div>
                                  )
                                )}


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
      </div >
      {/* product list ends */}
      {/* footer starts*/}
      <Footer />
      {/* lower footer ends */}
      {/* footer ends */}
    </>

  );
}

export default productlist;
