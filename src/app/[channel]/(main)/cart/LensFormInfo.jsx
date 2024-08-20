'use client'
import { useEffect, useMemo, useRef, useState } from "react";
import { produce } from 'immer'
import clsx from "clsx";
import gpl from 'graphql-tag'
import { useMutation, useQuery } from "urql";
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-toastify'

import VisionReportForm from "@/app/[channel]/(main)/products/[slug]/VisionReportForm.jsx";
import { formatMoney, formatMoneyRange } from "@/lib/utils";
import { useGlassesStepForm } from "@/app/[channel]/(main)/products/[slug]/GlassesStepFormContainer.jsx";

const PRESCRIPTION_TYPES = [
	{
		label: "Single Vision",
		value: "SINGLE_VISION",
		description: "Near, Intermediate, or Distance",
	},
	{
		label: "Progressive",
		value: "PROGRESSIVE",
		description: "Near, intermediate and distance in one lens",
	},
	{
		label: "Reader",
		value: "READER",
		description: "Select a magnification strength",
	},
];
const getPrescriptionLabel = (val) => val == null ? '--' : PRESCRIPTION_TYPES.find(item => item.value === val)?.label ?? '--'

// 获取和主产品关联的产品对应的 checkout-line ids
const getVariantRelatedCheckoutLineIds = (checkout, variantId) => {
	if (!checkout || !checkout.lines) {
		return null
	}
	return checkout.lines.filter(line => {
		return line?.metadata?.find(meta => meta.key === 'related_variant_id')?.value === variantId
	}).map(line => line.id)
}

const lensTypeStr = (form) => {
	if (form["2"]?.variant?.product.name === form["2"]?.variant?.name) {
		return form["2"]?.variant?.product.name;
	}
	return form["2"]?.variant?.product.name + " - " + form["2"]?.variant?.name;
};
const formatVariantPrice = (variant) =>
	variant == null
		? null
		: formatMoney(variant.pricing.price.gross.amount, variant.pricing.price.gross.currency);

const LensAboutInfoDocument = gpl`
	query LensAboutInfo($channel: String, $lensTypeVariantId: ID!, $lensThicknessVariantId: ID!) {
		lensTypeVariant: productVariant(channel: $channel, id: $lensTypeVariantId) {
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
		lensThicknessVariant: productVariant(channel: $channel, id: $lensThicknessVariantId) {
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
	}
`
const useLensAboutInfoQuery = (options) => {
	return useQuery({
		query: LensAboutInfoDocument,
		...options,
	})
}
const CheckoutDeleteLinesDocument = gpl`
	mutation CheckoutDeleteLines($checkoutId: ID!, $lineIds: [ID!]!) {
	  checkoutLinesDelete(id: $checkoutId, linesIds: $lineIds) {
	    checkout {
	      id
	    }
	    errors {
	      field
	      code
	    }
	  }
	}
`
const CheckoutAddMultiLinesDocument = gpl`
    mutation CheckoutAddMultiLines($id: ID!, $lines: [CheckoutLineInput!]!) {
        checkoutLinesAdd(id: $id, lines: $lines) {
            checkout {
                id
                lines {
                    id
                    quantity
                    variant {
                        name
                        product {
                            name
                        }
                    }
                }
            }
            errors {
                message
            }
        }
    }
`;

const CheckoutLineMetadataUpdateDocument = gpl`
	mutation checkoutLineMetadataUpdate($checkoutLineId: ID!, $inputs: [MetadataInput!]!) {
		updateMetadata(
			id: $checkoutLineId
  		input: $inputs
		) {
			metadataErrors {
				field
				code
			}
			item {
				metadata {
					key
					value
				}
			}
		}
	}
`
const useCheckoutLineMetadataMutation = () => {
	return useMutation(CheckoutLineMetadataUpdateDocument)
}
const useCheckoutDeleteLinesMutation = () => {
	return useMutation(CheckoutDeleteLinesDocument)
}

