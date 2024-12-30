'use client';
import React, { useState, useEffect, useCallback } from 'react';
import data from '../jsondata/Header.json';
import Link from 'next/link';
import '../../public/css/style.css';
import '../../public/css/responsive.css';
import { useRouter } from 'next/navigation';
import { getDecodedToken, categoriesHandleImageError, getCategories } from '../utils/frontendCommonFunction';

function Header() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [decodedToken, setDecodedToken] = useState(null);
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const keyword = query.get('keyword');
    if (keyword) {
      setSearchInput(decodeURIComponent(keyword));
    }
  }, []);

  // Categories Data
  const fetchData = useCallback(async () => {
    try {
      const data1 = await getCategories();
      if (data1.data.length) {
        if (data1.data.length) {
          const limitedData = data1.data.slice(0, 20);
          setCategories(limitedData);
        }
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const decodedlogtkn = getDecodedToken();
    setDecodedToken(decodedlogtkn);
  }, []);

  const isUserLoggedIn = decodedToken && decodedToken.data && decodedToken.data.id;

  useEffect(() => {
    const header = document.getElementById('navbar');
    let lastScrollTop = 0;
    let ticking = false;

    function smoothScrollAnimation(scrollPosition) {
      if (scrollPosition > 200 || scrollPosition === 0) {
        // Show the header with a smooth sliding animation
        header.style.transition = 'transform 0.7s ease';
        header.style.transform = 'translateY(0)';
      } else {
        // Hide the header with a smooth sliding animation
        header.style.transition = 'transform 0.7s ease';
        header.style.transform = 'translateY(-100%)';
      }
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

          smoothScrollAnimation(currentScroll);

          lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
          ticking = false;
        });
        ticking = true;
      }
    });

    const handleClick = () => {
      const categoriesLink = document.querySelector('.nav-item.dropdown .nav-link');
      const icon = categoriesLink.querySelector('.fas.fa-angle-down');
      icon.classList.toggle('rotate');
    };

    const categoriesLink = document.querySelector('.nav-item.dropdown .nav-link');
    categoriesLink.addEventListener('click', handleClick);

    return () => {
      categoriesLink.removeEventListener('click', handleClick);
    };
  }, []);


  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (searchInput.trim() !== '') {
  //     router.push(`/productlist/${searchInput}`);
  //   }
  // };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim() !== '') {
      router.push(`/productlist?keyword=${encodeURIComponent(searchInput)}`);
    }
  };


  return (
    <>
      <header>
        {data?.Header?.map((item, unikey) => {
          return (
            <React.Fragment key={`item-${unikey}`}>
              <div id="home">
                <div id="navbar">
                  <nav className="navbar navbar-expand-lg bg-body-tertiary">
                    <div className="container">
                      {/* Logo */}
                      <div className="navbar-brand">
                        <Link href="/">
                          {' '}
                          <img src={item.Logo} alt="" />
                          {/* <img src={item.image} alt="" /> */}
                        </Link>
                      </div>
                      {/* Navbar toggler */}
                      <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                      >
                        <span className="navbar-toggler-icon" />
                      </button>
                      {/* Navbar links */}
                      <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
                          <li className="nav-item">
                            <Link className="nav-link text-dark" href="/">
                              {item.Home}
                            </Link>
                          </li>
                          {/* Categories */}
                          <li className="nav-item dropdown">
                            <Link
                              id="iconlist"
                              className="nav-link text-dark"
                              href="#"
                              role="button"
                              data-bs-toggle="dropdown"
                              aria-expanded="false"
                            >
                              {item.Categories} <i className="fas fa-angle-down rotate-icon" />
                            </Link>
                            <ul className="dropdown-menu " aria-labelledby="navbarDropdown">
                              <div className="categories-dropdown">

                                <div className="catDropdownNewSection">
                                  <div className="row">
                                    <div className="col-8">
                                      <div className="row">
                                        {categories && categories.map((item1) => {
                                          return (
                                            <div className="col-md-3">
                                              <div className="col">
                                                <Link href={`/productlist/${item1.id}`}><img src={item1.image1} alt={item1.name} onError={categoriesHandleImageError} /></Link>
                                                <Link href={`/productlist/${item1.id}`} className="text-decoration-none text-dark"> <span>{item1.name}</span></Link>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    <div className="col-4">
                                      <div className="">
                                        <div className="col drop-down-img">
                                          <img src={item.DropDownImg} />
                                        </div>

                                        {categories && categories.length > 20 && (
                                          <div className='textcenter'>
                                            <Link href="/categories" className="view-more-btn">
                                              <button className="view-more-btn">View More <img
                                                src={item.IconImg} alt="" /></button>
                                            </Link>
                                          </div>
                                        )}

                                      </div>
                                    </div>
                                  </div>
                                </div>

                              </div>
                            </ul>
                          </li>
                          {/* Product */}
                          <li className="nav-item">
                            <Link className="nav-link text-dark" href="/productlist">
                              {item.Products}
                            </Link>
                          </li>
                          {/* Pages */}
                          <li className="nav-item">
                            <Link className="nav-link text-dark" href="/blog">
                              {item.Blog}
                            </Link>
                          </li>
                          <li className="nav-item">
                            <Link className="nav-link text-dark" href="/contact-us">
                              {item.Contact}
                            </Link>
                          </li>

                        </ul>
                        {/* Search form */}
                        <form onSubmit={handleSubmit} className="d-flex needs-validation" noValidate>
                          <div className="search-container">
                            {/* <input
                              className="form-control me-2 search-input"
                              type="search"
                              placeholder="Search"
                              aria-label="Search"
                              id="form-control-nav"
                            /> */}
                            <input
                              className="form-control me-2 search-input"
                              type="search"
                              placeholder="Search Products"
                              aria-label="Search"
                              id="form-control-nav"
                              value={searchInput}
                              onChange={(e) => setSearchInput(e.target.value)}
                            />

                          </div>
                        </form>
                        {/* Cart and User icons */}
                        <ul className="navbar-nav">
                          <li className="nav-item" style={{ marginTop: '10px' }}>
                            <Link href="/cart">
                              <img src={item.Cart} alt="" />
                            </Link>
                          </li>

                          {isUserLoggedIn ?
                            <li className="nav-item" style={{ marginTop: '10px' }}>
                              <Link href="/profile">
                                <img src={item.User} alt="" />
                              </Link>
                            </li>
                            :
                            <Link className="nav-link text-dark" href="/login" >
                              <button className="header-btn">{item.Login}</button>
                            </Link>
                          }
                        </ul>
                      </div>
                    </div>
                  </nav>
                </div>
              </div>
            </React.Fragment >
          );
        })}
      </header >
    </>
  );
}

export default Header;
