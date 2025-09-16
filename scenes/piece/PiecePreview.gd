extends Node2D
class_name PiecePreview

@export var cell_size: float = 32.0
@export var fill_color: Color = Color(1, 1, 1, 0.25)
@export var outline_color: Color = Color(1, 1, 1, 0.6)
@export var outline_thickness: float = 1.0
@export var offset: Vector2 = Vector2.ZERO

var _cells: Array = []
var _origin: Vector2 = Vector2.ZERO
var _cell_size: float = cell_size

func show_shape(shape_cells: Array, board_origin: Vector2 = Vector2.ZERO, override_cell_size: float = -1.0) -> void:
    _cells.clear()
    for entry in shape_cells:
        if entry is Vector2i:
            _cells.append(Vector2(entry))
        elif entry is Vector2:
            _cells.append(entry)
        elif entry is Array and entry.size() >= 2:
            _cells.append(Vector2(float(entry[0]), float(entry[1])))
        elif entry is Dictionary and entry.has("x") and entry.has("y"):
            _cells.append(Vector2(float(entry["x"]), float(entry["y"])))
    _origin = board_origin
    _cell_size = override_cell_size if override_cell_size > 0.0 else cell_size
    visible = not _cells.is_empty()
    queue_redraw()

func clear() -> void:
    _cells.clear()
    visible = false
    queue_redraw()

func _draw() -> void:
    if _cells.is_empty():
        return
    for cell in _cells:
        var pos := (cell + _origin + offset) * _cell_size
        var rect := Rect2(pos, Vector2(_cell_size, _cell_size))
        draw_rect(rect, fill_color, true)
        if outline_thickness > 0.0:
            draw_rect(rect, outline_color, false, outline_thickness)
