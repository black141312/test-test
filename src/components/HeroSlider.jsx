import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroSlider = () => {
    const banners = [
        {
            id: 1,
            image: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80&w=1600",
            title: "Streetwear Redefined",
            subtitle: "Drop 01 // Now Live",
            cta: "Shop the Collection"
        },
        {
            id: 2,
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=1600",
            title: "Winter Essentials",
            subtitle: "Premium Heavyweight Hoodies",
            cta: "Shop Outerwear"
        },
        {
            id: 3,
            image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?auto=format&fit=crop&q=80&w=1600",
            title: "Graphic Tees",
            subtitle: "Bold Prints. Oversized Fits.",
            cta: "Explore Tees"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-advance
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, [banners.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    };

    return (
        <div className="relative w-full h-[50vh] md:h-[60vh] bg-gray-100 overflow-hidden">
            {/* Slides container */}
            <div
                className="flex transition-transform duration-500 ease-out h-full"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
                {banners.map((banner) => (
                    <div key={banner.id} className="w-full flex-shrink-0 relative h-full">
                        <img
                            src={banner.image}
                            alt={banner.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex flex-col items-center justify-center text-center text-white p-4">
                            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-2 drop-shadow-lg">
                                {banner.title}
                            </h2>
                            <p className="text-lg md:text-2xl font-medium mb-8 drop-shadow-md">
                                {banner.subtitle}
                            </p>
                            <button className="bg-primary-500 text-white px-8 py-3 rounded-full font-bold uppercase tracking-wider hover:bg-white hover:text-black hover:scale-105 transition-all shadow-lg shadow-primary-500/30">
                                {banner.cta}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'bg-primary-500 w-8' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;

