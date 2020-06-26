# Ubuntu based image for creating a sandobox for executing user code.

# FROM some base-image
FROM ubuntu:20.04
MAINTAINER CHARAN, SURYA
LABEL version="1.0"

# Update the repository sources list
RUN apt-get upgrade
RUN apt-get update

#Install all the languages/compilers we are supporting.
RUN apt-get install python3 -y