'use client';
import { useState, useEffect, useCallback } from 'react';
import Footer from 'src/component/Footer';
import Header from 'src/component/Header';
import Link from 'next/link';
import data from '../../../../jsondata/BlogDetail.json';
import { FRONTEND_BLOG } from "../../../../utils/frontendAPIEndPoints";
import { formatDateFn, getBlogDetails, getRecentBlogs, blogHandleImageError } from "../../../../utils/frontendCommonFunction";
import { ManageAPIsData } from '../../../../utils/commonFunction';

export default function Page({ params }) {
  const [blogDetailData, setBlogDetailData] = useState([]);
  const [blogDetailNotData, setBlogDetailNotSlugData] = useState([]);

 
  const fetchData = useCallback(async () => {
    try {
      // Get Blog Details
      const data1 = await getBlogDetails(params.slug);
      if (data1.data) { setBlogDetailData(data1.data); }

      // Get Recent Blogs
      const data2 = await getRecentBlogs(params.slug);
      if (data2.data) { setBlogDetailNotSlugData(data2.data); }

    } catch (error) {
      console.error("Error fetching user info:", error);
    }

  }, []);

  useEffect(() => {
    fetchData(params.slug);
  }, [fetchData]);


  return (
    <>
      <div style={{ backgroundColor: '#f5f5f5' }}>
        <Header />
        {data?.BlogDetail?.map((item, index) => {
          return (
            <div key={index}>
              <>
                <section>
                  <div className="news-banner pt-5">
                    <img src={item.BannerImg} alt="" width="100%" />
                    <h1 className="py-5 blog-text">
                      Home / {item.Blog} /  {blogDetailData?.title || ''}
                      <div className="blog-line py-1 ms-3" />
                    </h1>
                  </div>
                </section>
                <section>

                  <div>
                    <div className="news-1 py-5">
                      <div className="container py-5">
                        <div className="row">
                          <div className="col-xl-8">
                            <div className="news-img-1">
                              <img src={blogDetailData?.image1} onError={blogHandleImageError} alt={blogDetailData?.title} width="100%" />
                              <div className="news-date py-3 text-center">
                                <h1>{blogDetailData?.created_at ? formatDateFn(blogDetailData.created_at) : ''}</h1>
                              </div>
                            </div>
                            <div className="news-bg bg-white pb-5">
                              <div className="news-tag pb-3 px-5">
                                <h1>{blogDetailData?.title || ''}</h1>
                              </div>
                              <div className="news-para px-5">
                                <div dangerouslySetInnerHTML={{ __html: blogDetailData?.description || '' }} />
                              </div>
                            </div>
                          </div>
                          <div className="col-xl-4">
                            <div className="recent-posts bg-white px-4 py-4">
                              <div className="head">
                                <h1>{item.RecentPosts}</h1>
                              </div>

                              {blogDetailNotData && blogDetailNotData.length > 0 ? (
                                blogDetailNotData.map((itemData, index) => {

                                  return (
                                    <div key={itemData.id}>
                                      <Link href={`/blog/detail/${itemData.slug}`} className="text-decoration-none">
                                        <div className="post-1 d-flex py-4">
                                          <div className="img">
                                            <img src={itemData?.image1} alt={itemData?.title || ''} onError={blogHandleImageError} />
                                          </div>
                                          <div className="post-text ">
                                            <div className="date-post d-flex">
                                              <p>{itemData?.title || ''}</p>
                                            </div>
                                            <div className="recent-post-text">
                                              <i className="fa fa-calendar-o px-1" aria-hidden="true"></i>
                                              {itemData?.created_at ? formatDateFn(itemData.created_at) : ''}
                                            </div>
                                          </div>
                                        </div>
                                      </Link>
                                    </div>
                                  );
                                })
                              ) : (
                                <div><center>Sorry, Records Not Found.</center></div>
                              )}





                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </section>
              </>
            </div>
          );
        })}
        <Footer />
      </div>
    </>
  );
}
