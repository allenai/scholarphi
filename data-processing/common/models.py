import configparser
from datetime import datetime
from typing import Optional

from peewee import (
    SQL,
    CharField,
    CompositeKey,
    DatabaseProxy,
    DateTimeField,
    FloatField,
    ForeignKeyField,
    IntegerField,
    Model,
    PostgresqlDatabase,
    TextField,
)

from scripts.pipelines import entity_pipelines

DATABASE_CONFIG = "config.ini"


input_database = DatabaseProxy()
output_database = DatabaseProxy()


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


class Paper(OutputModel):
    s2_id = CharField(primary_key=True)
    arxiv_id = CharField(index=True, null=True)


class Summary(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    title = TextField()
    authors = TextField()
    doi = TextField(null=True)
    venue = TextField(index=True, null=True)
    year = IntegerField(index=True, null=True)
    """
    Abstract will probably be backfilled.
    """
    abstract = TextField(null=True)


class Citation(OutputModel):
    paper = ForeignKeyField(Paper, on_delete="CASCADE")


class CitationPaper(OutputModel):
    citation = ForeignKeyField(Citation, on_delete="CASCADE")
    paper = ForeignKeyField(Paper, on_delete="CASCADE")

    class Meta:
        primary_key = CompositeKey("citation", "paper")


class Entity(OutputModel):
    type = TextField(index=True)
    source = TextField(
        choices=(("tex-pipeline", None), ("other", None)),
        index=True,
        default="tex-pipeline",
    )
    entity_id = IntegerField(index=True)


class BoundingBox(OutputModel):
    """
    Expressed in PDF coordinates.
    """

    page = IntegerField()
    left = FloatField()
    top = FloatField()
    width = FloatField()
    height = FloatField()


class EntityBoundingBox(OutputModel):
    entity = ForeignKeyField(Entity, on_delete="CASCADE")
    bounding_box = ForeignKeyField(BoundingBox, on_delete="CASCADE")

    class Meta:
        primary_key = CompositeKey("entity", "bounding_box")


class Annotation(BoundingBox):
    """
    Human annotation of an entity on a paper. Creating instances of this model with the automated
    data processing pipeline would be unexpected.
    """

    paper = ForeignKeyField(Paper, on_delete="CASCADE")
    type = TextField(choices=(("citation", None), ("symbol", None)), index=True)

    created_at = DateTimeField(constraints=[SQL("DEFAULT now()")])
    # The client is responsible for updating this field whenever they update the model.
    updated_at = DateTimeField(constraints=[SQL("DEFAULT now()")])


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


def init_database_connections(
    schema_name: Optional[str] = None, create_tables: bool = False
) -> None:
    """
    Initialize database connections.
    """

    import os
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
            Summary,
            Citation,
            CitationPaper,
            Entity,
            BoundingBox,
            EntityBoundingBox,
            Annotation,
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
