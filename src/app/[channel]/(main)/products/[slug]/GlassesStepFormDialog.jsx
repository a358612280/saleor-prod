"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { XMarkIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { produce } from "immer";
import { toast, Bounce } from "react-toastify";

import { formatMoney, formatMoneyRange } from "@/lib/utils";
import VisionReportForm from "./VisionReportForm";
import LensTypesForm from "@/app/[channel]/(main)/products/[slug]/LensTypesForm.jsx";
import LensThicknessForm from "@/app/[channel]/(main)/products/[slug]/LensThicknessForm.jsx";

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
const Magnification_Strength_ARRAY = Array(24)
	.fill(null)
	.map((_, i) => 0.25 + 0.25 * i);
const LENS_CATEGORIES = [
	{
		id: 1,
		scopes: [
			["sph", "0-3"],
			["cyl", "0-0.2"],
		],
		options: ["1.56", "1.61", "1.67"],
		recommend: "1.56",
	},
	{
		id: 2,
		scopes: [
			["sph", "0-3"],
			["cyl", "2.25-4"],
		],
		options: ["1.56高散", "1.61高散", "1.67高散"],
		recommend: "1.61高散",
	},
	{
		id: 3,
		scopes: [
			["sph", "0-3"],
			["cyl", "4.25-6"],
		],
		options: ["1.61超-高散", "1.67超-高散", "1.74超-高散"],
		recommend: "1.67超-高散",
	},

	{
		id: 4,
		scopes: [
			["sph", "3.25-6"],
			["cyl", "0-2"],
		],
		options: ["1.56", "1.61", "1.67", "1.74"],
		recommend: "1.61",
	},
	{
		id: 5,
		scopes: [
			["sph", "3.25-6"],
			["cyl", "2.25-4"],
		],
		options: ["1.56高散", "1.61高散", "1.67高散"],
		recommend: "1.67高散",
	},
	{
		id: 6,
		scopes: [
			["sph", "3.25-6"],
			["cyl", "4.25-6"],
		],
		options: ["1.61超-高散", "1.67超-高散", "1.74超-高散"],
		recommend: "1.67超-高散",
	},

	{
		id: 7,
		scopes: [
			["sph", "6.25-8"],
			["cyl", "0-2"],
		],
		options: ["1.61", "1.67", "1.74"],
		recommend: "1.67",
	},
	{
		id: 8,
		scopes: [
			["sph", "6.25-8"],
			["cyl", "2.25-4"],
		],
		options: ["1.67高散", "1.74高散"],
		recommend: "1.67高散",
	},
	{
		id: 9,
		scopes: [
			["sph", "6.25-8"],
			["cyl", "4.25-6"],
		],
		options: ["1.67超-高散", "1.74超-高散"],
		recommend: "1.67超-高散",
	},

	{
		id: 10,
		scopes: [
			["sph", "8.25-12"],
			["cyl", "0-6"],
		],
		options: ["1.67超薄", "1.74超薄"],
		recommend: "1.67超薄",
	},
];
const getLensCategory = (data = { sph: 0, cyl: 0 }) => {
	if (data.sph == null || data.cyl == null) {
		return null;
	}
	for (let i = 0; i < LENS_CATEGORIES.length; i++) {
		let category = LENS_CATEGORIES[i];
		if (!category.scopes) {
			continue;
		}
		let hit = category.scopes.every((scope) => {
			const name = scope[0];
			let range = scope[1].split("-").map((str) => Number(str));
			if (isNaN(range[0]) || isNaN(range[1])) {
				return null;
			}
			return Math.abs(data[name]) >= range[0] && Math.abs(data[name]) <= range[1];
		});
		if (!hit) {
			continue;
		}
		return category;
	}
	return null;
};
const LENS_PRICES = {
	1.56: "3.99",
	1.61: "10",
	1.67: "26",
	1.74: "65",
	"1.56高散": "11",
	"1.61高散": "19",
	"1.67高散": "32",
	"1.74高散": "69",
	"1.61超-高散": "25",
	"1.67超-高散": "36",
	"1.74超-高散": "73",
	"1.67超薄": "30",
	"1.74超薄": "71",
};

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

