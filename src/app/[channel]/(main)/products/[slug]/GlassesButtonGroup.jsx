"use client";

import { useRef } from "react";
import { Button } from "@headlessui/react";

import GlassesStepFormDialog from "./GlassesStepFormDialog";

function GlassesButtonGroup({ channel, variant, product }) {
	const dialogRef = useRef(null);

	const handleSelectLens = () => {
		dialogRef.current.open();
	};

	return (
		<div>
			<button
				disabled={variant == null}
				className="h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
				onClick={() => handleSelectLens()}
			>
				Select Lens
			</button>
			<button
				type="submit"
				disabled={variant == null}
				className="ml-4 h-12 items-center rounded-md bg-white px-6 py-3 text-base font-medium leading-6 text-neutral-800 shadow hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700"
			>
				Frame Only
			</button>
			<GlassesStepFormDialog ref={dialogRef} channel={channel} variant={variant} product={product} />
		</div>
	);
}

export default GlassesButtonGroup;
