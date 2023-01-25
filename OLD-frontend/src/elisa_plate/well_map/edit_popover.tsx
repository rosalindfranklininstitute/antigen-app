import { ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ElisaWellRef, ElisaWellPost, ElisaWell } from "../../elisa_well/utils";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  getAntigens,
  selectAntigen,
  selectAntigens,
} from "../../antigen/slice";
import {
  getNanobodies,
  selectNanobodies,
  selectNanobody,
} from "../../nanobody/slice";
import {
  Autocomplete,
  Button,
  Card,
  CardContent,
  Popover,
  Stack,
  TextField,
} from "@mui/material";
import { keyEq } from "../../utils/state_management";
import { DispatchType, RootState } from "../../store";
import { Antigen, AntigenRef } from "../../antigen/utils";
import { Nanobody, NanobodyRef } from "../../nanobody/utils";
import { ProjectRef } from "../../project/utils";
import { ElisaWellMapContext } from "./well_map_context";

export type AnchorPosition = { top: number; left: number };

type ElisaWellState = ElisaWellRef & Partial<ElisaWellPost>;

/**
 *
 * A MUI Popover for use as a popover form element; The element consists of a
 * popover card with vertically stacked children nodes and buttons allowing
 * for cancellation or saving of the form contents. Popover location and
 * visibility are controlled via the presence of an anchor element or position,
 * with a callback passed such that the component can hide itself by setting
 * the anchor element to undefined. On pressing the save button the the passed
 * on save callback is called and the popover closed as in the case of
 * cancelled
 *
 * @param params Children elements which compose the popover form fields, an
 * anchor element or position controlling element visibility, a callback to set
 * the anchor element to undefined and a callback which is executed upon
 * pressing of the save button
 * @param params.children The children composing the form fields
 * @param params.anchorEl The anchor element controlling visibility
 * @param params.anchorPosition The anchor position controlling visibility
 * @param params.setAnchor The callback to hide the component
 * @param params.onSave A callback to be executed upon save
 * @returns A MUI popover element which displays a form with cancel and save
 * buttons
 */
function SaveCancelPopover(params: {
  children: ReactNode;
  anchorEl?: HTMLElement;
  anchorPosition?: AnchorPosition;
  setAnchor: (anchorEl: undefined) => void;
  onSave: () => void;
}): JSX.Element {
  return (
    <Popover
      open={Boolean(params.anchorEl) || Boolean(params.anchorPosition)}
      anchorReference={params.anchorEl ? "anchorEl" : "anchorPosition"}
      anchorEl={params.anchorEl}
      anchorPosition={params.anchorPosition}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "center",
        horizontal: "center",
      }}
      onClose={() => params.setAnchor(undefined)}
    >
      <Card>
        <CardContent>
          <Stack spacing={2}>
            {params.children}
            <Stack direction="row" justifyContent="space-between">
              <Button
                variant="outlined"
                color="error"
                endIcon={<CancelIcon />}
                onClick={() => params.setAnchor(undefined)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                endIcon={<DoneIcon />}
                onClick={() => {
                  params.onSave();
                  params.setAnchor(undefined);
                }}
              >
                Save
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Popover>
  );
}

/**
 *
 * A MUI Autocomplete which allows for selection of an antibody from project
 * antibodies. The dropdown contains all available antigens, grouped by their
 * corresponding project and is given a default value according to the passed
 * reference. On change of value the passed callback is called allowing
 * upstream components to make use of the selected value. Antigens are
 * retrieved from the redux store with a dispatch executed to obtain it if
 * unavailable
 *
 * @param params An initial antigen reference, the project antibodies to
 * retrieve and a callback to be executed on change
 * @param params.initAntigen The initial antigen reference
 * @param params.project The project for which antigens should be retrieved
 * @param params.onChange A callback executed on change
 * @returns A MUI Autocomkplete allowing selection of an antibody
 */
