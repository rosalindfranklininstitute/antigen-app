import {
  Context,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

type Point = {
  x: number;
  y: number;
};

type Selection = {
  start: Point;
  current: Point;
};

export type Region = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

const initRegion = { top: 0, bottom: 0, left: 0, right: 0 };

type SelectionContextT<TagType> = {
  selectionRegion: Region;
  setSelectionRegion: (selectionRegion: Region) => void;
  selectableRegions: Map<TagType, Region>;
  addSelectableRegion: (tag: TagType, selectableRegion: Region) => void;
  selectedRegions: Map<TagType, Region>;
};

/**
 *
 * Creates a drag selection context provider which contains stateful
 * information on the selection region, selectable regions and their tags and
 * selected and their tags. The context provider provides each of the stateful
 * instances and a callback to set the selection region, and add a selectable
 * region. The selected regions are computed upon update of the selection
 * region or the selectable regions.
 *
 * @param SelectionContext The selection context for which this provides
 * @returns A react context for selection contexts
 */
function createSelectionContextProiver<TagType>(
  SelectionContext: Context<SelectionContextT<TagType>>
) {
  return (props: { children: ReactNode }) => {
    const [selectionRegion, setSelectionRegion] = useState<Region>(initRegion);
    const [selectableRegions, setSelectableRegions] = useState<
      Map<TagType, Region>
    >(new Map());
    const [selectedRegions, setSelectedRegions] = useState<
      Map<TagType, Region>
    >(new Map());

    useEffect(() => {
      const selected = new Map(
        Array.from(selectableRegions).filter(([_, region]) =>
          regionsIntersect(selectionRegion, region)
        )
      );
      setSelectedRegions(selected);
    }, [selectionRegion, selectableRegions]);

    const addSelectableRegion = useCallback(
      (tag: TagType, selectableRegion: Region) =>
        setSelectableRegions(selectableRegions.set(tag, selectableRegion)),
      [selectableRegions]
    );

    return (
      <SelectionContext.Provider
        value={{
          selectionRegion,
          setSelectionRegion,
          selectableRegions,
          addSelectableRegion,
          selectedRegions,
        }}
      >
        {props.children}
      </SelectionContext.Provider>
    );
  };
}

/**
 *
 * Creates a selectable region react element used to wrap the selectable
 * region; The element listens for mouse events; upon a mouse down event the
 * first point of the selection region is set and the passed on selection start
 * callback is called without parameters; mouse moved events update the second
 * point of the selection region and call the passed on selection change
 * callback with a map of selected element tags and regions; mouse up events
 * trigger the passed on selection end callback with a map of selected element
 * tags and regions. A red overlay box of 50% opacity is drawn to show the
 * selection region
 *
 * @param SelectionContext The selection context in which this operates
 * @returns A react element which wraps a selectable region
 */
function createSelectableRegionElement<TagType>(
  SelectionContext: Context<SelectionContextT<TagType>>
) {
  return (props: {
    children: ReactNode;
    onSelectionStart?: () => void;
    onSelectionEnd?: (selected: Map<TagType, Region>) => void;
    onSelectionChange?: (selected: Map<TagType, Region>) => void;
  }) => {
    const { onSelectionStart, onSelectionEnd, onSelectionChange } = props;
    const { selectionRegion, setSelectionRegion, selectedRegions } =
      useContext(SelectionContext);
    const [mouseDown, setMouseDown] = useState<boolean>(false);
    const [selection, setSelection] = useState<Selection>({
      start: { y: 0, x: 0 },
      current: { y: 0, x: 0 },
    });

    useEffect(() => {
      if (mouseDown) {
        setSelectionRegion(selectionToRegion(selection));
        if (onSelectionChange) onSelectionChange(selectedRegions);
      }
    }, [
      mouseDown,
      selection,
      setSelectionRegion,
      onSelectionChange,
      selectedRegions,
    ]);

    return (
      <div
        onMouseDown={(evt) => {
          setMouseDown(true);
          setSelection({
            ...selection,
            start: { x: evt.pageX, y: evt.pageY },
          });
          if (onSelectionStart) onSelectionStart();
        }}
        onMouseUp={() => {
          setMouseDown(false);
          if (onSelectionEnd) onSelectionEnd(selectedRegions);
        }}
        onMouseMove={(evt) => {
          setSelection({
            ...selection,
            current: { x: evt.pageX, y: evt.pageY },
          });
        }}
      >
        {props.children}
        {mouseDown && (
          <div
            style={{
              position: "absolute",
              top: selectionRegion.top,
              left: selectionRegion.left,
              width: selectionRegion.right - selectionRegion.left,
              height: selectionRegion.bottom - selectionRegion.top,
              backgroundColor: "red",
              opacity: 0.5,
            }}
          />
        )}
      </div>
    );
  };
}

/**
 *
 * Creates a selectable region wrapped with a selection context provider
 * lifting the on selection start, change and end callbacks of the selectable
 * region element
 *
 * @param SelectionContext The selection context operates
 * @returns A react element which wraps a selectable region wrapped with a
 * context provider
 */
function createSelectableRegion<TagType>(
  SelectionContext: Context<SelectionContextT<TagType>>
) {
  return (props: {
    children: ReactNode;
    onSelectionStart?: () => void;
    onSelectionEnd?: (selected: Map<TagType, Region>) => void;
    onSelectionChange?: (selected: Map<TagType, Region>) => void;
  }) => {
    const SelectionContextProvider =
      createSelectionContextProiver(SelectionContext);
    const SelectableRegionElement =
      createSelectableRegionElement(SelectionContext);

    return (
      <SelectionContextProvider>
        <SelectableRegionElement
          onSelectionStart={props.onSelectionStart}
          onSelectionEnd={props.onSelectionEnd}
          onSelectionChange={props.onSelectionChange}
        >
          {props.children}
        </SelectableRegionElement>
      </SelectionContextProvider>
    );
  };
}

/**
 *
 * Creates a selectable item react element used to shrink wrap selectable
 * items; The item registeres itself against the context with the provided tag
 *
 * @param SelectionContext The selection context in which this operates
 * @returns A react element which shrink wraps a selectable item
 */
function createSelectableItem<TagType>(
  SelectionContext: Context<SelectionContextT<TagType>>
) {
  return (props: { children: ReactNode; tag: TagType }) => {
    const divRef = useRef<HTMLDivElement | null>(null);
    const { addSelectableRegion } = useContext(SelectionContext);

    useEffect(() => {
      if (divRef.current)
        addSelectableRegion(props.tag, divRef.current.getBoundingClientRect());
    }, [props.tag, addSelectableRegion]);

    return <div ref={divRef}>{props.children}</div>;
  };
}

/**
 *
 * Converts a selection consisting of two points to a region bounded by the
 * top, bottom, left and right
 *
 * @param selection A selection consisting of two points
 * @returns A region bounded by top, bottom, left and right
 */
function selectionToRegion(selection: Selection): Region {
  return {
    top: Math.min(selection.start.y, selection.current.y),
    bottom: Math.max(selection.start.y, selection.current.y),
    left: Math.min(selection.start.x, selection.current.x),
    right: Math.max(selection.start.x, selection.current.x),
  };
}

/**
 *
 * Checks whether two regions bounded by top, bottom, left and right intersect
 *
 * @param first The first region
 * @param second The second region
 * @returns A boolean which is true if the regions intersect
 */
function regionsIntersect(first: Region, second: Region): boolean {
  return (
    first.left <= second.right &&
    first.right >= second.left &&
    first.top <= second.bottom &&
    first.bottom >= second.top
  );
}

/**
 *
 * A react hook which provides the selectable region and selectable item
 * elements
 *
 * @returns The selectable region and selectable item elements
 */
export function useDragSelector<TagType>() {
  const SelectionContext = createContext<SelectionContextT<TagType>>({
    selectionRegion: initRegion,
    setSelectionRegion: () => {},
    selectableRegions: new Map(),
    addSelectableRegion: () => {},
    selectedRegions: new Map(),
  });

  return {
    SelectableRegion: createSelectableRegion(SelectionContext),
    SelectableItem: createSelectableItem(SelectionContext),
  };
}
