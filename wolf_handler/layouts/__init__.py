from . import available_columns, exec_blotter, order_message
__author__ = "JNovak"


available_layouts = {
    'available_columns': {
        'columns': available_columns.columns,
        'description': 'All available columns',
    },
    'exec_blotter': {
        'columns': exec_blotter.blotter,
        'description': 'Trade Execution Blotter',
    },
    'order_message': {
        'columns': order_message.blotter,
        'description': 'Order Message Blotter',
    }
}