"use client";

import { useRef } from "react";
import { Button } from "@saleor/macaw-ui";

import GlassesStepFormDialog from "./GlassesStepFormDialog";

function GlassesButtonGroup({ channel, variant, product, onClickFrameOnly, onAddCartWithLens }) {
	const dialogRef = useRef(null);

	const handleSelectLens = () => {
		dialogRef.current.open();
	};

	return (
		<div>
			<button
				disabled={variant == null}
				className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-800 aria-disabled:cursor-not-allowed hover:aria-disabled:bg-neutral-800"
				onClick={() => handleSelectLens()}
			>
				Select Lens
			</button>
			<button
				disabled={variant == null}
				className="ml-4 h-12 items-center rounded-md bg-white px-6 py-3 text-base font-medium leading-6 text-neutral-800 shadow hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-transparent aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-transparent"
				onClick={onClickFrameOnly}
			>
				Frame Only
			</button>
			<GlassesStepFormDialog
				ref={dialogRef}
				channel={channel}
				variant={variant}
				product={product}
				submitText="Add to cart"
				onSubmit={async (form) => {
					await onAddCartWithLens(form);
					dialogRef.current.close();
				}}
			/>
		</div>
	);
}

export default GlassesButtonGroup;
