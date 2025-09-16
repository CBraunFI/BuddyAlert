extends Node2D
class_name Board

signal history_changed(has_undo: bool, has_redo: bool)
signal preview_state_changed(is_valid: bool)

const Shapes := preload("res://scripts/Shapes.gd")
const PiecePreviewScene := preload("res://scenes/piece/PiecePreview.tscn")

@export var board_size: Vector2i = Vector2i(10, 10)
@export var cell_size: float = 32.0
@export var initial_shape: String = "square"
@export var preview_enabled: bool = true
@export var preview_start_position: Vector2i = Vector2i.ZERO

var current_shape_id: String
var _rotation_steps: int = 0
var _is_flipped: bool = false
var _preview_position: Vector2i = Vector2i.ZERO
var _grid: Array = []
var _occupied_cells: Dictionary = {}
var _placements: Array = []
var _undo_stack: Array = []
var _redo_stack: Array = []
var _current_offsets: Array = []
var _preview_instance: PiecePreview
var _shape_color_cache: Dictionary = {}

const _PALETTE := [
    Color(0.94, 0.43, 0.36, 0.85),
    Color(0.44, 0.75, 0.93, 0.85),
    Color(0.91, 0.77, 0.35, 0.85),
    Color(0.47, 0.82, 0.50, 0.85),
    Color(0.78, 0.52, 0.88, 0.85),
    Color(0.96, 0.64, 0.38, 0.85),
]

func _ready() -> void:
    _init_grid()
    current_shape_id = _resolve_initial_shape()
    _preview_position = preview_start_position
    _create_preview_instance()
    update_preview()
    _notify_history_change()

func _init_grid() -> void:
    _grid.clear()
    _occupied_cells.clear()
    _placements.clear()
    _undo_stack.clear()
    _redo_stack.clear()

    for x in range(board_size.x):
        var column: Array[bool] = []
        for y in range(board_size.y):
            column.append(false)
        _grid.append(column)
    queue_redraw()

func _resolve_initial_shape() -> String:
    if Shapes.has_shape(initial_shape):
        return initial_shape
    if Shapes.SHAPES.is_empty():
        return ""
    return Shapes.SHAPES.keys()[0]

func _create_preview_instance() -> void:
    if not PiecePreviewScene:
        return
    if _preview_instance:
        _preview_instance.queue_free()
    _preview_instance = PiecePreviewScene.instantiate()
    add_child(_preview_instance)
    _preview_instance.set_cell_size(cell_size)
    _preview_instance.visible = preview_enabled
    _preview_instance.z_index = 100

func _unhandled_input(event: InputEvent) -> void:
    if event is InputEventKey and event.pressed and not event.echo:
        var key_event := event as InputEventKey
        match key_event.keycode:
            KEY_R:
                rotate_clockwise()
            KEY_F:
                toggle_flip()
            KEY_LEFT:
                move_preview(Vector2i(-1, 0))
            KEY_RIGHT:
                move_preview(Vector2i(1, 0))
            KEY_UP:
                move_preview(Vector2i(0, -1))
            KEY_DOWN:
                move_preview(Vector2i(0, 1))
            KEY_SPACE, KEY_ENTER:
                place_current_piece()
            KEY_Z:
                if key_event.ctrl_pressed:
                    if key_event.shift_pressed:
                        redo()
                    else:
                        undo()
            KEY_Y:
                if key_event.ctrl_pressed:
                    redo()

func set_current_shape(shape_id: String) -> void:
    if shape_id == current_shape_id:
        return
    if not Shapes.has_shape(shape_id):
        push_warning("Shape '%s' is not defined." % shape_id)
        return
    current_shape_id = shape_id
    _rotation_steps = 0
    _is_flipped = false
    update_preview()

func rotate_clockwise() -> void:
    _rotation_steps = (_rotation_steps + 1) % 4
    update_preview()

func rotate_counter_clockwise() -> void:
    _rotation_steps = (_rotation_steps + 3) % 4
    update_preview()

func toggle_flip() -> void:
    _is_flipped = not _is_flipped
    update_preview()

func set_flip(value: bool) -> void:
    if _is_flipped == value:
        return
    _is_flipped = value
    update_preview()

func move_preview(delta: Vector2i) -> void:
    _preview_position += delta
    update_preview()

func set_preview_position(position: Vector2i) -> void:
    _preview_position = position
    update_preview()

func get_preview_position() -> Vector2i:
    return _preview_position

func get_preview_cells() -> Array[Vector2i]:
    return _get_world_cells(_preview_position)

func can_place_current_preview() -> bool:
    return can_place_at(_preview_position)

func place_current_piece() -> bool:
    if _current_offsets.is_empty():
        return false
    var world_cells := _get_world_cells(_preview_position)
    if not _is_within_bounds(world_cells) or not _are_cells_free(world_cells):
        return false

    var placement := {
        "shape_id": current_shape_id,
        "rotation": _rotation_steps,
        "flipped": _is_flipped,
        "position": Vector2i(_preview_position),
        "cells": world_cells,
        "color": _get_color_for_shape(current_shape_id),
    }
    _apply_placement(placement)
    _undo_stack.append(placement)
    _redo_stack.clear()
    _notify_history_change()
    update_preview()
    return true

func undo() -> bool:
    if _undo_stack.is_empty():
        return false
    var placement = _undo_stack.pop_back()
    _remove_placement(placement)
    _redo_stack.append(placement)
    _notify_history_change()
    update_preview()
    return true

func redo() -> bool:
    if _redo_stack.is_empty():
        return false
    var placement = _redo_stack.pop_back()
    _apply_placement(placement)
    _undo_stack.append(placement)
    _notify_history_change()
    update_preview()
    return true

