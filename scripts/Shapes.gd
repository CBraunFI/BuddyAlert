extends Resource
class_name Shapes

## Utility helpers for manipulating polyomino style shapes.
## Shapes are represented as arrays of Vector2i offsets (cells)
## relative to an origin at (0, 0).

static func _to_vector2i_array(shape: Array) -> Array:
    var cells: Array = []
    for entry in shape:
        if entry is Vector2i:
            cells.append(entry)
        elif entry is Vector2:
            cells.append(Vector2i(int(round(entry.x)), int(round(entry.y))))
        elif entry is Array and entry.size() >= 2:
            cells.append(Vector2i(int(entry[0]), int(entry[1])))
        elif entry is Dictionary and entry.has("x") and entry.has("y"):
            cells.append(Vector2i(int(entry["x"]), int(entry["y"])))
        else:
            push_error("Unsupported shape entry: %s" % entry)
    return cells

static func _normalize(cells: Array) -> Array:
    if cells.is_empty():
        return []
    var min_x := cells[0].x
    var min_y := cells[0].y
    for cell in cells:
        min_x = mini(min_x, cell.x)
        min_y = mini(min_y, cell.y)
    var normalized: Array = []
    for cell in cells:
        normalized.append(Vector2i(cell.x - min_x, cell.y - min_y))
    return normalized

static func rotate(shape, steps: int = 1, normalize := true):
    ## Rotate a shape in 90° steps (clockwise).
    ## Accepts either an Array of Vector2(i) offsets or a Dictionary
    ## containing a `cells` Array. Returns a deep copy.
    var steps_local := int(steps) % 4
    if steps_local < 0:
        steps_local += 4
    if shape is Dictionary and shape.has("cells"):
        var clone := shape.duplicate(true)
        clone["cells"] = rotate(shape["cells"], steps_local, normalize)
        return clone

    var cells := _to_vector2i_array(shape)
    for _i in range(steps_local):
        for index in range(cells.size()):
            var cell: Vector2i = cells[index]
            cells[index] = Vector2i(-cell.y, cell.x)
    return _normalize(cells) if normalize else cells

static func flip(shape, horizontal: bool = true, normalize := true):
    ## Mirror a shape either horizontally (default) or vertically.
    ## Accepts the same formats as `rotate` and returns a deep copy.
    if shape is Dictionary and shape.has("cells"):
        var clone := shape.duplicate(true)
        clone["cells"] = flip(shape["cells"], horizontal, normalize)
        return clone

    var cells := _to_vector2i_array(shape)
    for index in range(cells.size()):
        var cell: Vector2i = cells[index]
        if horizontal:
            cells[index] = Vector2i(-cell.x, cell.y)
        else:
            cells[index] = Vector2i(cell.x, -cell.y)
    return _normalize(cells) if normalize else cells

static func rotate_counter_clockwise(shape, normalize := true):
    return rotate(shape, -1, normalize)

static func rotate_clockwise(shape, normalize := true):
    return rotate(shape, 1, normalize)

static func flip_vertical(shape, normalize := true):
    return flip(shape, false, normalize)

static func normalize(shape: Array) -> Array:
    return _normalize(_to_vector2i_array(shape))
