import {
  TableCell,
  TableContainer,
  TableRow,
  Table,
  TableBody,
  Stack,
  Link,
} from "@mui/material";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { getNanobody, selectNanobody } from "./slice";

export type Nanobody = {
  uuid: string;
  name: string;
  nanobody_elisa_wells: string[];
  creation_time: Date;
};

export type NanobodyPost = {};

export function NanobodyInfo(params: { uuid: string }) {
  const dispatch = useDispatch();
  const nanobody = useSelector(selectNanobody(params.uuid));

  useEffect(() => {
    dispatch(getNanobody(params.uuid));
  }, [dispatch, params]);

  if (!nanobody) return null;
  return (
    <TableContainer>
      <Table>
        <TableBody>
          <TableRow>
            <TableCell>UUID:</TableCell>
            <TableCell>{nanobody.uuid}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Elisa Appearances:</TableCell>
            <TableCell>
              <Stack>
                {nanobody.nanobody_elisa_wells.map((well, idx) => (
                  <Link component={RouterLink} to={`/elisa_well/${well}`}>
                    {well}
                  </Link>
                ))}
              </Stack>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>Creation Time:</TableCell>
            <TableCell>{nanobody.creation_time}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
