import React from "react";

interface Props {
  // By default, we set 'rel="noreferrer"' on links since it is best practice for untrusted domains
  // https://developer.mozilla.org/en-US/docs/Web/HTML/Link_types/noopener
  // In the case of some trusted domains, such as allenai.org,
  // setting `allowReferrer=true` will pass referrer data.
  allowReferrer?: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
}

const ExternalLink: React.FunctionComponent<Props> = ({ allowReferrer, children, className, href }: Props) => {
  // We do set noopener and noreferrer.
  // eslint-disable-next-line react/jsx-no-target-blank
  return <a className={className} href={href} target="_blank" rel={`noopener ${!allowReferrer && 'noreferrer'}`}>{children}</a>;
}

export default ExternalLink;
