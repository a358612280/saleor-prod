import { formatMoney } from "./utils";

export const isSubProduct = (line) => {
	return (
		line?.metadata?.some(
			(item) => item.key === "related_variant_id" && item.value != null && item.value.trim().length > 0,
		) || false
	);
};

export const isMainProduct = (line) => {
	return (
		line?.metadata?.some(
			(item) => item.key === "lens_form" && item.value != null && item.value.trim().length > 0,
		) || false
	);
};

export const calculateLinesPrice = (lines) => {
	if (!lines || lines.length === 0) {
		return null;
	}
	console.log("lines[0]", lines[0]);
	let currency = lines[0]?.variant?.pricing?.price.gross.currency;
	if (!currency) {
		return null;
	}
	let variants = lines
		.map((line) => line?.variant)
		.filter((item) => item != null && item.pricing.price.gross.currency === currency);
	let amount = variants.map((item) => item.pricing.price.gross.amount).reduce((a, b) => a + b, 0);
	return formatMoney(amount, currency);
};

export const parseLensForm = (line) => {
	try {
		return JSON.parse(line?.metadata?.find((meta) => meta.key === "lens_form")?.value);
	} catch (e) {
		return null;
	}
};

export const getLensFormFromCheckout = (checkout) => {
	let str = checkout?.lines
		.find((line) => line.metadata.some((item) => item.key == "lens_form"))
		?.metadata?.find((item) => item?.key === "lens_form")?.value;
	if (!str || str.trim().length === 0) {
		return null;
	}
	try {
		return JSON.parse(str);
	} catch (e) {
		return null;
	}
};
