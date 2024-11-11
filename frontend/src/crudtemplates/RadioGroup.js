"use client";

import { Radio, RadioGroup } from "@headlessui/react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function WrappedRadioGroup(props) {
  return (
    <fieldset aria-label={"Choose a " + props.label}>
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium leading-6 text-gray-900">
          {props.label}
        </div>
      </div>

      <RadioGroup
        value={props.value}
        onChange={props.setValue}
        className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6"
      >
        {props.options.map((option) => (
          <Radio
            key={option.name}
            value={option}
            disabled={option.disabled}
            className={classNames(
              !option.disabled
                ? "cursor-pointer focus:outline-none"
                : "cursor-not-allowed opacity-25",
              "flex items-center justify-center rounded-md bg-white px-3 py-3 text-sm font-semibold uppercase text-gray-900 ring-1 ring-gray-300 hover:bg-gray-50 data-[checked]:bg-indigo-600 data-[checked]:text-white data-[checked]:ring-0 data-[focus]:data-[checked]:ring-2 data-[focus]:ring-2 data-[focus]:ring-indigo-600 data-[focus]:ring-offset-2 data-[checked]:hover:bg-indigo-500 sm:flex-1 [&:not([data-focus],[data-checked])]:ring-inset",
            )}
          >
            {option.name}
          </Radio>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
