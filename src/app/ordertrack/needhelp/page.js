'use client';
import React from 'react'
import Link from 'next/link'
import data from "../../../jsondata/NeedHelp.json"
import Header from 'src/component/Header'
import Footer from 'src/component/Footer'


function NeedHelp() {
  return (
    <>
<div id="home">
  {/* header starts */}
  <Header/>
  {/* header ends */}
  {/* need help section starts */}
  {data?.NeedHelp?.map((item)=>{
    return(
  <div className="container needHelp">
    <div className="row">
      <div className="col-md-6">
        <h1>
          {item.LetsGetYou}
          <br /> {item.SomeHelp}
        </h1>
        <h6>
          {item.HaveAnyIssue}<span className="email-us">{item.Email}</span>
        </h6>
        <div className="img-wrapper">
          <img
            src={item.OnboardingImg}
            alt="undraw-onboarding-o8mv-1"
            border={0}
          />
        </div>
      </div>
      <div className="col-md-6">
        <form>
          <div className="form-group">
            <label htmlFor="list">{item.WhatListAre}</label>
            <input
              type="text"
              className="form-control"
              id="list"
              aria-describedby="emailHelp"
            />
          </div>
          <div className="form-group">
            <label htmlFor="tags">{item.PleaseFewPrimaryTags}</label>
            <input type="text" className="form-control" id="tags" />
          </div>
          <div className="form-group">
            <label htmlFor="describe">{item.PleaseDesribeYourListNeeds}</label>
            <textarea
              type="text"
              className="form-control"
              id="describe"
              rows={5}
              defaultValue={""}
            />
          </div>
          <div className="form-group">
            <label htmlFor="exampleFormControlSelect1">{item.SelectCategory}</label>
            <select className="form-control" id="exampleFormControlSelect1">
              <option>{item.OptionOne}</option>
              <option>{item.OptionTwo}</option>
              <option>{item.OptionThree}</option>
              <option>{item.OptionFour}</option>
              <option>{item.OptionFive}</option>
            </select>
          </div>
          <button type="button" className="need-help-submit-btn">
            <span>{item.Submit}</span> <i className={item.RightArrowIcon} />
          </button>
        </form>
      </div>
    </div>
  </div>
  )
})}
  {/* need help section ends */}
  {/* footer starts*/}
 <Footer/>
  {/* lower footer ends */}
  {/* footer ends */}
</div>


    </>
  )
}

export default NeedHelp