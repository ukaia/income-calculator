import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Scenario, Settings, Source } from "@/lib/schema";
import { settingsSchema } from "@/lib/schema";
import { uid } from "@/lib/utils";

const defaultSettings: Settings = settingsSchema.parse({});

function makeDefaultScenario(): Scenario {
  return {
    id: uid(),
    name: "My Plan",
    createdAt: Date.now(),
    settings: defaultSettings,
    sources: [],
  };
}

interface StoreState {
  scenarios: Scenario[];
  activeScenarioId: string | null;
  // Transient sensitivity overrides (NOT persisted in scenario)
  sensitivity: {
    dividendYieldDelta: number;
    marginRateDelta: number;
    marketReturnDelta: number;
    inflationDelta: number;
  };
  setSensitivity: (s: Partial<StoreState["sensitivity"]>) => void;
  resetSensitivity: () => void;

  // Active scenario helpers
  getActive: () => Scenario;
  setActive: (id: string) => void;
  updateActiveSettings: (patch: Partial<Settings>) => void;
  addSource: (src: Source) => void;
  updateSource: (id: string, patch: Partial<Source>) => void;
  removeSource: (id: string) => void;
  duplicateSource: (id: string) => void;
  reorderSources: (ids: string[]) => void;

  // Scenario CRUD
  createScenario: (name?: string, base?: Scenario) => string;
  renameScenario: (id: string, name: string) => void;
  duplicateScenario: (id: string) => string;
  deleteScenario: (id: string) => void;

  // Full state replace (import)
  replaceAll: (data: { scenarios: Scenario[]; activeScenarioId: string | null }) => void;
  resetAll: () => void;
}

const initial = (() => {
  const s = makeDefaultScenario();
  return { scenarios: [s], activeScenarioId: s.id };
})();

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      scenarios: initial.scenarios,
      activeScenarioId: initial.activeScenarioId,
      sensitivity: {
        dividendYieldDelta: 0,
        marginRateDelta: 0,
        marketReturnDelta: 0,
        inflationDelta: 0,
      },
      setSensitivity: (s) => set((state) => ({ sensitivity: { ...state.sensitivity, ...s } })),
      resetSensitivity: () =>
        set({
          sensitivity: {
            dividendYieldDelta: 0,
            marginRateDelta: 0,
            marketReturnDelta: 0,
            inflationDelta: 0,
          },
        }),

      getActive: () => {
        const { scenarios, activeScenarioId } = get();
        return scenarios.find((s) => s.id === activeScenarioId) || scenarios[0];
      },
      setActive: (id) => set({ activeScenarioId: id }),
      updateActiveSettings: (patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === state.activeScenarioId ? { ...s, settings: { ...s.settings, ...patch } } : s,
          ),
        })),
      addSource: (src) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === state.activeScenarioId ? { ...s, sources: [...s.sources, src] } : s,
          ),
        })),
      updateSource: (id, patch) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === state.activeScenarioId
              ? {
                  ...s,
                  sources: s.sources.map((src) =>
                    src.id === id ? ({ ...src, ...patch } as Source) : src,
                  ),
                }
              : s,
          ),
        })),
      removeSource: (id) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) =>
            s.id === state.activeScenarioId
              ? { ...s, sources: s.sources.filter((src) => src.id !== id) }
              : s,
          ),
        })),
      duplicateSource: (id) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => {
            if (s.id !== state.activeScenarioId) return s;
            const src = s.sources.find((x) => x.id === id);
            if (!src) return s;
            const copy = { ...src, id: uid(), name: `${src.name} (copy)` } as Source;
            return { ...s, sources: [...s.sources, copy] };
          }),
        })),
      reorderSources: (ids) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => {
            if (s.id !== state.activeScenarioId) return s;
            const map = new Map(s.sources.map((src) => [src.id, src]));
            const next = ids.map((id) => map.get(id)).filter(Boolean) as Source[];
            const missing = s.sources.filter((src) => !ids.includes(src.id));
            return { ...s, sources: [...next, ...missing] };
          }),
        })),

      createScenario: (name = "New Scenario", base) => {
        const id = uid();
        const seed =
          base ||
          {
            id,
            name,
            createdAt: Date.now(),
            settings: defaultSettings,
            sources: [],
          };
        const fresh: Scenario = {
          ...seed,
          id,
          name,
          createdAt: Date.now(),
          sources: seed.sources.map((s) => ({ ...s, id: uid() })),
        };
        set((state) => ({ scenarios: [...state.scenarios, fresh], activeScenarioId: id }));
        return id;
      },
      renameScenario: (id, name) =>
        set((state) => ({
          scenarios: state.scenarios.map((s) => (s.id === id ? { ...s, name } : s)),
        })),
      duplicateScenario: (id) => {
        const src = get().scenarios.find((s) => s.id === id);
        if (!src) return id;
        return get().createScenario(`${src.name} (copy)`, src);
      },
      deleteScenario: (id) =>
        set((state) => {
          const remaining = state.scenarios.filter((s) => s.id !== id);
          const list = remaining.length ? remaining : [makeDefaultScenario()];
          const activeStillExists = list.some((s) => s.id === state.activeScenarioId);
          return {
            scenarios: list,
            activeScenarioId: activeStillExists ? state.activeScenarioId : list[0].id,
          };
        }),

      replaceAll: (data) =>
        set({
          scenarios: data.scenarios.length ? data.scenarios : [makeDefaultScenario()],
          activeScenarioId: data.activeScenarioId,
        }),
      resetAll: () => {
        const fresh = makeDefaultScenario();
        set({ scenarios: [fresh], activeScenarioId: fresh.id });
      },
    }),
    {
      name: "income-calc-store-v1",
      version: 1,
      storage: createJSONStorage(() => safeStorage()),
      partialize: (state) => ({
        scenarios: state.scenarios,
        activeScenarioId: state.activeScenarioId,
      }),
    },
  ),
);

// Safari Private mode throws on localStorage writes; fall back to in-memory.
function safeStorage(): Storage {
  try {
    const probe = "__probe__";
    window.localStorage.setItem(probe, probe);
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    const mem: Record<string, string> = {};
    return {
      get length() {
        return Object.keys(mem).length;
      },
      clear: () => {
        for (const k of Object.keys(mem)) delete mem[k];
      },
      getItem: (k) => (k in mem ? mem[k] : null),
      key: (i) => Object.keys(mem)[i] ?? null,
      removeItem: (k) => {
        delete mem[k];
      },
      setItem: (k, v) => {
        mem[k] = v;
      },
    };
  }
}
