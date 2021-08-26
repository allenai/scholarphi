import argparse
import os
import sys
import logging
from typing import Tuple
from gevent.pywsgi import WSGIServer
from flask import Flask, Response, request, jsonify
from app.api import create_api
from app.utils import StackdriverJsonFormatter
from werkzeug.middleware.proxy_fix import ProxyFix

def start():
    """
    Starts up a HTTP server attached to the provider port, and optionally
    in development mode (which is ideal for local development but unideal
    for production use).
    """
    parser = argparse.ArgumentParser(description='Starts your application\'s HTTP server.')
    parser.add_argument(
        '--port',
        '-p',
        help='The port to listen on',
        default=8000
    )
    parser.add_argument(
        '--prod',
        help=
            'If specified the server is started in production mode, where ' +
            'the server isn\'t restarted as changes to the source code occur.',
        action='store_true'
    )
    args = parser.parse_args()

    # Locally we don't specify any handlers, which causes `basicConfig` to set
    # up one for us that writes human readable messages.
    handlers = None

    # If we're in production we setup a handler that writes JSON log messages
    # in a format that Google likes.
    if args.prod:
        json_handler = logging.StreamHandler()
        json_handler.setFormatter(StackdriverJsonFormatter())
        handlers = [ json_handler ]

    logging.basicConfig(
        level=os.environ.get('LOG_LEVEL', default=logging.INFO),
        handlers=handlers
    )
    logger = logging.getLogger()
    logger.debug("AHOY! Let's get this boat out to water...")

    app = Flask("app")

    # Bind the API functionality to our application. You can add additional
    # API endpoints by editing api.py.
    logger.debug("Starting: init API...")
    app.register_blueprint(create_api(), url_prefix='/')
    logger.debug("Complete: init API...")

    # In production we use a HTTP server appropriate for production.
    if args.prod:
        logger.debug("Starting: gevent.WSGIServer...")
        # There are two proxies -- the one that's run as a sibling of this process, and
        # the Ingress controller that runs on the cluster.
        # See: https://skiff.allenai.org/templates.html
        num_proxies = 2
        proxied_app = ProxyFix(app, x_for=num_proxies, x_proto=num_proxies, x_host=num_proxies,
                               x_port=num_proxies)
        http_server = WSGIServer(('0.0.0.0', args.port), proxied_app, log=logger,
            error_log=logger)
        app.logger.info(f'Server listening at http://0.0.0.0:{args.port}')
        http_server.serve_forever()
    else:
        logger.debug("Starting: Flask development server...")
        num_proxies = 1
        proxied_app = ProxyFix(app, x_for=num_proxies, x_proto=num_proxies, x_host=num_proxies,
                               x_port=num_proxies)
        app.run(host='0.0.0.0', port=args.port)

if __name__ == '__main__':
    start()
