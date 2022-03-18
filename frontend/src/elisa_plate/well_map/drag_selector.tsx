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

function selectionToRegion(selection: Selection): Region {
  return {
    top: Math.min(selection.start.y, selection.current.y),
    bottom: Math.max(selection.start.y, selection.current.y),
    left: Math.min(selection.start.x, selection.current.x),
    right: Math.max(selection.start.x, selection.current.x),
  };
}

function regionsIntersect(first: Region, second: Region): boolean {
  return (
    first.left <= second.right &&
    first.right >= second.left &&
    first.top <= second.bottom &&
    first.bottom >= second.top
  );
}

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
