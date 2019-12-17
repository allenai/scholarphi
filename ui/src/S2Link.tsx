import React from "react";

interface S2LinkProps {
  url: string;
}

/**
 * Link to an S2 resource.
 */
class S2Link extends React.PureComponent<S2LinkProps, {}> {
  render() {
    return (
      <a className="s2-link" target="_blank" rel="noopener noreferrer" href={this.props.url}>
        {this.props.children}
      </a>
    );
  }
}

export default S2Link;
