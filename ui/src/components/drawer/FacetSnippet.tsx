import classNames from "classnames";
import React from "react";
import * as selectors from "../../selectors";
import { RichText } from "../common";

interface Props {
  id: string;
  color: string;
  children: string;
  onClick: () => void;
  handleJumpToDiscourseObj: (id: string) => void;
}

class FacetSnippet extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  render() {
    const { id, children, color } = this.props;

    return (
      <>
        <div
          className={classNames("snippet", `facet-snippet-${id}`)}
          onClick={this.props.onClick}
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
