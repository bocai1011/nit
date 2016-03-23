""" manage the flask web server and user interactions """

import random
import webbrowser
import os
import os.path as osp
import subprocess
import csv
import json

from gevent.wsgi import WSGIServer
from neat.pcl import PCL
from flask import Flask, request, url_for, make_response, render_template
from neat.wolf_handler.importer.cli.config import mk_config_json, config_json_to_sheet

# globals

# define the port to listent / open browser
port = 5000 + random.randint(0,999)
url = "http://127.0.0.1:{0}".format(port)

app = Flask(__name__)
pcl = PCL()

@app.route('/')
def root():
    return render_template('index.html')

@app.route('/Progress/', methods=['GET'])
def progress(path):
    return 50

@app.route('/CsvConfigErrors/path=<path:path>', methods=['GET'])
def getWolfErrors(path):
    pass

@app.route('/CsvConfig/path=<path:path>', methods=['GET', 'POST'])
def get(path):
    if request.method == 'GET':
        print("CsvConfig get " + path)
        return mk_config_json(path, 'exec_blotter')

    elif request.method == 'POST':
        print("CsvConfig put " + path)
        j = request.get_json()
        config_json_to_sheet(path, 'exec_blotter', j)
        subprocess.call(["wolf", "-i", path + "/import_config.ini"])

        status = {'status': 'success', 'errors': []}
        with open(path + "/error.csv") as f:
            status['status'] = 'errors'
            header = ('row', 'error')  # JFN: 10/30/14 I don't know what the file will look like so I am guessing
            reader = csv.DictReader(f, header)
            for row in reader:
                status['errors'].append(json.dumps(row))

        return status

def run():

    # open the browser windows to my url
    print "opening browser: {0}".format(url)
    webbrowser.open(url)

    print "starting server: {0}".format(url)
    http_server = WSGIServer(('', port), app)
    http_server.serve_forever()

if __name__ == '__main__':
    run()