const INITIAL_FORM = {
	0: null,
	1: {
		prescriptionData: {
			OD: {
				sph: null,
				cyl: null,
				axis: null,
				add: null,
			},
			OS: {
				sph: null,
				cyl: null,
				axis: null,
				add: null,
			},
			PD: [null, null], // right-PD, left-PD
		},
		prescriptionFile: null,
		// TODO strength 修改的其实是 sph，这个字段之后可以去掉
		strength: null,
	},
	2: {
		variantId: null, // 变体id
		variant: null,
	},
	3: {
		variantId: null, // 变体id
		variant: null,
	},
};

const GlassesStepFormDialog = forwardRef(
	({ channel, variant, product, submitText = "Confirm", onSubmit, onClose }, ref) => {
		const visionFormRef = useRef(null);

		const [vis, setVis] = useState(false);
		const [form, setForm] = useState(INITIAL_FORM);
		const [currStep, setCurrStep] = useState(0);
		const currTitle = useMemo(() => {
			if (currStep === 0) {
				return "Prescription Type";
			}
			if (currStep === 1) {
				if (form["0"] === "SINGLE_VISION" || form["0"] === "PROGRESSIVE") {
					return "Enter Your Prescription";
				} else if (form["0"] === "READER") {
					return "Select a Magnification Strength";
				}
			} else if (currStep === 2) {
				return "Lens Type";
			} else if (currStep === 3) {
				return "Lens";
			}
		}, [currStep, form]);
		const isAvailable = [variant].some((variant) => variant?.quantityAvailable) ?? false;
		const price = variant?.pricing?.price?.gross
			? formatMoney(variant.pricing.price.gross.amount, variant.pricing.price.gross.currency)
			: isAvailable
				? formatMoneyRange({
						start: product?.pricing?.priceRange?.start?.gross,
						stop: product?.pricing?.priceRange?.stop?.gross,
					})
				: "";
		const totalPrice = useMemo(() => {
			let currency = variant?.pricing.price.gross.currency;
			if (!currency) {
				return null;
			}
			let variants = [variant, form["2"].variant, form["3"].variant].filter(
				(item) => item != null && item.pricing.price.gross.currency === currency,
			);
			let amount = variants.map((item) => item.pricing.price.gross.amount).reduce((a, b) => a + b, 0);
			return formatMoney(amount, currency);
		}, [variant, form]);

		const lensCategory = useMemo(() => {
			if (currStep < 3) {
				return null;
			}
			return getLensCategory({
				sph: form[1].prescriptionData.OD.sph,
				cyl: form[1].prescriptionData.OD.cyl,
			});
		}, [currStep, form]);

		const open = (form) => {
			setVis(true);
			// reset form
			if (form) {
				setForm(form);
			}
		};
		const close = () => {
			setVis(false);
			onClose?.();
		};
		const reset = () => {
			setForm(INITIAL_FORM);
		};
		useImperativeHandle(ref, () => ({
			open,
			close,
			reset,
		}));

		const handleChange = (step, val) => {
			if (step === 0) {
				if (val === "PROGRESSIVE") {
					// 为 PROGRESSIVE 时， 清除 AXIS（且 UI 上会禁用）
					setForm(
						produce(form, (draft) => {
							draft[0] = val;
							draft[1].prescriptionData.OD.axis = null;
							draft[1].prescriptionData.OS.axis = null;
						}),
					);
				} else {
					setForm({
						...form,
						0: val,
					});
				}
				setCurrStep(1);
			} else if (step === 1) {
				if (val[0] === "strength") {
					setForm(
						produce(form, (draft) => {
							draft[1].prescriptionData.OD.sph = val[1];
							draft[1].prescriptionData.OS.sph = val[1];
							draft[1].prescriptionData.PD[0] = 62;
							draft[1].prescriptionData.PD[1] = 62;
						}),
					);
				} else if (val[0] === "prescriptionData") {
					setForm((form) => ({
						...form,
						1: {
							...form[1],
							prescriptionData: val[1],
						},
					}));
				}
			} else if (step === 2) {
				setForm({
					...form,
					2: val,
				});
			} else if (step === 3) {
				setForm({
					...form,
					3: val,
				});
			}
		};

		const handleBack = () => {
			setCurrStep((prevState) => prevState - 1);
		};
		const handleNext = () => {
			switch (currStep) {
				case 1:
					if (["SINGLE_VISION", "PROGRESSIVE"].includes(form[0])) {
						// if (form[1].strength != null) {
						// TODO 要检查下
						if (visionFormRef.current?.hasErr) {
							toast.info("Please fill the form.", {
								position: "top-center",
								autoClose: 1500,
								hideProgressBar: true,
								closeOnClick: true,
								pauseOnHover: false,
								draggable: false,
								progress: undefined,
								theme: "light",
								transition: Bounce,
							});
							return;
						}
						setCurrStep((prevState) => prevState + 1);
						// }
					} else if (form[0] === "READER") {
						if (form[1].prescriptionData.OD.sph != null && form[1].prescriptionData.OS.sph != null) {
							setCurrStep((prevState) => prevState + 1);
						}
					}
					break;
				case 2:
					if (form[2] != null) {
						setCurrStep((prevState) => prevState + 1);
					}
					break;
			}
		};
		return (
			<div
				className={clsx(
					"fixed bottom-0 left-0 right-0 top-0 z-[999] flex translate-y-0 flex-col-reverse bg-white transition sm:flex-row",
					{
						["translate-y-full"]: !vis,
					},
				)}
			>
				{vis && (
					// fix 滚动穿透问题
					<style jsx global>{`
						body {
							overflow: hidden;
						}
					`}</style>
				)}
				<div className="absolute right-8 top-6 z-10">
					<XMarkIcon fontSize={12} className="size-6 cursor-pointer" onClick={close} />
				</div>
				{/* 底部的总价格、表单控制按钮 */}
				<div
					className="absolute bottom-0 left-0 right-0 flex h-16 flex-row items-center bg-white"
					style={{ boxShadow: "0 -1px 8px lightgray" }}
				>
					<div className="pl-12 text-xl font-bold text-neutral-800 max-sm:text-lg">Total</div>
					<div className="flex-[2] text-right max-sm:ml-2">
						<span className="pr-12 text-2xl font-bold text-neutral-800 max-sm:text-lg">{totalPrice}</span>
					</div>
					<div className="flex-[3] pr-12 pt-2 text-right">
						<button
							className={clsx(
								"h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700 max-sm:text-sm",
								{
									hidden: currStep === 0 || currStep === 3,
								},
							)}
							onClick={() => handleNext()}
						>
							Next
						</button>
						<button
							className={clsx(
								"h-12 items-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium leading-6 text-white shadow hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 hover:disabled:bg-neutral-700 aria-disabled:cursor-not-allowed aria-disabled:opacity-70 hover:aria-disabled:bg-neutral-700 max-sm:text-sm",
								{
									hidden: currStep !== 3,
								},
							)}
							onClick={() => onSubmit?.(form)}
						>
							{submitText}
						</button>
					</div>
				</div>
				{/* 左侧信息；sm以下时，位于底部 */}
				<div className="flex h-full flex-[2] flex-col justify-center px-12 pb-16 pt-4 max-sm:m-0 max-sm:mb-[64px] max-sm:h-[148px] max-sm:shrink-0 max-sm:flex-grow-0 max-sm:flex-row max-sm:items-center max-sm:justify-evenly max-sm:p-0">
					<div className="h-2/5 max-sm:h-full">
						{/*	img */}
						<imgf
							src={variant?.media?.[0]?.url}
							alt=""
							className="h-full w-full rounded bg-white object-contain max-sm:mt-12 max-sm:h-auto max-sm:w-[102px]"
						/>
					</div>
					<div className="mt-4 max-sm:h-full">
						<div className="flex flex-row">
							<div className="max-sm:hidden">
								<span className="font-bold max-sm:hidden"></span>You choose: <br />{" "}
								<span className="text-sm text-neutral-600">{variant?.name}</span>
							</div>
							<div className="ml-auto font-bold max-sm:hidden">{price}</div>
							<div className="font-bold">
								{variant?.name} &nbsp;&nbsp; {price}
							</div>
						</div>
						<div className="mt-6 max-sm:mt-0">
							<div>
								<div
									className={clsx({
										invisible: form["0"] == null,
									})}
								>
									<span className="max-sm:hidden">Prescription:</span>
									<br />{" "}
									<span className="text-sm text-neutral-600">
										{PRESCRIPTION_TYPES.find((item) => form["0"] != null && item.value == form["0"])?.label ||
											"--"}
									</span>
								</div>
								<div
									className={clsx("mt-2", {
										invisible: form["2"].variantId == null && form["3"].variantId == null,
									})}
								>
									<div className="font-bold max-sm:hidden">Lens:</div>
									<div className="mt-1 flex flex-row">
										<span className="text-sm text-neutral-600">{lensTypeStr(form)}</span>
										<br />
										<span className="ml-auto">{formatVariantPrice(form["2"].variant)}</span>
									</div>
									<div className="mt-1 flex flex-row">
										<span className="text-sm text-neutral-600">{form["3"]?.variant?.product.name}</span>
										<span className="ml-auto">{formatVariantPrice(form["3"].variant)}</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
				{/* form */}
				<div className="flex h-full flex-[3] flex-col overflow-hidden bg-[#f8f8f8] px-12 pb-16 pt-4 max-sm:h-auto max-sm:flex-[1] max-sm:px-8 max-sm:pb-4">
					<div
						className={clsx("mb-4 flex h-12 items-center", {
							["invisible"]: currStep == 0,
						})}
					>
						<span className="flex cursor-pointer items-center" onClick={() => handleBack()}>
							<ArrowLeftIcon className="mr-2 size-4" />
							Back
						</span>
					</div>
					<div className="font mb-6 text-xl">{currTitle}</div>
					{/* 1.方案 */}
					<div
						className={clsx("flex-1 overflow-y-auto", {
							hidden: currStep !== 0,
						})}
					>
						{PRESCRIPTION_TYPES.map(({ label, value, description }) => (
							<div
								key={value}
								onClick={() => handleChange(0, value)}
								className={clsx(
									"my-2 my-4 cursor-pointer rounded border bg-white p-6 transition hover:border-[#260ac9]",
									{
										["border border-[#260ac9]"]: form["0"] == value,
									},
								)}
							>
								<div className="font-bold">{label}</div>
								<div className="text-sm text-[#999]">{description}</div>
							</div>
						))}
					</div>
					{/* 2.视力数据	*/}
					<div
						className={clsx("flex-1 overflow-y-auto", {
							hidden: currStep !== 1,
						})}
					>
						{["SINGLE_VISION", "PROGRESSIVE"].includes(form[0]) && (
							<VisionReportForm
								ref={visionFormRef}
								type={form[0]}
								value={form[1].prescriptionData}
								onChange={(newVal) => handleChange(1, ["prescriptionData", newVal])}
							/>
						)}
						{form[0] === "READER" && (
							<div>
								{Magnification_Strength_ARRAY.map((num, index) => (
									<div
										key={num.toString()}
										className={clsx(
											"m-2 inline-flex h-10 w-[120px] cursor-pointer items-center justify-center rounded-3xl border bg-white hover:border-blue-500",
											{
												["border-blue-500"]: form[1].prescriptionData.OD.sph === num,
											},
										)}
										onClick={() => handleChange(1, ["strength", num])}
									>
										+{num.toFixed(2)}
									</div>
								))}
							</div>
						)}
					</div>
					{/* 3.镜片类型	*/}
					<LensTypesForm
						channel={channel}
						visible={currStep === 2}
						value={form["2"]}
						onChange={(val) => handleChange(2, val)}
					/>
					{/* 4.镜片厚度	*/}
					<LensThicknessForm
						channel={channel}
						visible={currStep === 3}
						value={form["3"]}
						onChange={(val) => handleChange(3, val)}
						lensCategory={lensCategory}
					/>
				</div>
			</div>
		);
	},
);
GlassesStepFormDialog.displayName = "GlassesStepFormDialog";

export default GlassesStepFormDialog;
