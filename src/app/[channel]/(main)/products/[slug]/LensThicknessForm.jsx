"use client";

// 镜片类型选择
import { clsx } from "clsx";
import { useEffect, useMemo, useState } from "react";
import gql from "graphql-tag";
import { useQuery, useClient } from "urql";
import { formatMoney } from "@/lib/utils";
import { Tooltip } from "@saleor/macaw-ui";

const transformHtmlToText = (content) => {
	try {
		const data = content ? JSON.parse(content) : null;
		let textContent = "";
		data?.blocks.forEach((block) => {
			if (block.type === "paragraph") {
				textContent += block.data.text + "\n";
			}
		});
		return textContent;
	} catch (e) {
		return null;
	}
};

const LENS_TYPES = [
	{
		value: "STANDARD",
		label: "Standard Eyeglass Lenses",
		description: "Traditional, transparent lenses perfect for everyday use",
		price: 1,
	},
	{
		value: "BLUE_LIGHT_BLOCKING",
		label: "Blue Light Blocking",
		description: "Protect your eyes from the negative side effects of digital screens",
		price: 4,
	},
	{
		value: "PHOTOCHROMIC",
		label: "Photochromic",
		description: "The best for people who want fully clear indoor and fast darkness outdoors.",
		price: 12,
	},
	{
		value: "COLOR_TINT",
		label: "Color Tint",
		description: "Tint or coat your lenses and turn regular lenses into sunglasses",
		price: 16,
	},
];
// 查询产品类型为 LensType 的信息，search 固定为“LensThickness”
const LensThicknessDocument = gql`
	query LensTypeList {
		productTypes(filter: { search: "LensThickness" }, first: 1) {
			edges {
				node {
					name
					id
				}
			}
		}
	}
`;
const useLensThicknessId = () => {
	const [{ data, fetching, stale }, refetch] = useQuery({
		query: LensThicknessDocument,
	});
	return useMemo(() => {
		return data?.productTypes.edges[0].node.id || null;
	}, [data, fetching, stale]);
};
const LensThicknessProductListDocument = gql`
	query MyLensTypeProductList($channel: String!, $productTypeId: ID!) {
		products(
			first: 100
			filter: { productTypes: [$productTypeId] }
			channel: $channel
			sortBy: { field: RATING, direction: DESC }
		) {
			edges {
				node {
					created
					id
					name
					description
					#              productType {
					#                  id
					#                  name
					#              }
					variants {
						id
						name
						pricing {
							price {
								currency
								gross {
									amount
									currency
								}
							}
						}
						attributes {
							values {
								id
								name
								plainText
							}
							attribute {
								id
								name
							}
						}
						product {
							name
						}
					}
					attributes {
						attribute {
							id
							name
						}
						values {
							name
						}
					}
				}
			}
		}
	}
`;
const useLensThicknessProductListQuery = (options) => {
	return useQuery({
		query: LensThicknessProductListDocument,
		...options,
	});
};
const useLensThicknessProductList = (channel) => {
	const id = useLensThicknessId();
	// console.log("LensThickness id", id);
	const shouldPause = useMemo(() => id == null || channel == null, [id, channel]);
	const [{ data }] = useLensThicknessProductListQuery({
		variables: {
			channel,
			productTypeId: id,
		},
		pause: shouldPause,
	});
	return {
		data,
	};
};

/**
 *
 * @param channel
 * @param visible
 * @param value - 最后一步的镜片厚度选择 { variantId: null, variant: null }
 * @param onChange - 更新 value
 * @param lensCategory - 镜片的分类信息 demo {
 *     "id": 4,
 *     "scopes": [["sph", "3.25-6"],["cyl","0-2"]],
 *     "options": ["1.56","1.61","1.67","1.74"],
 *     "recommend": "1.61"
 * }
 * @returns {JSX.Element}
 * @constructor
 */
const LensThicknessForm = ({ channel, visible, value, onChange, lensCategory }) => {
	const { data } = useLensThicknessProductList(channel);
	const filteredEdges = useMemo(() => {
		if (!lensCategory) {
			return null;
		}
		return (
			lensCategory?.options
				.map((name) => data?.products.edges.find(({ node }) => node.name === name))
				.filter((item) => item != null) || null
		);
	}, [data, lensCategory]);

	return (
		<div
			className={clsx("flex-1 overflow-y-auto", {
				hidden: !visible,
			})}
		>
			{(!filteredEdges || filteredEdges.length === 0) && (
				<div className="text-center">
					<span className="italic text-neutral-400">No available items.</span>
				</div>
			)}
			{filteredEdges?.map(({ node }) => (
				<div
					key={node.id}
					onClick={() => {
						if (value.variantId && node.variants.some((variant) => variant.id === value.variantId)) {
							// do nothing
						} else {
							onChange({
								variantId: node.variants[0].id,
								variant: node.variants[0],
							});
						}
					}}
					className={clsx(
						" my-4 flex cursor-pointer flex-row rounded border bg-white py-6 pl-6 transition hover:border-[#260ac9]",
						{
							["border border-[#260ac9]"]: node.variants.some((variant) => variant.id === value.variantId),
						},
					)}
				>
					<div className="flex-1">
						<div className="font-bold">{node.name}</div>
						<div className="text-sm text-[#999]">{transformHtmlToText(node.description)}</div>
					</div>
					<div className="flex w-[100px] shrink-0 items-center justify-center font-bold">
						{(() => {
							let variant = node.variants.find((variant) => variant.id === value.variantId);
							if (!variant) {
								variant = node.variants[0];
							}
							return formatMoney(variant.pricing.price.gross.amount, variant.pricing.price.gross.currency);
						})()}
					</div>
				</div>
			))}
		</div>
	);
};
LensThicknessForm.displayName = "LensThicknessForm";

export default LensThicknessForm;
