import { TabContext, TabList, TabPanel } from "@mui/lab";
import {
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  Tab,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { LoadingPaper, FailedRetrievalPaper } from "../utils/api";
import {
  getElisaPlate,
  selectElisaPlate,
  selectLoadingElisaPlate,
} from "./slice";
import { ElisaPlateInfo, ElisaPlateRef } from "./utils";
import { ElisaWellMapElement } from "./well_map/well_map";

type StrElisaPlateKey = { [K in keyof ElisaPlateRef]: string };

export default function ElisaPlateView() {
  let { project, number: number_str } =
    useParams<StrElisaPlateKey>() as StrElisaPlateKey;
  const number = parseInt(number_str);
  const dispatch = useDispatch();
  const elisaPlate = useSelector(selectElisaPlate({ project, number }));
  const loading = useSelector(selectLoadingElisaPlate);
  const [tab, setTab] = useState<string>("map");

  useEffect(() => {
    dispatch(getElisaPlate({ project, number }));
  }, [dispatch, project, number]);

  if (loading)
    return <LoadingPaper text="Retrieving elisa plate from database." />;
  if (!elisaPlate)
    return (
      <FailedRetrievalPaper
        text={`Could not retrieve entry for ${window.location.href
          .split("/")
          .pop()}`}
      />
    );

  return (
    <Card>
      <CardContent>
        <Stack gap={2} divider={<Divider />}>
          <Typography variant="h4">
            {elisaPlate.project}:{elisaPlate.number}
          </Typography>
          <TabContext value={tab}>
            <TabList onChange={(evt, tab) => setTab(tab)}>
              <Tab label="Map" value="map" />
              <Tab label="Table" value="table" />
            </TabList>
            <TabPanel value="map" tabIndex={0}>
              <ElisaWellMapElement elisaPlateRef={elisaPlate} />
            </TabPanel>
            <TabPanel value="table">
              <ElisaPlateInfo elisaPlateRef={elisaPlate} />
            </TabPanel>
          </TabContext>
        </Stack>
      </CardContent>
    </Card>
  );
}
