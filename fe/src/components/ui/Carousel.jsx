import React, { useState, useEffect } from "react";

const Carousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(intervalId);
  }, [currentIndex]);

  return (
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div key={index} className="w-full flex-shrink-0">
              <img
                src={image}
                alt={`Slide ${index}`}
                className="w-full h-[400px] sm:h-[600px] object-fill"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Carousel;
