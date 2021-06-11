import Card from "@material-ui/core/Card";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import Select from "@material-ui/core/Select";
import MuiTooltip from "@material-ui/core/Tooltip";
import DeleteIcon from "@material-ui/icons/Delete";
import React from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  className?: string;
  pageView: PDFPageView;
  anchor: BoundingBox;
  handleDeleteCustomDiscourseTag: () => void;
  handleCreateCustomDiscourseTag: (discourse: string) => void;
  discourseOptions: string[];
  selectedDiscourseTag: string;
}

/**
 * A widget that allows users to either specify a discourse tag for or delete a selected sentence.
 */
class DiscourseTagActionWidget extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
  }

  handleDiscourseSelected = (event: React.ChangeEvent<{ value: any }>) => {
    this.props.handleCreateCustomDiscourseTag(event.target.value);
  };

  render() {
    const { pageView, anchor, className, discourseOptions } = this.props;

    /*
     * Align the horizontal center of the tooltip with the center of the anchor.
     */
    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);
    const tooltipCenterX = anchorPosition.left + anchorPosition.width + 2;
    let style: React.CSSProperties = {
      left: tooltipCenterX,
      transform: "translate(-50%, 0)",
    };
    const TOOLTIP_VERTICAL_MARGIN = 4;
    style.top =
      anchorPosition.top + anchorPosition.height + TOOLTIP_VERTICAL_MARGIN;

    return (
      <Card
        className={`discourse-tag-action-widget ${className}`}
        style={style}
      >
        <div>
          <FormControl className="discourse-select">
            <Select
              native
              value={this.props.selectedDiscourseTag}
              onChange={this.handleDiscourseSelected}
            >
              <option key="default" value="" disabled />
              {discourseOptions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
          </FormControl>
          <MuiTooltip title={"Delete annotation"}>
            <IconButton
              size="small"
              onClick={this.props.handleDeleteCustomDiscourseTag}
            >
              <DeleteIcon />
            </IconButton>
          </MuiTooltip>
        </div>
      </Card>
    );
  }
}

export default DiscourseTagActionWidget;
