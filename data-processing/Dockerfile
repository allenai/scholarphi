FROM ubuntu:bionic

RUN apt-get update

# Fetch Node apt-get sources
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash

# Disable tzdatainteractive dialogue
ARG DEBIAN_FRONTEND=noninteractive
RUN apt-get install -y texlive-full python3.7 nodejs cpanminus

WORKDIR /data-processing

# RUN apt-get install -y postgresql libpq-dev

# Install Python dependencies
RUN apt-get install -y python3-distutils
RUN curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
RUN python3 get-pip.py --force-reinstall
COPY requirements.txt ./
RUN pip install -r requirements.txt

# Install Perl dependencies
RUN apt-get install -y build-essential

# Install Perl
# Old version (e.g., 5.22) needed to support TeX::AutoTeX
RUN cpan App::perlbrew \
  && perlbrew init \
  && perlbrew install perl-5.22.4 \
  && perlbrew install-cpanm

# Install Perl dependencies
SHELL ["/bin/bash", "-c"]
RUN source ~/perl5/perlbrew/etc/bashrc \
  && perlbrew use perl-5.22.4 \
  && cpanm TeX::AutoTeX

# Copy over the source code
COPY . .

# Install Node dependencies
RUN apt-get install -y git
RUN (cd node && npm install)

# Install ImageMagick for rendering PDFs
RUN apt-get install -y imagemagick

# Install vim for when we inevitably want to inspect files
RUN apt-get install -y vim
