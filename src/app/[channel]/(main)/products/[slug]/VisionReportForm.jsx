"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import clsx from "clsx";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Checkbox } from "@headlessui/react";
import { produce } from "immer";
import _ from "lodash";

const OPTIONS = {
	SPH: _.range(-12, 12, 0.25)
		.concat(2.25)
		.map((i) => ({ label: i > 0 ? `+${i.toFixed(2)}` : i.toFixed(2), value: i })),
	CYL: _.range(-6, 6, 0.25)
		.concat(6)
		.map((i) => ({ label: i > 0 ? `+${i.toFixed(2)}` : i.toFixed(2), value: i })),
	ADD: _.range(0.5, 3.5, 0.25)
		.concat(3.5)
		.map((i) => ({ label: i > 0 ? `+${i.toFixed(2)}` : i.toFixed(2), value: i })),
	AXIS: _.range(0, 180, 1)
		.concat(180)
		.map((i) => ({ label: i + "", value: i })),
	PD: _.range(25, 41, 0.5)
		.concat(41)
		.map((i) => ({ label: i > 0 ? `+${i.toFixed(2)}` : i.toFixed(2), value: i })),
};

const INITIAL_VAL = {
	SINGLE_VISION: {
		// sph: -0.5,
		sph: 0,
		cyl: 0,
		axis: "None",
		add: 0,
		pd: [31, 31],
	},
	PROGRESSIVE: {
		sph: 0,
		cyl: 0,
		axis: "None",
		add: 0,
		pd: [31, 31],
	},
};

