'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { useParams } from 'next/navigation';
import data from '../../../jsondata/ProductDetails.json';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { FRONTEND_CART_ENDPOINT, FRONTEND_PRODUCTS, FRONTEND_REVIEW } from 'src/utils/frontendAPIEndPoints';
import { useSession } from 'next-auth/react';
import { useSnackbar } from 'notistack';
import { CircularProgress } from '@mui/material';
import { getDecodedToken, productRating, getOnlyToken, productsHandleImageError, addToWishlistFn, addToCartFn, calculateDiscountPercentage, formatDateFn, setWishlistClass } from '../../../utils/frontendCommonFunction';

function ProductDetails() {
  const { enqueueSnackbar } = useSnackbar();
  const { data: session } = useSession()
  const [count, setCount] = useState(1); // Initialize count to 1
  const [productDetails, setProductDetails] = useState({}); // Initialize count to 1
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [reviewdata, setReviewData] = useState([]);
  let { id } = useParams();
  const [ratings, setRatings] = useState({});
  const user_token_data = getOnlyToken();
  const [wishlistClasses, setWishlistClasses] = useState({});
  const [mainImage, setMainImage] = useState("");

  const changeImage = (newImageUrl) => {
    setMainImage(newImageUrl);
  };

  const decodedlogtkn = getDecodedToken();
  const UserLoggedInID = decodedlogtkn && decodedlogtkn.data ? decodedlogtkn.data.id : '';

  const FetchProductDetails = async () => {
    try {
      setIsLoadingProducts(true);
      const response = await ManageAPIsData(`${FRONTEND_PRODUCTS}?id=${id}`, 'GET');
      if (!response.ok) {
        console.error('Error fetching data:', response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        const product = responseData.data[0];

        setProductDetails(product);
        setIsLoadingProducts(false);


        // Fetch rating for the single product
        const rating = await productRating(product.id);
        const ratingsMap = { [product.id]: rating };
        setRatings(ratingsMap);

        // Fetch Wishlist Class
        const classes = {};
        for (const product of responseData.data) {
          classes[product.id] = await setWishlistClass(product.id);
        }
        setWishlistClasses(classes);

      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setIsLoadingProducts(false);
    }
  };

  useEffect(() => {
    FetchProductDetails();
  }, [id])

  const increment = () => {
    setCount(count + 1);
  };
  const decrement = () => {
    if (count > 1) {
      // Ensure count doesn't go below 1
      setCount(count - 1);
    }
  };

  // Slideshow functions
  let slideIndex = 1;

  function currentSlide(n) {
    showSlides(slideIndex = n);
  }

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
    if (slides[slideIndex - 1]) {
      slides[slideIndex - 1].style.display = 'block';
      dots[slideIndex - 1].className += ' active';
      captionText.innerHTML = dots[slideIndex - 1]?.alt || '';
    }
  }

  useEffect(() => {
    const stars = document.querySelectorAll('.stars i');
    stars.forEach((star, index1) => {
      star.addEventListener('click', () => {
        stars.forEach((star, index2) => {
          index1 >= index2 ? star.classList.add('active') : star.classList.remove('active');
        });
      });
    });
    showSlides(slideIndex);
  }, [productDetails]);

  // productDetails

  // Add To Cart
  const addToCartProcess = async () => {
    var pstock = productDetails?.stock;
    var pid = productDetails?.id;
    addToCartFn(pstock, pid, count);
  };


  // Manage Review Section - Start

  const initialFormData = {
    user_id: UserLoggedInID,
    product_id: id,
    rating_no: 0,
    description: ''
  };

  const [formData, setFormData] = useState(initialFormData);

  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    rating_no: 0,
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(false);
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

  const resetStars = () => {
    const stars = document.querySelectorAll('.stars i');
    stars.forEach(star => star.classList.remove('active'));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    let errors = {};

    if (!formData.description.trim()) {
      errors.description = 'Please enter message';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setSubmitting(false);
    } else {
      try {
        const response = await ManageAPIsData(FRONTEND_REVIEW, 'POST', formData, user_token_data);
        if (!response.ok) {
          console.error("Error fetching data:", response.statusText);
          setSubmitting(false);
          return;
        }
        const responseData = await response.json();
        if (responseData.message) {
          setFormData(initialFormData);
          resetStars();
          setSubmitSuccess(true);
          setSubmitting(false);
          getReviewData();
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setSubmitting(false);
      }
    }
  };

  const handleStarClick = (rating) => {
    setFormData(prevState => ({
      ...prevState,
      rating_no: rating
    }));
  };

  // Fetch Review
  const getReviewData = async () => {
    try {
      const response = await ManageAPIsData(`${FRONTEND_REVIEW}?product_id=${id}`, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        // const limitedData = responseData.data.slice(0, 3);
        setReviewData(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getReviewData();
  }, []);

  // Manage Review Section - End

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

  return (
    <>
      <Header />
      {data?.ProductDetails?.map((item, index) => {
        return (
          <div id="home">

            <div id="productDetails">
              <div className="container">
                {isLoadingProducts ? (
                  <div className="container">
                    <div className="text-center ">
                      <CircularProgress />
                    </div>
                  </div>
                ) : (<>
                  <div className="row">
                    <div id="poupProductimgs">
                      <div className="col-md-8">
                        <div className="two-columns-container">
                          <div >
                            {/* {productDetails?.images?.map((image, index) => (
                              <div className="mySlides" key={index}>
                                <img className='-webkit-optimize-contrast' src={`${image.url}`} alt={`Slide ${index + 1}`} onError={productsHandleImageError} />
                              </div>
                            ))} */}
                            <div style={{ width: "100%", margin: "20px" }}>
                              <img
                                id="mainImage2"
                                src={mainImage || productDetails?.images?.[0]?.url}
                                alt="Main Product"
                                onError={productsHandleImageError}
                              />
                            </div>


                            <div className="caption-container">
                              <p id="caption">{productDetails?.long_description}</p>
                            </div>
                          </div>
                          <div >
                            <div className="row">
                              {/* {productDetails?.images?.map((image, index) => (
                                <div className="column" key={index}>
                                  <img
                                    className="demo cursor"
                                    src={`${image.url}`}
                                    onClick={() => currentSlide(index + 1)}
                                    onError={productsHandleImageError}
                                  />
                                </div>
                              ))} */}

                              {(productDetails?.images || []).map((image, index) => (
                                <div className="column" key={index}>
                                  <img
                                    key={index}
                                    src={image?.url || `/img/new-launch-${index + 1}.png`}
                                    className="demo cursor "
                                    onClick={() =>
                                      changeImage(image?.url || `/img/new-launch-${index + 1}.png`)
                                    }
                                    style={{ width: "500px", margin: "20px 10px" }}
                                    alt={`Thumbnail ${index + 1}`}
                                    onError={productsHandleImageError}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-4 product-details-section">
                      <div className="product-name">
                        <h4 style={{ float: 'left' }}>{productDetails?.product_name}</h4>
                        {/* <i className="far fa-heart filled-heart" id="heart" onClick={() => addToWishlistProcess(productDetails)}></i> */}
                        <i className={`${wishlistClasses[productDetails.id] || 'far'} fa-heart filled-heart`} id="heart" onClick={() => addToWishlistProcess(productDetails)}></i>

                      </div>

                      <div className="price">
                        <h4><i className="fa fa-inr" />{productDetails?.discount_price > 0 ? productDetails.discount_price : productDetails.price}</h4>
                        {(productDetails?.discount_price > 0) && <del><i className="fa fa-inr" />{productDetails?.price}</del>}
                        {productDetails?.discount_price > 0 && productDetails?.price && <h6>{calculateDiscountPercentage(productDetails.price, productDetails.discount_price).toFixed(2)}% off</h6>}
                      </div>

                      {productDetails.coming_soon === 1 ? (
                        <div>Availability: <span className="btn btn-warning btn-sm">Coming Soon</span></div>
                      ) : productDetails.coming_soon === 2 && (
                        productDetails.stock > productDetails.sell_stock ? (
                          <div>Availability: <span className="btn btn-success btn-sm">In Stock</span></div>
                        ) : (
                          <div>Availability: <span className="btn btn-danger btn-sm">Out Of Stock</span></div>
                        )
                      )}

                      <div className="product-customer-review">
                        {ratings[productDetails.id] > 0 && (
                          Array.from({ length: 5 }).map((_, i) => (
                            <i
                              key={i}
                              className={i < (ratings[productDetails.id] || 0) ? 'fa-solid fa-star' : 'fa fa-star-o'}
                            />
                          ))
                        )}
                      </div>
                      <p>{productDetails?.long_description}</p>
                      <div className="product-quantity-btn">

                        {productDetails.coming_soon === 2 && productDetails.stock > productDetails.sell_stock && (
                          <div className="number">
                            <span className="minus" onClick={decrement}>-</span>
                            <input type="text" value={count} readOnly />
                            <span className="plus" onClick={increment}>+</span>
                          </div>
                        )}

                        {productDetails.coming_soon === 2 && productDetails.stock > productDetails.sell_stock && (
                          <button className="add-cart-btn" onClick={() => addToCartProcess()}>Add to Cart</button>
                        )}


                      </div>
                      <div className="product-detail-table">
                        <h5>Product Details</h5>
                        <div className="detail-table">
                          <ul>
                            <li>Category: {productDetails?.category}</li>
                            <li>Material: {productDetails?.inner_material_name}</li>
                            <li>Model Number: {productDetails?.model_number}</li>
                          </ul>
                        </div>
                      </div>
                      <div className="about-product-item">
                        <h5>About This Item</h5>
                        <ul>
                          <li>{productDetails?.long_description}</li>
                        </ul>
                      </div>
                      <div className="product-info">
                        <h5>Additional Information</h5>
                        <div className="detail-table">
                          <ul>
                            <li>Weight: {productDetails?.weight}</li>
                            <li>Manufacturer: {productDetails?.manufacturer}</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
                )}
              </div>
            </div>

            <div id="productSpecifications">
              <div className="container">
                <div className="row">
                  <div className="category-head py-5">
                    <div className="heading text-center">
                      <h1 className="display-6 desktop-text-tile-left">
                        {item.ProductSpecifications}
                      </h1>
                    </div>
                    <div className="category-head-border d-flex ">
                      <div className="category-line" />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <p>{productDetails?.long_description}</p>
                    <table className="table">
                      <tbody>
                        <tr>
                          <td>{item.Availability}</td>
                          <td>
                            {productDetails.coming_soon === 1 ? (
                              <span className="btn btn-warning btn-sm">Coming Soon</span>
                            ) : productDetails.coming_soon === 2 && (
                              productDetails.stock > productDetails.sell_stock ? (
                                <span className="btn btn-success btn-sm">In Stock</span>
                              ) : (
                                <span className="btn btn-danger btn-sm">Out Of Stock</span>
                              )
                            )}
                          </td>
                        </tr>
                        <tr>
                          <td>{item.Weight}</td>
                          <td>{productDetails?.weight}</td>
                        </tr>
                        <tr>
                          <td>{item.Stone}</td>
                          <td>{productDetails?.inner_material_name}</td>
                        </tr>
                        <tr>
                          <td>{item.Material}</td>
                          <td>{item.SterlingSilver}</td>
                        </tr>
                        <tr>
                          <td>{item.RingSize}</td>
                          <td>{productDetails?.category}</td>
                        </tr>
                        <tr>
                          <td>{item.ModuleNumber}</td>
                          <td>{productDetails?.model_number}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-6">
                    <img src={item.SpecificationImg} alt="" />
                  </div>
                </div>
              </div>
            </div>

            {productDetails.coming_soon === 2 && productDetails.stock > productDetails.sell_stock && (
              <div id="productReviews">
                <div className="container">
                  <div className="row">
                    <div className="category-head">
                      <div className="heading text-center">
                        <h1 className="display-6  desktop-text-tile-left">{item.Reviews} ({reviewdata && reviewdata.length})</h1>
                      </div>
                      <div className="category-head-border d-flex ">
                        <div className="category-line" />
                      </div>
                    </div>

                    <div className={UserLoggedInID ? 'col-md-12' : 'col-md-12'}>
                      {reviewdata && reviewdata.length > 0 ? (
                        reviewdata.map((reviewdatas, index) => {

                          const rating = Math.max(0, Math.min(reviewdatas.rating_no, 5));

                          return (
                            <div key={reviewdatas.id} className='mb-5'>
                              <div className="product-clinet-review">
                                <div className="customer">
                                  <img src={reviewdatas.gender === 1 ? '/img/men-avatar.png' : reviewdatas.gender === 2 ? '/img/women-avatar.png' : '/img/noimg.png'} alt="Avatar" />
                                  <div className="client-name">
                                    <div className="client-reviw-section">
                                      <h6>{reviewdatas.first_name} {reviewdatas.last_name}</h6>
                                      <div>Review Date: {formatDateFn(reviewdatas.created_at)}</div>
                                      <div style={{ fontSize: "13px" }}>Order Date: {formatDateFn(reviewdatas.invoice_date)}</div>
                                      <div className="client-review-icon">
                                        {[...Array(5)].map((_, i) => (
                                          <i
                                            key={i}
                                            className={i < rating ? "fa fa-star" : "notfl fa fa-star-o"}
                                          />
                                        ))}
                                      </div>
                                      <p>{reviewdatas.description}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div><center>Sorry, Records Not Found.</center></div>
                      )}
                    </div>
                    {/* {UserLoggedInID && (
                      <div className="col-md-6 review-form-section">
                        <h5>{item.AddReview}</h5>
                        <div className="flex">
                          <h6>{item.YourRating}</h6>
                          <div className="rating-box">
                            <div className="stars">
                              {[1, 2, 3, 4, 5].map(star => (
                                <i
                                  key={star}
                                  className={`fa fa-star${formData.rating_no >= star ? '' : ''}`}
                                  onClick={() => handleStarClick(star)}
                                  style={{ cursor: 'pointer' }}
                                />
                              ))}
                            </div>
                          </div>

                          <form onSubmit={handleSubmit} className="needs-validation" noValidate>
                            <div className="mb-3">
                              <label htmlFor="message" className="form-label">Message:</label>
                              <textarea placeholder='Enter ...' name="description" value={formData.description} onChange={handleChange} className={`form-control ${formErrors.description && 'is-invalid'}`} id="description" required />
                              <div className="invalid-feedback">
                                {formErrors.description}
                              </div>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
                          </form>
                          {submitSuccess && <p className="text-success mt-3">Form successfully submitted</p>}
                        </div>
                      </div>
                    )} */}

                  </div>
                </div>
              </div>
            )}


          </div >
        );
      })}

      <Footer />
    </>
  );
}

export default ProductDetails;
