const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
const pokemonTypesUrl = 'https://pokeapi.co/api/v2/type';
let currentPage = 1;
const limit = 12;
let allPokemonData = [];
let filteredData = [];

// Fetch and display Pokemon
async function fetchPokemon(offset) {
    const response = await fetch(`${baseUrl}?offset=${offset}&limit=${limit}`);
    const data = await response.json();
    return data.results;
}

async function getPokemonDetails(url) {
    const response = await fetch(url);
    const data = await response.json();
    return {
        name: data.name,
        image: data.sprites.front_default,
        type: data.types.map(typeInfo => typeInfo.type.name).join('/'),
        abilities: data.abilities.map(abilityInfo => abilityInfo.ability.name).join(', '),
        stats: data.stats.map(statInfo => `${statInfo.stat.name}: ${statInfo.base_stat}`).join(', ')
    };
}

async function displayPokemon() {
    const offset = (currentPage - 1) * limit;
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = '';
    const pokemons = await fetchPokemon(offset);
    for (const pokemon of pokemons) {
        const details = await getPokemonDetails(pokemon.url);
        allPokemonData.push({ name: details.name.toLowerCase(), details });
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card mb-4" onclick="showDetails('${details.name}', '${details.image}', '${details.type}', '${details.abilities}', '${details.stats}')">
                <img src="${details.image}" class="card-img-top" alt="${details.name}">
                <div class="card-body">
                    <h5 class="card-title">${details.name}</h5>
                    <p class="card-text">Type: ${details.type}</p>
                </div>
            </div>
        `;
        pokemonList.appendChild(card);
    }
    filteredData = allPokemonData;  // Update filtered data
}

function showDetails(name, image, type, abilities, stats) {
    document.getElementById('modalImage').src = image;
    document.getElementById('modalName').innerText = name;
    document.getElementById('modalType').innerText = `Type: ${type}`;
    document.getElementById('modalAbilities').innerText = `Abilities: ${abilities}`;
    document.getElementById('modalStats').innerText = `Stats: ${stats}`;
    $('#pokemonModal').modal('show');
}

// Search functionality
function searchPokemon() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredPokemon = filteredData.filter(pokemon => pokemon.name.includes(searchInput));
    displayFilteredPokemon(filteredPokemon);
}

function applyTypeFilter() {
    const typeFilter = document.getElementById('typeFilter').value;
    if (typeFilter) {
        filteredData = allPokemonData.filter(pokemon => pokemon.details.type.includes(typeFilter));
    } else {
        filteredData = allPokemonData;
    }
    displayFilteredPokemon(filteredData);
}

// Display filtered Pokémon
function displayFilteredPokemon(filteredPokemon) {
    const pokemonList = document.getElementById('pokemon-list');
    pokemonList.innerHTML = '';
    filteredPokemon.forEach(({ details }) => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card mb-4" onclick="showDetails('${details.name}', '${details.image}', '${details.type}', '${details.abilities}', '${details.stats}')">
                <img src="${details.image}" class="card-img-top" alt="${details.name}">
                <div class="card-body">
                    <h5 class="card-title">${details.name}</h5>
                    <p class="card-text">Type: ${details.type}</p>
                </div>
            </div>
        `;
        pokemonList.appendChild(card);
    });
}

// Fetch types for filter dropdown
async function fetchPokemonTypes() {
    const response = await fetch(pokemonTypesUrl);
    const data = await response.json();
    const typeFilter = document.getElementById('typeFilter');
    data.results.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name;
        option.text = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        typeFilter.appendChild(option);
    });
}

// Pagination
function nextPage() {
    currentPage++;
    displayPokemon();
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        displayPokemon();
    }
}

// Initial load
fetchPokemonTypes();
displayPokemon();
