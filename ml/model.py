import os
import sys
import json
import pandas as pd

def norm(s: str) -> str:
    return (s or "").strip().lower().rstrip('s')

def load_df():
    # Use comma delimiter unless your CSV is tab-delimited
    DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'recipes.csv')
    return pd.read_csv(DATA_PATH)

def parse_args():
    # Accept: model.py [seasonal]
    if len(sys.argv) >= 2:
        return sys.argv[1].strip()
    return ""

def filter_recipes(df: pd.DataFrame, seasonal: str):
    seasonal_n = norm(seasonal)
    df = df.copy()

    # Normalize ingredients per row
    df['__norm_ingredients__'] = (
        df['Ingredients']
          .astype(str)
          .str.split(',')
          .apply(lambda ings: [norm(i) for i in ings if str(i).strip()])
    )

    # Filter: seasonal substring in any normalized ingredient
    if seasonal_n:
        df = df[df['__norm_ingredients__'].apply(lambda ings: any(seasonal_n in ing for ing in ings))]

    # Shape output for the frontend
    results = []
    for _, row in df.iterrows():
        ingredients_raw = row.get('Ingredients', '')
        ingredients_list = [i.strip() for i in str(ingredients_raw).split(',') if i.strip()]
        results.append({
            "name": row.get("Name", ""),
            "ingredients": ingredients_list,
            "instructions": row.get("Instructions", ""),
            "Prep Time": row.get("Prep Time (min)", ""),
            "Diet Type": row.get("Diet Type", ""),
            "Sustainability Score": row.get("Sustainability Score", ""),
            "Waste Parts": row.get("Waste Parts", ""),
            "Reuse Suggestions": row.get("Reuse Suggestions", "")
        })
    return results

def main():
    try:
        df = load_df()
        seasonal = parse_args()
        recipes = filter_recipes(df, seasonal)
        print(json.dumps(recipes, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
