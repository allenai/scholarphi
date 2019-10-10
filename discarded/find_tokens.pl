#!/usr/bin/env perl
#
# Adapted from public domain 'latexmlmath' script.
use strict;
use warnings;

use JSON::PP;
use LaTeXML::Core;
use Scalar::Util 'reftype';
use Searcher;

my $DEBUG = 0;

# Read and clean the TeX equation from the arguments.
my $tex = join(' ', @ARGV);
if ($tex eq '-') {
  { local $/ = undef; $tex = <>; } }

$tex =~ s/^\s+//;
$tex =~ s/\s+$//;

our $MATHENVS = 'math|displaymath|equation*?|eqnarray*?'
  . '|multline*?|align*?|falign*?|alignat*?|xalignat*?|xxalignat*?|gather*?';
if    (($tex =~ /^\$/)                     && ($tex =~ /\$$/))          { }    # Wrapped in $'s
elsif (($tex =~ /^\\\(/)                   && ($tex =~ /\\\)$/))        { }    # Wrapped in \(...\)
elsif (($tex =~ /^\\\[/)                   && ($tex =~ /\\\]$/))        { }    # Wrapped in \[...\]
elsif (($tex =~ /^\\begin\{($MATHENVS)\}/) && ($tex =~ /\\end\{$1\}$/)) { }
else {
  $tex = '\[ ' . $tex . ' \]'; }

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
my @preload;

my $latexml = LaTeXML::Core->new(preload => ['LaTeX.pool', @preload],
  verbosity => $verbosity, strict => $strict,
  includecomments => 0,
  includestyles   => $includestyles,
  nomathparse     => $noparse);

my $digested = $latexml->digestFile($texdoc);

# Traverse the equation for tokens
my $equation = $digested->{boxes}[5]{properties}{body};

sub createToken {
    my ($text, $startLine, $startColumn, $endLine, $endColumn) = @_;
    my %token = (
        "text" => $text,
        "startLine" => $startLine,
        "startColumn" => $startColumn,
        "endLine" => $endLine,
        "endColumn" => $endColumn
    );
    return %token;
}

# Need to keep filtering. One adequate filtering condition may be to check that 'string' isn't empty.
sub extractTokens {
    my ($item) = @_;
    my @tokens = ();
    my $itemType = reftype($item);
    if (defined($itemType) && ($itemType eq "HASH")) {
        my %hash = %{$item};
        if (defined($hash{properties})
                && (reftype($hash{properties}) eq "HASH")
                && (defined($hash{properties}->{locator}))
                && defined($hash{tokens})) {
            # use Data::Dumper;
            # print Dumper(%hash);
            my %locator = %{$hash{properties}{locator}};
            my @itemTokens = $hash{tokens};
            my %token = createToken(
                $itemTokens[0][0],
                $locator{fromLine},
                $locator{fromCol},
                $locator{toLine},
                $locator{toCol});
            push @tokens, \%token;
        }
    }
    return @tokens;
}

my $searcher = new Searcher($DEBUG, \&extractTokens);
$searcher->search($equation);

foreach (@{$searcher->{tokens}}) {
    print JSON::PP->new->utf8->canonical->encode(\%{$_}), "\n";
}

use Data::Dumper;
print Dumper($equation);
# print Dumper(\@tokens);
