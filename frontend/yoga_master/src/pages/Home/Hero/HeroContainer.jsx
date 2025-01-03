import React from 'react'
import 'swiper/css';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css/effect-creative';
import { EffectCreative }  from 'swiper';
import Hero from './hero';
import Hero2 from './Hero2';



const HeroContainer = () => {
  return (
    <Swiper
    grabCursor={true}
    effect="creative"  // Adds a creative effect to the slider
    creativeEffect={{
      prev: { shadow: true,translate:"-120%,0,-500" },
      next: { shadow: true,translate:"-120%,0,-500" },
   }}
   modules={[EffectCreative]}
   className='mySwiper'
   loop={true} 
   autoplay={
    {
      delay:250,
      disableOnInteraction:false,
    }
   }
    >
      <SwiperSlide><Hero/></SwiperSlide>
      <SwiperSlide><Hero2/></SwiperSlide>

    </Swiper>
  )
}

export default HeroContainer