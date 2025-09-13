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

    // Optionally load recipes for the first ingredient
    if (ingredients.length > 0) {
      fetchRecipes(ingredients[0]);
    }
  } catch (err) {
    console.error('Failed to load seasonal ingredients:', err);
  }
}

// Fetch recipes for the selected ingredient
async function fetchRecipes(seasonal) {
  try {
    const res = await fetch(`/api/recipes/${encodeURIComponent(seasonal)}`);
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

// Wait until DOM is ready before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
  const dropdown = document.getElementById('ingredientDropdown');
  if (dropdown) {
    dropdown.addEventListener('change', e => {
      fetchRecipes(e.target.value);
    });
  }
  loadSeasonalIngredients();
});
