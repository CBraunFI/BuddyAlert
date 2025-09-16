extends HBoxContainer
class_name BottomBar

@export var board_path: NodePath

var _board: Board = null

@onready var _rotate_button: Button = $RotateButton
@onready var _flip_button: Button = $FlipButton
@onready var _undo_button: Button = $UndoButton
@onready var _redo_button: Button = $RedoButton

func _ready() -> void:
    _rotate_button.pressed.connect(_on_rotate_pressed)
    _flip_button.pressed.connect(_on_flip_pressed)
    _undo_button.pressed.connect(_on_undo_pressed)
    _redo_button.pressed.connect(_on_redo_pressed)
    _resolve_board()
    _update_button_states()

func _exit_tree() -> void:
    if _board and _board.history_changed.is_connected(_on_board_history_changed):
        _board.history_changed.disconnect(_on_board_history_changed)

func set_board(board: Board) -> void:
    if _board == board:
        return
    if _board and _board.history_changed.is_connected(_on_board_history_changed):
        _board.history_changed.disconnect(_on_board_history_changed)
    _board = board
    if _board:
        _board.history_changed.connect(_on_board_history_changed)
    _update_button_states()

func _resolve_board() -> void:
    if board_path == NodePath():
        return
    var node := get_node_or_null(board_path)
    if node is Board:
        set_board(node)
    elif node:
        push_warning("Node '%s' is not a Board instance." % node.name)

func _update_button_states() -> void:
    var has_board := _board != null
    _rotate_button.disabled = not has_board
    _flip_button.disabled = not has_board
    if has_board:
        _undo_button.disabled = not _board.has_undo()
        _redo_button.disabled = not _board.has_redo()
    else:
        _undo_button.disabled = true
        _redo_button.disabled = true

func _on_rotate_pressed() -> void:
    if _board:
        _board.rotate_clockwise()

func _on_flip_pressed() -> void:
    if _board:
        _board.toggle_flip()

func _on_undo_pressed() -> void:
    if _board:
        _board.undo()

func _on_redo_pressed() -> void:
    if _board:
        _board.redo()

func _on_board_history_changed(has_undo: bool, has_redo: bool) -> void:
    _undo_button.disabled = not has_undo
    _redo_button.disabled = not has_redo
    _rotate_button.disabled = _board == null
    _flip_button.disabled = _board == null