// @type 视力类型
const SelectMenus = ({ value, onChange = () => {}, type, fieldType }) => {
	const [selected, setSelected] = useState(null);
	// 处理 value 和 selected.value 不一致的情况，而进行同步，比如其他地方修改了 value，就同步给 selected.value
	useEffect(() => {
		// avoid infinite update
		if (value == selected?.value) {
			return;
		}
		const opt = opts.find((item) => item.value === value);
		if (opt) {
			setSelected(opt);
		} else if (value === "None") {
			// 适配 AXIS 初始值，但是在选项中不存在
			// 创建一个选项中不存在的
			setSelected({
				label: "None",
				value: "None",
			});
		} else if (value === 0) {
			// 适配 ADD 初始值，但是在选项中不存在
			// 创建一个选项中不存在的
			setSelected({
				label: "0.00",
				value: 0,
			});
		}
	}, [value]);
	useEffect(() => {
		// if ((value == null && selected?.value != null) || selected?.value != value) {
		// avoid infinite update
		if (selected?.value != value) {
			onChange && onChange(selected?.value || null);
		}
	}, [selected]);
	const opts = useMemo(() => {
		return OPTIONS[fieldType] || [];
	}, [fieldType]);
	// value 为空 且 opts 不变的情况下，初始化一次 selected
	// useEffect(() => {
	// 	if (!value && opts.length > 0 && opts[0]) {
	// 		const defaultVal = INITIAL_VAL[type][fieldType.toUpperCase()]
	// 		if (defaultVal != null) {
	// 			const opt = opts.find(item => item.value === defaultVal)
	// 			opt && setSelected(opt)
	// 		}
	// 	}
	// }, [opts, value]);

	return (
		<Listbox value={selected} onChange={setSelected}>
			{/*<Label className="block text-sm font-medium leading-6 text-gray-900">Assigned to</Label>*/}
			<div className="relative">
				<ListboxButton className="relative h-[36px] w-full min-w-[42px] cursor-default rounded-md bg-white py-1.5 text-left text-gray-900 shadow-sm max-sm:px-0 sm:text-sm sm:leading-6 md:pl-1 md:pr-7">
					<span className="flex items-center">
						{/*<img alt="" src={selected.avatar} className="h-5 w-5 flex-shrink-0 rounded-full" />*/}
						<span className="ml-3 block truncate max-sm:ml-0">{selected?.label ?? selected?.value}</span>
					</span>
					<span className="pointer-events-none absolute inset-y-0 right-0 ml-3 hidden items-center pr-2 md:flex  ">
						<ChevronUpDownIcon aria-hidden="true" className="h-5 w-5 text-gray-400" />
					</span>
				</ListboxButton>
				{/* 选项 */}
				<ListboxOptions
					transition
					className="absolute left-1/2 z-10 mt-1 max-h-56 w-full min-w-[112px] -translate-x-1/2 overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none data-[closed]:data-[leave]:opacity-0 data-[leave]:transition data-[leave]:duration-100 data-[leave]:ease-in max-sm:w-[82px] max-sm:-translate-x-1/4 sm:text-sm"
				>
					{(!opts || opts.length === 0) && <div className="text-center">No options.</div>}
					{opts.map((item) => (
						<ListboxOption
							key={item.value}
							value={item}
							className="group relative cursor-default select-none py-2 text-gray-900 data-[focus]:bg-indigo-600 data-[focus]:text-white max-sm:px-2 md:pl-3 md:pr-9"
						>
							<div className="flex items-center">
								{/*<img alt="" src={item.avatar} className="h-5 w-5 flex-shrink-0 rounded-full" />*/}
								<span className="group-data-[selected]: ml-3 block truncate font-normal">{item.label}</span>
							</div>
							<span className="absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600 group-data-[focus]:text-white max-sm:hidden md:flex [.group:not([data-selected])_&]:hidden">
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
const VisionReportForm = forwardRef(({ type, value, onChange = () => {}, readonly = false }, ref) => {
	const [enabled, setEnabled] = useState(readonly);

	useEffect(() => {
		if (INITIAL_VAL[type]) {
			const newValue = produce(value, (draft) => {
				Object.entries(INITIAL_VAL[type]).forEach(([k, v]) => {
					["OD", "OS"].forEach((path) => {
						// 注意这里是 ===
						if (draft[path][k] === null && v != null) {
							draft[path][k] = v;
						}
					});
					if (k === "pd" && v != null) {
						draft.PD = v;
					}
				});
			});
			onChange(newValue);
		}
	}, [type]);

	const warnMsg = useMemo(() => {
		if (value.OD.sph * value.OS.sph < 0) {
			return "In general, SPH is either - or +. Please make sure they are correct.";
		} else if (Math.abs(Math.abs(value.OD.sph) - Math.abs(value.OS.sph)) > 3) {
			return "Your SPH values may be abnormal. Please make sure they are correct.";
		} else if (value.OD.cyl * value.OS.cyl < 0) {
			return "In general, CYL is either - or +. Please make sure they are correct.";
		} else if (Math.abs(Math.abs(value.OD.cyl) - Math.abs(value.OS.cyl)) > 3) {
			return "Your CYL values may be abnormal. Please make sure they are correct.";
		}
		return null;
	}, [value]);
	const errors = useMemo(() => {
		let _errors = {
			OD: {
				// cyl: null,
				add: null,
			},
			OS: {
				// cyl: null,
				add: null,
			},
			// PD: null
		};
		["OD", "OS"].forEach((path) => {
			if (
				(value[path].axis === "None" || value[path].axis == null) &&
				(value[path].add == null || value[path].add == 0)
			) {
				// TODO check
				_errors[path].add = path + " Add must not be 0.00.";
			}
		});
		// if (value.PD[0] == null || value.PD[1] == null) {
		// 	_errors.PD = 'PD is required.'
		// }
		return _errors;
	}, [value]);
	const hasErr = useMemo(() => ["OD", "OS"].some((path) => errors[path].add != null), [errors]);

	useImperativeHandle(
		ref,
		() => {
			return {
				hasErr,
			};
		},
		[hasErr],
	);

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
				{/* 第一行 header */}
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
					<div className="flex flex-1 items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							OD <br />
							<span className="text-xs text-[#999]">(Right)</span>
						</span>
					</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OD.sph}</span>
						) : (
							<SelectMenus
								type={type}
								fieldType="SPH"
								value={value.OD.sph}
								onChange={(val) => _onChangeUnit(["OD", "sph"], val)}
							/>
						)}
					</div>
					<div className="flex flex-1 items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OD.cyl}</span>
						) : (
							<SelectMenus
								type={type}
								fieldType="CYL"
								value={value.OD.cyl}
								onChange={(val) => _onChangeUnit(["OD", "cyl"], val)}
							/>
						)}
					</div>
					<div
						className={clsx("flex flex-1 items-center justify-center", {
							["border-r border-gray-300 bg-[#f7f8fa]"]: type === "PROGRESSIVE" || readonly,
						})}
					>
						{type === "PROGRESSIVE" || readonly ? (
							<span className="text-neutral-400">None</span>
						) : (
							<SelectMenus
								type={type}
								fieldType="AXIS"
								value={value.OD.axis}
								onChange={(val) => _onChangeUnit(["OD", "axis"], val)}
							/>
						)}
					</div>
					{(type === "PROGRESSIVE" || readonly) && (
						<div className="flex flex-1 items-center justify-center">
							{readonly ? (
								<span className="text-neutral-500">{value.OD.add}</span>
							) : (
								<SelectMenus
									type={type}
									fieldType="ADD"
									value={value.OD.add}
									onChange={(val) => _onChangeUnit(["OD", "add"], val)}
								/>
							)}
						</div>
					)}
				</div>
				{/* 第三行 */}
				<div className="flex h-12 flex-row">
					<div className="flex flex-1  items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							OS <br />
							<span className=" text-xs text-[#999]">(Left)</span>
						</span>
					</div>
					<div className="flex flex-1  items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OS.sph}</span>
						) : (
							<SelectMenus
								type={type}
								fieldType="SPH"
								value={value.OS.sph}
								onChange={(val) => _onChangeUnit(["OS", "sph"], val)}
							/>
						)}
					</div>
					<div className="flex flex-1  items-center justify-center border-r border-gray-300">
						{readonly ? (
							<span className="text-neutral-500">{value.OS.cyl}</span>
						) : (
							<SelectMenus
								type={type}
								fieldType="CYL"
								value={value.OS.cyl}
								onChange={(val) => _onChangeUnit(["OS", "cyl"], val)}
							/>
						)}
					</div>
					<div
						className={clsx("flex flex-1  items-center justify-center", {
							["border-r border-gray-300 bg-[#f7f8fa]"]: type === "PROGRESSIVE" || readonly,
						})}
					>
						{type === "PROGRESSIVE" || readonly ? (
							<span className="text-neutral-400">None</span>
						) : (
							<SelectMenus
								type={type}
								fieldType="AXIS"
								value={value.OS.axis}
								onChange={(val) => _onChangeUnit(["OS", "axis"], val)}
							/>
						)}
					</div>
					{(type === "PROGRESSIVE" || readonly) && (
						<div className="flex flex-1  items-center justify-center">
							{readonly ? (
								<span className="text-neutral-500">{value.OS.add}</span>
							) : (
								<SelectMenus
									type={type}
									fieldType="ADD"
									value={value.OS.add}
									onChange={(val) => _onChangeUnit(["OS", "add"], val)}
								/>
							)}
						</div>
					)}
				</div>
			</div>
			{warnMsg && (
				<div className="mt-1">
					<span className="text-xs text-red-500">{warnMsg}</span>
				</div>
			)}
			{["OD", "OS"].map((path) =>
				errors[path].add ? (
					<div className="mt-1">
						<span className="text-xs text-red-500">{errors[path].add}</span>
					</div>
				) : null,
			)}
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
					<div className="flex flex-1  items-center border-r border-gray-300 bg-[#eef2fb]">
						<span className="ml-2">
							PD <br />
							<span className=" text-xs text-[#999] max-xl:hidden">(Pupillary distance)</span>
						</span>
					</div>
					<div
						className={clsx("relative flex flex-1  items-center justify-center", {
							["border-r border-gray-300"]: enabled,
						})}
					>
						{enabled && <span className="mr-1 text-xs text-neutral-400">Right</span>}
						{readonly ? (
							<span className="text-neutral-500">{value.PD[1]}</span>
						) : (
							<SelectMenus
								type={type}
								fieldType="PD"
								value={value.PD[1]}
								onChange={(val) => _onChangeUnit(["PD", "1"], val)}
							/>
						)}
					</div>
					{enabled && (
						<div className="relative flex flex-1  items-center justify-center">
							{enabled && <span className="ml-1 text-xs text-neutral-400">Left</span>}
							{readonly ? (
								<span className="text-neutral-500">{value.PD[0]}</span>
							) : (
								<SelectMenus
									type={type}
									fieldType="PD"
									value={value.PD[0]}
									onChange={(val) => _onChangeUnit(["PD", "0"], val)}
								/>
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
			<div className="mt-1 hidden text-xs max-xl:block">
				<div className="text-neutral-400">PD: Pupillary distance</div>
			</div>
		</div>
	);
});

export default VisionReportForm;
