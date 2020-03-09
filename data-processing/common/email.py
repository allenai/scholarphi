import configparser
import logging
import smtplib
import ssl
from email.header import Header
from email.mime.text import MIMEText
from typing import Iterable, Optional

from common.types import PipelineDigest

EMAIL_CONFIG = "config.ini"


def _format_digest(digest: PipelineDigest) -> str:
    " Create the HTML summarizing the results of running the pipeline. "

    message = ""

    if len(digest.keys()) == 0:
        message += "Hmmm... no papers were processed<br/>"

    # Create a section for each paper processed.
    for paper_id, paper_digest in digest.items():
        message += f"<u>For paper with arXiv ID <i>{paper_id}</i>...</u><br/>"

        # Add a brief summary of what was found for each entity.
        for entity_name, entity_digest in paper_digest.items():
            entity_name_capitalized = entity_name[0:1].upper() + entity_name[1:]
            message += entity_name_capitalized + ": "

            metrics_messages = []
            if entity_digest.num_extracted is not None:
                metrics_messages.append(
                    f"<b>{entity_digest.num_extracted}</b> extracted"
                )
            if entity_digest.num_hues_located is not None:
                metrics_messages.append(
                    f"<b>{entity_digest.num_hues_located}</b> entity hues located"
                )

            if metrics_messages:
                message += ", ".join(metrics_messages)
            else:
                message += "(I didn't collect any metrics for this entity)"
            message += ".<br/>"

        message += "<br/>"

    return message


def send_digest_email(
    digest: PipelineDigest, to: Iterable[str], log_preview_url: Optional[str] = None
) -> None:
    " Send an email containing results of running the pipeline to a set of email addresses. "

    config = configparser.ConfigParser()
    config.read(EMAIL_CONFIG)

    server_domain = config["digest"]["domain"]
    server_port = int(config["digest"]["port"])
    email_address = config["digest"]["email"]
    password = config["digest"]["password"]

    try:
        server = smtplib.SMTP(server_domain, server_port)
        context = ssl.create_default_context()
        server.starttls(context=context)
        server.login(email_address, password)
    except Exception as e:  # pylint: disable=broad-except
        logging.warning(  # pylint: disable=logging-not-lazy
            (
                "Could not connect to SMTP server %s on port %s for user %s. Mail will not be sent. "
                + "This is the error: %s"
            ),
            server_domain,
            server_port,
            email_address,
            e,
        )
        return

    for to_address in to:

        message_text = (
            "Hi there!<br/>"
            + "<br/>"
            + "I just wanted to share with you the results I got from processing some "
            + "more papers. Here's what I found.<br/>"
            + "<br/>"
            + f"{_format_digest(digest)}"  # digest is always followed by a new line.
            + "Hopefully it found what you expected. If it didn't, forward this email to "
            + "Andrew at andrewhead@berkeley.edu and he'll see what can be fixed."
        )

        if log_preview_url is not None:
            message_text += (
                " If you have access to the logs on S3, you can also check out the "
                + f"logs at {log_preview_url}."
            )

        message_text += "<br/>" + "<br/>" + "Best wishes,<br/>" + "The ScholarPhi Bot 😊"

        message = MIMEText(message_text, "html")

        message["Subject"] = Header(
            "[ScholarPhi Bot] Fresh results from the paper processor"
        )
        message["To"] = to_address
        message.set_charset("utf8")

        server.sendmail(email_address, to_address, message.as_string())
        logging.debug(
            "Sent a digest with the pipeline processing summary to %s", to_address
        )
