import React, { useState, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  usePlanetsQuery,
  useCreatePlanetMutation,
  useResetPlanetsMutation
} from "../hooks/usePlanets";

import { FilterBar } from "../components/FilterBar";
import { PlanetCard } from "../components/PlanetCard";
import { Pagination } from "../components/Pagination";
import { StatusView } from "../components/StatusView";
import { AddPlanetModal } from "../components/AddPlanetModal";
import { CachedDataBadge } from "../components/CachedDataBadge";
import { usePwa } from "../context/PwaContext";
import { Plus, RefreshCw, Sparkles } from "lucide-react";

export const PlanetsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isOnline } = usePwa();

  const search = searchParams.get("search") || "";
  const type = searchParams.get("type") || "ALL";
  const habitable = searchParams.get("habitable") || "ALL";
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const page = parseInt(searchParams.get("page") || "1", 10);

  
  const queryParams = useMemo(() => ({
    search,
    type,
    habitable,
    sortBy,
    sortOrder,
    page,
    limit: 12
  }), [search, type, habitable, sortBy, sortOrder, page]);

  const {
    planets,
    pagination,
    isCached: isCachedData,
    cachedAt,
    isLoading,
    isError,
    error: queryError,
    isEmpty,
    refetch
  } = usePlanetsQuery(queryParams);


  const createPlanetMutation = useCreatePlanetMutation();
  const resetPlanetsMutation = useResetPlanetsMutation();


  const errorMessage = isError ? (queryError || "Ошибка загрузки данных из каталога") : null;

 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);


  const updateFilterParam = useCallback((newParams) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, val]) => {
        if (
          val === "" ||
          val === "ALL" ||
          (key === "page" && (val === 1 || val === "1")) ||
          (key === "sortBy" && val === "name") ||
          (key === "sortOrder" && val === "asc")
        ) {
          updated.delete(key);
        } else {
          updated.set(key, String(val));
        }
      });
      return updated;
    });
  }, [setSearchParams]);

  const handleSearchChange = (val) => updateFilterParam({ search: val, page: 1 });
  const handleTypeChange = (val) => updateFilterParam({ type: val, page: 1 });
  const handleHabitableChange = (val) => updateFilterParam({ habitable: val, page: 1 });
  const handleSortByChange = (val) => updateFilterParam({ sortBy: val, page: 1 });
  const handleSortOrderToggle = () =>
    updateFilterParam({ sortOrder: sortOrder === "asc" ? "desc" : "asc", page: 1 });
  const handlePageChange = (newPage) => updateFilterParam({ page: newPage });
  const handleResetFilters = () => setSearchParams({});

  
  const handleCreatePlanet = async (formData) => {
    try {
      const newRecord = await createPlanetMutation.mutateAsync(formData);
      setIsAddModalOpen(false);
      showNotification(`Планета «${newRecord.name}» успешно внесена в каталог!`);
      
    } catch (err) {
      alert(err.message || "Ошибка добавления планеты");
    }
  };

 
  const handleResetToDefaults = async () => {
    if (window.confirm("Восстановить исходные 105 экзопланет? Все добавленные записи будут удалены.")) {
      await resetPlanetsMutation.mutateAsync();
      handleResetFilters();
      showNotification("База данных восстановлена к начальным 105 планетам.");
    }
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="planets-page-container">
      {/* Верхний заголовок и кнопки управления */}
      <div className="page-header-row">
        <div>
          <h1 className="page-heading">Каталог экзопланет</h1>
          <p className="page-subheading">
            Поиск, фильтрация по параметрам и спектральным классам (синхронизировано с URL)
          </p>
        </div>

        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={handleResetToDefaults}
            disabled={resetPlanetsMutation.isPending}
            title="Восстановить начальные 105 планет"
          >
            <RefreshCw size={15} /> Сбросить БД
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus size={16} /> Добавить планету
          </button>
        </div>
      </div>

      <CachedDataBadge isCached={isCachedData} cachedAt={cachedAt} isOnline={isOnline} />

      {/* Уведомление об успешном действии */}
      {notification && (
        <div style={{
          background: "rgba(16, 185, 129, 0.15)",
          border: "1px solid var(--accent-emerald)",
          color: "var(--accent-emerald)",
          padding: "0.85rem 1.2rem",
          borderRadius: 12,
          marginBottom: "1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem"
        }}>
          <Sparkles size={18} /> {notification}
        </div>
      )}

      {/* Панель фильтров, поиска и сортировки */}
      <FilterBar
        search={search}
        onSearchChange={handleSearchChange}
        type={type}
        onTypeChange={handleTypeChange}
        habitable={habitable}
        onHabitableChange={handleHabitableChange}
        sortBy={sortBy}
        onSortByChange={handleSortByChange}
        sortOrder={sortOrder}
        onSortOrderToggle={handleSortOrderToggle}
        onReset={handleResetFilters}
        totalResults={pagination.total}
      />

      {/* Обработка 4 состояний: Загрузка, Ошибка, Пусто, Сетка данных */}
      <div style={{ marginTop: "1.5rem" }}>
        {isLoading ? (
          <StatusView type="loading" />
        ) : errorMessage ? (
          <StatusView type="error" message={errorMessage} onRetry={() => refetch()} />
        ) : isEmpty || planets.length === 0 ? (
          <StatusView type="empty" onResetFilters={handleResetFilters} />
        ) : (
          <>
            <div className="planets-grid">
              {planets.map((planet) => (
                <PlanetCard key={planet.id} planet={planet} />
              ))}
            </div>

            {/* Пагинация */}
            <div style={{ marginTop: "2rem" }}>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Модальное окно создания планеты */}
      <AddPlanetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPlanet={handleCreatePlanet}
      />
    </div>
  );
};

export default PlanetsPage;