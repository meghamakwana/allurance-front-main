import React from 'react'
import data from "../jsondata/support.json"
import Link from 'next/link'
import "../../public/css/style.css"
import "../../public/css/responsive.css"

function Support() {
  return (
    <>
     <section>
    {data?.Support?.map((item , index)=>{
      return(
  
    <div className="main-sec-2 py-5" key={index} >
      <div className="container">
        <div className="row">
          <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-12 text-center">
            <div className="img">
              <img src={item.DeliveryImg} alt="" width="25%" />
            </div>
            <div className="feature-text py-2">
              <h1 className="display-6">{item.DeliveryText}</h1>
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-12 text-center">
            <div className="img">
              <img src={item.SupportImg} alt="" />
            </div>
            <div className="feature-text py-2 pt-4">
              <h1 className="display-6">{item.SupportText}</h1>
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-12 text-center">
            <div className="img">
              <img src={item.CashbackImg} alt="" />
            </div>
            <div className="feature-text py-2 pt-4">
              <h1 className="display-6">{item.CashbackText}</h1>
            </div>
          </div>
          <div className="col-xl-3 col-lg-6 col-md-6 col-sm-6 col-12 text-center">
            <div className="img">
              <img src={item.QualityImg} alt="" />
            </div>
            <div className="feature-text py-2 pt-4">
              <h1 className="display-6">{item.QualityText}</h1>
            </div>
          </div>
        </div>
      </div>
    </div>
        )
      })}
  </section>
    </>
  )
}

export default Support