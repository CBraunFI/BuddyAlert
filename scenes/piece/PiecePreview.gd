extends Node2D
class_name PiecePreview

@export var cell_size: float = 32.0
@export var valid_color: Color = Color(0.3, 0.9, 0.9, 0.45)
@export var invalid_color: Color = Color(1.0, 0.3, 0.3, 0.45)
@export var outline_color: Color = Color(1.0, 1.0, 1.0, 0.7)

var _cells: Array[Vector2i] = []
var _is_valid: bool = true

func set_cells(cells: Array[Vector2i]) -> void:
    _cells.clear()
    for cell in cells:
        _cells.append(Vector2i(cell))
    queue_redraw()

func clear() -> void:
    _cells.clear()
    queue_redraw()

func set_valid_state(valid: bool) -> void:
    if _is_valid == valid:
        return
    _is_valid = valid
    queue_redraw()

func set_cell_size(size: float) -> void:
    if cell_size == size:
        return
    cell_size = size
    queue_redraw()

func _draw() -> void:
    if _cells.is_empty():
        return

    var fill_color := valid_color if _is_valid else invalid_color
    for cell in _cells:
        var top_left := Vector2(cell.x, cell.y) * cell_size
        var rect := Rect2(top_left, Vector2(cell_size, cell_size))
        draw_rect(rect, fill_color)
        draw_rect(rect, outline_color, false, 1.0)
