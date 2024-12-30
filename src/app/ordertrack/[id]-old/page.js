'use client';
import * as Yup from 'yup';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { yupResolver } from '@hookform/resolvers/yup';
import { FRONTEND_ORDERS_ENDPOINT } from 'src/utils/frontendAPIEndPoints';
import { useParams } from 'next/navigation';
import { styled } from '@mui/material/styles';
import Card from '@mui/material/Card';
import { ManageAPIsData, createFileOptions } from 'src/utils/commonFunction';
import { fDate, fTime } from 'src/utils/format-time';
import TableRow from '@mui/material/TableRow';
import { CircularProgress, Box, Typography, Grid, Button, FormControlLabel, Checkbox, Modal } from '@mui/material';
import FormProvider from 'src/components/hook-form/form-provider';
import IconButton from '@mui/material/IconButton';
import { RHFTextField, RHFUpload } from 'src/components/hook-form';
import { LoadingButton } from '@mui/lab';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { INE_ORDER_RETURN_ENDPOINT } from 'src/utils/apiEndPoints';
import { useSnackbar } from 'notistack';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(4),
  minWidth: 800,
  position: 'relative',
}));

const ImagePreview = styled('div')(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

const ImageItem = styled('div')(({ theme }) => ({
  position: 'relative',
  width: 100,
  height: 100,
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  '& .remove-btn': {
    position: 'absolute',
    top: 2,
    right: 2,
    background: 'rgba(255, 255, 255, 0.8)',
    borderRadius: '50%',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '& td': {
    textAlign: 'right',
    borderBottom: 'none',
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
  },
}));

function OrderTrack() {
  
  
  
  const [openModal, setOpenModal] = useState(false);
  let { id } = useParams();
  const [comment, setComment] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [orders, setOrders] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckboxes, setshowCheckboxes] = useState(false);
  const [noRecordsFound, setNoRecordsFound] = useState(false);
  const governmentBasePath = '/assets/images/documents/government/';
  const [selectedProducts, setSelectedProducts] = useState([]);


  const NewProductSchema = Yup.object().shape({
    description: Yup.string().required('Description is required'),
  });

  const methods = useForm({
    resolver: yupResolver(NewProductSchema),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      description: "",
      images: [],
    },
  });

  const [images, setImages] = useState(watch('images') || []);

  const handleDynamicImageProcessing = async (image) => {
    try {
      const processedBase64Image = await createFileOptions(image);
      return processedBase64Image;
    } catch (error) {
      console.error("Error in handleDynamicImageProcessing:", error);
      return '';
    }
  };

  const onSubmit = handleSubmit(async (data) => {
    data.id = orders.id
    data.order_id = orders.order_id
    data.invoice_id = orders.invoice_id
    data.customer_id = orders.customer_id
    data.description = comment
    data.returnproduct = selectedProducts

    if (data?.images && data?.images?.length) {
      for (let i = 0; i < data.images?.length; i++) {
        const processedImage = await handleDynamicImageProcessing(data?.images[i]);
        data.images[i] = processedImage;
      }
    }
    const apiUrl = INE_ORDER_RETURN_ENDPOINT;
    const fetchMethod = "POST";
    const response = await ManageAPIsData(apiUrl, fetchMethod, data);

    if (response.status == true) {
      enqueueSnackbar('Return success!');
      router.push(paths.dashboard.supportchannel.root);

    } else {
      const responseData = await response.json();
      if (responseData && responseData.error) {
        enqueueSnackbar(responseData.error, { variant: 'error' });
      }
    }
    // Add your logic here to process the refund or return
  });

  const handleRemoveImage = (inputFile) => {
    const updatedImages = images.filter((file) => file !== inputFile);
    setImages(updatedImages);
    setValue('images', updatedImages, { shouldValidate: true });
  };

  const handleRemoveAllImages = () => {
    setImages([]);
    setValue('images', [], { shouldValidate: true });
  };

  const handleDropMultiFile = (acceptedFiles) => {
    const updatedImages = [...images, ...acceptedFiles];
    if (updatedImages.length > 5) {
      enqueueSnackbar('You can only upload a maximum of 5 images.', { variant: 'error' });
      return;
    }
    setImages(updatedImages);
    setValue('images', updatedImages, { shouldValidate: true });
  };

  const handleSelectProduct = (product) => {
    const productId = product?.id; // Access the id property of the product
    if (selectedProducts.some((p) => p.id === productId)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleFormOpen = () => {
    setSelectedProducts([]); // Reset selected products
    setshowCheckboxes((prevShowCheckboxes) => !prevShowCheckboxes); // Toggle checkbox visibility
  };

  const handleProceed = () => {
    setOpenModal(true);
  };


  const fetchInitialData = async () => {
    setIsLoading(true);
    setNoRecordsFound(false);
    try {
      const response = await ManageAPIsData(`${FRONTEND_ORDERS_ENDPOINT}?id=${id}`, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data) {
        setOrders(responseData.data);
      } else {
        setNoRecordsFound(true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (noRecordsFound) {
    return (
      <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
        <Typography variant="h6">No Records Found</Typography>
      </Box>
    );
  }

  if (!orders) {
    return null;
  }



  return (
    <>
      <Header />
      <div className="orderTrack">
        <div className="container">
          <div className="row order-address-section">
            <div className="col-md-4 order-detail-section">
              <h3>Delivery Address</h3>
              <h4>{orders.first_name} {orders.last_name}</h4>
              <p>
                {orders.address_line_1}, {orders.address_line_2}, {orders.landmark}, {orders.district}, {orders.state}, {orders.country} - {orders.pincode}
              </p>
              <h4>
                <i className="fas fa-phone" />
                {orders.phone}
              </h4>
            </div>
            <div className="col-md-4 order-detail-section">
              <h3>Order Details</h3>
              <div className="order-details-list d-flex justify-content-between">
                <ul>
                  <li className="dark-text">Order ID: {orders.order_id}</li>
                  <li className="dark-text">Order Date: {fDate(orders.created_at)}</li>
                  <li className="dark-text">Invoice ID: {orders.invoice_id}</li>
                  <li className="dark-text">Total Amount: {orders.total_amount}</li>
                  <li className="dark-text">Payment Status: {orders.payment_status === 3 ? 'Successful' : 'Pending'}</li>
                </ul>
              </div>
            </div>
            <div className="col-md-4 order-detail-section">
              <Link href="/ordertrack/needhelp" className="order-need-help-btn">
                Need Help? <i className="fas fa-question-circle" />
              </Link>
              <div className="order-detail-btn-section">
                <button className="download-invoice-btn">
                  Download Invoice <i className="fas fa-arrow-down" />
                </button>
                <button className="write-review-btn">
                  Write Review <i className="fas fa-pen" />
                </button>
              </div>
            </div>
          </div>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Grid>
              <Button
                variant="contained"
                onClick={handleFormOpen}
              >
                Return
              </Button>
            </Grid>
            {showCheckboxes && (
              <Grid>
                <Button variant="contained" onClick={handleProceed} sx={{ mb: 2, ml: 1 }}>
                  Proceed
                </Button>
              </Grid>
            )}
          </Box>
          {orders.Products.map((product, index) => (
            <div key={index} className="row order-track-section">
              <div className="col-md-3 hh-grayBox pt45 pb20 d-flex justify-content-between">
                <div>
                  <img src={`${governmentBasePath}/${product.images[0]}` || '/default-product-image.jpg'} alt={product.title} height={140} />
                </div>
                <div className="small-details">
                  <h5>{product.name}</h5>
                  <h3>Price: {product.price} /-</h3>
                </div>
                {showCheckboxes && (
                  <FormControlLabel
                    control={<Checkbox
                      checked={selectedProducts?.some((p) => p.id === product?.id)}
                      onChange={() => handleSelectProduct(product)}
                    />}
                  />
                )}
              </div>
              <div className="col-md-9">
                <div className="container px-1 px-md-4 mx-auto">
                  <div className="card">
                    <div className="row d-flex justify-content-between px-3 top"></div>
                    <div className="row d-flex justify-content-center">
                      <div className="col-12">
                        <ul id="progressbar" className="text-center">
                          <li className={orders.order_status >= 1 ? "active step0" : "step0"}>
                            <h4>Placed</h4>
                            {/* <span className="description">
                              {fDate(orders.created_at)}<br />
                              {fTime(orders.created_at)}
                            </span> */}
                          </li>
                          <li className={orders.order_status >= 2 ? "active step0" : "step0"}>
                            <h4>Packed</h4>
                            {/* <span className="description">
                              {fDate(orders.invoice_date)}<br />
                              {fTime(orders.invoice_date)}
                            </span> */}
                          </li>
                          <li className={orders.order_status >= 3 ? "active step0" : "step0"}>
                            <h4>Shipped</h4>
                            {/* <span className="description">
                              {fDate(orders.invoice_date)}<br />
                              {fTime(orders.invoice_date)}
                            </span> */}
                          </li>
                          <li className={orders.order_status >= 3 ? "active step0" : "step0"}>
                            <h4 className="grey-text">Delivered</h4>
                            {/* <span className="description">
                              Expected By<br />{new Date(orders.invoice_date).toLocaleDateString()}
                            </span> */}.
                            <span className="description">
                              {fDate(orders.invoice_date)}<br />
                              {fTime(orders.invoice_date)}
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Modal
        open={openModal}
        onClose={() => setOpenModal(false)}
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
      >
        <StyledCard>
          <IconButton
            sx={{ position: 'absolute', top: 10, right: 10 }}
            onClick={() => setOpenModal(false)}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h4" gutterBottom>
            Refund/Return Products
          </Typography>
          <FormProvider methods={methods} onSubmit={onSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <RHFTextField
                  id="description"
                  name="description"
                  label="Description"
                  multiline
                  rows={4}
                  onChange={(e) => setComment(e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1">Upload Images:</Typography>
                <RHFUpload
                  id="images"
                  name="images"
                  multiple
                  maxSize={3145728}
                  onDrop={handleDropMultiFile}
                  onRemove={handleRemoveImage}
                  onRemoveAll={handleRemoveAllImages}
                />
                {images.length > 0 && (
                  <ImagePreview>
                    {images.map((file, index) => (
                      <ImageItem key={index}>
                        <img src={URL.createObjectURL(file)} alt={`uploaded-${index}`} />
                        <IconButton
                          size="small"
                          className="remove-btn"
                          onClick={() => handleRemoveImage(file)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </ImageItem>
                    ))}
                  </ImagePreview>
                )}
              </Grid>
              <Grid item xs={12}>
                <LoadingButton
                  variant="contained"
                  type="submit"
                  fullWidth
                  loading={isSubmitting}
                  sx={{ mt: 2 }}
                >
                  Submit
                </LoadingButton>
              </Grid>
            </Grid>
          </FormProvider>
        </StyledCard>
      </Modal>

      <Footer />
    </>
  )
}

export default OrderTrack;
