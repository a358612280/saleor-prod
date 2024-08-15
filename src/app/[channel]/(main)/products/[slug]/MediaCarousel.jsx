"use client";

import NextImage from "next/image.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";
import { useEffect, useRef } from "react";

const MyCarousel = ({ media, selectedVariantMediaId }) => {
	const swiperRef = useRef(null);
	useEffect(() => {
		if (swiperRef.current && selectedVariantMediaId != null) {
			const targetIndex = media?.findIndex((item) => item.id === selectedVariantMediaId) || -1;
			if (targetIndex !== -1) {
				// 这里可以访问 Swiper 实例并进行初始化控制
				const swiperInstance = swiperRef.current.swiper;
				// console.log(swiperInstance);
				// 例如，可以设置初始 slide
				swiperInstance.slideTo(targetIndex);
			}
		}
	}, [selectedVariantMediaId]);

	return (
		<Swiper
			ref={swiperRef}
			spaceBetween={50}
			slidesPerView={1}
			modules={[Pagination]}
			pagination={{ clickable: true }}
		>
			{media?.map(({ url, alt }, index) => (
				<SwiperSlide key={index}>
					<div className="aspect-square overflow-hidden bg-neutral-50">
						<NextImage
							className="h-full w-full object-contain object-center p-2"
							priority={true}
							alt={alt ?? ""}
							width={1024}
							height={1024}
							src={url}
						/>
					</div>
				</SwiperSlide>
			))}
		</Swiper>
	);
};
export default MyCarousel;
