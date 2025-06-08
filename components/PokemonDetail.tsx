import { useEffect, useState, useTransition } from "react";
import { PokemonDetails } from "../types/pokemon";
import { X } from "lucide-react";
import Image from "next/image";

interface Props {
  selectedPokemon: PokemonDetails | null;
  onClose: () => void;
}

interface EvolutionStage {
  name: string;
  sprite: string;
}

export default function PokemonDetail({ selectedPokemon, onClose }: Props) {
  const [evolutionChain, setEvolutionChain] = useState<EvolutionStage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!selectedPokemon) return;

    startTransition(() => {
      //Evitar bloqueios na UI ao carregar as evoluções
      fetchEvolutionChain(selectedPokemon);
    });

    async function fetchEvolutionChain(pokemon: PokemonDetails) {
      setLoading(true);

      try {
        const speciesRes = await fetch(pokemon.species.url);
        const speciesData = await speciesRes.json();
        const evoUrl = speciesData.evolution_chain.url;

        const evoRes = await fetch(evoUrl);
        const evoData = await evoRes.json();

        const chain = [];
        let current = evoData.chain;

        while (current) {
          chain.push(current.species.name);
          current = current.evolves_to[0];
        }

        //Buscar as sprites das evoluções
        const evolutions: EvolutionStage[] = await Promise.all(
          chain.map(async (name: string) => {
            const res = await fetch(
              `https://pokeapi.co/api/v2/pokemon/${name}`,
            );
            const data = await res.json();
            return {
              name,
              sprite: data.sprites.front_default,
            };
          }),
        );
        setEvolutionChain(evolutions);
      } catch (err) {
        console.error("Erro ao buscar cadeia evolutiva:", err);
      } finally {
        setLoading(false);
      }
    }
  }, [selectedPokemon]);

  if (!selectedPokemon) {
    return null;
  } //Não renderiza nada se nenhum pokemon estiver selecionado

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-end bg-black/50"
      onClick={onClose} //Clicar fora desse painel (no overlay) chama onClose (fecha o painel)
    >
      <aside
        className="relative bg-[#121417] w-full sm:max-w-md h-full p-3 sm:p-5 overflow-y-auto z-50"
        onClick={(e) => e.stopPropagation()} //Impede que o clique dentro do painel feche acidentalmente o painel
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-[#121417] hover:bg-yellow-300 transition cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5 hover:text-[#121417]" />
        </button>

        {loading ? (
          //Spinner animado aparece enquanto as informações e evoluções estão sendo carregadas
          <div className="flex justify-center items-center h-full">
            <div className="w-10 h-10 border-4 border-yellow-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4 bg-gray-800 rounded-2xl">
              <Image
                src={selectedPokemon.sprites.front_default}
                alt={selectedPokemon.name}
                width={160}
                height={160}
                unoptimized
                priority
                placeholder="blur"
                blurDataURL="/placeholder.png"
              />
            </div>
            <h2 className="text-xl text-yellow-300 font-bold capitalize mb-2">
              {selectedPokemon.name}
            </h2>
            <p className="text-sm mb-2 capitalize">
              <strong>Type:</strong>{" "}
              {selectedPokemon.types.map((t) => t.type.name).join(", ")}
            </p>
            <p className="text-sm mb-2">
              <strong>Height:</strong> {selectedPokemon.height / 10} m
            </p>
            <p className="text-sm mb-2">
              <strong>Weight:</strong> {selectedPokemon.weight / 10} kg
            </p>
            <p className="text-sm mb-4 capitalize">
              <strong>Abilities:</strong>{" "}
              {selectedPokemon.abilities.map((a) => a.ability.name).join(", ")}
            </p>

            <h3 className="mb-2 font-semibold">Stats</h3>
            <ul className="text-sm">
              {selectedPokemon.stats.map((stat) => (
                <li key={stat.stat.name} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span>{stat.stat.name.toUpperCase()}</span>
                    <span>{stat.base_stat}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded">
                    <div
                      className="h-2 bg-yellow-300 rounded"
                      style={{ width: `${Math.min(stat.base_stat, 100)}%` }}
                    ></div>
                  </div>
                </li>
              ))}
            </ul>
            {/*Evoluções*/}
            <p className="text-md mt-6 mb-3 font-semibold">Evolution Chain</p>
            <div className="flex gap-4 justify-center flex-wrap">
              {evolutionChain.map((evo) => (
                <div key={evo.name} className="flex flex-col items-center">
                  <Image
                    src={evo.sprite}
                    alt={evo.name}
                    width={64}
                    height={64}
                    unoptimized
                    className="w-32 h-32 sm:w-16 sm:h-16 bg-gray-800 rounded-2xl"
                  />
                  <p className="text-sm mt-1 capitalize">{evo.name}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
