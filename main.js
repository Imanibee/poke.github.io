const baseUrl = 'https://pokeapi.co/api/v2/pokemon';
const pokemonTypesUrl = 'https://pokeapi.co/api/v2/type';
let currentPage = 1;
const limit = 12;
let allPokemonData = [];
let filteredData = [];
let totalPokemon = 0;

// Fetch all Pokémon data initially (fetches names, URLs, and detailed info)
async function fetchAllPokemon() {
    const response = await fetch(`${baseUrl}?limit=10000`);
    const data = await response.json();
    totalPokemon = data.results.length;

    // Fetch details for each Pokémon and store it in allPokemonData
    for (const pokemon of data.results) {
        const details = await getPokemonDetails(pokemon.url);
        allPokemonData.push({ name: details.name.toLowerCase(), ...details });
    }

    return allPokemonData;
}

// Fetch detailed Pokémon data for each Pokémon
async function getPokemonDetails(url) {
    const response = await fetch(url);
    const data = await response.json();
    return {
        name: data.name,
        image: data.sprites.front_default,
        type: data.types.map(typeInfo => typeInfo.type.name.toLowerCase()).join('/'),
        abilities: data.abilities.map(abilityInfo => abilityInfo.ability.name).join(', '),
        stats: data.stats.map(statInfo => `${statInfo.stat.name}: ${statInfo.base_stat}`).join(', ')
    };
}

// Initialize: fetch all Pokémon data and display first page
async function init() {
    await fetchAllPokemon(); // Fetch all Pokémon and store it
    await loadPageData(); // Load the data for the first page
    fetchPokemonTypes();  // Fetch types for the filter
}

// Load and display data for the current page
async function loadPageData() {
    const offset = (currentPage - 1) * limit;
    const pagePokemon = allPokemonData.slice(offset, offset + limit); // Paginate locally
    displayPokemon(pagePokemon);
}

// Display Pokémon cards on the current page
function displayPokemon(pokemonList) {
    const pokemonContainer = document.getElementById('pokemon-list');
    pokemonContainer.innerHTML = '';
    pokemonList.forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card mb-4" onclick="showDetails('${pokemon.name}', '${pokemon.image}', '${pokemon.type}', '${pokemon.abilities}', '${pokemon.stats}')">
                <img src="${pokemon.image}" class="card-img-top" alt="${pokemon.name}">
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">Type: ${pokemon.type}</p>
                </div>
            </div>
        `;
        pokemonContainer.appendChild(card);
    });
}

// Show Pokémon details in a modal
function showDetails(name, image, type, abilities, stats) {
    document.getElementById('modalImage').src = image;
    document.getElementById('modalName').innerText = name;
    document.getElementById('modalType').innerText = `Type: ${type}`;
    document.getElementById('modalAbilities').innerText = `Abilities: ${abilities}`;
    document.getElementById('modalStats').innerText = `Stats: ${stats}`;
    $('#pokemonModal').modal('show');
}

// Search Pokémon by name
function searchPokemon() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const filteredPokemon = allPokemonData.filter(pokemon => pokemon.name.includes(searchInput));
    displayFilteredPokemon(filteredPokemon);
}

// Apply filter based on selected type
function applyTypeFilter() {
    const typeFilter = document.getElementById('typeFilter').value.toLowerCase();
    if (typeFilter === 'all') {
        displayPokemon(allPokemonData.slice((currentPage - 1) * limit, currentPage * limit)); // Reset to all Pokémon
    } else {
        filteredData = allPokemonData.filter(pokemon => pokemon.type.includes(typeFilter));
        displayFilteredPokemon(filteredData);
    }
}

// Display filtered Pokémon cards
function displayFilteredPokemon(filteredPokemon) {
    const pokemonContainer = document.getElementById('pokemon-list');
    pokemonContainer.innerHTML = '';
    filteredPokemon.slice(0, limit).forEach(pokemon => {
        const card = document.createElement('div');
        card.className = 'col-md-4';
        card.innerHTML = `
            <div class="card mb-4" onclick="showDetails('${pokemon.name}', '${pokemon.image}', '${pokemon.type}', '${pokemon.abilities}', '${pokemon.stats}')">
                <img src="${pokemon.image}" class="card-img-top" alt="${pokemon.name}">
                <div class="card-body">
                    <h5 class="card-title">${pokemon.name}</h5>
                    <p class="card-text">Type: ${pokemon.type}</p>
                </div>
            </div>
        `;
        pokemonContainer.appendChild(card);
    });
}

// Fetch types for the filter dropdown
async function fetchPokemonTypes() {
    const response = await fetch(pokemonTypesUrl);
    const data = await response.json();
    const typeFilter = document.getElementById('typeFilter');
    typeFilter.innerHTML = '<option value="all">All</option>'; // Add "All" option

    data.results.forEach(type => {
        const option = document.createElement('option');
        option.value = type.name.toLowerCase();
        option.text = type.name.charAt(0).toUpperCase() + type.name.slice(1);
        typeFilter.appendChild(option);
    });
}

// Pagination controls
function nextPage() {
    if ((currentPage * limit) < totalPokemon) {
        currentPage++;
        loadPageData();
    }
}

function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        loadPageData();
    }
}

// Initialize the app on page load
init();
