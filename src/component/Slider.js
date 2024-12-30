import React, { useState, useEffect } from 'react';
import data from '../jsondata/slider.json';
import Link from 'next/link';
import '../../public/css/style.css';
import '../../public/css/responsive.css';
import { FRONTEND_DESKTOPMASTHEAD } from "../utils/frontendAPIEndPoints";
import { ManageAPIsData } from '../utils/commonFunction';

function Slider() {

  const [sliderdata, setSliderData] = useState([]);

  // Slider Data
  const getSliderData = async () => {
    try {
      const response = await ManageAPIsData(FRONTEND_DESKTOPMASTHEAD, 'GET');
      if (!response.ok) {
        console.error("Error fetching data:", response.statusText);
        return;
      }
      const responseData = await response.json();
      if (responseData.data.length) {
        setSliderData(responseData.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    getSliderData();
  }, []);

  return (
    <>
      <section>
        {data?.Slider?.map((item, index) => {
          return (
            <React.Fragment key={`item-${index}`}>
              <div className="slider-sec-1 mt-5 pt-5" >
                <div
                  id="carouselExampleCaptions"
                  className="carousel slide carousel-dark pt-2"
                  data-bs-ride="carousel"
                >
                  <div id="carouselExampleFade" className="carousel slide carousel-fade">
                    <div className="carousel-indicators">
                      {sliderdata.map((item1, index) => (
                        <button
                          key={index}
                          type="button"
                          data-bs-target="#carouselExampleCaptions"
                          data-bs-slide-to={index}
                          className={`btn-circle ${index === 0 ? 'active' : ''}`}
                          aria-current={index === 0 ? "true" : "false"}
                          aria-label={`Slide ${index + 1}`}
                        />
                      ))}

                    </div>

                    <div className="carousel-inner ">
                      {sliderdata.map((item1, index) => {
                        return (
                          <div
                            key={index}
                            className={`carousel-item ${index === 0 ? 'active' : ''}`}
                            data-bs-interval={3000}
                            data-interval="true"
                          >
                            <div className="home-slider-detail-section">
                              <img className="banner-img-1" src={`/img/${item1.image1}`} alt="Slide Image" />
                              <div className="container">
                                <div className="slide-1-text slider-position-text">
                                  <h1 className="home-slider-text">{item1.title}</h1>
                                  {item1.description && (<p className="sliderdesc">{item1.description}</p>)}
                                  <Link href={`/${item1.button_link}`} target={item1.button_target}>
                                    <div className="shop-now-btn">
                                      <div className="button_slide slide_down">
                                        {item1.button_name}{' '}
                                      </div>
                                    </div>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      className="carousel-control-prev"
                      type="button"
                      data-bs-target="#carouselExampleCaptions"
                      data-bs-slide="prev"
                    >
                      <span className="carousel-control-prev-icon" aria-hidden="true" />
                      <span className="visually-hidden">Previous</span>
                    </button>
                    <button
                      className="carousel-control-next"
                      type="button"
                      data-bs-target="#carouselExampleCaptions"
                      data-bs-slide="next"
                    >
                      <span className="carousel-control-next-icon" aria-hidden="true" />
                      <span className="visually-hidden">Next</span>
                    </button>
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

export default Slider;
