"""Assign each exercise a specific muscle region (e.g. upper chest, rear delts) from its
primary muscle + name. free-exercise-db only lists whole muscles, so we infer the region."""
import re

def _m(pattern, name):
    return re.search(pattern, name, re.I) is not None

def region(primary: str, name: str, secondary=()):
    n = name
    if primary == "chest":
        if _m(r"incline|low.?to.?high|low cable cross|reverse.?grip bench", n): return "chest-upper"
        if _m(r"decline|dip|high.?to.?low|high cable|pullover", n): return "chest-lower"
        return "chest-middle"
    if primary == "shoulders":
        if _m(r"rear|pull.?apart|reverse fl|reverse machine|face pull|bent.?over.*(raise|fly|flye)|posterior|back fly", n): return "delts-rear"
        if _m(r"lateral|side raise|side lateral|upright row|lu raise|y.?raise|cable.*side|iron cross", n): return "delts-side"
        return "delts-front"
    if primary == "lats": return "back-lats"
    if primary in ("middle back", "traps"): return "back-upper"
    if primary == "lower back": return "back-lower"
    if primary == "abdominals":
        if _m(r"oblique|twist|side bend|side plank|woodchop|wood chop|russian|windmill|saxon|side jack|bicycle|cross.?body|landmine 180|pallof|side crunch|heel touch|alternate heel", n): return "abs-obliques"
        if _m(r"leg raise|knee raise|reverse crunch|flutter|scissor|hanging|leg pull|knee tuck|tuck crunch|mountain|leg lift|v.?up|jackknife|frog|dragon|toes to bar|hip lift|flat bench lying leg", n): return "abs-lower"
        return "abs-upper"
    return {
        "biceps": "biceps", "triceps": "triceps", "forearms": "forearms",
        "quadriceps": "legs-quads", "hamstrings": "legs-hamstrings", "glutes": "legs-glutes",
        "calves": "legs-calves", "adductors": "legs-inner", "abductors": "legs-outer", "neck": "neck",
    }.get(primary, primary)
