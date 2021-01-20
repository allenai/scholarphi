import configparser
import os
import uuid
from datetime import datetime
from typing import Optional

from peewee import (
    SQL,
    BooleanField,
    CharField,
    Check,
    DatabaseProxy,
    DateTimeField,
    FloatField,
    ForeignKeyField,
    IntegerField,
    Model,
    PostgresqlDatabase,
    TextField,
)
from playhouse.postgres_ext import BinaryJSONField, DateTimeTZField

from scripts.pipelines import entity_pipelines

DATABASE_CONFIG = "config.ini"


input_database = DatabaseProxy()
output_database = DatabaseProxy()


session_id = uuid.uuid4()
"""
Each time these scripts are launched, a unique session ID is generated. This session ID can be
used to make sure that all data uploaded while these scripts are run has the same 'version'.
"""


class InputModel(Model):  # type: ignore
    """
    Input models are read but never written. These specifications of input models in this file
    only need to define the fields we want to read, and they may not be a complete specification
    of the table (i.e. they might leave out indexes or columns).
    """

    class Meta:
        database = input_database


class Metadata(InputModel):
    metadata_id = TextField()
    created_ts = DateTimeField()


class OutputModel(Model):  # type: ignore
    class Meta:
        database = output_database


class TimestampsMixin(OutputModel):
    """
    Fields for timestamping data. If 'created_at' and 'updated_at' are not defined, and a model
    using this mixing is created using 'bulk_create', then those timestamps will be set using the
    *pipeline's* time instead of the server database's time, because of limitations in the
    bulk_create method (see https://github.com/coleifer/peewee/issues/1931#issue-443944983). It's
    expected that the pipeline's clock and the server's clock will be sufficiently synchronized
    that this won't cause issues anytime soon.
    """

    created_at = DateTimeTZField(
        constraints=[SQL("DEFAULT (now() at time zone 'utc')")], default=datetime.utcnow
    )
    updated_at = DateTimeTZField(
        constraints=[SQL("DEFAULT (now() at time zone 'utc')")], default=datetime.utcnow
    )
    " The client is responsible for updating this field whenever they update the model. "


class Paper(OutputModel):
    s2_id = CharField(primary_key=True)
    arxiv_id = CharField(index=True, null=True)


class Version(OutputModel):
    """
    Data for each paper is versioned. Typically, all of the data from a single run of the pipeline
    is grouped into the same version. This allows us to store multiple versions of the data for
    the paper, and switch back and forth between which version is being viewed in the interface.
    """

    created_at = DateTimeField(constraints=[SQL("DEFAULT now()")])
    paper = ForeignKeyField(Paper)
    index = IntegerField(index=True)
    " Starts at 0 for the first version of data for a paper, increases by 1 each time. "

    session_id = TextField(index=True, null=True)
    """
    For use by this data pipeline only. This is a unique ID for the session of the pipeline that
    created this version. This can be used by the pipeline to check whether it has already created
    a version of data for a paper during an earlier stage of paper processing.
    """

    class Meta:
        indexes = ((("paper_id", "index"), True), (("paper_id", "session_id"), True))


class Summary(OutputModel):
    """
    While the summary model is defined in this project in order to create the table, it is
    assumed that it will be filled by another service.
    """

    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    title = TextField()
    authors = TextField()
    doi = TextField(null=True)
    venue = TextField(index=True, null=True)
    year = IntegerField(index=True, null=True)
    abstract = TextField(null=True)


class Entity(TimestampsMixin, OutputModel):
    """
    An entity (e.g., citation, symbol, term) found in a paper.
    """

    paper = ForeignKeyField(Paper, on_delete="CASCADE")

    version = IntegerField(index=True)
    """
    The version of data for this paper that this entity belongs too. Should match a version number
    for the paper from the 'Version' table.
    """

    type = TextField(index=True)
    within_paper_id = TextField(index=True, null=True)
    """
    'within_paper_id' is a unique ID for this entity of this type within the paper. Entities of
    different types within the same paper can have the same 'within_paper_id'. Entities of the
    same type across different papers can also have the same 'within_paper_id'. Unlike the
    automatically-generated Postgres ID field, this field may convey some semantic information,
    like the order in which the entities were found in the paper. The primary purpose of this
    field is to resolve references from one entity to another when the pipeline is uploading
    entities that refer to other entities.
    """

    source = TextField(index=True, default="tex-pipeline")

    class Meta:
        indexes = ((("paper_id", "version", "type", "within_paper_id"), True),)


