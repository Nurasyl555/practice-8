import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createPlanet,
  fetchAllPlanets,
  fetchPlanetById,
  fetchPlanets,
  resetPlanets
} from "../store/thunks/planetThunks";
import { setActivePlanetId } from "../store/slices/planetDetailSlice";
import {
  resetDashboardFilters,
  setDashboardHabitability,
  setDashboardMission
} from "../store/slices/dashboardSlice";
import {
  selectActivePlanet,
  selectAllDashboardPlanets,
  selectDashboardBreakdowns,
  selectDashboardFilters,
  selectDashboardState,
  selectDashboardStats,
  selectFilteredDashboardPlanets,
  selectIsCatalogEmpty,
  selectPlanetDetailState,
  selectPlanetsMutationState,
  selectPlanetsState
} from "../store/selectors/planetSelectors";

function useDebouncedValue(value, delayMs = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

export const usePlanetsQuery = (params) => {
  const dispatch = useDispatch();
  const planetsState = useSelector(selectPlanetsState);
  const isEmpty = useSelector(selectIsCatalogEmpty);

  const {
    search = "",
    type = "ALL",
    habitable = "ALL",
    sortBy = "name",
    sortOrder = "asc",
    page = 1,
    limit = 12
  } = params || {};

  const debouncedSearch = useDebouncedValue(search, 300);

  useEffect(() => {
    const promise = dispatch(
      fetchPlanets({
        search: debouncedSearch,
        type,
        habitable,
        sortBy,
        sortOrder,
        page,
        limit
      })
    );

    return () => {
      promise.abort();
    };
  }, [
    dispatch,
    debouncedSearch,
    type,
    habitable,
    sortBy,
    sortOrder,
    page,
    limit,
    planetsState.invalidateVersion
  ]);

  const refetch = useCallback(() => {
    return dispatch(
      fetchPlanets({
        search: debouncedSearch,
        type,
        habitable,
        sortBy,
        sortOrder,
        page,
        limit
      })
    );
  }, [dispatch, debouncedSearch, type, habitable, sortBy, sortOrder, page, limit]);

  return {
    planets: planetsState.items,
    pagination: planetsState.pagination,
    isCached: planetsState.isCached,
    cachedAt: planetsState.cachedAt,
    isLoading: planetsState.status === "loading" || planetsState.status === "idle",
    isError: planetsState.status === "failed",
    error: planetsState.error,
    isEmpty,
    refetch
  };
};

export const usePlanetDetailQuery = (id) => {
  const dispatch = useDispatch();
  const detailState = useSelector(selectPlanetDetailState);
  const planet = useSelector(selectActivePlanet);

  useEffect(() => {
    if (!id) return undefined;
    dispatch(setActivePlanetId(id));
    const promise = dispatch(fetchPlanetById({ id }));
    return () => {
      promise.abort();
    };
  }, [dispatch, id, detailState.invalidateVersion]);

  const refetch = useCallback(() => {
    if (!id) return undefined;
    return dispatch(fetchPlanetById({ id, force: true }));
  }, [dispatch, id]);

  const isLoading =
    Boolean(id) &&
    !planet &&
    (detailState.status === "loading" || detailState.status === "idle");

  return {
    planet,
    isLoading,
    isError: !planet && detailState.status === "failed",
    error: detailState.error,
    refetch
  };
};

export const useDashboardPlanets = () => {
  const dispatch = useDispatch();
  const dashboardState = useSelector(selectDashboardState);
  const allPlanets = useSelector(selectAllDashboardPlanets);
  const filteredPlanets = useSelector(selectFilteredDashboardPlanets);
  const stats = useSelector(selectDashboardStats);
  const { classBreakdown, missionBreakdown } = useSelector(selectDashboardBreakdowns);
  const filters = useSelector(selectDashboardFilters);

  useEffect(() => {
    const promise = dispatch(fetchAllPlanets());
    return () => {
      promise.abort();
    };
  }, [dispatch, dashboardState.invalidateVersion]);

  const refetch = useCallback(() => {
    return dispatch(fetchAllPlanets({ force: true }));
  }, [dispatch]);

  const setMission = useCallback(
    (mission) => dispatch(setDashboardMission(mission)),
    [dispatch]
  );
  const setHabitability = useCallback(
    (habitability) => dispatch(setDashboardHabitability(habitability)),
    [dispatch]
  );
  const resetFilters = useCallback(
    () => dispatch(resetDashboardFilters()),
    [dispatch]
  );

  return {
    allPlanets,
    filteredPlanets,
    stats,
    classBreakdown,
    missionBreakdown,
    filters,
    isCached: dashboardState.isCached,
    cachedAt: dashboardState.cachedAt,
    isLoading: dashboardState.status === "loading" || dashboardState.status === "idle",
    isError: dashboardState.status === "failed",
    error: dashboardState.error,
    refetch,
    setMission,
    setHabitability,
    resetFilters
  };
};

export const useCreatePlanetMutation = () => {
  const dispatch = useDispatch();
  const mutationState = useSelector(selectPlanetsMutationState);

  const mutateAsync = useCallback(
    (newPlanetData) => dispatch(createPlanet(newPlanetData)).unwrap(),
    [dispatch]
  );

  return {
    mutateAsync,
    isPending: mutationState.status === "loading",
    error: mutationState.error
  };
};

export const useResetPlanetsMutation = () => {
  const dispatch = useDispatch();
  const mutationState = useSelector(selectPlanetsMutationState);

  const mutateAsync = useCallback(
    () => dispatch(resetPlanets()).unwrap(),
    [dispatch]
  );

  return {
    mutateAsync,
    isPending: mutationState.status === "loading",
    error: mutationState.error
  };
};
