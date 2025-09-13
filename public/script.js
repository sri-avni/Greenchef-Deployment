document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('seasonalSelect');
  if (select) {
    select.addEventListener('change', async (e) => {
      const val = e.target.value;
      if (val) {
        await loadRecipes(val);
        document.getElementById('recipesSection').scrollIntoView({ behavior: 'smooth' });
      } else {
        document.getElementById('recipes').innerHTML = '';
      }
    });
  }

  loadSeasonalIngredients();
});

async function loadSeasonalIngredients() {
  const select = document.getElementById('seasonalSelect');
  select.innerHTML = '<option value="">-- Select Ingredient --</option>';

  try {
    const res = await fetch('/api/seasonal');
    const ingredients = await res.json();

    ingredients.forEach(i => {
      const option = document.createElement('option');
      option.value = i;
      option.textContent = i.charAt(0).toUpperCase() + i.slice(1);
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error loading ingredients:', err);
    select.innerHTML = '<option value="">Failed to load ingredients</option>';
  }
}

async function loadRecipes(seasonal) {
  const container = document.getElementById('recipes');
  container.innerHTML = '<p>Loading recipes...</p>';

  try {
    const res = await fetch(`/api/recipes/${encodeURIComponent(seasonal)}`);
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType.includes("application/json")) {
      throw new Error("Invalid response from server");
    }

    const recipes = await res.json();
    if (!recipes.length) {
      container.innerHTML = '<p>No recipes found for this ingredient.</p>';
      return;
    }

    container.innerHTML = '';
    recipes.forEach(r => {
      const div = document.createElement('div');
      div.className = 'recipe';
      div.innerHTML = `
        <h3>${r.name}</h3>
        <p><strong>Ingredients:</strong> ${Array.isArray(r.ingredients) ? r.ingredients.join(', ') : r.ingredients}</p>
        <p><strong>Instructions:</strong> ${r.instructions}</p>
        <p><strong>Prep Time:</strong> ${r['Prep Time'] || 'N/A'} mins</p>
        <p><strong>Diet Type:</strong> ${r['Diet Type'] || 'N/A'}</p>
        <p><strong>Sustainability Score:</strong> ${r['Sustainability Score'] || 'N/A'}</p>
        <p><strong style="color:#b22222;">Waste Parts:</strong> ${r['Waste Parts'] || 'None'}</p>
        <p><strong style="color:#2e8b57;">Reuse Suggestions:</strong> ${r['Reuse Suggestions'] || 'None'}</p>
      `;
      container.appendChild(div);
    });

  } catch (err) {
    console.error('Error loading recipes:', err);
    container.innerHTML = '<p style="color:red;">Error loading recipes.</p>';
  }
}
