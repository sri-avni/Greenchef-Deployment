// Load seasonal ingredients from backend and populate dropdown
async function loadSeasonalIngredients() {
  try {
    const res = await fetch('/api/seasonal');
    const ingredients = await res.json();
    const dropdown = document.getElementById('ingredientDropdown');
    dropdown.innerHTML = '';

    ingredients.forEach(ing => {
      const opt = document.createElement('option');
      opt.value = ing;
      opt.textContent = ing;
      dropdown.appendChild(opt);
    });
  } catch (err) {
    console.error('Failed to load seasonal ingredients:', err);
  }
}

// Fetch recipes for the selected ingredient
async function fetchRecipes(seasonal) {
  try {
    const res = await fetch('/api/recipes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ seasonal })
    });
    const recipes = await res.json();
    displayRecipes(recipes);
  } catch (err) {
    console.error('Failed to fetch recipes:', err);
  }
}

// Display recipes in the page
function displayRecipes(recipes) {
  const container = document.getElementById('recipes');
  container.innerHTML = '';
  if (!recipes.length) {
    container.textContent = 'No recipes found.';
    return;
  }
  recipes.forEach(r => {
    const div = document.createElement('div');
    div.innerHTML = `
      <h3>${r.name}</h3>
      <p><b>Ingredients:</b> ${r.ingredients.join(', ')}</p>
      <p><b>Instructions:</b> ${r.instructions}</p>
    `;
    container.appendChild(div);
  });
}

// When dropdown changes, fetch recipes for that ingredient
document.getElementById('ingredientDropdown').addEventListener('change', e => {
  fetchRecipes(e.target.value);
});

// On page load, populate dropdown and load first ingredient's recipes
window.onload = async () => {
  await loadSeasonalIngredients();
  const first = document.getElementById('ingredientDropdown').value;
  if (first) fetchRecipes(first);
};