function LensFormInfo({ lensForm, channel, checkoutId, checkoutLineId, checkout, product, variant }) {
	const [, updateMetadata] = useCheckoutLineMetadataMutation()
	const [, checkoutDeleteLines] = useCheckoutDeleteLinesMutation()
	const [, checkoutAddMultiLines] = useMutation(CheckoutAddMultiLinesDocument)
	const { open: openGlassStepForm } = useGlassesStepForm({
		submitText: 'Update',
		onSubmit: async (form) => {
			let simpleLensForm = {
				0: form["0"],
				1: form["1"],
				2: {
					variantId: form["2"].variantId,
					variant: null,
				},
				3: {
					variantId: form["3"].variantId,
					variant: null,
				},
			}
			await updateMetadata({
				checkoutLineId,
				inputs: [
					{ key: 'lens_form', value: JSON.stringify(simpleLensForm) }
				]
			})
			const deletedLineIds = getVariantRelatedCheckoutLineIds(checkout, variant.id)
			if (deletedLineIds && deletedLineIds.length > 0) {
				await checkoutDeleteLines({
					checkoutId,
					lineIds: deletedLineIds
				})
			}
			const newLines = [
				{ quantity: 1, variantId: form["2"]?.variantId, metadata: [{ key: 'related_variant_id', value: variant.id }] },
				{ quantity: 1, variantId: form["3"]?.variantId, metadata: [{ key: 'related_variant_id', value: variant.id }] },
			]
			await checkoutAddMultiLines({
				id: checkoutId,
				lines: newLines
			})
			toast('Updated')
		}
	})

	const [open, setOpen] = useState(false);

	const [shouldPause, setShouldPause] = useState(true);
	const [{ data }, refetchLensAboutInfo] = useLensAboutInfoQuery({
		variables: {
			channel,
			lensTypeVariantId: lensForm?.["2"]?.variantId,
			lensThicknessVariantId: lensForm?.["3"]?.variantId,
		},
		pause: shouldPause
	})

	useEffect(() => {
		if (lensForm && lensForm["2"]?.variantId && lensForm["3"]?.variantId) {
			setShouldPause(false)
		}
	}, [lensForm]);
	// 带有具体变体和产品数据的 form
	const form = useMemo(() => {
		if (lensForm && data) {
			return produce(lensForm, draft => {
				draft["2"].variant = data.lensTypeVariant
				draft["3"].variant = data.lensThicknessVariant
			});
		}
		return lensForm
	}, [data]);

	const handleEdit = () => {
		openGlassStepForm({
			channel,
			product,
			variant,
			form
		})
	};

	return (
		<div>
			<div className="flex flex-row items-center cursor-pointer" onClick={() => setOpen(prevState => !prevState)}>
				<span className="mr-1 text-sm text-neutral-500">Prescription: {getPrescriptionLabel(lensForm?.["0"])}</span>
				<ChevronDownIcon className={clsx("size-4 cursor-pointer transition", {
					"rotate-180": open,
				})}/>
			</div>
			<div
				className="mt-1 overflow-hidden"
			>
				<div
					className={clsx("-translate-y-full transition", {
						["translate-y-1"]: open,
						["h-0"]: !open,
					})}
				>
					<div className="text-sm text-neutral-500">Lens:</div>
					<div className="mt-1 flex  flex-row">
						<span className="text-sm text-neutral-600">{lensTypeStr(form)}</span>
						<br />
						<span className="ml-auto">{formatVariantPrice(form["2"].variant)}</span>
					</div>
					<div className="mt-1 flex flex-row">
						<span className="text-sm text-neutral-600">{form["3"]?.variant?.product.name}</span>
						<span className="ml-auto">{formatVariantPrice(form["3"].variant)}</span>
					</div>
					<div className="flex-1 overflow-y-auto">
						{
							lensForm && (
								<VisionReportForm
									type={form[0]}
									value={form[1].prescriptionData}
									readonly
								/>
							)
						}
					</div>
					<div className="flex justify-around items-center mb-2">
						<div className="px-12 py-0.5 border border-neutral-500 cursor-pointer" onClick={handleEdit}>Edit</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default LensFormInfo;
