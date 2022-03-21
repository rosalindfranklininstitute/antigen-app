import { ReactNode, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getElisaWell,
  postElisaWells,
  putElisaWell,
  selectElisaWell,
} from "../../elisa_well/slice";
import { ElisaWellRef, ElisaWellPost, ElisaWell } from "../../elisa_well/utils";
import { selectElisaPlate } from "../slice";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";
import {
  getAntigens,
  selectAntigen,
  selectAntigens,
} from "../../antigen/slice";
import {
  getNanobodies,
  postNanobodies,
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
import { partialEq, zip } from "../../utils/state_management";
import { DispatchType, RootState } from "../../store";
import { Antigen, AntigenRef } from "../../antigen/utils";
import { Nanobody, NanobodyRef } from "../../nanobody/utils";

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
  onChange: (antigen: Antigen | null) => void;
}) => {
  const dispatch = useDispatch();
  const antigens = useSelector(selectAntigens);
  const initAntigen = useSelector((state: RootState) =>
    params.initAntigen ? selectAntigen(params.initAntigen)(state) : undefined
  );

  useEffect(() => {
    dispatch(getAntigens({}));
  }, [dispatch]);

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
    />
  );
};

const NanobodyAutocomplete = (params: {
  initNanobody: NanobodyRef | undefined;
  onChange: (nanobody: Nanobody | null) => void;
}) => {
  const dispatch = useDispatch();
  const nanobodies = useSelector(selectNanobodies);
  const initNanobody = useSelector((state: RootState) =>
    params.initNanobody ? selectNanobody(params.initNanobody)(state) : undefined
  );

  useEffect(() => {
    dispatch(getNanobodies({}));
  }, [dispatch]);

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
    />
  );
};

export function ElisaWellEditPopover(params: {
  elisaWellRef: ElisaWellRef;
  anchorEl: HTMLElement | undefined;
  setAnchorEl: (anchorEl: undefined) => void;
}) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(
    selectElisaPlate({
      project: params.elisaWellRef.project,
      number: params.elisaWellRef.plate,
    })
  );
  const initElisaWell = useSelector(selectElisaWell(params.elisaWellRef));
  const [elisaWell, setElisaWell] = useState<ElisaWellState>(
    initElisaWell ? initElisaWell : params.elisaWellRef
  );

  useEffect(() => {
    if (
      elisaPlate?.elisawell_set.find((well) =>
        partialEq(well, params.elisaWellRef)
      )
    )
      dispatch(getElisaWell({ elisaWellRef: params.elisaWellRef }));
    dispatch(getNanobodies({}));
  }, [dispatch, params, elisaPlate]);

  const updateElisaWell = useCallback(() => {
    if (Object.values(elisaWell).every((val) => val !== undefined)) {
      if (initElisaWell) {
        dispatch(putElisaWell(elisaWell as ElisaWellRef & ElisaWellPost));
      } else {
        dispatch(postElisaWells([elisaWell as ElisaWellRef & ElisaWellPost]));
      }
    }
  }, [dispatch, elisaWell, initElisaWell]);

  return (
    <SaveCancelPopover
      anchorEl={params.anchorEl}
      setAnchor={params.setAnchorEl}
      onSave={updateElisaWell}
    >
      <AntigenAutocomplete
        initAntigen={elisaWell.antigen}
        onChange={(antigen) =>
          setElisaWell({
            ...elisaWell,
            antigen: antigen ? antigen : elisaWell.antigen,
          })
        }
      />
      <NanobodyAutocomplete
        initNanobody={elisaWell.nanobody}
        onChange={(nanobody) =>
          setElisaWell({
            ...elisaWell,
            nanobody: nanobody ? nanobody : elisaWell.nanobody,
          })
        }
      />
      <TextField
        label="Optical Density"
        type="number"
        defaultValue={elisaWell?.optical_density}
        onChange={(evt) => {
          setElisaWell({
            ...elisaWell,
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
  const dispatch = useDispatch<DispatchType>();
  const elisaWells = useSelector((state: RootState) =>
    params.elisaWellRefs.map((elisaWellRef) =>
      selectElisaWell(elisaWellRef)(state)
    )
  ).filter((elisaWell): elisaWell is ElisaWell => elisaWell !== undefined);
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
    filled.forEach((elisaWell) => dispatch(putElisaWell(elisaWell)));
    dispatch(
      postNanobodies(
        empty.map((emptyWell) => ({
          project: emptyWell.project,
        }))
      )
    ).then((response) => {
      if (response.meta.requestStatus === "fulfilled")
        dispatch(
          postElisaWells(
            zip(empty, response.payload as Array<Nanobody>).map(
              ([elisaWellRef, nanobody]) => ({
                ...elisaWellRef,
                antigen,
                nanobody,
                optical_density: 0.0,
              })
            )
          )
        );
    });
  }, [dispatch, params.elisaWellRefs, elisaWells, antigen]);

  return (
    <SaveCancelPopover
      anchorPosition={params.anchorPosition}
      setAnchor={params.setAnchorPosition}
      onSave={updateElisaWells}
    >
      <AntigenAutocomplete
        initAntigen={undefined}
        onChange={(antigen) => {
          setAntigen(antigen);
        }}
      />
    </SaveCancelPopover>
  );
}
