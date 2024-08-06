"use client";

import NextImage from "next/image.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/swiper-bundle.css";

const MyCarousel = ({ media }) => (
	<Swiper spaceBetween={50} slidesPerView={1} modules={[Pagination]} pagination={{ clickable: true }}>
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
export default MyCarousel;
