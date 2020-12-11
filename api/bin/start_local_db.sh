#!/bin/bash
set -eu

POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_PASSWORD="${POSTGRES_PASSWORD:-pdfsarefun}"
POSTGRES_DB="${POSTGRES_DB:-scholar-reader}"
LOCAL_DB_PORT="${LOCAL_DB_PORT:-5555}"

IMAGE="postgres:11.8"
CONTAINER_NAME="scholarphi-db"

is_running=$(docker ps -q --filter name="$CONTAINER_NAME")
if [[ ! -z "$is_running" ]]; then
    echo "The database is already running. For more information, run:"
    echo "    docker ps --filter name=$CONTAINER_NAME"
    exit 0
fi

docker run -d --rm --name "$CONTAINER_NAME" \
           -p "$LOCAL_DB_PORT:5432"  \
           -e POSTGRES_USER="$POSTGRES_USER" \
           -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
           -e POSTGRES_DB="$POSTGRES_DB" \
           "$IMAGE" > /dev/null

echo
echo "A local database is starting in the background..."
echo

set +e
is_db_ready=1
function check_if_db_is_ready {
    docker exec "$CONTAINER_NAME" pg_isready \
                                  -h localhost -p 5432 \
                                  -U "$POSTGRES_USER" 2>&1 > /dev/null
    is_db_ready=$?
}
while [[ $is_db_ready -ne 0 ]]; do
    echo "Waiting for the database to start..."
    sleep 1
    check_if_db_is_ready
done
set -e

echo 
echo "The database is ready. You can connect via:"
echo "    psql postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@localhost:$LOCAL_DB_PORT/$POSTGRES_DB"
echo
echo "To see database logs, run:"
echo "    docker logs $CONTAINER_NAME"
echo
echo "To stop the database run:"
echo "    docker stop $CONTAINER_NAME"
