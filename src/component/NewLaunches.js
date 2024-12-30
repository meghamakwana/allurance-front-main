"use client";
import React, { useState, useEffect, useCallback } from 'react';
import data from "../jsondata/NewLaunches.json";
import Slider from "react-slick";
import "../../public/css/style.css";
import "../../public/css/responsive.css";
import { newLaunchesHandleImageError, getCategories } from "../utils/frontendCommonFunction";
import Link from 'next/link';

function NewLaunches() {
  const [categories, setCategories] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const response = await getCategories();
      if (response.data.length) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const settings = {
    infinite: true,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    speed: 2200,
    autoplaySpeed: 1000,
    cssEase: "linear",
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 3 } },
      { breakpoint: 768, settings: { slidesToShow: 2 } },
      { breakpoint: 480, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <section>
      {data?.NewLaunches?.map((item, index) => (
        <div className='productList' key={index}>
          <div className='launches-main py-5'>
            <div className='container'>
              <div className="best-sell d-flex justify-content-between">
                <div className="popular-head">
                  <div className="text d-flex">
                    <h1 className="display-5" style={{ fontWeight: 300 }}>{item.NewText}</h1>
                    <h1 className="display-5 fw-normal px-3" style={{ fontWeight: 500 }}>{item.LaunchesText}</h1>
                  </div>
                  <div className="border-line text-center">
                    <div className={item.LaunchesTextLine} />
                  </div>
                </div>
              </div>
              <div className="slider-container">
                <div className="wrapper">
                  <Slider {...settings}>

                    {categories.length > 0 ? (
                      categories.map((category, index) => (
                        <Link href={`/productlist/${category.id}`}>
                          <div className="slider__item" key={index}>
                            <div className="zoom-img">
                              <img src={category.image1} alt={category.name} onError={newLaunchesHandleImageError} />
                            </div>
                            <h4>{category.name}</h4>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div><center>Sorry, Records Not Found.</center></div>
                    )}
                  </Slider>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}

export default NewLaunches;
