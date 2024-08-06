"use client";

import { useState } from "react";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";

const options = [
	{
		value: "-0.50",
	},
	{
		value: "-1.5",
	},
	{
		value: "-1.25",
	},
	{
		value: "-1.00",
	},
];

const SelectMenus = () => {
	const [selected, setSelected] = useState(options[0]);

	return (
		<Listbox value={selected} onChange={setSelected}>
			{/*<Label className="block text-sm font-medium leading-6 text-gray-900">Assigned to</Label>*/}
			<div className="relative">
				<ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm sm:text-sm sm:leading-6">
					<span className="flex items-center">
						{/*<img alt="" src={selected.avatar} className="h-5 w-5 flex-shrink-0 rounded-full" />*/}
						<span className="ml-3 block truncate">{selected.value}</span>
					</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2">
						<ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
					</span>
				</ListboxButton>

				<ListboxOptions
					transition
					className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in sm:text-sm"
				>
					{options.map((item) => (
						<ListboxOption
							key={item.value}
							value={item}
							className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white"
						>
							<div className="flex items-center">
								{/*<img alt="" src={item.avatar} className="h-5 w-5 flex-shrink-0 rounded-full" />*/}
								<span className="group-data-[selected]: ml-3 block truncate font-normal">{item.value}</span>
							</div>
							<span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600 group-data-[focus]:text-white [.group:not([data-selected])_&]:hidden">
								<CheckIcon aria-hidden="true" className="h-5 w-5" />
							</span>
						</ListboxOption>
					))}
				</ListboxOptions>
			</div>
		</Listbox>
	);
};

// 视力表单
export function ExtraOrder() {
	return (
		<div>
			<div className="min-h-[120px] w-full border-collapse rounded border border-gray-300 bg-white text-sm shadow-sm">
				<div className="flex h-12 flex-row border-b border-gray-300 bg-[#eef2fb]">
					<div className="flex-1 border-r border-gray-300"></div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">SPH</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">CYL</div>
					<div className="flex  flex-1 items-center justify-center">AXIS</div>
				</div>
				{/* 第二行 */}
				<div className="flex h-12 flex-row border-b border-gray-300">
					<div className="flex flex-1 items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							OD <br />
							<span className="text-xs text-[#999]">(Right)</span>
						</span>
					</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">
						<SelectMenus />
					</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">
						<SelectMenus />
					</div>
					<div className="flex  flex-1 items-center justify-center">
						<SelectMenus />
					</div>
				</div>
				{/* 第二行 */}
				<div className="flex h-12 flex-row">
					<div className="flex flex-1 items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							OS <br />
							<span className=" text-xs text-[#999]">(Left)</span>
						</span>
					</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">
						<SelectMenus />
					</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">
						<SelectMenus />
					</div>
					<div className="flex  flex-1 items-center justify-center">
						<SelectMenus />
					</div>
				</div>
			</div>
			<div className="mt-4 w-1/2 border-collapse rounded border border-gray-300 bg-white text-sm shadow-sm">
				<div className="flex h-12 flex-row">
					<div className="flex flex-1 items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							PD <br />
							<span className=" text-xs text-[#999]">(distance)</span>
						</span>
					</div>
					<div className="flex flex-1 items-center justify-center">
						<SelectMenus />
					</div>
				</div>
			</div>
		</div>
	);
}
