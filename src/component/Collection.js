import React, { useState, useEffect, useCallback } from 'react';
import data from '../jsondata/collection.json';
import Link from 'next/link';
import '../../public/css/style.css';
import '../../public/css/responsive.css';
import { getCollectionData } from 'src/utils/frontendCommonFunction';

function Collection() {

  const [collectionData, setCollectionData] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const data1 = await getCollectionData();
      if (data1.data.length) {
        setCollectionData(data1.data);
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
        {data?.Collection?.map((item, index) => {
          return (
            <div className="new-collection py-2" key={index}>
              <div className="container">
                <div className="row">

                  {collectionData && collectionData.length > 0 ? (
                    collectionData.map((collectionDatas, index) => {
                      return (

                        <div className="col-xl-4 col-lg-4 col-12 ">
                          <div className="img-collection-1 py-2">
                            <img src={`/img/${collectionDatas.image1}`} alt="" />
                            <div className="collection-text">
                              <Link href="#" className="text-decoration-none">
                                <div className="new-colle-head">
                                  <h1 className="display-6">{collectionDatas.heading} </h1>
                                </div>
                                <div className="coll-product-head">
                                  <h1 className="display-3">
                                    {collectionDatas.title}
                                  </h1>
                                </div>
                              </Link>
                              <Link href="#" className="text-decoration-none">
                                {item.SeeMore}
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
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

export default Collection;