class BoundingBox(TimestampsMixin, OutputModel):

    entity = ForeignKeyField(Entity, on_delete="CASCADE", backref="bounding_boxes")
    source = TextField(index=True, default="tex-pipeline")
    page = IntegerField()

    """
    Dimensions expressed in ratio coordinates ([0..1]).
    """
    left = FloatField()
    top = FloatField()
    width = FloatField()
    height = FloatField()


class EntityData(TimestampsMixin, OutputModel):
    """
    A key-value pair holding arbitrary data for an entity. Together, the 'item_type', 'of_list', and
    'relation_type' provide a specification for the type of the data.
    """

    entity = ForeignKeyField(Entity, on_delete="CASCADE")
    source = TextField(index=True, default="tex-pipeline")
    key = TextField(index=True)
    value = TextField(null=True)

    item_type = TextField(
        index=True,
        choices=(
            ("int", None),
            ("float", None),
            ("string", None),
            ("relation-id", None),
        ),
    )
    " Base type of data. This can be used for casting data when it's retrieved from the datatbase. "

    of_list = BooleanField(index=True)
    " Whether this data point is an element in a list. "

    relation_type = TextField(
        index=True,
        null=True,
        constraints=[
            Check(
                "(item_type = 'relation-id' AND relation_type IS NOT NULL) OR"
                + "(item_type != 'relation-id' AND relation_type IS NULL)"
            )
        ],
    )
    """
    The type of entity referred to by a relation-id. Will be defined if the item type is
    'relation-id'. Otherwise, will be undefined.
    """


class LogEntry(TimestampsMixin, OutputModel):
    """
    Log data from the user interface. Only intended to be written to by the user interface code.
    """

    ip_address = TextField()
    " IP address of client that logged the event. "

    username = TextField(null=True, index=True)
    """
    S2 username of the user using the app when the event was triggered. May be undefined if user
    was not logged in or user name was not available.
    """

    level = TextField(index=True)
    " Level of the log event. See user interface code for expected levels. "

    event_type = TextField(index=True, null=True)
    " Optional tag used to define the type of event that is being logged. "

    data = BinaryJSONField(null=True)
    " Arbitrary data associated with this event. "


def init_database(
    conf: configparser.ConfigParser, config_section: str, schema: Optional[str] = None
) -> PostgresqlDatabase:
    """
    Specify a default schema that the database should use for creating a querying tables with
    the 'schema' parameter. This can allow you to upload data to development tables, rather
    than the public schema which is queried by the live application.
    """

    db_name = conf[config_section]["db_name"]
    user = conf[config_section]["user"]
    password = conf[config_section]["password"]
    host = conf[config_section]["host"]
    port = conf[config_section]["port"]

    # Set the default schema for creating and querying tables by setting as the sole schema in the
    # database connection's search path.
    options = f'-c search_path="{schema}"' if schema is not None else ""
    print(options)

    return PostgresqlDatabase(
        db_name, user=user, password=password, host=host, port=port, options=options,
    )


def setup_database_connections(
    schema_name: Optional[str] = None, create_tables: bool = False
) -> None:
    """
    Initialize database connections.
    """

    config = configparser.ConfigParser(os.environ)
    config.read(DATABASE_CONFIG)

    # By default, data will be placed in a schema with the timestamp of the time that this
    # connection to the database was established.
    if schema_name is None:
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        schema_name = f"schema_{timestamp}"

    input_database.initialize(init_database(config, "input-db"))
    output_database.initialize(init_database(config, "output-db", schema_name))

    if create_tables:
        # Schema must be created before tables, because Peewee will attempt to create the tables
        # within the schema.
        output_database.execute_sql("CREATE SCHEMA IF NOT EXISTS %s" % (schema_name,))

        # Assemble the list of database models from a set of defaults, and from the set of models
        # defined for specific entity pipelines.
        models_to_create = [
            Paper,
            Version,
            Summary,
            Entity,
            BoundingBox,
            EntityData,
            LogEntry,
        ]
        for pipeline in entity_pipelines:
            models_to_create.extend(pipeline.database_models)

        output_database.create_tables(
            models_to_create,
            # Don't create the tables if they're already created.
            safe=True,
        )

        # Provide 'api' user with read access to the new schema.
        output_database.execute_sql(
            "GRANT ALL ON SCHEMA %s TO %s" % (schema_name, "api")
        )
        output_database.execute_sql(
            "GRANT ALL ON ALL TABLES IN SCHEMA %s TO %s" % (schema_name, "api")
        )
        output_database.execute_sql(
            "GRANT ALL ON ALL SEQUENCES IN SCHEMA %s TO %s" % (schema_name, "api")
        )
