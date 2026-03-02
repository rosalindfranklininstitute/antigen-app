import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { Combobox } from "@headlessui/react";
import { useState } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ComboBox = (props) => {
  // const [selectedOptions, setSelectedOptions] = useState(props.selected);
  const [query, setQuery] = useState("");

  const filteredOptions =
    query === ""
      ? props.options
      : props.options.filter((option) => {
          return option[props.displayField]
            .toLowerCase()
            .includes(query.toLowerCase());
        });

  return (
    <Combobox
      as="div"
      value={props.selected}
      onChange={props.onChange}
      multiple={props.multiple}
    >
      {/* <Combobox.Label className="block text-sm font-medium text-gray-700">Assigned to</Combobox.Label> */}
      <div className="relative">
        <Combobox.Input
          className="w-full rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          onChange={(event) => setQuery(event.target.value)}
          displayValue={(optIds) => {
            if (optIds === null) {
              return "";
            }
            if (Number.isInteger(optIds)) {
              optIds = [optIds];
            }
            return optIds
              .map((optId) => {
                let opt = props.options.find(
                  (availOpt) => availOpt.id === optId,
                );
                return opt !== undefined ? opt[props.displayField] : "";
              })
              .join(", ");
          }}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredOptions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredOptions.map((option) => (
              <Combobox.Option
                key={props.field + "combo" + option.id}
                value={option.id}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-3 pr-9",
                    active ? "bg-indigo-600 text-white" : "text-gray-900",
                  )
                }
              >
                {({ active, selected }) => (
                  <>
                    <div className="flex items-center">
                      {/* <span
                      className={classNames(
                        'inline-block h-2 w-2 flex-shrink-0 rounded-full',
                        person.online ? 'bg-green-400' : 'bg-gray-200'
                      )}
                      aria-hidden="true"
                    /> */}
                      <span
                        className={classNames(
                          "ml-3 truncate",
                          selected && "font-semibold",
                        )}
                      >
                        {option[props.displayField]}
                        {/* <span className="sr-only"> is {person.online ? 'online' : 'offline'}</span> */}
                      </span>
                    </div>

                    {selected && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 right-0 flex items-center pr-4",
                          active ? "text-white" : "text-indigo-600",
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  );
};

export default ComboBox;
