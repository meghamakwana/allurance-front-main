'use client';
import Link from 'next/link';
import React, { useEffect, useState, useCallback } from 'react';
import data from '../../jsondata/Blog.json';
import '../../../public/css/style.css';
import '../../../public/css/responsive.css';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import '../../../public/css/style.css';
import '../../../public/css/responsive.css';
import { formatDateFn, getBlogs, blogHandleImageError } from "../../utils/frontendCommonFunction";

function Blog() {

  const [blogdata, setBlogData] = useState([]);

  // BLOG Data
  const fetchData = useCallback(async () => {
    try {
      const data1 = await getBlogs();
      if (data1.data.length) {
        const limitedData = data1.data.slice(0, 5);
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

      <div style={{ backgroundColor: '#f5f5f5' }}>
        <div id="home">
          <Header />
          {data?.Blog?.map((item, index) => {
            return (
              <React.Fragment key={`item-${index}`}>
                <section>
                  <div className="news-banner pt-5">
                    <img src={item.BannerImg} alt="" width="100%" />
                    <h1 className="py-5 blog-text">
                      {item.Blog}
                      <div className="blog-line py-1 ms-3" />
                    </h1>
                  </div>
                </section>


                <section>
                  <div className="news-1 py-5">
                    <div className="container py-5">
                      <div className="row">
                        <div className='col-xl-2'></div>
                        <div className="col-xl-8">

                          {blogdata && blogdata.length > 0 ? (
                            blogdata.map((blogdatas, index) => {
                              return (
                                <div key={blogdatas.id} className='mb-5'>
                                  <div className="news-img-1">
                                    <img src={blogdatas?.image1}
                                      alt="" width="100%" onError={blogHandleImageError} />
                                    <div className="news-date py-3 text-center">
                                      <h1>{blogdatas?.created_at ? formatDateFn(blogdatas.created_at) : ''}</h1>
                                    </div>
                                  </div>
                                  <div className="news-bg bg-white">
                                    <div className="news-tag pb-3 px-5">
                                      <Link href={`/blog/detail/${blogdatas.slug}`}><h1>{blogdatas.title}</h1></Link>
                                    </div>
                                    <div className="news-para px-5">
                                      <p>{blogdatas?.short_description || ''}</p>
                                    </div>
                                    <div className="shop-now-btn  news-read-more-btn-section">
                                      <Link href={`/blog/detail/${blogdatas.slug}`}>
                                        <div className="button_slide slide_down news-read-more-btn">
                                          {item.ReadMore}{' '}
                                        </div>
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div><center>Sorry, Records Not Found.</center></div>
                          )}





                        </div>
                        <div className='col-xl-2'></div>


                      </div>
                    </div>
                  </div>
                </section>
              </React.Fragment>
            );
          })}
          {/* footer */}
          <Footer />
        </div>
      </div>
    </>
  );
}

export default Blog;
