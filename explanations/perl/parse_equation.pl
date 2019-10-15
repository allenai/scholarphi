#!/usr/bin/env perl
#
# Fork of the 'latexmlmath' script as of LaTeXML version 0.8.4. The main change to this file is
# that it expects a well-formed TeX equation, including the surrounding '$' or 'equation'
# environment declaration. Unlike 'latexmlmath', this script does *not* sanitize the input TEX
# because the locations of the nodes in the output should match the TeX the caller inputs.
# 
# Usage:
#   perl perl/parse_equation.pl [equation]
#
# Arguments:
# - equation: TeX equation to parse. '$' and '\' symbols must be properly escaped.
#
# The 's2:location' attributes on the nodes in the printed XML can be traced back to positions
# in the input string, if you subtract 6 from the line number and, if the line number is 6,
# 2 from the character number.
use strict;
use warnings;

use LaTeXML::Core;
use LaTeXML::Post;
use LaTeXML::Post::CrossRef;
use LaTeXML::Post::Scan;
use LaTeXML::Util::ObjectDB;

my $tex = $ARGV[0];

# All of the below is code copied from the 'latexmlmath' program. Brif annotations are provided
# to describe the various stages; other comments about implementation details have been removed.
# Wrap the TeX in a mock document to allow processing with LaTeXML.
my $texdoc = <<"EODoc";
literal:
\\documentclass{article}
\\begin{document}
\\newcounter{equation}
\\newcounter{Unequation}
$tex
\\end{document}
EODoc

# Process the TeX
my ($verbosity, $strict, $includestyles, $noparse) = (-1, 0, 0, 0);
my @preload = ('perl/label_token_locations.ltxml');

my $latexml = LaTeXML::Core->new(preload => ['LaTeX.pool', @preload],
  verbosity => $verbosity, strict => $strict,
  includecomments => 0,
  includestyles   => $includestyles,
  nomathparse     => $noparse);

my $digested = $latexml->digestFile($texdoc);

my $model = $$latexml{state}->getModel;
$$model{tagprop}{'ltx:Math'}{afterClose}
  = [grep { $_ ne \&LaTeXML::Package::Pool::cleanup_Math }
    @{ $$model{tagprop}{'ltx:Math'}{afterClose} }];

my $converted = $digested && $latexml->convertDocument($digested);
my $document = $digested && LaTeXML::Post::Document->new($converted, nocache => 1);

our %OPTIONS = ();
my $DB = LaTeXML::Util::ObjectDB->new(%OPTIONS);
my $post = LaTeXML::Post->new(verbosity => $verbosity || 0);
($document) = $post->ProcessChain($document,
  LaTeXML::Post::Scan->new(db => $DB, %OPTIONS),
  LaTeXML::Post::CrossRef->new(db => $DB, %OPTIONS));

# Output the document
my ($result) = $post->ProcessChain(cloneDoc($document));
outputXML($result->findnode('//ltx:XMath'), "-"); 

sub cloneDoc {
  my ($document) = @_;
  my $clone = $document->getDocumentElement->cloneNode(1);
  foreach my $pi ($document->findnodes(".//processing-instruction('latexml')")) {
    $clone->appendChild($pi->cloneNode); }
  return $document->new($clone); }

sub outputXML {
  my ($xml, $xmldestination, $defaulturi) = @_;
  my $newdoc = XML::LibXML::Document->new("1.0", "UTF-8");
  $newdoc->setDocumentElement($xml);
  if (my $oldprefix = $defaulturi && $xml->lookupNamespacePrefix($defaulturi)) {
    $xml->setNamespaceDeclPrefix($oldprefix, undef); }
  my $serialized = $newdoc->toString(1);
  if ($xmldestination eq '-') {
    print $serialized; }
  else {
    $xmldestination = pathname_canonical($xmldestination);
    if (my $dir = pathname_directory($xmldestination)) {
      pathname_mkdir($dir) or die "Couldn't create destination directory $dir: $!"; }
    my $OUT;
    open($OUT, '>', $xmldestination) or die "Couldn't open output file $xmldestination: $!";
    print $OUT $serialized;
    close($OUT); }
  return; }
