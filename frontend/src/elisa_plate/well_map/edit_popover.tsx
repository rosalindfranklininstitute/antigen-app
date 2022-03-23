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
import { partialEq } from "../../utils/state_management";
import { DispatchType, RootState } from "../../store";
import { Antigen, AntigenRef } from "../../antigen/utils";
import { Nanobody, NanobodyRef } from "../../nanobody/utils";
import { ProjectRef } from "../../project/utils";
import { ElisaWellMapContext } from "./well_map_context";

export type AnchorPosition = { top: number; left: number };

type ElisaWellState = ElisaWellRef & Partial<ElisaWellPost>;

const SaveCancelPopover = (params: {
  children: ReactNode;
  anchorEl?: HTMLElement;
  anchorPosition?: AnchorPosition;
  setAnchor: (anchorEl: undefined) => void;
  onSave: () => void;
}) => (
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

const AntigenAutocomplete = (params: {
  initAntigen: AntigenRef | undefined;
  project: ProjectRef | undefined;
  onChange: (antigen: Antigen | null) => void;
}) => {
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
};

const NanobodyAutocomplete = (params: {
  initNanobody: NanobodyRef | undefined;
  project: ProjectRef;
  onChange: (nanobody: Nanobody | null) => void;
}) => {
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
};

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
          partialEq(elisaWell, elisaWellRef)
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
