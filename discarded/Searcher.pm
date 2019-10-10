package Searcher;

use Scalar::Util 'reftype';

sub new {
    my $class = shift;
    my ($verbose, $callback) = @_;

    my %visited;
    my @tokens = ();

    my $self = {
        verbose => $verbose,
        visited => \%visited,
        tokens => \@tokens,
        callback => $callback,
    };
    bless $self, $class;

    return $self;
}

sub search {
    my $self = shift;
    my ($equation) = @_;
    $self->searchItem($equation);
}

sub searchHash {
    my $self = shift;
    my ($hash) = @_;
    $self->{visited}{$hash} = 1;
    while(my($key, $value) = each %{$hash}) {
        if ($self->{verbose}) {
            print "Found key: ", $key, "\n";
        }
        $self->searchItem($value);
    }
}

sub searchArray {
    my $self = shift;
    my ($array) = @_;
    foreach (@{$array}) {
        if ($self->{verbose}) {
            print "Found element: ", $_, "\n";
        }
        $self->searchItem($_);
    }
}

sub searchItem {
    my $self = shift;   
    my ($item) = @_;
    if (not defined($item)) {
        return;
    }
    if (exists $self->{visited}{$item}) {
        return;
    }
    my $itemType = reftype($item);
    if ($self->{verbose}) {
        print "Searching item: ", $item;
        if (defined($itemType)) {
            print " with ref ", $itemType;
        }
        print "\n";
    }
    my @newTokens = $self->{callback}->($item);
    push @{$self->{tokens}}, @newTokens;
    if (defined($itemType)) {
        if ($itemType eq 'HASH') {
            $self->searchHash($item);
        } elsif ($itemType eq 'ARRAY') {
            $self->searchArray($item);
        }
    }
    if ($self->{verbose}) {
        print "Finished searching item ", $item, "\n";
    }
}

1;