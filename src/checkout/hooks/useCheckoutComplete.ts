import { useMemo } from "react";
import { useCheckoutCompleteMutation } from "@/checkout/graphql";
import { useCheckout } from "@/checkout/hooks/useCheckout";
import { useSubmit } from "@/checkout/hooks/useSubmit";
import { replaceUrl } from "@/checkout/lib/utils/url";
import { getLensFormFromCheckout } from "@/lib/utils-custom";

export const useCheckoutComplete = () => {
	const { checkout } = useCheckout();
	const checkoutId = checkout.id;
	const lensForm = useMemo(() => getLensFormFromCheckout(checkout), [checkout]);
	const [{ fetching }, checkoutComplete] = useCheckoutCompleteMutation();

	const onCheckoutComplete = useSubmit<{}, typeof checkoutComplete>(
		useMemo(
			() => ({
				parse: () => ({
					checkoutId,
					// 有 lens_form 信息，就塞到 order metadata 中
					...(lensForm
						? {
								metadata: [
									{
										key: "lens_form",
										value: JSON.stringify(lensForm),
									},
								],
							}
						: null),
				}),
				onSubmit: checkoutComplete,
				onSuccess: ({ data }) => {
					const order = data.order;

					if (order) {
						const newUrl = replaceUrl({
							query: {
								order: order.id,
							},
							replaceWholeQuery: true,
						});
						window.location.href = newUrl;
					}
				},
			}),
			[checkoutComplete, checkoutId],
		),
	);
	return { completingCheckout: fetching, onCheckoutComplete };
};