function AntigenAutocomplete(params: {
  initAntigen: AntigenRef | undefined;
  project: ProjectRef | undefined;
  onChange: (antigen: Antigen | null) => void;
}): JSX.Element {
  const dispatch = useDispatch<DispatchType>();
  const antigens = useSelector(selectAntigens);
  const initAntigen = useSelector((state: RootState) =>
    params.initAntigen ? selectAntigen(params.initAntigen)(state) : undefined
  );
  const [loading, setLoading] = useState<boolean>(false);

  const loadAntigens = useCallback(() => {
    setLoading(true);
    dispatch(getAntigens({ project: params.project })).then(() =>
      setLoading(false)
    );
  }, [dispatch, params.project]);

  return (
    <Autocomplete
      renderInput={(params) => (
        <TextField {...params} label="Antigen" sx={{ width: "32ch" }} />
      )}
      options={antigens}
      groupBy={(antigen) => antigen.project}
      getOptionLabel={(antigen) => antigen.name}
      defaultValue={initAntigen}
      onChange={(_, antigen) => params.onChange(antigen)}
      onOpen={loadAntigens}
      loading={loading}
    />
  );
}

/**
 *
 * A MUI Autocomplete which allows for selection of a nanobody from project
 * antibodies. The dropdown contains all available nanobodies, grouped by their
 * corresponding project and is given a default value according to the passed
 * reference. On change of value the passed callback is called allowing
 * upstream components to make use of the selected value. Nanobodies are
 * retrieved from the redux store with a dispatch executed to obtain it if
 * unavailable
 *
 * @param params An initial nanobody reference, the project antibodies to
 * retrieve and a callback to be executed on change
 * @param params.initNanobody The initial nanobody reference
 * @param params.project The project for which nanobodies should be retrieved
 * @param params.onChange A callback executed on change
 * @returns A MUI Autocomkplete allowing selection of a nanobody
 */
function NanobodyAutocomplete(params: {
  initNanobody: NanobodyRef | undefined;
  project: ProjectRef;
  onChange: (nanobody: Nanobody | null) => void;
}): JSX.Element {
  const dispatch = useDispatch<DispatchType>();
  const nanobodies = useSelector(selectNanobodies);
  const initNanobody = useSelector((state: RootState) =>
    params.initNanobody ? selectNanobody(params.initNanobody)(state) : undefined
  );
  const [loading, setLoading] = useState<boolean>(false);

  const loadNanobodies = useCallback(() => {
    setLoading(true);
    dispatch(getNanobodies({ project: params.project })).then(() =>
      setLoading(false)
    );
  }, [dispatch, params.project]);

  return (
    <Autocomplete
      renderInput={(params) => (
        <TextField {...params} label="Nanobody" sx={{ width: "32ch" }} />
      )}
      options={nanobodies}
      groupBy={(nanobody) => nanobody.project}
      getOptionLabel={(nanobody) => nanobody.name}
      defaultValue={initNanobody}
      onChange={(_, nanobody) => params.onChange(nanobody)}
      loading={loading}
      onOpen={loadNanobodies}
    />
  );
}

/**
 *
 * A save cancel popover with antigen autocomplete, nanobody autocomplete and
 * threshold numeric text field. The initial values of the antigen and nanobody
 * autocompletes and threshold text field are populated as the current values
 * of the elisa well if it can be retrieved, otherwise they are set to
 * undefined and none respectively. Upon saving the form the elisa well value
 * of the context is set to that entered in the form. Popover location and
 * visibility are controlled via the presence of an anchor element, with a
 * callback passed such that the component can hide itself by setting the
 * anchor element to undefined. Elisa well information is retrieved from the
 * elisa well map context
 *
 * @param params An elisa well reference from which the elisa well can be
 * retrieved, an anchor element controlling element visibility, a callback to
 * set the anchor element to undefined
 * @param params.elisaWellRef The elisa well reference
 * @param params.anchorEl The anchor element controlling visibility
 * @param params.setAnchorEl The callback to hide the component
 * @returns A MUI popover element which displays a form with antigen
 * autocomplete, nanobody autocomplete and threshold numeric text field
 */
