'use client';

import { useScroll } from 'framer-motion';

// import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

// import MainLayout from 'src/layouts/main';

// import ScrollProgress from 'src/components/scroll-progress';

// import HomeHero from '../home-hero';
// import HomeMinimal from '../home-minimal';
// import HomePricing from '../home-pricing';
// import HomeDarkMode from '../home-dark-mode';
// import HomeLookingFor from '../home-looking-for';
// import HomeForDesigner from '../home-for-designer';
// import HomeColorPresets from '../home-color-presets';
// import HomeAdvertisement from '../home-advertisement';
// import HomeCleanInterfaces from '../home-clean-interfaces';
// import HomeHugePackElements from '../home-hugepack-elements';
import Header from '../../../component/Header';
import Slider from 'src/component/Slider';
import Support from 'src/component/Support';
import Collection from 'src/component/Collection';
import PopularCategories from 'src/component/PopularCategories';
import ExploreBestsellers from 'src/component/ExploreBestsellers';
import NewLaunches from 'src/component/NewLaunches';
import ShopWith from 'src/component/ShopWith';
import BeautyOfJewelry from 'src/component/BeautyOfJewelry';
import Footer from 'src/component/Footer';

// ----------------------------------------------------------------------

const StyledPolygon = styled('div')(({ anchor = 'top', theme }) => ({
  left: 0,
  zIndex: 9,
  height: 80,
  width: '100%',
  position: 'absolute',
  clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
  backgroundColor: theme.palette.background.default,
  display: 'block',
  lineHeight: 0,
  ...(anchor === 'top' && {
    top: -1,
    transform: 'scale(-1, -1)',
  }),
  ...(anchor === 'bottom' && {
    bottom: -1,
    backgroundColor: theme.palette.grey[900],
  }),
}));

// ----------------------------------------------------------------------

export default function HomeView() {
  const { scrollYProgress } = useScroll();

  return (
    

    <>
      <Header />
      <Slider />
      <Support />
      <Collection />
      <PopularCategories />
      <ExploreBestsellers />
      <NewLaunches />
      <ShopWith />
      <BeautyOfJewelry />
      <Footer />
    </>
  );
}
