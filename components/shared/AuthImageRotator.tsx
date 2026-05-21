"use client"
import React, { useEffect, useState } from 'react';
import Image from "next/image";

const randomImages = [
    "/assets/auth-image.png",
    "/assets/auth-image2.png",
];

const AuthImageRotator = ({className}: {className?: string}) => {
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        const intervalIndex = setInterval(() => {
            setImageIndex((currentIndex) => {
                let nextIndex = Math.floor(Math.random() * randomImages.length);

                if (nextIndex === currentIndex) {
                    nextIndex = (currentIndex + 1) % randomImages.length;
                }

                return nextIndex;
            });
        }, 5000);

        return () => clearInterval(intervalIndex);
    }, []);

    return (
        <Image
            alt='authentication image'
            src={randomImages[imageIndex]}
            fill
            className={`object-cover ${className}`}
            priority
        />
    )
}

export default AuthImageRotator