export function ElisaWellEditPopover(params: {
  elisaWellRef: ElisaWellRef;
  anchorEl: HTMLElement | undefined;
  setAnchorEl: (anchorEl: undefined) => void;
}) {
  const { getElisaWell, setElisaWell } = useContext(ElisaWellMapContext);
  const [uiElisaWell, setUiElisaWell] = useState<ElisaWellState>(
    params.elisaWellRef
  );

  const updateElisaWell = useCallback(() => {
    if (Object.values(uiElisaWell).every((val) => val !== undefined)) {
      setElisaWell(uiElisaWell as Required<typeof uiElisaWell>);
    }
  }, [setElisaWell, uiElisaWell]);

  useEffect(() => {
    if (params.anchorEl !== undefined) {
      const elisaWell = getElisaWell(params.elisaWellRef);
      setUiElisaWell(elisaWell ? elisaWell : params.elisaWellRef);
    }
  }, [params.elisaWellRef, params.anchorEl, getElisaWell]);

  return (
    <SaveCancelPopover
      anchorEl={params.anchorEl}
      setAnchor={params.setAnchorEl}
      onSave={updateElisaWell}
    >
      <AntigenAutocomplete
        initAntigen={uiElisaWell.antigen}
        project={uiElisaWell.project}
        onChange={(antigen) =>
          setUiElisaWell({
            ...uiElisaWell,
            antigen: antigen ? antigen : uiElisaWell.antigen,
          })
        }
      />
      <NanobodyAutocomplete
        initNanobody={uiElisaWell.nanobody}
        project={uiElisaWell.project}
        onChange={(nanobody) =>
          setUiElisaWell({
            ...uiElisaWell,
            nanobody: nanobody ? nanobody : uiElisaWell.nanobody,
          })
        }
      />
      <TextField
        label="Optical Density"
        type="number"
        defaultValue={uiElisaWell?.optical_density}
        onChange={(evt) => {
          setUiElisaWell({
            ...uiElisaWell,
            optical_density: Number(evt.target.value),
          });
        }}
      />
    </SaveCancelPopover>
  );
}

/**
 *
 * A save cancel popover with antigen autocomplete. Upon saving the form each
 * previously populated elisa well is updated with the selected antigen whilst
 * unpopulated wells are generated as new elisa wells containing the selected
 * antigen, a new nanobody and a default optical density. Popover location and
 * visibility are controlled via the presence of an anchor position, with a
 * callback passed such that the component can hide itself by setting the
 * anchor position to undefined. Elisa well information is retrieved from the
 * elisa well map context
 *
 * @param params Elisa well references from which the elisa wells can be
 * retrieved, an anchor position controlling element visibility, a callback to
 * set the anchor position to undefined
 * @param params.elisaWellRefs The elisa well references
 * @param params.anchorPosition The anchor position controlling visibility
 * @param params.setAnchorPosition The callback to hide the component
 * @returns A MUI popover element which displays a form with antigen
 * autocomplete, nanobody autocomplete and threshold numeric text field
 */
export function ElisaWellsEditPopover(params: {
  elisaWellRefs: Array<ElisaWellRef>;
  anchorPosition: AnchorPosition | undefined;
  setAnchorPosition: (anchorPosition: undefined) => void;
}) {
  const { getElisaWell, setElisaWell, generateElisaWells } =
    useContext(ElisaWellMapContext);
  const elisaWells = params.elisaWellRefs
    .map((elisaWellRef) => getElisaWell(elisaWellRef))
    .filter((elisaWell): elisaWell is ElisaWell => elisaWell !== undefined);
  const [antigen, setAntigen] = useState<Antigen | null>(null);

  const updateElisaWells = useCallback(() => {
    if (!antigen) return;
    const [filled, empty] = params.elisaWellRefs.reduce<
      [Array<ElisaWell>, Array<ElisaWellRef>]
    >(
      ([f, e], elisaWellRef) => {
        const elisaWell = elisaWells.find((elisaWell) =>
          keyEq(elisaWell, elisaWellRef, ["project", "plate", "location"])
        );
        return elisaWell !== undefined
          ? [f.concat(elisaWell), e]
          : [f, e.concat(elisaWellRef)];
      },
      [[], []]
    );
    filled.forEach((elisaWell) => setElisaWell({ ...elisaWell, antigen }));
    generateElisaWells(empty, antigen);
  }, [
    params.elisaWellRefs,
    elisaWells,
    antigen,
    setElisaWell,
    generateElisaWells,
  ]);

  return (
    <SaveCancelPopover
      anchorPosition={params.anchorPosition}
      setAnchor={params.setAnchorPosition}
      onSave={updateElisaWells}
    >
      <AntigenAutocomplete
        initAntigen={undefined}
        project={
          params.elisaWellRefs[0] ? params.elisaWellRefs[0].project : undefined
        }
        onChange={(antigen) => {
          setAntigen(antigen);
        }}
      />
    </SaveCancelPopover>
  );
}
