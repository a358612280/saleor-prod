// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
/* eslint-disable */
import { type ReactNode, useMemo } from "react";

import { useSummaryLineLineAttributesText, getSummaryLineProps } from "./utils";
import { isMainProduct, parseLensForm } from "@/lib/utils-custom";
import { type CheckoutLineFragment, type OrderLineFragment } from "@/checkout/graphql";
import { PhotoIcon } from "@/checkout/ui-kit/icons";
import LensFormInfo from "@/app/[channel]/(main)/cart/LensFormInfo";

export type SummaryLine = CheckoutLineFragment | OrderLineFragment;

interface SummaryItemProps {
	line: SummaryLine;
	children: ReactNode;
}

export const SummaryItem = ({ line, children, ...restProps }: SummaryItemProps) => {
	const { productName, productImage } = getSummaryLineProps(line);

	const attributesText = useSummaryLineLineAttributesText(line);

	const showExtraInfo = useMemo(() => isMainProduct(line), [line]);
	const lensForm = useMemo(() => parseLensForm(line), [line]);

	return (
		<li key={line.id} className="flex border-b py-4 last:border-none" data-testid="SummaryItem">
			<div className="aspect-square h-16 w-16 flex-shrink-0 overflow-hidden rounded border bg-neutral-50 md:h-24 md:w-24 md:bg-white">
				{productImage ? (
					<img
						src={productImage.url}
						alt={productImage.alt ?? ""}
						className="h-full w-full object-contain object-center"
					/>
				) : (
					<PhotoIcon />
				)}
			</div>
			<div className="relative flex flex-1 flex-col justify-between pl-4">
				<div className="flex justify-between justify-items-start gap-4">
					<div className="flex flex-col gap-y-1">
						<p className="font-bold">{productName}</p>
						<p className="text-xs text-neutral-500">{attributesText}</p>
						{lensForm && (
							<LensFormInfo
								editable={false}
								lensForm={lensForm}
								checkoutLineId={line.id}
								checkoutId={restProps.checkoutId}
								channel={restProps?.channel?.slug}
								checkout={restProps?.checkout}
								product={line?.variant?.product}
								variant={line?.variant}
							/>
						)}
					</div>
					{children}
				</div>
			</div>
		</li>
	);
};
