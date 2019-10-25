import configparser

from peewee import (
    CharField,
    CompositeKey,
    FloatField,
    ForeignKeyField,
    IntegerField,
    Model,
    PostgresqlDatabase,
    TextField,
)

DATABASE_CONFIG = "config.ini"


config = configparser.ConfigParser()
config.read(DATABASE_CONFIG)
db_name = config["postgres"]["db_name"]
postgres_user = config["postgres"]["user"]
postgres_password = config["postgres"]["password"]
postgres_host = config["postgres"]["host"]
postgres_port = config["postgres"]["port"]


database = PostgresqlDatabase(
    db_name,
    user=postgres_user,
    password=postgres_password,
    host=postgres_host,
    port=postgres_port,
)


class DatabaseModel(Model):  # type: ignore
    class Meta:
        database = database


class Paper(DatabaseModel):
    s2_id = CharField(primary_key=True)
    arxiv_id = CharField(index=True, null=True)


class Summary(DatabaseModel):
    paper = ForeignKeyField(Paper)
    title = TextField()
    authors = TextField()
    doi = TextField(null=True)
    venue = TextField(index=True, null=True)
    year = IntegerField(index=True, null=True)
    """
    Abstract will probably be backfilled.
    """
    abstract = TextField(null=True)


class Citation(DatabaseModel):
    paper = ForeignKeyField(Paper)


class CitationPaper(DatabaseModel):
    citation = ForeignKeyField(Citation)
    paper = ForeignKeyField(Paper)

    class Meta:
        primary_key = CompositeKey("citation", "paper")


class Symbol(DatabaseModel):
    paper = ForeignKeyField(Paper)
    tex = TextField(index=True)


class Entity(DatabaseModel):
    type = TextField(choices=((1, "citation"), (2, "equation"), (3, "symbol")))
    entity_id = IntegerField(index=True)


class BoundingBox(DatabaseModel):
    """
    Expressed in PDF coordinates.
    """

    page = IntegerField()
    left = FloatField()
    top = FloatField()
    width = FloatField()
    height = FloatField()


class EntityBoundingBox(DatabaseModel):
    entity = ForeignKeyField(Entity)
    bounding_box = ForeignKeyField(BoundingBox)

    class Meta:
        primary_key = CompositeKey("entity", "bounding_box")


def create_tables() -> None:
    """
    Initialize any tables that haven't yet been created.
    """
    database.create_tables(
        [
            Paper,
            Summary,
            Symbol,
            Citation,
            CitationPaper,
            Entity,
            BoundingBox,
            EntityBoundingBox,
        ],
        safe=True,
    )
