""" core queries """

import logging
from ..import query

queries = [
    query.Query('test_query_q','123'),
    query.Query('test_query_f',lambda : 12345)
    ]
