'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from 'src/component/Header';
import ProfileListView from 'src/component/ProfileListView';
import Footer from 'src/component/Footer';
import { FRONTEND_CART_ENDPOINT, FRONTEND_WISHLIST } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import { getUserLoginSession, getDecodedToken, getMyWishlistData, deleteMyWishlistData, productsHandleImageError, productRating, addToCartFn, calculateDiscountPercentage } from "../../utils/frontendCommonFunction";
import { enqueueSnackbar } from 'notistack';
import { useRouter } from 'next/navigation';
import { Card, CardMedia, CardContent, Typography, Button, Rating } from '@mui/material';

function Wishlist() {
  const router = useRouter();
  const [decodedToken, setDecodedToken] = useState(null);
  const [wishlistData, setWishlistData] = useState([]);
  const [ratings, setRatings] = useState({});

  useEffect(() => {
    const decodedToken = getDecodedToken();
    if (!decodedToken || !decodedToken.data || !decodedToken.data.id) {
      enqueueSnackbar("Something went wrong! Please log in to continue.", { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedToken);
  }, [router]);

  const isUserLoggedIn = decodedToken?.data?.id;

  // Fetch Wishlist Data
  const fetchData = useCallback(async () => {
    if (isUserLoggedIn) {
      try {
        const data1 = await getMyWishlistData(isUserLoggedIn);
        setWishlistData(data1);

        // Fetch ratings for each product
        const ratingsPromises = data1.map(async (product) => {
          const rating = await productRating(product.id);
          return { id: product.id, rating };
        });
        const ratingsData = await Promise.all(ratingsPromises);
        const ratingsMap = ratingsData.reduce((acc, { id, rating }) => {
          acc[id] = rating;
          return acc;
        }, {});
        setRatings(ratingsMap);

      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    }
  }, [isUserLoggedIn]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Remove wishlist
  const removeWishlist = async (rowID) => {
    const responseData = await deleteMyWishlistData(rowID);
    if (responseData.message) {
      setWishlistData(prevData => prevData.filter(item => item.wid !== rowID));
      enqueueSnackbar("Product successfully removed from the wishlist.", { variant: 'success' });
    }
  };

  // Add To Cart
  const addToCartProcess = async (productDetails, qty) => {
    var pstock = productDetails?.stock;
    var pid = productDetails?.id;
    addToCartFn(pstock, pid, qty);
  };

  return (
    <>
      <Header />
      <div id="myProfile">
        <div className="container">
          <div className="row">
            <ProfileListView />

            {wishlistData && wishlistData.length > 0 ? (
              wishlistData.map((wishlistDatas, index) => (
                <div className="col-md-3 margin-left" key={wishlistDatas.id}>
                  <Card sx={{ maxWidth: 345, boxShadow: 3, borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
                    <CardMedia
                      component="img"
                      height="320"
                      image={wishlistDatas?.images[0]?.url}
                      alt={wishlistDatas?.product_name}
                      onError={productsHandleImageError}
                    />
                    <CardContent>
                      <div className="customer-review">
                        <Rating
                          value={ratings[wishlistDatas.id] || 0}
                          precision={0.5}
                          readOnly
                          size="small"
                        />
                      </div>

                      <Link href={`/productdetails/${wishlistDatas?.id}`} passHref>
                        <Typography variant="h6" component="h4" sx={{ fontWeight: 'bold', textDecoration: 'none', color: 'text.primary' }}>
                          {wishlistDatas?.product_name}
                        </Typography>
                      </Link>

                      {wishlistDatas.coming_soon === 2 && wishlistDatas.stock > wishlistDatas.sell_stock && (
                        <Button
                          variant="contained"
                          color="primary"
                          fullWidth
                          sx={{ mt: 2 }}
                          onClick={() => addToCartProcess(wishlistDatas, 1)}
                        >
                          Add to Cart
                        </Button>
                      )}

                      <div className="price" style={{ marginTop: 10 }}>
                        <Typography variant="body2" color="text.secondary">
                          <i className="fa fa-inr" /> {wishlistDatas?.discount_price > 0 ? wishlistDatas.discount_price : wishlistDatas.price}
                        </Typography>
                        {wishlistDatas?.discount_price > 0 && (
                          <>
                            <del><i className="fa fa-inr" />{wishlistDatas?.price}</del>
                            <Typography variant="body2" color="error">
                              {calculateDiscountPercentage(wishlistDatas.price, wishlistDatas.discount_price).toFixed(2)}% off
                            </Typography>
                          </>
                        )}
                      </div>

                      <div className="product-status" style={{ marginTop: 10 }}>
                        {wishlistDatas.coming_soon === 1 ? (
                          <Button variant="outlined" color="warning" fullWidth>Coming Soon</Button>
                        ) : wishlistDatas.stock > wishlistDatas.sell_stock ? (
                          <Button variant="outlined" color="success" fullWidth>In Stock</Button>
                        ) : (
                          <Button variant="outlined" color="error" fullWidth>Out of Stock</Button>
                        )}
                      </div>
                    </CardContent>

                    <Button
                      onClick={() => removeWishlist(wishlistDatas.wid)}
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        zIndex: 1,
                        backgroundColor: 'transparent',
                        '&:hover': { backgroundColor: 'transparent' }
                      }}
                    >
                      <img
                        src="/img/fld-heart.png"
                        alt="Remove from wishlist"
                        style={{ width: 24, height: 24 }}
                      />
                    </Button>
                  </Card>
                </div>
              ))
            ) : (
              <div className='col-md-9'><center>Sorry, no records found.</center></div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Wishlist;
