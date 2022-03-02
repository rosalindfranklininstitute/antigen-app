import {
  Typography,
  Grid,
  Button,
  Paper,
  Popover,
  Stack,
  CardContent,
  Card,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAntigen,
  getAntigens,
  selectAntigen,
  selectAntigens,
} from "../antigen/slice";
import {
  getElisaWell,
  postElisaWell,
  putElisaWell,
  selectElisaWell,
} from "../elisa_well/slice";
import { ElisaWellKey, ElisaWellPost } from "../elisa_well/utils";
import {
  getNanobodies,
  getNanobody,
  selectNanobodies,
  selectNanobody,
} from "../nanobody/slice";
import DoneIcon from "@mui/icons-material/Done";
import CancelIcon from "@mui/icons-material/Cancel";
import { selectElisaPlate } from "./slice";

type ElisaWellState = ElisaWellKey & Partial<ElisaWellPost>;

function uuidToColor(uuid: string) {
  const hue = Number("0x".concat(uuid.substring(0, 2)));
  return `hsl(${hue}, 50%, 50%)`;
}

function ElisaWellEditPopover(params: {
  wellKey: ElisaWellKey;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
}) {
  const dispatch = useDispatch();
  const initElisaWell = useSelector(selectElisaWell(params.wellKey));
  const [elisaWell, setElisaWell] = useState<ElisaWellState>(
    initElisaWell ? initElisaWell : params.wellKey
  );
  const antigens = useSelector(selectAntigens);
  const nanobodies = useSelector(selectNanobodies);

  useEffect(() => {
    dispatch(getElisaWell(params.wellKey));
    dispatch(getAntigens());
    dispatch(getNanobodies());
  }, [dispatch, params]);

  const updateElisaWell = () => {
    if (Object.values(elisaWell).every((val) => !!val)) {
      if (initElisaWell) {
        dispatch(putElisaWell(elisaWell as ElisaWellPost));
      } else {
        dispatch(postElisaWell(elisaWell as ElisaWellPost));
      }
    }
  };

  return (
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
            <Autocomplete
              renderInput={(params) => (
                <TextField {...params} label="Antigen" sx={{ width: "32ch" }} />
              )}
              options={antigens}
              getOptionLabel={(antigen) => antigen.name}
              defaultValue={antigens.find(
                (antigen) => antigen.uuid === elisaWell?.antigen
              )}
              onChange={(_, antigen) => {
                setElisaWell({
                  ...elisaWell,
                  antigen: antigen ? antigen.uuid : elisaWell.antigen,
                });
              }}
            />
            <Autocomplete
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Nanobody"
                  sx={{ width: "32ch" }}
                />
              )}
              options={nanobodies}
              getOptionLabel={(nanobody) => nanobody.name}
              defaultValue={nanobodies.find(
                (nanobody) => nanobody.uuid === elisaWell?.nanobody
              )}
              onChange={(_, nanobody) => {
                setElisaWell({
                  ...elisaWell,
                  nanobody: nanobody ? nanobody.uuid : elisaWell.nanobody,
                });
              }}
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
                  updateElisaWell();
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
}

function ElisaWellInfoPopover(params: {
  wellKey: ElisaWellKey;
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLAnchorElement | null) => void;
}) {
  const dispatch = useDispatch();
  const elisaWell = useSelector(selectElisaWell(params.wellKey));
  const antigen = useSelector(
    elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined
  );
  const nanobody = useSelector(
    elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined
  );

  useEffect(() => {
    dispatch(getElisaWell(params.wellKey));
  });

  useEffect(() => {
    if (elisaWell) {
      dispatch(getAntigen(elisaWell.antigen));
      dispatch(getNanobody(elisaWell.nanobody));
    }
  }, [dispatch, elisaWell]);

  return (
    <Popover
      open={Boolean(params.anchorEl && elisaWell)}
      anchorEl={params.anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      onClose={() => params.setAnchorEl(null)}
      sx={{ pointerEvents: "none" }}
    >
      <Stack alignItems="center">
        {antigen && <div>Antigen: {antigen.name}</div>}
        {nanobody && <div>Nanobody: {nanobody.name}</div>}
      </Stack>
    </Popover>
  );
}

function ElisaWellElement(params: { wellKey: ElisaWellKey }) {
  const dispatch = useDispatch();
  const elisaPlate = useSelector(selectElisaPlate(params.wellKey.plate));
  const elisaWell = useSelector(
    params.wellKey ? selectElisaWell(params.wellKey) : () => undefined
  );
  const antigen = useSelector(
    elisaWell ? selectAntigen(elisaWell.antigen) : () => undefined
  );
  const nanobody = useSelector(
    elisaWell ? selectNanobody(elisaWell.nanobody) : () => undefined
  );

  const [infoAnchorEl, setInfoAnchorEl] = useState<HTMLElement | null>(null);
  const [editAnchorEl, setEditAnchorEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (
      elisaPlate?.plate_elisa_wells.find(
        (location) => location === params.wellKey.location
      )
    )
      dispatch(getElisaWell(params.wellKey));
  }, [dispatch, params, elisaPlate]);

  useEffect(() => {
    if (elisaWell) {
      dispatch(getAntigen(elisaWell.antigen));
      dispatch(getNanobody(elisaWell.nanobody));
    }
  }, [dispatch, elisaWell]);

  const antigenColor = antigen ? uuidToColor(antigen.uuid) : "white";
  const nanobodyColor = nanobody ? uuidToColor(nanobody.uuid) : "white";

  const InfoPopover = () =>
    params.wellKey ? (
      <ElisaWellInfoPopover
        wellKey={params.wellKey}
        anchorEl={infoAnchorEl}
        setAnchorEl={setInfoAnchorEl}
      />
    ) : null;
  const EditPopover = () =>
    params.wellKey ? (
      <ElisaWellEditPopover
        wellKey={params.wellKey}
        anchorEl={editAnchorEl}
        setAnchorEl={setEditAnchorEl}
      />
    ) : null;

  return (
    <Paper
      sx={{
        background: `linear-gradient(90deg, ${antigenColor} 50%, ${nanobodyColor} 50%)`,
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      <Button
        sx={{
          width: "100%",
          padding: "0 0 100% 0",
        }}
        onMouseEnter={(evt) => setInfoAnchorEl(evt.currentTarget)}
        onMouseLeave={() => setInfoAnchorEl(null)}
        onClick={(evt) => {
          setInfoAnchorEl(null);
          setEditAnchorEl(evt.currentTarget);
        }}
      />
      <InfoPopover />
      <EditPopover />
    </Paper>
  );
}

export function ElisaWellMapElement(params: { plate: string }) {
  return (
    <Grid container spacing={2} columns={13}>
      <Grid item xs={1} key={0} />
      {Array.from({ length: 12 }, (_, col) => (
        <Grid item xs={1} key={col + 1}>
          <Typography>{col + 1}</Typography>
        </Grid>
      ))}
      {Array.from({ length: 8 }, (_, row) => {
        return [
          <Grid item xs={1} key={(row + 1) * 13}>
            <Typography>{String.fromCharCode(row + 65)}</Typography>
          </Grid>,
          Array.from({ length: 12 }, (_, col) => (
            <Grid item xs={1}>
              <ElisaWellElement
                wellKey={{ plate: params.plate, location: row * 12 + col + 1 }}
              />
            </Grid>
          )),
        ];
      })}
    </Grid>
  );
}
