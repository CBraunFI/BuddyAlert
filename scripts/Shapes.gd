extends Resource
class_name Shapes

## Stores the raw shape definitions and exposes helpers to transform them.
## Shapes are described as lists of Vector2i offsets where (0, 0) represents the
## top-left corner of the piece in its default orientation.
const SHAPES := {
    "square": [
        Vector2i(0, 0), Vector2i(1, 0),
        Vector2i(0, 1), Vector2i(1, 1),
    ],
    "line": [
        Vector2i(0, 0), Vector2i(1, 0), Vector2i(2, 0), Vector2i(3, 0)
    ],
    "l": [
        Vector2i(0, 0), Vector2i(0, 1), Vector2i(0, 2), Vector2i(1, 2)
    ],
    "t": [
        Vector2i(0, 0), Vector2i(1, 0), Vector2i(2, 0), Vector2i(1, 1)
    ],
}

## Returns true when a shape with the given name exists.
static func has_shape(name: String) -> bool:
    return SHAPES.has(name)

## Returns a deep copy of the base cell list for the given shape name.
static func get_shape(name: String) -> Array[Vector2i]:
    if not SHAPES.has(name):
        return []
    var duplicated: Array[Vector2i] = []
    for cell in SHAPES[name]:
        duplicated.append(Vector2i(cell))
    return duplicated

## Rotates a set of cells by the given number of clockwise 90° steps.
static func rotate_cells(cells: Array[Vector2i], steps: int = 1) -> Array[Vector2i]:
    var normalized_steps := posmod(steps, 4)
    if normalized_steps == 0:
        return _normalize_cells(cells)

    var rotated: Array[Vector2i] = []
    for cell in cells:
        var transformed := Vector2i(cell)
        for i in range(normalized_steps):
            transformed = Vector2i(transformed.y, -transformed.x)
        rotated.append(transformed)
    return _normalize_cells(rotated)

## Flips a set of cells. By default the cells are mirrored horizontally.
static func flip_cells(cells: Array[Vector2i], horizontal: bool = true) -> Array[Vector2i]:
    var flipped: Array[Vector2i] = []
    for cell in cells:
        var x := -cell.x if horizontal else cell.x
        var y := cell.y if horizontal else -cell.y
        flipped.append(Vector2i(x, y))
    return _normalize_cells(flipped)

## Applies rotation and flip to the provided cell list.
static func transform_cells(
        cells: Array[Vector2i],
        rotation_steps: int = 0,
        flipped: bool = false,
        horizontal: bool = true) -> Array[Vector2i]:
    var transformed: Array[Vector2i] = []
    for cell in cells:
        transformed.append(Vector2i(cell))

    if flipped:
        transformed = flip_cells(transformed, horizontal)
    if rotation_steps % 4 != 0:
        transformed = rotate_cells(transformed, rotation_steps)
    return _normalize_cells(transformed)

## Helper to fetch a transformed shape in one call.
static func get_transformed_shape(
        name: String,
        rotation_steps: int = 0,
        flipped: bool = false,
        horizontal: bool = true) -> Array[Vector2i]:
    var base := get_shape(name)
    if base.is_empty():
        return []
    return transform_cells(base, rotation_steps, flipped, horizontal)

static func _normalize_cells(cells: Array[Vector2i]) -> Array[Vector2i]:
    if cells.is_empty():
        return []

    var min_x := cells[0].x
    var min_y := cells[0].y
    for cell in cells:
        min_x = min(min_x, cell.x)
        min_y = min(min_y, cell.y)

    var normalized: Array[Vector2i] = []
    for cell in cells:
        normalized.append(Vector2i(cell.x - min_x, cell.y - min_y))
    return normalized
