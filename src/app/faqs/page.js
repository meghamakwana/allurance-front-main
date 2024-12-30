"use client"
import React, { useState, useEffect, useCallback } from 'react';
import data from '../../jsondata/faqs.json';
import Header from 'src/component/Header';
import Footer from 'src/component/Footer';
import "../../../public/css/style.css"
import "../../../public/css/responsive.css"
import { getFaqsData } from '../../utils/frontendCommonFunction';

function Faqs() {

  const [faqsData, setFaqsData] = useState([]);

  // Fetch Data
  const fetchData = useCallback(async () => {
    try {
      const data1 = await getFaqsData();
      if (data1.data.length) {
        setFaqsData(data1.data);
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

      {data?.Faqs?.map((item, index) => (
        <div className="faqsSection" key={index}>
          <div className="container p-4 bg-light">
            <h3 className="mb-3">
              {item.Faqs}
            </h3>

            <div className="accordion accordion-flush" id={`accordionFlushExample${index}`}>
              {faqsData.map((item1, idx) => (
                <div className="accordion-item rounded-3 border-0 shadow mb-2" key={idx}>
                  <h2 className="accordion-header">
                    <button
                      className="accordion-button border-bottom fw-semibold"
                      type="button"
                      data-bs-toggle="collapse"
                      data-bs-target={`#flush-collapse-${index}-${idx}`}
                      aria-expanded="false"
                      aria-controls={`flush-collapse-${index}-${idx}`}
                    >
                      {item1.title}
                    </button>
                  </h2>
                  <div
                    id={`flush-collapse-${index}-${idx}`}
                    className="accordion-collapse collapse"
                    data-bs-parent={`#accordionFlushExample${index}`}
                  >
                    <div className="accordion-body">
                      <p>{item1.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* faqs section ends */}
        </div>
      ))}

      <Footer />
    </>
  );
}

export default Faqs;



