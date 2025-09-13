import os
import json
import pandas as pd

def norm(s: str) -> str:
    return (s or "").strip().lower().rstrip('s')

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'recipes.csv')

try:
    df = pd.read_csv(DATA_PATH, delimiter='\t')
except Exception as e:
    print(json.dumps({"error": f"CSV load failed: {str(e)}"}))
    raise SystemExit(1)

# Split and normalize ingredients per row
df['__norm_ingredients__'] = (
    df['Ingredients']
      .astype(str)
      .str.split(',')
      .apply(lambda ings: [norm(i) for i in ings if str(i).strip()])
)

# All unique normalized ingredients
all_ings = sorted({ing for row in df['__norm_ingredients__'] for ing in row})

# Substrings to exclude (normalized)
EXCLUDE_SUBSTR = {
    "basmati rice",
    "boiled green gram(moong)",
    "boiled green gram",
    "green gram(moong)",
    "green gram",
    "cooked rice",
    "coriander",
    "coriander leave",   # handles both leave/leaf
    "coriander leaf",
    "cucumber",
    "cumin seed",
    "curry leave",
    "curry leaf",
    "garlic",
    "ginger",
    "green chilli",
    "green chili",
    "green pea",
    "lemon juice",
    "minimal oil",
    "moong dal",
    "moringa leave",
    "moringa leaf",
    "mustard seed",
    "mustard seeds",
    "peanut",
    "pumpkin",
    "pumpkin seed",
    "ridge gourd",
    "ridge gourd peel",
    "salt",
    "tomato",
    "tomatoe",
    "turmeric",
    "tamarind",
    "vegetable stock",
    "rice"
}

def is_excluded(ing: str) -> bool:
    n = norm(ing)
    return any(sub in n for sub in EXCLUDE_SUBSTR)

# Filter out unwanted items
candidates = [ing for ing in all_ings if not is_excluded(ing)]

# Verify each remaining ingredient has at least one matching recipe
def has_recipe(seasonal: str) -> bool:
    s = norm(seasonal)
    return not df[df['__norm_ingredients__'].apply(lambda ings: any(s in i for i in ings))].empty

valid = sorted([ing for ing in candidates if has_recipe(ing)])
print(json.dumps(valid))