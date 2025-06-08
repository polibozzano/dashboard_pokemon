import React from "react";

interface SidebarProps {
  types: string[];
  generations: string[];
  selectedType: string;
  onSelectType: (type: string) => void;
  selectedGeneration: string;
  onSelectGeneration: (gen: string) => void;
}

export default function Sidebar({
  types = [],
  generations = [],
  selectedType,
  onSelectType,
  selectedGeneration,
  onSelectGeneration,
}: SidebarProps) {
  return (
    <aside className="w-full sm:w-60 m-1 p-2 sm:p-4 flex flex-col gap-2 sm:gap-3">
      <img src="/img/pokemon_logo.png" alt="Pokemon Logo" className="mb-6" />

      <section className="mb-4">
        <h2 className="text-xl font-bold capitalize mb-2">Types</h2>
        <div className="flex flex-col gap-2">
          {["All", ...types].map((type) => (
            <button
              key={type}
              role="button"
              className={`btn btn_category btn_category:hover capitalize w-full ${
                selectedType === type ? "btn_category--active" : "text-white"
              }`}
              onClick={() => onSelectType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold capitalize mb-2">Generations</h2>
        <div className="flex flex-col gap-2">
          {["All", ...generations].map((gen) => (
            <button
              key={gen}
              role="button"
              className={`btn btn_category capitalize text-left w-full ${
                selectedGeneration === gen
                  ? "btn_category--active"
                  : "text-white"
              }`}
              onClick={() => onSelectGeneration(gen)}
            >
              {gen.replace("generation-", "Gen ")}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