func has_undo() -> bool:
    return not _undo_stack.is_empty()

func has_redo() -> bool:
    return not _redo_stack.is_empty()

func can_place_at(position: Vector2i) -> bool:
    if _current_offsets.is_empty():
        return false
    var world_cells := _get_world_cells(position)
    return _is_within_bounds(world_cells) and _are_cells_free(world_cells)

func is_within_bounds(cells: Array[Vector2i]) -> bool:
    return _is_within_bounds(cells)

func are_cells_free(cells: Array[Vector2i]) -> bool:
    return _are_cells_free(cells)

func is_placement_valid(cells: Array[Vector2i]) -> bool:
    return _is_within_bounds(cells) and _are_cells_free(cells)

func clear_board() -> void:
    _init_grid()
    update_preview()
    _notify_history_change()

func update_preview() -> void:
    if current_shape_id == "" or not Shapes.has_shape(current_shape_id):
        _current_offsets = []
    else:
        _current_offsets = Shapes.get_transformed_shape(current_shape_id, _rotation_steps, _is_flipped)

    _clamp_preview_position()

    var valid := can_place_at(_preview_position)
    if _preview_instance:
        _preview_instance.visible = preview_enabled and not _current_offsets.is_empty()
        _preview_instance.set_cell_size(cell_size)
        _preview_instance.position = Vector2(_preview_position) * cell_size
        _preview_instance.set_cells(_current_offsets)
        _preview_instance.set_valid_state(valid)

    emit_signal("preview_state_changed", valid)
    queue_redraw()

func _clamp_preview_position() -> void:
    if board_size.x <= 0 or board_size.y <= 0:
        _preview_position = Vector2i.ZERO
        return
    var size := _get_shape_size()
    var width := max(size.x, 1)
    var height := max(size.y, 1)
    var max_x := max(0, board_size.x - width)
    var max_y := max(0, board_size.y - height)
    _preview_position.x = clamp(_preview_position.x, 0, max_x)
    _preview_position.y = clamp(_preview_position.y, 0, max_y)

func _get_shape_size() -> Vector2i:
    if _current_offsets.is_empty():
        return Vector2i.ONE
    var max_x := 0
    var max_y := 0
    for cell in _current_offsets:
        max_x = max(max_x, cell.x)
        max_y = max(max_y, cell.y)
    return Vector2i(max_x + 1, max_y + 1)

func _get_world_cells(position: Vector2i) -> Array[Vector2i]:
    var cells: Array[Vector2i] = []
    for offset in _current_offsets:
        cells.append(position + offset)
    return cells

func _is_within_bounds(cells: Array[Vector2i]) -> bool:
    for cell in cells:
        if cell.x < 0 or cell.y < 0:
            return false
        if cell.x >= board_size.x or cell.y >= board_size.y:
            return false
    return true

func _are_cells_free(cells: Array[Vector2i]) -> bool:
    for cell in cells:
        if cell.x < 0 or cell.x >= board_size.x:
            return false
        if cell.y < 0 or cell.y >= board_size.y:
            return false
        if _grid[cell.x][cell.y]:
            return false
    return true

func _apply_placement(placement: Dictionary) -> void:
    if not _placements.has(placement):
        _placements.append(placement)
    for cell in placement["cells"]:
        _set_cell(cell, true, placement["color"])
    queue_redraw()

func _remove_placement(placement: Dictionary) -> void:
    _placements.erase(placement)
    for cell in placement["cells"]:
        _set_cell(cell, false)
    queue_redraw()

func _set_cell(cell: Vector2i, occupied: bool, color: Color = Color.WHITE) -> void:
    if cell.x < 0 or cell.x >= board_size.x:
        return
    if cell.y < 0 or cell.y >= board_size.y:
        return
    _grid[cell.x][cell.y] = occupied
    var key := Vector2i(cell)
    if occupied:
        _occupied_cells[key] = color
    else:
        _occupied_cells.erase(key)

func _get_color_for_shape(shape_id: String) -> Color:
    if _shape_color_cache.has(shape_id):
        return _shape_color_cache[shape_id]
    if _PALETTE.is_empty():
        return Color.WHITE
    var index := abs(hash(shape_id)) % _PALETTE.size()
    var color := _PALETTE[index]
    _shape_color_cache[shape_id] = color
    return color

func _notify_history_change() -> void:
    emit_signal("history_changed", has_undo(), has_redo())

func _draw() -> void:
    var board_pixel_size := Vector2(board_size.x * cell_size, board_size.y * cell_size)
    draw_rect(Rect2(Vector2.ZERO, board_pixel_size), Color(0.08, 0.08, 0.08))

    var line_color := Color(0.3, 0.3, 0.35, 0.75)
    for x in range(board_size.x + 1):
        var pos_x := x * cell_size
        draw_line(Vector2(pos_x, 0), Vector2(pos_x, board_pixel_size.y), line_color, 1.0)
    for y in range(board_size.y + 1):
        var pos_y := y * cell_size
        draw_line(Vector2(0, pos_y), Vector2(board_pixel_size.x, pos_y), line_color, 1.0)

    for cell_key in _occupied_cells.keys():
        var cell: Vector2i = cell_key
        var color: Color = _occupied_cells[cell_key]
        var top_left := Vector2(cell.x, cell.y) * cell_size
        var rect := Rect2(top_left, Vector2(cell_size, cell_size))
        draw_rect(rect, color)
        var outline := Color(color.r, color.g, color.b, min(color.a + 0.2, 1.0))
        draw_rect(rect, outline, false, 1.0)
