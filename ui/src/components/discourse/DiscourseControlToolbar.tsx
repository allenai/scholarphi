import IconButton from "@material-ui/core/IconButton";
import MuiTooltip from "@material-ui/core/Tooltip";
import Close from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import Toc from "@material-ui/icons/Toc";
import { default as React } from "react";
import { BoundingBox } from "../../api/types";
import { PDFPageView } from "../../types/pdfjs-viewer";
import * as uiUtils from "../../utils/ui";

interface Props {
  pageView: PDFPageView;
  anchor: BoundingBox;
  handleClose: () => void;
  handleDeleteHighlight: () => void;
  handleOpenDrawer: () => void;
}

class DiscourseControlToolbar extends React.PureComponent<Props> {
  render() {
    const { pageView, anchor } = this.props;

    const anchorPosition = uiUtils.getPositionInPageView(pageView, anchor);

    return (
      <div
        className="discourse-control-toolbar side-right"
        style={{
          top: anchorPosition.top,
          left: anchorPosition.left + anchorPosition.width + 10,
        }}
      >
        <table>
          <tbody>
            <tr>
              <td>
                <MuiTooltip title="Open drawer">
                  <IconButton
                    size="small"
                    onClick={this.props.handleOpenDrawer}
                  >
                    <Toc />
                  </IconButton>
                </MuiTooltip>
              </td>
              <td>
                <MuiTooltip title="Delete highlight">
                  <IconButton
                    size="small"
                    onClick={() => {
                      this.props.handleDeleteHighlight();
                      this.props.handleClose();
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </MuiTooltip>
              </td>
              <td>
                <MuiTooltip title="Close tooltip">
                  <IconButton size="small" onClick={this.props.handleClose}>
                    <Close />
                  </IconButton>
                </MuiTooltip>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

export default DiscourseControlToolbar;
