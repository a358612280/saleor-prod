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

// 查询产品类型为 LensType 的信息
const LensTypeDocument = gql`
	query LensTypeList {
		productTypes(filter: { search: "LensType" }, first: 1) {
			edges {
				node {
					name
					id
				}
			}
		}
	}
`;
const useLensTypeId = () => {
	const [{ data, fetching, stale }, refetch] = useQuery({
		query: LensTypeDocument,
	});
	return useMemo(() => {
		return data?.productTypes.edges[0].node.id || null;
	}, [data, fetching, stale]);
};
const LensTypeProductListDocument = gql`
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
const useLensTypeProductListQuery = (options) => {
	return useQuery({
		query: LensTypeProductListDocument,
		...options,
	});
};
const useLensTypeProductList = (channel) => {
	const id = useLensTypeId();
	const shouldPause = useMemo(() => id == null || channel == null, [id, channel]);
	const [{ data }] = useLensTypeProductListQuery({
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

const LensTypesForm = ({ channel, visible, value, onChange }) => {
	const { data } = useLensTypeProductList(channel);
	return (
		<div
			className={clsx("flex-1 overflow-y-auto", {
				hidden: !visible,
			})}
		>
			{data?.products.edges.map(({ node }) => (
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
						{
							//  变体的颜色
							node.variants.length > 1 && (
								<div className="mt-1 flex flex-row">
									{node.variants.map((variant) => (
										<Tooltip key={variant.id}>
											<Tooltip.Trigger>
												<div
													key={variant.id}
													className={clsx("mx-1 flex h-5 w-5 items-center justify-center rounded-full", {
														["border border-[#260ac9]"]: value.variantId == variant.id,
													})}
													onClick={(e) => {
														e.stopPropagation();
														onChange({
															variantId: variant.id,
															variant,
														});
													}}
												>
													<div
														style={{
															backgroundColor:
																variant.attributes
																	.find((item) => item.attribute.name == "lens_color")
																	.values[0].name.toLowerCase() || "white",
														}}
														className={clsx("h-4 w-4 cursor-pointer rounded-full")}
													></div>
												</div>
											</Tooltip.Trigger>
											<Tooltip.Content side="top">
												{
													variant.attributes.find((item) => item.attribute.name == "lens_color").values[0]
														.name
												}
												<Tooltip.Arrow />
											</Tooltip.Content>
										</Tooltip>
									))}
								</div>
							)
						}
					</div>
					<div className="flex w-[100px] shrink-0 items-center justify-center font-bold">
						{(() => {
							let variant = node.variants.find((variant) => variant.id === value);
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
export default LensTypesForm;
