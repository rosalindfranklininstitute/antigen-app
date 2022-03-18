import { ReactNode, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getElisaWell,
  postElisaWell,
  putElisaWell,
  selectElisaWell,
} from "../../elisa_well/slice";
import { ElisaWellRef, ElisaWellPost } from "../../elisa_well/utils";
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
import { RootState } from "../../store";
import { Antigen, AntigenRef } from "../../antigen/utils";
import { Nanobody, NanobodyRef } from "../../nanobody/utils";

type ElisaWellState = ElisaWellRef & Partial<ElisaWellPost>;

const SaveCancelPopover = (params: {
  children: ReactNode;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  onSave: () => void;
}) => (
  <Popover
    open={Boolean(params.anchorEl)}
    anchorEl={params.anchorEl}
    anchorOrigin={{
      vertical: "center",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "center",
      horizontal: "center",
    }}
    onClose={() => params.setAnchorEl(null)}
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
              onClick={() => params.setAnchorEl(null)}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              endIcon={<DoneIcon />}
              onClick={() => {
                params.onSave();
                params.setAnchorEl(null);
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
    dispatch(getAntigens());
  }, []);

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
    dispatch(getNanobodies());
  }, []);

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
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
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
    dispatch(getNanobodies());
  }, [dispatch, params, elisaPlate]);

  const updateElisaWell = () => {
    if (Object.values(elisaWell).every((val) => val !== undefined)) {
      if (initElisaWell) {
        dispatch(putElisaWell(elisaWell as ElisaWellRef & ElisaWellPost));
      } else {
        dispatch(postElisaWell(elisaWell as ElisaWellRef & ElisaWellPost));
      }
    }
  };

  return (
    <SaveCancelPopover
      anchorEl={params.anchorEl}
      setAnchorEl={params.setAnchorEl}
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
