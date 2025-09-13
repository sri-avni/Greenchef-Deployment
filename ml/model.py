import os
import sys
import json
import pandas as pd

def norm(s: str) -> str:
    return (s or "").strip().lower().rstrip('s')

def load_df():
    # Build a Render-safe path to recipes.csv
    DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'recipes.csv')
    # If your file is tab-delimited, change sep to '\t'
    return pd.read_csv(
        DATA_PATH,
        sep=',',                # or '\t' if your CSV uses tabs
        engine='python',        # python engine lets us use on_bad_lines
        on_bad_lines='skip'     # SKIP any row that doesn't match the header
    )

def parse_args():
    # Expect: model.py [ingredient]
    return sys.argv[1].strip() if len(sys.argv) >= 2 else ""

def filter_recipes(df: pd.DataFrame, seasonal: str):
    seasonal_n = norm(seasonal)
    df = df.copy()

    # Normalize each row's ingredients into a list
    df['__norm_ingredients__'] = (
        df['Ingredients']
          .astype(str)
          .str.split(',')
          .apply(lambda ings: [norm(i) for i in ings if str(i).strip()])
    )

    # If an ingredient was passed, filter by substring match
    if seasonal_n:
        df = df[df['__norm_ingredients__']
                .apply(lambda ings: any(seasonal_n in ing for ing in ings))]

    # Build the JSON-serializable output
    results = []
    for _, row in df.iterrows():
        raw = row.get('Ingredients', '')
        parts = [i.strip() for i in str(raw).split(',') if i.strip()]
        results.append({
            "name": row.get("Name", ""),
            "ingredients": parts,
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
        ingredient = parse_args()
        recipes = filter_recipes(df, ingredient)
        print(json.dumps(recipes, ensure_ascii=False))
    except Exception as e:
        # Return any error as JSON so Node can parse it
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
