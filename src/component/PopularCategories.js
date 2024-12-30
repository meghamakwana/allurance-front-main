import React, { useState, useEffect, useCallback } from 'react';
import data from "../jsondata/popularCategories.json";
import Link from 'next/link';
import "../../public/css/style.css";
import "../../public/css/responsive.css";
import { getCategories, categoriesHandleImageError } from "../utils/frontendCommonFunction";

function PopularCategories() {

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
        const limitedData = data1.data.slice(0, 6);
        setCategories(limitedData);
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
      <section>
        {data?.PopularCategories?.map((item, index) => {
          return (
            <div className="popular-category py-5" key={index}>
              <div className="container">
                <div className="main-head d-flex justify-content-between">
                  <div className="popular-head">
                    <div className="text d-flex">
                      <h1 className="display-5" style={{ fontWeight: 300 }}>
                        {item.PopularText}
                      </h1>
                      <h1
                        className="display-5 fw-normal px-3"
                        style={{ fontWeight: 500 }}
                      >
                        {item.CategoriesText}
                      </h1>
                    </div>
                    <div className="border-line text-center">
                      <div className={item.Line} />
                    </div>
                  </div>

                  {categories && categories.length > 6 && (
                    <div className="View-all-btn">
                      <div className="view-all-btn-1">
                        <Link
                          href="/categories"
                          className="text-dark text-decoration-none"
                        >
                          {item.ViewAllText} <img src={item.GreaterThanSymbolIImg} alt="" />
                        </Link>
                      </div>
                      <div className={item.ViewAllLine} />
                    </div>
                  )}

                </div>
                <div className="row py-5">

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
                                src={categoriesData.image1 || '/img/placeholder/200x200.png'}
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
          );
        })}
      </section>
    </>
  );
}

export default PopularCategories;
