import Image from "next/image";
import { Pokemon } from "../types/pokemon";

interface Props {
  pokemons: Pokemon[];
  onSelect: (url: string) => void;
}

export default function PokemonGrid({ pokemons, onSelect }: Props) {
  return (
    <main className="w-full p-2 sm:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-4">
      {pokemons &&
        pokemons.map((pokemon) => {
          const id = pokemon.url.split("/").filter(Boolean).pop();

          return (
            <button
              key={pokemon.name}
              className="bg-gray-800 flex flex-col items-center p-2 rounded-lg hover:bg-gray-700 hover:scale-105 transition cursor-pointer border-2 border-white/10"
              onClick={() => onSelect(pokemon.url)}
            >
              <Image
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`}
                alt={pokemon.name}
                width={120}
                height={120}
                unoptimized
              />
              <p className="text-center text-sm font-medium tracking-wide mb-2 capitalize">
                {pokemon.name}
              </p>
            </button>
          );
        })}
    </main>
  );
}
