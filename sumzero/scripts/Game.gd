## Handles high-level scene setup and acts as entry point for the prototype.
extends Node2D

const BOARD_SCENE: PackedScene = preload("res://scenes/board/Board.tscn")
const UI_SCENE: PackedScene = preload("res://scenes/ui/UIRoot.tscn")

var board: Board
var ui_root: Control

func _ready() -> void:
    ## Instantiate UI and board scaffolding for milestone 1.
    ui_root = UI_SCENE.instantiate()
    add_child(ui_root)

    board = BOARD_SCENE.instantiate() as Board
    var board_holder: Node2D = ui_root.get_node("Layout/BoardPane/BoardHolder") as Node2D
    board_holder.add_child(board)
    board.position = Vector2.ZERO
    board.set_board_size(Vector2i(14, 14))
