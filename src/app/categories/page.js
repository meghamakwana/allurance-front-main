'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import data from '../../jsondata/Categories.json';
import '../../../public/css/style.css';
import '../../../public/css/responsive.css';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import { FRONTEND_CATEGORY } from "../../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../../utils/commonFunction';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { getCategories, categoriesHandleImageError } from "../../utils/frontendCommonFunction";

function Categories() {

  const [categories, setCategories] = useState([]);

  const changeImage = (event, newSrc) => {
    const imageElement = event.target;
    if (imageElement) {
      imageElement.src = newSrc ? newSrc : '/img/placeholder/200x200.png';
    }
  }

  // Categories Data
  const fetchData = useCallback(async () => {
    try {
      const data1 = await getCategories();
      if (data1.data.length) {
        setCategories(data1.data);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);



  return (
    <>
      <Header />
      <div id="home">
        <section>
          <div className="category-section mt-5 pt-5">
            <div className="breadcrumb pt-2">
              <img src="" alt="" width="100%" />
            </div>
            <div className="container">
              <div className="category-head py-5">
                <div className="heading text-center">
                  {data?.Categories?.map((item, index) => {
                    return (
                      <h1 className="display-6" key={index}>
                        {item.Categories}
                      </h1>
                    );
                  })}
                </div>
                <div className="category-head-border d-flex justify-content-center">
                  <div className="category-line" />
                </div>
              </div>

              <div className="row py-3">
                {categories && categories.length > 0 ? (
                  categories.map((categoriesData, index) => {
                    return (
                      <div key={categoriesData.id} className="col-xl-2 col-lg-2 col-md-4 col-sm-6 col-12">
                        <Link
                          href={`/productlist/${categoriesData.id}`}
                          className="image-hover"
                          onMouseOverCapture={(event) => changeImage(event, categoriesData.image2)}
                          onMouseOut={(event) => changeImage(event, categoriesData.image1)}
                        >
                          <div className="popular-img-1">
                            <img
                              height={200}
                              width={500}
                              className="imageToSwap"
                              src={`${categoriesData.image1 ? categoriesData.image1 : 'category-dummy-img.png'}`}
                              alt={categoriesData.name}
                              onError={categoriesHandleImageError}
                            />
                          </div>
                        </Link>
                        <div className="cat-name name py-4">
                          <Link
                            href={`/productlist/${categoriesData.id}`}
                            className="image-hover"
                          ></Link>
                          <Link href={`/productlist/${categoriesData.id}`} className="text-decoration-none">
                            <h1 className="display-6 text-dark">{categoriesData.name}</h1>
                          </Link>
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
        </section>
      </div>

      <Footer />
    </>
  );
}

export default Categories;
