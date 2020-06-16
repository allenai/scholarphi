import React from "react";

interface Props {
  url: string;
}

/**
 * Link to an S2 resource.
 */
class S2Link extends React.PureComponent<Props, {}> {
  render() {
    return (
      <a
        className="s2-link"
        target="_blank"
        rel="noopener noreferrer"
        href={this.props.url}
      >
        {this.props.children}
      </a>
    );
  }
}

export default S2Link;
