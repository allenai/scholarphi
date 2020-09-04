import Card from "@material-ui/core/Card";
import IconButton from "@material-ui/core/IconButton";
import MoreHoriz from "@material-ui/icons/MoreHoriz";
import React from "react";
import RichText from "./RichText";
import { Point } from "./Selection";

interface Props {
  entityId: string;
  children: string;
  anchor: Point;
  handleShowMore: (entityId: string) => void;
}

class EquationDiagramGloss extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onClickShowMore = this.onClickShowMore.bind(this);
  }

  onClickShowMore() {
    this.props.handleShowMore(this.props.entityId);
  }

  render() {
    return (
      <Card
        style={{
          position: "absolute",
          left: this.props.anchor.x,
          top: this.props.anchor.y,
        }}
        className="scholar-reader-tooltip tooltip"
      >
        <div className="gloss simple-gloss equation-diagram-gloss">
          <table>
            <tbody>
              <tr>
                <td>
                  <RichText>{this.props.children}</RichText>
                </td>
                <td>
                  <IconButton onClick={this.onClickShowMore} size="small">
                    <MoreHoriz />
                  </IconButton>
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
