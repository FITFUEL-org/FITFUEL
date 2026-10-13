"""Trim free-exercise-db (Unlicense, github.com/yuhonas/free-exercise-db) into public/data/exercises.json.

Usage: python scripts/prepare-exercises.py path/to/exercises.json
"""
import json, re, sys

HOME = {"body only", "dumbbell", "kettlebells", "bands", "exercise ball", "medicine ball", "foam roll", None}
OUTDOOR = {"body only", "bands", "kettlebells", "medicine ball", None}

src = json.load(open(sys.argv[1], encoding="utf-8"))
out = []
for x in src:
    eq = x.get("equipment")
    places = ["gym"]
    if eq in HOME: places.append("home")
    if eq in OUTDOOR or x["category"] in ("cardio", "plyometrics") and eq in (None, "body only"): places.append("outdoor")
    out.append({
        "id": x["id"], "name": x["name"], "level": x["level"], "mechanic": x.get("mechanic"),
        "force": x.get("force"), "equipment": eq or "none", "category": x["category"],
        "primary": x["primaryMuscles"], "secondary": x["secondaryMuscles"],
        "steps": [re.sub(r"\s+", " ", s).strip() for s in x["instructions"]],
        "images": x["images"], "places": sorted(set(places)),
    })
out.sort(key=lambda e: e["name"].lower())
json.dump(out, open("public/data/exercises.json", "w", encoding="utf-8"), separators=(",", ":"), ensure_ascii=False)
print(len(out), "exercises")
