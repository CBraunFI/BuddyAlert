extends Node2D
class_name Board

const Shapes := preload("res://scripts/Shapes.gd")

@export var columns: int = 10
@export var rows: int = 10
@export var cell_size: float = 32.0

var grid: Array = []
var undo_stack: Array = []
var redo_stack: Array = []

var current_piece: Array = []
var current_origin: Vector2i = Vector2i.ZERO
var current_rotation_steps: int = 0
var flipped_horizontal: bool = false
var preview_origin: Vector2 = Vector2.ZERO

@onready var preview: PiecePreview = get_node_or_null("PiecePreview") as PiecePreview

func _ready() -> void:
    _initialize_grid()
    update_preview()

func _initialize_grid() -> void:
    grid.clear()
    for _y in range(rows):
        var row: Array = []
        for _x in range(columns):
            row.append(null)
        grid.append(row)
    undo_stack.clear()
    redo_stack.clear()

func reset_board() -> void:
    _initialize_grid()
    current_piece.clear()
    current_origin = Vector2i.ZERO
    current_rotation_steps = 0
    flipped_horizontal = false
    update_preview()

func set_current_piece(cells: Array, origin: Vector2i = Vector2i.ZERO) -> void:
    current_piece = Shapes.normalize(cells)
    current_origin = origin
    current_rotation_steps = 0
    flipped_horizontal = false
    update_preview()

func set_preview_origin(board_cell: Vector2) -> void:
    preview_origin = board_cell
    update_preview()

func get_current_piece_cells() -> Array:
    if current_piece.is_empty():
        return []
    var transformed := Shapes.rotate(current_piece, current_rotation_steps)
    if flipped_horizontal:
        transformed = Shapes.flip(transformed, true)
    return transformed

func get_transformed_global_cells(origin: Vector2i) -> Array:
    var oriented := get_current_piece_cells()
    var global_cells: Array = []
    for cell in oriented:
        global_cells.append(origin + cell)
    return global_cells

func is_in_bounds(cell: Vector2i) -> bool:
    return cell.x >= 0 and cell.y >= 0 and cell.x < columns and cell.y < rows

func is_cell_empty(cell: Vector2i) -> bool:
    return is_in_bounds(cell) and grid[cell.y][cell.x] == null

func can_place(piece_cells: Array, origin: Vector2i) -> bool:
    for cell in piece_cells:
        var board_cell := origin + cell
        if not is_in_bounds(board_cell):
            return false
        if not is_cell_empty(board_cell):
            return false
    return true

func can_place_current_piece(origin: Vector2i) -> bool:
    return can_place(get_current_piece_cells(), origin)

func place_piece(piece_cells: Array, origin: Vector2i, value := true, metadata := {}) -> bool:
    if not can_place(piece_cells, origin):
        return false
    var record := {
        "cells": [],
        "before": [],
        "after": [],
        "metadata": metadata.duplicate(true) if metadata is Dictionary else metadata
    }
    for cell in piece_cells:
        var board_cell := origin + cell
        record["cells"].append(board_cell)
        record["before"].append(grid[board_cell.y][board_cell.x])
        record["after"].append(value)
        grid[board_cell.y][board_cell.x] = value
    undo_stack.append(record)
    redo_stack.clear()
    return true

func place_current_piece(origin: Vector2i = current_origin, value := true, metadata := {}) -> bool:
    var piece_cells := get_current_piece_cells()
    var placed := place_piece(piece_cells, origin, value, metadata)
    if placed:
        current_origin = origin
    return placed

func undo() -> void:
    if undo_stack.is_empty():
        return
    var last_action := undo_stack.pop_back()
    for index in range(last_action["cells"].size()):
        var cell: Vector2i = last_action["cells"][index]
        var value = last_action["before"][index]
        grid[cell.y][cell.x] = value
    redo_stack.append(last_action)
    update_preview()

func redo() -> void:
    if redo_stack.is_empty():
        return
    var action := redo_stack.pop_back()
    for index in range(action["cells"].size()):
        var cell: Vector2i = action["cells"][index]
        var value = action["after"][index]
        grid[cell.y][cell.x] = value
    undo_stack.append(action)
    update_preview()

func rotate_current_piece(clockwise: bool = true) -> void:
    if current_piece.is_empty():
        return
    var delta := 1 if clockwise else -1
    current_rotation_steps = (current_rotation_steps + delta) % 4
    if current_rotation_steps < 0:
        current_rotation_steps += 4
    update_preview()

func flip_current_piece() -> void:
    if current_piece.is_empty():
        return
    flipped_horizontal = not flipped_horizontal
    update_preview()

func update_preview() -> void:
    if preview == null:
        return
    var oriented := get_current_piece_cells()
    if preview.has_method("show_shape"):
        preview.show_shape(oriented, preview_origin, cell_size)

func _unhandled_input(event: InputEvent) -> void:
    if not (event is InputEventKey):
        return
    var key_event := event as InputEventKey
    if not key_event.pressed or key_event.echo:
        return
    match key_event.keycode:
        KEY_R:
            rotate_current_piece(not key_event.shift_pressed)
            accept_event()
        KEY_F:
            flip_current_piece()
            accept_event()
        KEY_Z:
            if key_event.ctrl_pressed:
                if key_event.shift_pressed:
                    redo()
                else:
                    undo()
                accept_event()
        KEY_Y:
            if key_event.ctrl_pressed:
                redo()
                accept_event()

func on_rotate_button_pressed() -> void:
    rotate_current_piece(true)

func on_flip_button_pressed() -> void:
    flip_current_piece()

func on_undo_button_pressed() -> void:
    undo()

func on_redo_button_pressed() -> void:
    redo()

func get_cell_value(cell: Vector2i):
    if not is_in_bounds(cell):
        return null
    return grid[cell.y][cell.x]

func set_cell_value(cell: Vector2i, value) -> void:
    if not is_in_bounds(cell):
        return
    grid[cell.y][cell.x] = value

func clear_history() -> void:
    undo_stack.clear()
    redo_stack.clear()
