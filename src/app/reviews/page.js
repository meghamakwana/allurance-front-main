'use client';
import React, { useEffect, useState, useCallback } from 'react';
import Header from 'src/component/Header';
import ProfileListView from 'src/component/ProfileListView';
import Footer from 'src/component/Footer';
import {
  formatDateFn,
  getMyReviewData,
  getDecodedToken,
  renderStars,
  productsHandleImageError,
  getOnlyToken,
} from '../../utils/frontendCommonFunction';
import { useRouter } from 'next/navigation';
import { Box, Button, Modal, Rating, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { enqueueSnackbar } from 'notistack';
import { ManageAPIsData } from 'src/utils/commonFunction';
import { FRONTEND_REVIEW } from 'src/utils/frontendAPIEndPoints';

function Reviews() {
  const router = useRouter();
  const [reviewdata, setReviewData] = useState([]);
  const [decodedToken, setDecodedToken] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState({
    rating: '',
    comment: '',
  });
  const user_token_data = getOnlyToken();

  const isUserLoggedIn = decodedToken?.data?.id;

  const fetchData = useCallback(async () => {
    if (isUserLoggedIn) {
      try {
        const data1 = await getMyReviewData(isUserLoggedIn);
        setReviewData(data1);
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
  }, [isUserLoggedIn]);

  const handleOpen = (id) => {

    setCurrentProductId(id); // Set the ID of the current product
    const matched = reviewdata.find((item) => item.id === id);
    if (matched) {
      setRating(Number(matched?.rating_no));
      setComment(matched?.description);
    } else {
      setComment('');
      setRating(0);
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setCurrentProductId(null); // Reset the ID when modal is closed
    setIsModalOpen(false);
  };

  const handleSubmit = async (id) => {
    setError({ rating: '', comment: '' });

    if (!rating) {
      setError((prev) => ({ ...prev, rating: 'Rating is required.' }));
      return;
    }
    if (!comment.trim()) {
      setError((prev) => ({ ...prev, comment: 'Comment is required.' }));
      return;
    }

    const matched = reviewdata.find((item) => item.id === id);
    const matchedId = matched?.id;
    console.log("matched", matched);


    if (!matchedId) {
      enqueueSnackbar("Review not found for the given product ID", { variant: 'warning' });
      return;
    }

    try {
      const data = {
        rating_no: rating,
        description: comment,
        product_id: matched?.product_id,
        user_id: matched?.user_id,
        order_id: matched?.order_id,
      };

      const response = await ManageAPIsData(FRONTEND_REVIEW, 'POST', data, user_token_data);
      if (response) {
        await fetchData(); // Refetch data
        enqueueSnackbar("Review Updated", { variant: 'success' });
      } else {
        enqueueSnackbar("Something Went Wrong", { variant: 'error' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      handleClose();
    }
  };

  const handleDelete = async (id) => {
    const matched = reviewdata.find((item) => item.id === id);
    const matchedId = matched?.id;

    if (!matchedId) {
      enqueueSnackbar("Review not found for the given product ID", { variant: 'warning' });
      return;
    }

    try {
      const response = await ManageAPIsData(`${FRONTEND_REVIEW}?id=${matchedId}`, 'DELETE', {}, user_token_data);

      if (response && response.ok) {
        enqueueSnackbar("Review Deleted", { variant: 'success' });
        await fetchData(); // Refetch data
      } else {
        enqueueSnackbar(`Error: ${response.statusText}`, { variant: 'error' });
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      enqueueSnackbar("Failed to delete the review", { variant: 'error' });
    } finally {
      handleClose();
    }
  };


  useEffect(() => {
    const decodedToken = getDecodedToken();
    if (!decodedToken || !decodedToken.data || !decodedToken.data.id) {
      enqueueSnackbar('Something Wrong! Please login to continue access', { variant: 'error' });
      router.push('/login');
      return;
    }
    setDecodedToken(decodedToken);
  }, [router]);




  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function renderStars(rating) {
    const maxStars = 5; // Total number of stars
    return (
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {[...Array(maxStars)].map((_, index) => (
          <span
            key={index}
            style={{
              color: index < rating ? '#ffc107' : '#e4e5e9',
              fontSize: '24px', // Larger size for the stars
              fontWeight: 'bold', // Bold font for prominence
              cursor: 'pointer', // Pointer for hover effect
              transition: 'transform 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'scale(1.2)'; // Enlarge on hover
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'scale(1)'; // Reset size on mouse out
            }}
          >
            ★
          </span>
        ))}
      </div>
    );
  }


  return (
    <>
      <Header />
      <div
        id="myProfile"
        style={{
          backgroundColor: '#f8f9fa',
          padding: '40px 0',
          minHeight: '100vh',
        }}
      >
        <div className="container">
          <div className="row">
            <ProfileListView />
            <div className="col-md-9">
              <div id="reviews-ratings">
                <h3
                  style={{
                    marginBottom: '20px',
                    fontFamily: "'Roboto', sans-serif",
                    fontWeight: '700',
                  }}
                >
                  My Reviews{' '}
                  <span >
                    ({reviewdata?.length || 0})
                  </span>
                </h3>
                {reviewdata && reviewdata.length > 0 ? (
                  reviewdata.map((review, index) => (
                    <div
                      className="card"
                      key={index}
                      style={{
                        marginBottom: '20px',
                        borderRadius: '10px',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        overflow: 'hidden',
                        cursor: "pointer"
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.transform = 'translateY(-5px)')
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.transform = 'translateY(0)')
                      }
                      onClick={() => handleOpen(review?.id)}
                    >
                      <div className="row g-0">
                        <div
                          className="col-md-3"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <img
                            src="/img/noproduct.webp"
                            alt="Product"
                            style={{
                              maxWidth: '100px',
                              padding: '15px',
                              borderRadius: '5px',
                              backgroundColor: '#ffffff',
                              border: '1px solid #ddd',
                            }}
                          />
                        </div>
                        <div className="col-md-9">
                          <div
                            className="card-body"
                            style={{ padding: '20px' }}
                          >
                            <div
                              className="card-title"
                              style={{
                                fontSize: '18px',
                                fontWeight: 'bold',
                                color: '#333',
                                marginBottom: '10px',
                              }}
                            >
                              {review.product_name}
                            </div>
                            <div
                              className="starcolor"
                              style={{
                                color: '#ffc107',
                                fontSize: '18px',
                                marginBottom: '10px',
                              }}
                            >
                              {renderStars(parseInt(review.rating_no))}
                            </div>
                            <p
                              className="card-text"
                              style={{
                                color: '#6c757d',
                                fontSize: '14px',
                                lineHeight: '1.6',
                              }}
                            >
                              {review.description}
                            </p>
                            <div style={{ color: '#6c757d', fontSize: '13px' }}>
                              <div>
                                Review Date: {formatDateFn(review.created_at)}
                              </div>
                              <div>
                                Order Date: {formatDateFn(review.invoice_date)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      color: '#6c757d',
                      padding: '50px 0',
                    }}
                  >
                    <h5 style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      Sorry, Records Not Found
                    </h5>
                    <p style={{ fontSize: '14px', marginTop: '10px' }}>
                      Looks like you haven’t left any reviews yet. Start
                      exploring and sharing your thoughts!
                    </p>
                  </div>
                )}

                <Modal open={isModalOpen} onClose={handleClose}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: 800,
                      bgcolor: 'background.paper',
                      border: 'none',
                      boxShadow: 24,
                      borderRadius: '8px',
                      display: 'flex',
                      flexDirection: 'row',
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: '50%',
                        backgroundColor: '#f9f9f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 2,
                      }}
                    >
                      <img
                        src="#"
                        alt="Product"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                        onError={productsHandleImageError}
                      />
                    </Box>

                    <Box sx={{ width: '50%', padding: 3 }}>
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Typography variant="h6" component="h2">
                          Edit Review
                        </Typography>
                        <CloseIcon
                          onClick={handleClose}
                          style={{ cursor: 'pointer', color: 'gray' }}
                        />
                      </Box>
                      <Box mt={2}>
                        <Typography mt={2}>Rating</Typography>
                        <Rating
                          name="rating"
                          value={rating}
                          onChange={(event, newValue) => setRating(newValue)}
                          sx={{ mt: 1 }}
                        />
                        {error.rating && (
                          <Typography color="error" variant="body2">
                            {error.rating}
                          </Typography>
                        )}
                        <TextField
                          fullWidth
                          label="Comment"
                          variant="outlined"
                          multiline
                          rows={4}
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          margin="normal"
                        />
                        {error.comment && (
                          <Typography color="error" variant="body2">
                            {error.comment}
                          </Typography>
                        )}
                      </Box>
                      <Box mt={3} display="flex" justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => handleSubmit(currentProductId)}
                          style={{ marginRight: '10px' }}
                        >
                          Update
                        </Button>
                        <Button variant="contained" onClick={() => { handleDelete(currentProductId) }}>
                          Delete
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Reviews;
