export type FiltersState = {
  status: 'all' | 'active' | 'pending' | 'closed' | 'sensitive';
  search: string;
  manager: string;
  city: string;
  proposal: string;
  service: string;
};

type FilterOption = {
  label: string;
  value: string;
};

interface FiltersProps {
  state: FiltersState;
  onChange: (next: FiltersState) => void;
  onReset: () => void;
  resultsCount: number;
  managers: FilterOption[];
  cities: FilterOption[];
  proposals: FilterOption[];
  services: FilterOption[];
}

const statuses: Array<{ label: string; value: FiltersState['status'] }> = [
  { label: 'Todos', value: 'all' },
  { label: 'Activos', value: 'active' },
  { label: 'Pendientes', value: 'pending' },
  { label: 'Cerrados', value: 'closed' },
  { label: 'Sensibles', value: 'sensitive' },
];

export function Filters({ state, onChange, onReset, resultsCount, managers, cities, proposals, services }: FiltersProps) {
  return (
    <section className="filters-card surface-card">
      <div className="filters-topline">
        <div>
          <p className="section-kicker">Busqueda de expedientes</p>
          <h3>Filtrar casos</h3>
        </div>
        <span className="results-pill">{resultsCount} resultados</span>
      </div>

      <div className="status-filters">
        {statuses.map((item) => (
          <button
            key={item.value}
            className={state.status === item.value ? 'status-button active' : 'status-button'}
            onClick={() => onChange({ ...state, status: item.value })}
            type="button"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="filters-grid">
        <label className="field field-search">
          Buscar
          <input
            type="text"
            value={state.search}
            onChange={(event) => onChange({ ...state, search: event.target.value })}
            placeholder="Numero de caso, participante o servicio"
          />
        </label>

        <label className="field">
          Gestor
          <select value={state.manager} onChange={(event) => onChange({ ...state, manager: event.target.value })}>
            <option value="">Todos</option>
            {managers.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Ciudad
          <select value={state.city} onChange={(event) => onChange({ ...state, city: event.target.value })}>
            <option value="">Todas</option>
            {cities.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Propuesta
          <select value={state.proposal} onChange={(event) => onChange({ ...state, proposal: event.target.value })}>
            <option value="">Todas</option>
            {proposals.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          Servicio
          <select value={state.service} onChange={(event) => onChange({ ...state, service: event.target.value })}>
            <option value="">Todos</option>
            {services.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="filters-actions">
        <button className="secondary-button" type="button" onClick={onReset}>
          Limpiar filtros
        </button>
      </div>
    </section>
  );
}
