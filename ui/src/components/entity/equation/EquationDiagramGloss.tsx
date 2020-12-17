import { RichText } from "../../common";
import { Point } from "../../control/Selection";
import * as uiUtils from "../../../utils/ui";

import Card from "@material-ui/core/Card";
import classNames from "classnames";
import React from "react";

interface Props {
  id?: string;
  className?: string;
  anchor: Point;
  entityId?: string;
  children: string;
  handleShowMore?: (entityId: string) => void;
}

class EquationDiagramGloss extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClickShowMore = this.onClickShowMore.bind(this);
  }

  onClickShowMore() {
    if (this.props.entityId && this.props.handleShowMore) {
      this.props.handleShowMore(this.props.entityId);
    }
  }

  render() {
    return (
      <Card
        id={this.props.id}
        className={classNames(
          this.props.className,
          "scholar-reader-tooltip tooltip equation-diagram-tooltip"
        )}
        style={{
          position: "absolute",
          left: this.props.anchor.x,
          top: this.props.anchor.y,
        }}
        elevation={uiUtils.TOOLTIP_ELEVATION}
      >
        <div className="gloss simple-gloss equation-diagram-gloss">
          <table>
            <tbody>
              <tr>
                <td>
                  <p
                    className="equation-diagram-gloss__label"
                    tabIndex={0}
                    onClick={this.onClickShowMore}
                  >
                    <RichText>{this.props.children}</RichText>
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    );
  }
}

export default EquationDiagramGloss;
