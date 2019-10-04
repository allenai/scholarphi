import configparser

from peewee import (
    CharField,
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


class Paper(Model):
    arxiv_id = CharField(primary_key=True)

    class Meta:
        database = database


class Equation(Model):
    paper = ForeignKeyField(Paper)
    page = IntegerField()
    tex = TextField(index=True)
    left = FloatField()
    top = FloatField()
    width = FloatField()
    height = FloatField()

    class Meta:
        database = database


def create_tables():
    """
    Initialize any tables that haven't yet been created.
    """
    database.create_tables([Paper, Equation], safe=True)
