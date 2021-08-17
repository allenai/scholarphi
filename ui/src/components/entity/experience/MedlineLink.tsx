import React from "react";

interface Props {
  url: string;
}

/**
 * Link to a Medline resource.
 */
class MedlineLink extends React.PureComponent<Props, {}> {
  render() {
    return (
      <p> Retreived from <a
        className="medline-link"
        target="_blank"
        rel="noopener noreferrer"
        href={this.props.url}
      >
        {this.props.children}
      </a> </p>
    );
  }
}

export default MedlineLink;
