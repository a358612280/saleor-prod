"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import GlassesStepFormDialog from "./GlassesStepFormDialog.jsx";

const _MANAGER = {
	$instance: null,
};

export const useGlassesStepForm = (options) => {
	useEffect(() => {
		if (options && _MANAGER.$instance) {
			_MANAGER.$instance?.setOptions(options);
		}
	}, [options, _MANAGER.$instance]);
	return {
		open: (...args) => _MANAGER.$instance?.open(...args),
		close: (...args) => _MANAGER.$instance?.close(...args),
	};
};

function GlassesStepFormContainer() {
	const dialogRef = useRef(null);
	const [data, setData] = useState({
		channel: null,
		product: null,
		variant: null,
		form: null,
		submitText: "Submit",
		onSubmit: null,
	});
	const [vis, setVis] = useState(false);
	const canMount = useMemo(() => data.channel && data.product && data.variant, [data]);

	useEffect(() => {
		if (_MANAGER.$instance != null) {
			console.warn("instance is already existed.");
			return;
		}
		_MANAGER.$instance = {
			open: ({ channel, product, variant, form }) => {
				if (!channel || !product || !variant) {
					throw new Error("args invalid");
				}
				setData((prevState) => ({
					...prevState,
					channel,
					product,
					variant,
					form,
				}));
				setVis(true);
			},
			close: () => {
				dialogRef.current?.close();
			},
			setOptions: (options) => {
				setData((prevState) => ({
					...prevState,
					...options,
				}));
			},
		};
		return () => {
			_MANAGER.$instance = null;
		};
	}, []);
	useEffect(() => {
		if (vis && canMount) {
			dialogRef.current?.open(data.form);
		}
	}, [canMount, vis]);

	return (
		<div>
			{canMount && vis && (
				<GlassesStepFormDialog
					ref={dialogRef}
					channel={data.channel}
					variant={data.variant}
					product={data.product}
					submitText={data.submitText}
					onSubmit={async (form) => {
						if (data.onSubmit) {
							await data.onSubmit(form);
							// reset
							setVis(false);
							dialogRef.current?.reset();
						}
					}}
				/>
			)}
		</div>
	);
}
export default GlassesStepFormContainer;
