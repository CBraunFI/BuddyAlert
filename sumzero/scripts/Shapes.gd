## Contains canonical polyomino definitions and transformation helpers.
class_name Shapes
extends Object

const SHAPES: Dictionary = {
    "domino": [Vector2i(0, 0), Vector2i(1, 0)],
    "tetromino_i": [Vector2i(0, 0), Vector2i(1, 0), Vector2i(2, 0), Vector2i(3, 0)],
    "tetromino_o": [Vector2i(0, 0), Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1)],
    "tetromino_t": [Vector2i(1, 0), Vector2i(0, 1), Vector2i(1, 1), Vector2i(2, 1)],
    "tetromino_s": [Vector2i(1, 0), Vector2i(2, 0), Vector2i(0, 1), Vector2i(1, 1)],
    "tetromino_z": [Vector2i(0, 0), Vector2i(1, 0), Vector2i(1, 1), Vector2i(2, 1)],
    "tetromino_l": [Vector2i(0, 0), Vector2i(0, 1), Vector2i(0, 2), Vector2i(1, 2)],
    "tetromino_j": [Vector2i(1, 0), Vector2i(1, 1), Vector2i(1, 2), Vector2i(0, 2)]
}

static func list_shapes() -> PackedStringArray:
    ## Returns identifiers for all registered shapes.
    var keys: Array = SHAPES.keys()
    keys.sort()
    return PackedStringArray(keys)

static func get_shape_cells(shape_id: String) -> Array[Vector2i]:
    ## Returns a copy of the cell list for the given shape.
    if not SHAPES.has(shape_id):
        return []
    var cells: Array[Vector2i] = []
    for cell in SHAPES[shape_id]:
        cells.append(cell)
    return cells

static func rotate_cells(cells: Array[Vector2i], quarter_turns: int) -> Array[Vector2i]:
    ## Rotates a shape in 90-degree increments.
    var turns: int = ((quarter_turns % 4) + 4) % 4
    var rotated: Array[Vector2i] = []
    for cell in cells:
        var result: Vector2i = cell
        match turns:
            0:
                result = cell
            1:
                result = Vector2i(-cell.y, cell.x)
            2:
                result = Vector2i(-cell.x, -cell.y)
            3:
                result = Vector2i(cell.y, -cell.x)
        rotated.append(result)
    return _normalize(rotated)

static func mirror_cells(cells: Array[Vector2i], horizontal: bool = true) -> Array[Vector2i]:
    ## Mirrors a shape either horizontally or vertically.
    var mirrored: Array[Vector2i] = []
    for cell in cells:
        var result: Vector2i = horizontal ? Vector2i(-cell.x, cell.y) : Vector2i(cell.x, -cell.y)
        mirrored.append(result)
    return _normalize(mirrored)

static func _normalize(cells: Array[Vector2i]) -> Array[Vector2i]:
    ## Normalizes a list of cells so the minimum coordinate is at (0, 0).
    if cells.is_empty():
        return []
    var min_x: int = cells[0].x
    var min_y: int = cells[0].y
    for cell in cells:
        min_x = min(min_x, cell.x)
        min_y = min(min_y, cell.y)
    var normalized: Array[Vector2i] = []
    for cell in cells:
        normalized.append(Vector2i(cell.x - min_x, cell.y - min_y))
    return normalized
