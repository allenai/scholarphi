import classNames from "classnames";
import React from "react";
import { getRemoteLogger } from "../../logging";
import * as selectors from "../../selectors";
import { RichText } from "../common";
import * as uiUtils from "../../utils/ui";

const logger = getRemoteLogger();

interface Props {
  id: string;
  color: string;
  children: string;
  handleJumpToDiscourseObj: (id: string) => void;
}

class FacetSnippet extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  markAsSelected = (classname: string) => {
    uiUtils.addClassToElementsByClassname(classname, "selected");
  };

  clearAllSelected = () => {
    uiUtils.removeClassFromElementsByClassname("selected");
  };

  onClick() {
    logger.log("debug", "clicked-jump-to-facet-snippet-context", {
      contextEntity: this.props.id,
    });
    if (this.props.handleJumpToDiscourseObj) {
      this.clearAllSelected();
      this.markAsSelected(`facet-snippet-${this.props.id}`);
      this.markAsSelected(`highlight-${this.props.id}`);

      this.props.handleJumpToDiscourseObj(this.props.id);
    }
  }

  render() {
    const { id, children, color } = this.props;

    return (
      <>
        <div
          className={classNames("snippet", `facet-snippet-${id}`)}
          onClick={() => this.onClick()}
        >
          <div
            className={"snippet-vert-bar"}
            style={{
              backgroundColor: color,
            }}
          ></div>
          <RichText>{selectors.cleanTex(children)}</RichText>
        </div>
      </>
    );
  }
}

export default FacetSnippet;
