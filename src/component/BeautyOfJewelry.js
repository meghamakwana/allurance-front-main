'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link'
import "../../public/css/style.css"
import "../../public/css/responsive.css"
import { getBlogs, blogHandleImageError } from "../utils/frontendCommonFunction";

function BeautyOfJewelry() {

  const [blogData, setBlogData] = useState([]);

  // Get Blog Data
  const fetchData = useCallback(async () => {
    try {
      const data1 = await getBlogs();
      if (data1.data.length) {
        const limitedData = data1.data.slice(0, 2);
        setBlogData(limitedData);
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

        <div className="jewelry-art-main py-2">
          <div className="container pb-5">
            <div className="jewelry-text d-flex justify-content-center py-2">
              <h1 className="display-5" style={{ fontWeight: 300 }}>
                The Inspiring
              </h1>
              <h1
                className="display-5 fw-normal px-3"
                style={{ fontWeight: 500 }}
              >
                Beauty Of Jewelry Art
              </h1>
            </div>
            <div className="row py-4 pb-3">

              {blogData && blogData.length > 0 ? (
                blogData.map((blogDatas, index) => {
                  return (
                    <div key={index} className="col-xl-6 col-lg-6 col-12">
                      <Link href={`/blog/detail/${blogDatas.slug}`} className="text-decoration-none text-dark">
                        <div className="img-wrapper">
                          <img
                            className="inner-img"
                            src={`${blogDatas.image1 ? blogDatas.image1 : 'blog-dummy-img.png'}`}
                            width="100%"
                            onError={blogHandleImageError}
                          />
                        </div>
                        <div className="art-detail text-center">
                          <h1 className="display-6 pt-4">
                            {blogDatas.title}
                          </h1>
                          <p>{blogDatas?.short_description || ''}</p>
                        </div>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div><center>Sorry, Records Not Found.</center></div>
              )}

            </div>

            <div className="art-btn text-center py-3">
              {blogData && blogData.length > 0 && (
                <Link href="/blog" className="text-decoration-none">
                  <button className="button_slide slide_down py-3 px-5 border-0 blog-view-more-btn">
                    View More
                  </button>
                </Link>
              )}
            </div>

          </div>
        </div>

      </section>
    </>
  )
}

export default BeautyOfJewelry