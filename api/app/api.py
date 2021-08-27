from flask import Blueprint, request, current_app

def create_api() -> Blueprint:
    """
    Creates an instance of your API. If you'd like to toggle behavior based on
    command line flags or other inputs, add them as arguments to this function.
    """
    api = Blueprint('api', __name__)

    # This route simply tells anything that depends on the API that it's
    # working. If you'd like to redefine this behavior that's ok, just
    # make sure a 200 is returned.
    @api.route('/')
    def index():
        return '', 204

    # This route just prints out the provided payload to stdout. These messages
    # are in turn aggregated into a BigQuery database for examination.
    @api.route('/api/log', methods=['POST'])
    def log():
        event = request.json
        message = { "message_type": "s2-simplify-event", "event": event }
        current_app.logger.info(message)
        return '', 204

    return api
