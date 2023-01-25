import { createContext, ReactNode, useCallback, useEffect } from "react";

import { ElisaWell, ElisaWellPost, ElisaWellRef } from "../../elisa_well/utils";
import { useDispatch, useSelector } from "react-redux";
import {
  generateNanobodies,
  getNanobodies,
  selectNanobody,
} from "../../nanobody/slice";
import { getAntigens, selectAntigen } from "../../antigen/slice";
import {
  getElisaWells,
  postElisaWells,
  putElisaWell,
} from "../../elisa_well/slice";
import { DispatchType, RootState } from "../../store";
import { keyEq, zip } from "../../utils/state_management";
import { putElisaPlate, selectElisaPlate } from "../slice";
import { Antigen, AntigenRef } from "../../antigen/utils";
import { Nanobody, NanobodyRef } from "../../nanobody/utils";
import { ElisaPlate, ElisaPlateRef } from "../utils";

export const ElisaWellMapContext = createContext<{
  threshold: number;
  setThreshold: (threshold: number) => void;
  elisaWells: Array<ElisaWell>;
  getElisaWell: (elisaWellRef: ElisaWellRef) => ElisaWell | undefined;
  setElisaWell: (well: ElisaWellPost) => void;
  generateElisaWells: (
    elisaWellRefs: Array<ElisaWellRef>,
    antigenRef: AntigenRef
  ) => void;
  antigens: Array<Antigen>;
  getAntigen: (antigenRef: AntigenRef) => Antigen | undefined;
  nanobodies: Array<Nanobody>;
  getNanobody: (nanobodyRef: NanobodyRef) => Nanobody | undefined;
}>({
  threshold: 0.0,
  setThreshold: () => {},
  elisaWells: [],
  getElisaWell: () => undefined,
  setElisaWell: () => {},
  generateElisaWells: () => {},
  antigens: [],
  getAntigen: () => undefined,
  nanobodies: [],
  getNanobody: () => undefined,
});

/**
 *
 * A context provider which provides the elisa well map context, consisting of
 * a stateful elisa plate instance, array of elisa wells, array of
 * corresponding antigens, array of corresponding nanobodies and methods get an
 * elisa well, antigen or nanobody, to set the well threshold or an elisa well
 * or to generate a set of elisa wells with a given antigen and new nanobodies.
 * Elisa plate, elisa well, antigen and nanboody information is retrieved from
 * the redux store with a dispatch executed to obtain it if unavailable
 *
 * @param params An elisa plate reference from which the elisa plate, elisa
 * wells, antigens and nanobodies can be reteieved and a react node containing
 * children to be contained within the context provider
 * @param params.children The children to be contained
 * @param params.elisaPlateRef The elisa plate reference
 * @returns A provider of the elisa well map context
 */
export function ElisaWellMapContextProvider(params: {
  children: ReactNode;
  elisaPlateRef: ElisaPlateRef;
}): JSX.Element {
  const dispatch = useDispatch<DispatchType>();

  const elisaPlate = useSelector(
    selectElisaPlate(params.elisaPlateRef)
  ) as ElisaPlate;

  const elisaWells = useSelector((state: RootState) =>
    state.elisaWells.elisaWells.filter(
      (elisaWell) =>
        elisaWell.project === params.elisaPlateRef.project &&
        elisaWell.plate === params.elisaPlateRef.number
    )
  );

  const antigens = useSelector((state: RootState) =>
    elisaWells.map((elisaWell) => selectAntigen(elisaWell.antigen)(state))
  ).filter((antigen): antigen is Antigen => antigen !== undefined);

  const nanobodies = useSelector((state: RootState) =>
    elisaWells.map((elisaWell) => selectNanobody(elisaWell.nanobody)(state))
  ).filter((nanobody): nanobody is Nanobody => nanobody !== undefined);

  useEffect(() => {
    dispatch(
      getElisaWells({
        project: params.elisaPlateRef.project,
        plate: params.elisaPlateRef.number,
      })
    );
    dispatch(
      getAntigens({
        project: params.elisaPlateRef.project,
        plate: params.elisaPlateRef.number,
      })
    );
    dispatch(
      getNanobodies({
        project: params.elisaPlateRef.project,
        plate: params.elisaPlateRef.number,
      })
    );
  }, [dispatch, params.elisaPlateRef]);

  const setThreshold = useCallback(
    (threshold: number) =>
      dispatch(
        putElisaPlate({
          ...elisaPlate,
          threshold,
        })
      ),
    [dispatch, elisaPlate]
  );

  const getElisaWell = useCallback(
    (elisaWellRef: ElisaWellRef) =>
      elisaWells.find((elisaWell) =>
        keyEq(elisaWell, elisaWellRef, ["project", "plate", "location"])
      ),
    [elisaWells]
  );

  const setElisaWell = useCallback(
    (elisaWellPost: ElisaWellPost) => {
      if (
        elisaWells.some((elisaWell) =>
          keyEq(elisaWell, elisaWellPost, ["project", "plate", "location"])
        )
      ) {
        dispatch(putElisaWell(elisaWellPost));
      } else {
        dispatch(postElisaWells([elisaWellPost]));
      }
    },
    [dispatch, elisaWells]
  );

  const generateElisaWells = useCallback(
    (elisaWellRefs: Array<ElisaWellRef>, antigenRef: AntigenRef) =>
      dispatch(
        generateNanobodies(elisaWellRefs.length, elisaPlate.project)
      ).then((action) => {
        if (action.meta.requestStatus === "fulfilled")
          dispatch(
            postElisaWells(
              zip(elisaWellRefs, action.payload as Array<Nanobody>).map(
                ([elisaWellRef, nanobody]) => ({
                  ...elisaWellRef,
                  antigen: antigenRef,
                  nanobody,
                  optical_density: 0.0,
                })
              )
            )
          );
      }),
    [dispatch, elisaPlate]
  );

  const getAntigen = useCallback(
    (antigenRef: AntigenRef) =>
      antigens.find((antigen) =>
        keyEq(antigen, antigenRef, ["project", "number"])
      ),
    [antigens]
  );

  const getNanobody = useCallback(
    (nanobodyRef: NanobodyRef) =>
      nanobodies.find((nanobody) =>
        keyEq(nanobody, nanobodyRef, ["project", "number"])
      ),
    [nanobodies]
  );

  return (
    <ElisaWellMapContext.Provider
      value={{
        threshold: elisaPlate.threshold,
        setThreshold,
        elisaWells,
        getElisaWell,
        setElisaWell,
        generateElisaWells,
        antigens,
        getAntigen,
        nanobodies,
        getNanobody,
      }}
    >
      {params.children}
    </ElisaWellMapContext.Provider>
  );
}
