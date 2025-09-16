## Renders the board grid and handles simple click-based cell toggling for the prototype.
class_name Board
extends Node2D

signal cell_state_changed(cell: Vector2i, filled: bool)

const CELL_SIZE: int = 32
const GRID_COLOR: Color = Color(0.35, 0.35, 0.4, 1.0)
const BACKGROUND_COLOR: Color = Color(0.1, 0.1, 0.15, 1.0)
const FILL_COLOR: Color = Color(0.85, 0.5, 0.2, 0.9)
const BORDER_COLOR: Color = Color(0.65, 0.65, 0.75, 1.0)

var board_size: Vector2i = Vector2i(14, 14)
var _cells: Array[Array[bool]] = []

func _ready() -> void:
    ## Prepare the board matrix and enable input processing.
    if _cells.is_empty():
        _initialize_cells()
    set_process_unhandled_input(true)
    queue_redraw()

func set_board_size(size: Vector2i) -> void:
    ## Sets the board dimensions and reinitialises cell data.
    board_size = size
    _initialize_cells()
    queue_redraw()

func reset() -> void:
    ## Clears all filled cells.
    for y in range(board_size.y):
        for x in range(board_size.x):
            _cells[y][x] = false
    queue_redraw()

func get_board_pixel_size() -> Vector2:
    ## Returns the pixel dimensions of the board.
    return Vector2(board_size.x * CELL_SIZE, board_size.y * CELL_SIZE)

func _draw() -> void:
    ## Draws the board background, grid, and toggled cells.
    var size: Vector2 = get_board_pixel_size()
    draw_rect(Rect2(Vector2.ZERO, size), BACKGROUND_COLOR, true)
    draw_rect(Rect2(Vector2.ZERO, size), BORDER_COLOR, false, 2.0)

    for x in range(board_size.x + 1):
        var start: Vector2 = Vector2(x * CELL_SIZE, 0)
        var end: Vector2 = Vector2(x * CELL_SIZE, size.y)
        draw_line(start, end, GRID_COLOR, x % 5 == 0 ? 1.5 : 1.0)

    for y in range(board_size.y + 1):
        var start_y: Vector2 = Vector2(0, y * CELL_SIZE)
        var end_y: Vector2 = Vector2(size.x, y * CELL_SIZE)
        draw_line(start_y, end_y, GRID_COLOR, y % 5 == 0 ? 1.5 : 1.0)

    for y in range(board_size.y):
        for x in range(board_size.x):
            if _cells[y][x]:
                var rect: Rect2 = Rect2(Vector2(x, y) * CELL_SIZE, Vector2(CELL_SIZE, CELL_SIZE))
                draw_rect(rect.grow(-3.0), FILL_COLOR, true)

func _unhandled_input(event: InputEvent) -> void:
    ## Toggles a cell when the left mouse button is pressed.
    if event is InputEventMouseButton and event.button_index == MouseButton.LEFT and event.pressed:
        var mouse_event := event as InputEventMouseButton
        var local_pos: Vector2 = to_local(mouse_event.position)
        var cell: Vector2i = _position_to_cell(local_pos)
        if _is_cell_in_bounds(cell):
            _toggle_cell(cell)
            queue_redraw()

func _toggle_cell(cell: Vector2i) -> void:
    ## Flips a cell state and emits the change.
    var value: bool = not _cells[cell.y][cell.x]
    _cells[cell.y][cell.x] = value
    cell_state_changed.emit(cell, value)

func _initialize_cells() -> void:
    ## Builds a matrix representing board occupancy.
    _cells.clear()
    for y in range(board_size.y):
        var row: Array[bool] = []
        for x in range(board_size.x):
            row.append(false)
        _cells.append(row)

func _position_to_cell(point: Vector2) -> Vector2i:
    ## Converts a pixel position into board coordinates.
    return Vector2i(floor(point.x / CELL_SIZE), floor(point.y / CELL_SIZE))

func _is_cell_in_bounds(cell: Vector2i) -> bool:
    ## Checks whether a cell coordinate exists on the board.
    return cell.x >= 0 and cell.y >= 0 and cell.x < board_size.x and cell.y < board_size.y
