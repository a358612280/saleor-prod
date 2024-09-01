"use server";

import { revalidatePath } from "next/cache";
import { executeGraphQL } from "@/lib/graphql";
import { CheckoutDeleteLinesDocument } from "@/gql/graphql";

type deleteLineFromCheckoutArgs = {
	lineId: string;
	checkoutId: string;
	subLineIds?: [string] | [];
};

export const deleteLineFromCheckout = async ({
	lineId,
	checkoutId,
	subLineIds = [],
}: deleteLineFromCheckoutArgs) => {
	await executeGraphQL(CheckoutDeleteLinesDocument, {
		variables: {
			checkoutId,
			// TODO check
			lineIds: [lineId, ...subLineIds].filter((item) => item != null),
		},
		cache: "no-cache",
	});

	revalidatePath("/cart");
};
