#!/usr/bin/env perl

# Automatically compile TeX files into PDF. This script uses arXiv's AutoTeX utility
# (https://metacpan.org/pod/TeX::AutoTeX) to detect the main file and to pick a LaTeX engine.
#
# Usage:
#   ./compile_tex.pl [latex_dir] [texlive_path] [bin]
#
# Arguments:
# - latex_dir: directory containing '.tex' files you want to compile
# - texlive_path: path to your texlive distribution. There should be a 'texmf.cnf' file in this
#   directory. Examples: /usr/local/texlive/2017, /opt/texlive/2009/
# - bin: path to bin directory that includes LaTeX utilities. Must minimally include the
#   'pdflatex' utility.
#
use TeX::AutoTeX;
 
my $workdir = $ARGV[0];
my $texlive_path = $ARGV[1];
my $bin_path = $ARGV[2];

# TODO(andrewhead): handle `use_stamp` directives, or ignore stamps during image diff.
my $compiler = TeX::AutoTeX->new(
  verbose => 1,
  workdir => $workdir,
  branch => $texlive_path,
  tex_env_path => $bin_path,);

$compiler->{log} = TeX::AutoTeX::Log->new(
  dir     => $compiler->{workdir},
  verbose => $compiler->{verbose},
  dupefh  => $compiler->{verbose} ? \*STDOUT : undef,);

$compiler->{log}->open_logfile();
if ($compiler->process()) {
  print "Successfully compiled the TeX\n";
  # Print out the names of all generated PDFs
  my @pdfs = @{$compiler->{process}->{made_pdf}};
  foreach (@pdfs) {
    print "Generated PDF: $_<end of PDF name>\n";
  }
  exit 0;
} else {
  print "Failed to compile the TeX. For more details, see " +
    "$compiler->{workdir}/auto_gen_ps.log\n";
  exit -1;
}
