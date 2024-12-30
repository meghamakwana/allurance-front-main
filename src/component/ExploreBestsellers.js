'use client';
// import React from 'react'
import React, { useEffect } from 'react';
import { useState } from 'react';
import data from '../jsondata/ExploreBestsellers.json';
import Link from 'next/link';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { FRONTEND_CART_ENDPOINT, FRONTEND_PRODUCTS, FRONTEND_WISHLIST } from 'src/utils/frontendAPIEndPoints';
import { useSession } from 'next-auth/react';
import { enqueueSnackbar } from 'notistack';
import CircularProgress from '@mui/material/CircularProgress';
import defaultImg from "../../public/img/new-launch-1.png"
import { getDecodedToken, productRating, addToWishlistFn, productsHandleImageError, addToCartFn, calculateDiscountPercentage, setWishlistClass } from '../utils/frontendCommonFunction';

function ExploreBestsellers() {
  const { data: session } = useSession();
  const [count, setCount] = useState(1); // Initialize count to 1
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [ratings, setRatings] = useState({});
  const [wishlistClasses, setWishlistClasses] = useState({});
  const [mainImage, setMainImage] = useState(selectedProduct?.images?.[0]?.url);


  const decodedlogtkn = getDecodedToken();
  const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };
  let slideIndex = 1;
  function currentSlide(n) {
    showSlides((slideIndex = n));
  }

  const handleQuickView = (product) => {
    setCount(1);
    setSelectedProduct(product);

  };
  const changeImage = (newImageUrl) => {
    setMainImage(newImageUrl);
  };
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

  const FetchBestSellers = async () => {
    setIsLoadingProducts(true);
    try {
      const response = await ManageAPIsData(`${FRONTEND_PRODUCTS}?bestseller=1`, 'GET');
      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        const limitedData = responseData.data.slice(0, 6);
        setProducts(limitedData);

        // Fetch ratings for each product
        const ratingsPromises = limitedData.map(async (product) => {
          const rating = await productRating(product.id);
          return { id: product.id, rating };
        });
        const ratingsData = await Promise.all(ratingsPromises);
        const ratingsMap = ratingsData.reduce((acc, { id, rating }) => {
          acc[id] = rating;
          return acc;
        }, {});
        setRatings(ratingsMap);

        // Fetch Wishlist Class
        const classes = {};
        for (const product of limitedData) {
          classes[product.id] = await setWishlistClass(product.id);
        }
        setWishlistClasses(classes);

        // setProducts(responseData.data);
        setIsLoadingProducts(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoadingProducts(false);
    }
  };

  const closeModal = () => {
    // Get the modal element
    const modal = document.getElementById('productModal1');
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


  useEffect(() => {
    FetchBestSellers();
    // showSlides(slideIndex);
    let thumbnails = document.querySelectorAll('.demo');
    thumbnails.forEach(function (thumbnail, index) {
      thumbnail.addEventListener('click', function () {
        currentSlide(index + 1);
      });
    });
  }, []);

  console.log("Products", selectedProduct?.images?.[0]?.url);

  return (
    <>
      <section>
        {data?.ExploreBestsellers?.map((item, index) => {
          return (
            <React.Fragment key={`item-${index}`}>
              <div className="title-justify-space-between">
                <div className="container">
                  <div className="popular-head">
                    <div className="text d-flex">
                      <h1 className="display-5" style={{ fontWeight: 300 }}>
                        {item.ExploreText}
                      </h1>
                      <h1 className="display-5 fw-normal px-3" style={{ fontWeight: 500 }}>
                        {item.BestsellersText}
                      </h1>
                    </div>
                    <div className="border-line text-center">
                      <div className={item.BestsellersTextLine} />
                    </div>
                  </div>

                  {products && products.length > 4 && (
                    <div className="View-all-btn">
                      <div className="view-all-btn-1">
                        <Link href="/productlist" className="text-dark text-decoration-none">
                          {item.ViewAllText} <img src={item.GreaterThanSymbolIImg} alt="" />
                        </Link>
                      </div>
                      <div className={item.ViewAllLine} />
                    </div>
                  )}

                </div>
              </div>
              <div className="productList">
                <div className="container ">
                  <div className="row">
                    {isLoadingProducts ? (
                      <div className="modal-body text-center">
                        <CircularProgress />
                      </div>
                    ) : (
                      products?.map((prdct) => {
                        return (
                          <div className="col-lg-3 col-md-6 col-sm-12 col-xs-12 product-container">
                            <Link href="/productdetails"></Link>
                            <div className="product-img-section">
                              {/* <Link href="/productdetails"> */}
                              <Link href={`/productdetails/${prdct.id}`}>
                                <img src={`${prdct?.images[0]?.url}`} alt="" className="product-img" height="320" onError={productsHandleImageError} />
                              </Link>
                              {/* <img} src={item.HeartImg alt="" className="wishlist" /> */}
                              {/* <img src="/img/heart.png" alt="" className="wishlist" onClick={() => addToWishlistProcess(prdct)} /> */}
                              <i className={`${wishlistClasses[prdct.id] || 'far'} fa-heart filled-heart wishlist`} onClick={() => addToWishlistProcess(prdct)}></i>
                              {prdct.coming_soon === 2 && prdct.stock > prdct.sell_stock && (
                                <img src={item.ShoppBagImg} alt="" className="prodcut-cart" onClick={() => shoppBagCart(prdct)} />
                              )}
                              <div className="view-btn">
                                <button
                                  onClick={() => handleQuickView(prdct)}
                                  className="quick-view "
                                  data-bs-toggle="modal"
                                  data-bs-target="#productModal1"
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
                      })
                    )}
                    {/* Bootstrap Modal */}
                    <div className={`modal fade ${selectedProduct ? 'show' : ''}`} id="productModal1" tabIndex="-1" role="dialog" aria-labelledby="productModalLabel" aria-hidden={!selectedProduct}>
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
                                    {selectedProduct.coming_soon === 2 && (
                                      <div className="price" style={{ marginLeft: "-30px", marginTop: "10px", gap: "0px" }}><h4><i className="fa fa-inr" />{selectedProduct?.discount_price > 0 ? selectedProduct.discount_price : selectedProduct.price}</h4>
                                        {(selectedProduct?.discount_price > 0) && <del><i className="fa fa-inr" />{selectedProduct?.price}</del>}
                                        {selectedProduct?.discount_price > 0 && selectedProduct?.price && <h6>{calculateDiscountPercentage(selectedProduct.price, selectedProduct.discount_price).toFixed(2)}% off</h6>}
                                      </div>
                                    )}

                                    {selectedProduct.coming_soon === 1 ? (
                                      <div>Availability: <span className="btn btn-warning btn-sm">Coming Soon</span></div>
                                    ) : selectedProduct.coming_soon === 2 && (
                                      selectedProduct.stock > selectedProduct.sell_stock ? (
                                        <div>Availability: <span className="btn btn-success btn-sm">In Stock</span></div>
                                      ) : (
                                        <div>Availability: <span className="btn btn-danger btn-sm">Out Of Stock</span></div>
                                      )
                                    )}
                                    <div className="">
                                      {ratings[selectedProduct.id] > 0 && (
                                        Array.from({ length: 5 }).map((_, i) => (
                                          <i
                                            key={i}
                                            className={i < (ratings[selectedProduct.id] || 0) ? 'fa-solid fa-star' : 'fa fa-star-o'}
                                          />
                                        ))
                                      )}
                                    </div>
                                    <p>{selectedProduct.short_description}</p>

                                    {selectedProduct.coming_soon === 2 && selectedProduct.stock > selectedProduct.sell_stock && (
                                      <div className="popup-quantity-btn">
                                        <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
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

                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </section>
    </>
  );
}

export default ExploreBestsellers;
