"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Checkbox } from "@headlessui/react";

const options = [
	{
		value: -0.5,
	},
	{
		value: -1.5,
	},
	{
		value: -1.25,
	},
	{
		value: -1.0,
	},
];

const SelectMenus = ({ value, onChange = () => {} }) => {
	const [selected, setSelected] = useState(options.find((item) => item.value == value) || options[0]);
	useEffect(() => {
		// avoid infinite update
		if (selected?.value != value) {
			onChange && onChange(selected?.value || null);
		}
	}, [selected]);

	return (
		<Listbox value={selected} onChange={setSelected}>
			{/*<Label className="block text-sm font-medium leading-6 text-gray-900">Assigned to</Label>*/}
			<div className="relative">
				<ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm max-sm:px-0 sm:text-sm sm:leading-6">
					<span className="flex items-center">
						{/*<img alt="" src={selected.avatar} className="h-5 w-5 flex-shrink-0 rounded-full" />*/}
						<span className="ml-3 block truncate max-sm:ml-0">{selected.value.toFixed(2)}</span>
					</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-2 max-sm:hidden">
						<ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
					</span>
				</ListboxButton>
				{/* 选项 */}
				<ListboxOptions
					transition
					className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in max-sm:w-[82px] max-sm:-translate-x-1/4 sm:text-sm"
				>
					{options.map((item) => (
						<ListboxOption
							key={item.value}
							value={item}
							className="group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white max-sm:px-2"
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
/*
	{
		OD: {
			SPH: null,
			CYL: null,
			AXIS: null,
			ADD: null,
		},
		OS: {
			SPH: null,
			CYL: null,
			AXIS: null,
			ADD: null,
		},
		PD: [null, null] // right-PD, left-PD
	}
 */
function VisionReportForm({ type, value, onChange = () => {}, readonly = false }) {
	const [enabled, setEnabled] = useState(readonly);

	const handleCheck = (val) => {
		if (val) {
			if (value.PD[0] !== value.PD[1]) {
				onChange?.({
					...value,
					PD: [value.PD[1], value.PD[1]],
				});
			}
		}
		setEnabled(val);
	};
	const _onChangeUnit = ([key1, key2], val) => {
		if (key1 == "PD") {
			const newPd = [...value.PD];
			newPd[key2] = val;
			if (!enabled) {
				newPd[0] = val;
			}
			onChange({
				...value,
				PD: newPd,
			});
			return;
		}
		onChange({
			...value,
			[key1]: {
				...value[key1],
				[key2]: val,
			},
		});
	};

	return (
		<div className="min-w-[300px] max-sm:w-full">
			<div className="min-h-[120px] w-full border-collapse rounded border border-gray-300 bg-white text-sm shadow-sm">
				{/* 第一行 */}
				<div className="flex h-12 flex-row border-b border-gray-300 bg-[#eef2fb]">
					<div className="flex-1  border-r border-gray-300"></div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">SPH</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">CYL</div>
					<div
						className={clsx("flex  flex-1 items-center justify-center", {
							["border-r border-gray-300"]: type === "PROGRESSIVE" || readonly,
						})}
					>
						AXIS
					</div>
					{(type === "PROGRESSIVE" || readonly) && (
						<div className="flex  flex-1 items-center justify-center">ADD</div>
					)}
				</div>
				{/* 第二行 */}
				<div className="flex h-12 flex-row border-b border-gray-300">
					<div className="flex flex-1 shrink-0 items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							OD <br />
							<span className="text-xs text-[#999]">(Right)</span>
						</span>
					</div>
					<div className="flex flex-1 shrink-0 items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OD.sph}</span>
						) : (
							<SelectMenus value={value.OD.sph} onChange={(val) => _onChangeUnit(["OD", "sph"], val)} />
						)}
					</div>
					<div className="flex flex-1 shrink-0 items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OD.cyl}</span>
						) : (
							<SelectMenus value={value.OD.cyl} onChange={(val) => _onChangeUnit(["OD", "cyl"], val)} />
						)}
					</div>
					<div
						className={clsx("flex flex-1 shrink-0 items-center justify-center", {
							["border-r border-gray-300 bg-[#f7f8fa]"]: type === "PROGRESSIVE" || readonly,
						})}
					>
						{type === "PROGRESSIVE" || readonly ? (
							<span className="text-neutral-400">None</span>
						) : (
							<SelectMenus value={value.OD.axis} onChange={(val) => _onChangeUnit(["OD", "axis"], val)} />
						)}
					</div>
					{(type === "PROGRESSIVE" || readonly) && (
						<div className="flex flex-1 shrink-0 items-center justify-center">
							{readonly ? (
								<span className="text-neutral-500">{value.OD.add}</span>
							) : (
								<SelectMenus value={value.OD.add} onChange={(val) => _onChangeUnit(["OD", "add"], val)} />
							)}
						</div>
					)}
				</div>
				{/* 第三行 */}
				<div className="flex h-12 flex-row">
					<div className="flex flex-1 shrink-0 items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							OS <br />
							<span className=" text-xs text-[#999]">(Left)</span>
						</span>
					</div>
					<div className="flex flex-1 shrink-0 items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OS.sph}</span>
						) : (
							<SelectMenus value={value.OS.sph} onChange={(val) => _onChangeUnit(["OS", "sph"], val)} />
						)}
					</div>
					<div className="flex flex-1 shrink-0 items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OS.cyl}</span>
						) : (
							<SelectMenus value={value.OS.cyl} onChange={(val) => _onChangeUnit(["OS", "cyl"], val)} />
						)}
					</div>
					<div
						className={clsx("flex flex-1 shrink-0 items-center justify-center", {
							["border-r border-gray-300 bg-[#f7f8fa]"]: type === "PROGRESSIVE" || readonly,
						})}
					>
						{type === "PROGRESSIVE" || readonly ? (
							<span className="text-neutral-400">None</span>
						) : (
							<SelectMenus value={value.OS.axis} onChange={(val) => _onChangeUnit(["OS", "axis"], val)} />
						)}
					</div>
					{(type === "PROGRESSIVE" || readonly) && (
						<div className="flex flex-1 shrink-0 items-center justify-center">
							{readonly ? (
								<span className="text-neutral-500">{value.OS.add}</span>
							) : (
								<SelectMenus value={value.OS.add} onChange={(val) => _onChangeUnit(["OS", "add"], val)} />
							)}
						</div>
					)}
				</div>
			</div>
			{/* PD */}
			<div
				className={clsx("mt-4 border-collapse rounded border border-gray-300 bg-white text-sm shadow-sm", {
					// 表格宽度对齐
					"w-1/2": !enabled && type !== "PROGRESSIVE",
					"w-3/4": enabled && type !== "PROGRESSIVE",
					"w-2/5": !enabled && type === "PROGRESSIVE",
					"w-3/5": (enabled && type === "PROGRESSIVE") || readonly,
				})}
			>
				<div className="flex h-12 flex-row">
					<div className="flex flex-1 shrink-0 items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							PD <br />
							<span className=" text-xs text-[#999] max-sm:hidden">(Pupillary distance)</span>
						</span>
					</div>
					<div
						className={clsx("relative flex flex-1 shrink-0 items-center justify-center", {
							["border-r border-gray-300"]: enabled,
						})}
					>
						{enabled && <span className="mr-1 text-xs text-neutral-400">Right</span>}
						{readonly ? (
							<span className="text-neutral-500">{value.PD[1]}</span>
						) : (
							<SelectMenus value={value.PD[1]} onChange={(val) => _onChangeUnit(["PD", "1"], val)} />
						)}
					</div>
					{enabled && (
						<div className="relative flex flex-1 shrink-0 items-center justify-center">
							{enabled && <span className="ml-1 text-xs text-neutral-400">Left</span>}
							{readonly ? (
								<span className="text-neutral-500">{value.PD[0]}</span>
							) : (
								<SelectMenus value={value.PD[0]} onChange={(val) => _onChangeUnit(["PD", "0"], val)} />
							)}
						</div>
					)}
				</div>
			</div>
			<div className="mt-2 flex items-center">
				{!readonly && (
					<>
						<Checkbox
							checked={enabled}
							onChange={handleCheck}
							className="ring-gray/15 data-[checked]:bg-gray group inline-block size-4 rounded-md bg-white p-1 ring-1 ring-inset"
						>
							<CheckIcon className="hidden size-2 fill-black group-data-[checked]:block" />
						</Checkbox>
						<span className="ml-2 text-sm text-neutral-700">2PD</span>
					</>
				)}
			</div>
			<div className="hidden text-xs max-sm:block">
				<div className="text-neutral-400">PD：(Pupillary distance)</div>
			</div>
		</div>
	);
}

export default VisionReportForm;
