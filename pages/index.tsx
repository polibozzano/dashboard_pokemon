import Head from "next/head";
import { GetStaticProps } from "next";
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import PokemonGrid from "../components/PokemonGrid";
import PokemonDetail from "../components/PokemonDetail";
import { Pokemon, PokemonDetails } from "../types/pokemon";

interface HomeProps {
  initialPokemons: Pokemon[];
  typesList: string[];
  generationsList: string[];
}

export const getStaticProps: GetStaticProps = async () => {
  const [pokemonRes, typeRes, generationRes] = await Promise.all([
    fetch("https://pokeapi.co/api/v2/pokemon?limit=10000"),
    fetch("https://pokeapi.co/api/v2/type"),
    fetch("https://pokeapi.co/api/v2/generation"),
  ]);

  const [pokemonData, typeData, generationData] = await Promise.all([
    pokemonRes.json(),
    typeRes.json(),
    generationRes.json(),
  ]);

  const typesList: string[] = Array.isArray(typeData.results)
    ? typeData.results
        .map((t: { name: string }) => t.name)
        .filter((type: string) => type !== "shadow" && type !== "unknown")
    : [];

  const generationsList: string[] = generationData.results.map(
    (g: { name: string }) => g.name,
  );

  return {
    props: {
      initialPokemons: pokemonData.results,
      typesList,
      generationsList,
    },
  };
};

export default function Home({
  initialPokemons,
  typesList,
  generationsList,
}: HomeProps) {
  const [pokemons, setPokemons] = useState<Pokemon[]>(initialPokemons);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetails | null>(
    null,
  );
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedGeneration, setSelectedGeneration] = useState<string>("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchFilteredPokemons = async () => {
      try {
        if (selectedType === "All" && selectedGeneration === "All") {
          setPokemons(initialPokemons);
        } else if (selectedType !== "All" && selectedGeneration === "All") {
          const res = await fetch(
            `https://pokeapi.co/api/v2/type/${selectedType}`,
          );
          const data = await res.json();
          const filtered = data.pokemon.map((p: any) => p.pokemon);
          setPokemons(filtered);
        } else if (selectedType === "All" && selectedGeneration !== "All") {
          const res = await fetch(
            `https://pokeapi.co/api/v2/generation/${selectedGeneration}`,
          );
          const data = await res.json();
          const filtered = data.pokemon_species.map((p: any) => ({
            name: p.name,
            url: `https://pokeapi.co/api/v2/pokemon/${p.name}`,
          }));
          setPokemons(filtered);
        } else {
          const [typeRes, genRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/type/${selectedType}`),
            fetch(`https://pokeapi.co/api/v2/generation/${selectedGeneration}`),
          ]);

          const [typeData, genData] = await Promise.all([
            typeRes.json(),
            genRes.json(),
          ]);

          const typePokemons = typeData.pokemon.map((p: any) => p.pokemon);
          const genNames = genData.pokemon_species.map((p: any) => p.name);

          const filtered = typePokemons.filter((p: any) =>
            genNames.includes(p.name),
          );

          setPokemons(filtered);
        }
      } catch (err) {
        console.error("Erro ao buscar pokemons:", err);
      }
    };

    fetchFilteredPokemons();
  }, [selectedType, selectedGeneration]);

  const handleSelectPokemon = async (url: string) => {
    const res = await fetch(url);
    const data = await res.json();
    setSelectedPokemon(data);
  };

  return (
    <>
      <Head>
        <title>Pokemon Dashboard</title>
        <meta
          name="description"
          content="Filtre e explore Pokemons por tipo e geração"
        />
        <link rel="icon" type="image/x-icon" href="/pokeball.svg" />
      </Head>

      <button
        className="md:hidden p-4 rounded-full bg-[#121417] text-yellow-300 fixed z-50 top-2 left-2 cursor-pointer"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        aria-label="Abrir ou fechar menu lateral"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      <main className="h-screen flex-1 flex flex-col sm:flex-row p-4 sm:p-4 gap-6 sm:gap-6 overflow-auto bg-[#121417]">
        <h1 className="hidden text-sm">Pokemon Dashboard</h1>
        <div
          className={`fixed md:static z-40 top-0 left-0 h-full sidebar p-5 bg-[#121417] transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 max-h-screen overflow-y-auto shadow-xl shadow-black/50 rounded-none md:rounded-2xl`}
        >
          <Sidebar
            types={typesList}
            generations={generationsList}
            selectedType={selectedType}
            onSelectType={setSelectedType}
            selectedGeneration={selectedGeneration}
            onSelectGeneration={setSelectedGeneration}
          />
        </div>
        <div className="overflow-y-auto sidebar flex-1 shadow-xl shadow-black/50 rounded-2xl">
          <PokemonGrid pokemons={pokemons} onSelect={handleSelectPokemon} />
        </div>

        <aside
          className={`transition-all duration-300 ${selectedPokemon ? "translate-x-0" : "translate-x-full"} fixed right-0 top-0 h-full w-full sm:w-[300px] overflow-y-auto sidebar z-50 bg-[#121417] shadow-xl shadow-black/50 rounded-2xl`}
        >
          {selectedPokemon && (
            <PokemonDetail
              selectedPokemon={selectedPokemon}
              onClose={() => setSelectedPokemon(null)}
            />
          )}
        </aside>
      </main>
    </>
  );
}
