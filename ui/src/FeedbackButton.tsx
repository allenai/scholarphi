import React from "react";
import FeedbackIcon from "@material-ui/icons/FeedbackOutlined";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles"
import { ScholarReaderContext, PaperId } from "./state";
import queryString from "querystring";

function mkFeedbackLink(paperId?: PaperId, extraContext?: Object) {
    console.log(extraContext);
    const baseUrl = "https://docs.google.com/forms/d/e/1FAIpQLSdnTn4ng-3SsNqwr6M7yF54IhABNAw9_KIjPdWC746fIe546w/viewform";
    const params = {
        // This ID is produced by Google Forms. If the form changes we
        // may need to change this value
        "entry.331961046": JSON.stringify(Object.assign(
            {},
            extraContext || {},
            { paperId }
        ))
    };
    return `${baseUrl}?${queryString.stringify(params)}`;
}

const useStyles = makeStyles({
    button: {
        padding: "8px",
        minWidth: "auto",
        borderRadius: "50%",
    },
    toolbar: {
        width: "auto"
    }
});

// Controls the visual appearance of the button. The toolbar variant mimics
// the appearance of buttons rendered by the default PDF viewing experience.
type ButtonVariant = "default" | "toolbar";

interface Props {
    variant?: ButtonVariant;
    extraContext?: Object;
}

const FeedbackButton = ({ variant, extraContext }: Props) => {
    const classNames = useStyles();

    switch (variant) {
        case "toolbar": {
            return (
                <ScholarReaderContext.Consumer>{({ paperId }) => (
                    <button
                        onClick={() => window.open(mkFeedbackLink(paperId, extraContext), '_blank')}
                        className={`${classNames.toolbar} toolbarButton hiddenLargeView"`}
                        title="Submit Feedback"
                    >
                        <FeedbackIcon fontSize="large" />
                    </button>
                )}</ScholarReaderContext.Consumer>
            )
        }
        case "default":
        default: {
            return (
                <ScholarReaderContext.Consumer>{({ paperId }) => (
                    <Button
                        onClick={() => window.open(mkFeedbackLink(paperId, extraContext), '_blank' )}
                        className={`${classNames.button} hiddenLargeView`}
                    >
                        <FeedbackIcon fontSize="large" />
                    </Button>
                )}</ScholarReaderContext.Consumer>
            );
        }
    }
};

export default FeedbackButton;
